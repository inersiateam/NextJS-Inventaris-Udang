import { authOptions } from "@/lib/authOptions";
import {
  calculateJatuhTempo,
} from "@/lib/helpers/globalHelper";
import prisma from "@/lib/prisma";
import { barangKeluarSchema } from "@/lib/validations/barangKeluarValidator";
import { Jabatan } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Silahkan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const { jabatan } = session.user;
    if (!["ABL", "ATM"].includes(jabatan)) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk mengubah barang keluar" },
        { status: 403 }
      );
    }

    const barangKeluarId = parseInt(params.id);

    if (isNaN(barangKeluarId)) {
      return NextResponse.json(
        { error: "ID barang keluar tidak valid" },
        { status: 400 }
      );
    }

    const existingBarangKeluar = await prisma.barangKeluar.findFirst({
      where: {
        id: barangKeluarId,
        admin: {
          jabatan: jabatan as Jabatan,
        },
      },
      include: {
        details: {
          include: {
            barang: true,
          },
        },
        transaksiKeluar: {
          include: {
            pendapatan: true,
          },
        },
      },
    });

    if (!existingBarangKeluar) {
      return NextResponse.json(
        { error: "Barang keluar tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = barangKeluarSchema.parse(body);
    const barangIds = validatedData.items.map((item) => item.barangId);
    const barangs = await prisma.barang.findMany({
      where: { id: { in: barangIds } },
    });

    if (barangs.length !== barangIds.length) {
      return NextResponse.json(
        { error: "Ada barang yang tidak ditemukan" },
        { status: 404 }
      );
    }

    for (const item of validatedData.items) {
      const barang = barangs.find((b) => b.id === item.barangId);
      const oldDetail = existingBarangKeluar.details.find(
        (d) => d.barangId === item.barangId
      );
      const stokTersedia = barang!.stok + (oldDetail?.jmlPembelian || 0);

      if (stokTersedia < item.jmlPembelian) {
        return NextResponse.json(
          {
            error: `Stok ${
              barang!.nama
            } tidak mencukupi. Stok tersedia: ${stokTersedia}`,
          },
          { status: 400 }
        );
      }
    }

    const pelanggan = await prisma.pelanggan.findUnique({
      where: { id: validatedData.pelangganId },
    });

    if (!pelanggan) {
      return NextResponse.json(
        { error: "Pelanggan tidak ditemukan" },
        { status: 404 }
      );
    }

    const tglKeluar = new Date(validatedData.tglKeluar);
    const jatuhTempo = calculateJatuhTempo(tglKeluar);
    let totalOmset = 0;
    let totalModal = 0;
    const detailsData = validatedData.items.map((item) => {
      const barang = barangs.find((b) => b.id === item.barangId)!;
      const subtotal = item.hargaJual * item.jmlPembelian;
      const modalPerItem = barang.harga * item.jmlPembelian;

      totalOmset += subtotal;
      totalModal += modalPerItem;

      return {
        barangId: item.barangId,
        jmlPembelian: item.jmlPembelian,
        hargaJual: item.hargaJual,
        subtotal,
      };
    });

    const labaKotor = totalOmset - totalModal;
    const totalQuantity = validatedData.items.reduce(
      (sum, item) => sum + item.jmlPembelian,
      0
    );
    const totalFee = (30000 + 10000) * totalQuantity;
    const totalBiayaKeluar = totalFee + validatedData.ongkir;
    const labaBerjalan = labaKotor - totalBiayaKeluar;

    const bulan = tglKeluar.getMonth() + 1;
    const tahun = tglKeluar.getFullYear();

    const owner1 = Math.floor(labaBerjalan * 0.3);
    const owner2 = Math.floor(labaBerjalan * 0.3);
    const owner3 = Math.floor(labaBerjalan * 0.3);
    const cv = Math.floor(labaBerjalan * 0.1);

    const result = await prisma.$transaction(async (tx) => {
      await Promise.all(
        existingBarangKeluar.details.map((detail) =>
          tx.barang.update({
            where: { id: detail.barangId },
            data: {
              stok: {
                increment: detail.jmlPembelian,
              },
            },
          })
        )
      );

      const updatedBarangKeluar = await tx.barangKeluar.update({
        where: { id: barangKeluarId },
        data: {
          pelangganId: validatedData.pelangganId,
          totalOmset,
          totalModal,
          labaKotor,
          tglKeluar,
          jatuhTempo,
        },
        include: {
          pelanggan: true,
          admin: true,
        },
      });

      await tx.barangKeluarDetail.deleteMany({
        where: { barangKeluarId },
      });

      await tx.barangKeluarDetail.createMany({
        data: detailsData.map((detail) => ({
          barangKeluarId,
          ...detail,
        })),
      });

      await Promise.all(
        validatedData.items.map((item) =>
          tx.barang.update({
            where: { id: item.barangId },
            data: {
              stok: {
                decrement: item.jmlPembelian,
              },
            },
          })
        )
      );

      const transaksi = existingBarangKeluar.transaksiKeluar[0];
      const updatedTransaksi = await tx.transaksiKeluar.update({
        where: { id: transaksi.id },
        data: {
          totalFee,
          ongkir: validatedData.ongkir,
          totalBiayaKeluar,
          labaBerjalan,
          status: validatedData.status || transaksi.status,
        },
      });

      if (transaksi.pendapatan) {
        await tx.pendapatan.update({
          where: { id: transaksi.pendapatan.id },
          data: {
            bulan,
            tahun,
            owner1,
            owner2,
            owner3,
            cv,
            tanggal: tglKeluar,
          },
        });
      }

      return { updatedBarangKeluar, updatedTransaksi };
    });

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "UPDATE",
        tabelTarget: "barang_keluar",
        dataLama: JSON.stringify({
          id: existingBarangKeluar.id,
          noInvoice: existingBarangKeluar.noInvoice,
          totalOmset: existingBarangKeluar.totalOmset,
          labaKotor: existingBarangKeluar.labaKotor,
        }),
        dataBaru: JSON.stringify({
          id: result.updatedBarangKeluar.id,
          noInvoice: result.updatedBarangKeluar.noInvoice,
          totalOmset: result.updatedBarangKeluar.totalOmset,
          labaKotor: result.updatedBarangKeluar.labaKotor,
        }),
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Barang keluar berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    console.error("Update barang keluar error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui barang keluar" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Silahkan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const { jabatan } = session.user;
    if (!["ABL", "ATM"].includes(jabatan)) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk menghapus barang keluar" },
        { status: 403 }
      );
    }

    const barangKeluarId = parseInt(params.id);

    if (isNaN(barangKeluarId)) {
      return NextResponse.json(
        { error: "ID barang keluar tidak valid" },
        { status: 400 }
      );
    }

    const existingBarangKeluar = await prisma.barangKeluar.findFirst({
      where: {
        id: barangKeluarId,
        admin: {
          jabatan: jabatan as Jabatan,
        },
      },
      include: {
        details: {
          include: {
            barang: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
        pelanggan: {
          select: {
            nama: true,
          },
        },
        transaksiKeluar: {
          include: {
            pendapatan: true,
          },
        },
      },
    });

    if (!existingBarangKeluar) {
      return NextResponse.json(
        { error: "Barang keluar tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await Promise.all(
        existingBarangKeluar.details.map((detail) =>
          tx.barang.update({
            where: { id: detail.barangId },
            data: {
              stok: {
                increment: detail.jmlPembelian,
              },
            },
          })
        )
      );

      await tx.barangKeluar.delete({
        where: { id: barangKeluarId },
      });
    });

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "DELETE",
        tabelTarget: "barang_keluar",
        dataLama: JSON.stringify({
          id: existingBarangKeluar.id,
          noInvoice: existingBarangKeluar.noInvoice,
          pelanggan: existingBarangKeluar.pelanggan.nama,
          totalOmset: existingBarangKeluar.totalOmset,
          labaKotor: existingBarangKeluar.labaKotor,
          items: existingBarangKeluar.details.map((d) => ({
            barang: d.barang.nama,
            jumlah: d.jmlPembelian,
          })),
        }),
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Barang keluar berhasil dihapus",
      data: existingBarangKeluar,
    });
  } catch (error) {
    console.error("Delete barang keluar error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus barang keluar" },
      { status: 500 }
    );
  }
}
