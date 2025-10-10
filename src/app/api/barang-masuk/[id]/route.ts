import { authOptions } from "@/lib/authOptions";
import { calculateJatuhTempo } from "@/lib/helpers/globalHelper";
import prisma from "@/lib/prisma";
import { barangMasukSchema } from "@/lib/validations/barangMasukValidator";
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
        { error: "Anda tidak memiliki akses untuk mengubah barang masuk" },
        { status: 403 }
      );
    }

    const barangMasukId = parseInt(params.id);
    if (isNaN(barangMasukId)) {
      return NextResponse.json(
        { error: "ID barang masuk tidak valid" },
        { status: 400 }
      );
    }

    const existingBarangMasuk = await prisma.barangMasuk.findFirst({
      where: {
        id: barangMasukId,
        admin: {
          jabatan: jabatan as Jabatan,
        },
      },
      include: {
        barang: true,
      },
    });

    if (!existingBarangMasuk) {
      return NextResponse.json(
        { error: "Barang masuk tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = barangMasukSchema.parse(body);
    const barang = await prisma.barang.findUnique({
      where: { id: validatedData.barangId },
    });

    if (!barang) {
      return NextResponse.json(
        { error: "Barang tidak ditemukan" },
        { status: 404 }
      );
    }

    const tglMasuk = new Date(validatedData.tglMasuk);
    const jatuhTempo = calculateJatuhTempo(tglMasuk);
    const totalHarga =
      validatedData.stokMasuk * barang.harga + validatedData.ongkir;

    const [updatedBarangMasuk] = await prisma.$transaction([
      prisma.barangMasuk.update({
        where: { id: barangMasukId },
        data: {
          barangId: validatedData.barangId,
          noInvoice: validatedData.noInvoice,
          noSuratJalan: validatedData.noSuratJalan,
          stokMasuk: validatedData.stokMasuk,
          tglMasuk,
          jatuhTempo,
          ongkir: validatedData.ongkir,
          totalHarga,
          keterangan: validatedData.keterangan,
          status: validatedData.status || existingBarangMasuk.status,
        },
        include: {
          barang: {
            select: {
              id: true,
              nama: true,
              harga: true,
            },
          },
          admin: {
            select: {
              id: true,
              username: true,
              jabatan: true,
            },
          },
        },
      }),

      prisma.barang.update({
        where: { id: existingBarangMasuk.barangId },
        data: {
          stok: {
            decrement: existingBarangMasuk.stokMasuk,
          },
        },
      }),

      prisma.barang.update({
        where: { id: validatedData.barangId },
        data: {
          stok: {
            increment: validatedData.stokMasuk,
          },
        },
      }),
    ]);

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "UPDATE",
        tabelTarget: "barang_masuk",
        dataLama: JSON.stringify({
          id: existingBarangMasuk.id,
          barangId: existingBarangMasuk.barangId,
          noInvoice: existingBarangMasuk.noInvoice,
          stokMasuk: existingBarangMasuk.stokMasuk,
          totalHarga: existingBarangMasuk.totalHarga,
          status: existingBarangMasuk.status,
        }),
        dataBaru: JSON.stringify({
          id: updatedBarangMasuk.id,
          barangId: updatedBarangMasuk.barangId,
          noInvoice: updatedBarangMasuk.noInvoice,
          stokMasuk: updatedBarangMasuk.stokMasuk,
          totalHarga: updatedBarangMasuk.totalHarga,
          status: updatedBarangMasuk.status,
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
      message: "Barang masuk berhasil diperbarui",
      data: updatedBarangMasuk,
    });
  } catch (error) {
    console.error("Update barang masuk error:", error);

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
      { error: "Terjadi kesalahan saat memperbarui barang masuk" },
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
        { error: "Anda tidak memiliki akses untuk menghapus barang masuk" },
        { status: 403 }
      );
    }

    const barangMasukId = parseInt(params.id);

    if (isNaN(barangMasukId)) {
      return NextResponse.json(
        { error: "ID barang masuk tidak valid" },
        { status: 400 }
      );
    }

    const existingBarangMasuk = await prisma.barangMasuk.findFirst({
      where: {
        id: barangMasukId,
        admin: {
          jabatan: jabatan as Jabatan,
        },
      },
      include: {
        barang: {
          select: {
            id: true,
            nama: true,
            stok: true,
          },
        },
        admin: {
          select: {
            id: true,
            username: true,
            jabatan: true,
          },
        },
      },
    });

    if (!existingBarangMasuk) {
      return NextResponse.json(
        { error: "Barang masuk tidak ditemukan" },
        { status: 404 }
      );
    }

    if (existingBarangMasuk.barang.stok < existingBarangMasuk.stokMasuk) {
      return NextResponse.json(
        {
          error: `Tidak dapat menghapus. Stok barang saat ini (${existingBarangMasuk.barang.stok}) lebih kecil dari stok masuk (${existingBarangMasuk.stokMasuk}). Kemungkinan barang sudah terjual.`,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.barangMasuk.delete({
        where: { id: barangMasukId },
      }),
      prisma.barang.update({
        where: { id: existingBarangMasuk.barangId },
        data: {
          stok: {
            decrement: existingBarangMasuk.stokMasuk,
          },
        },
      }),
    ]);

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "DELETE",
        tabelTarget: "barang_masuk",
        dataLama: JSON.stringify({
          id: existingBarangMasuk.id,
          barangId: existingBarangMasuk.barangId,
          barangNama: existingBarangMasuk.barang.nama,
          noInvoice: existingBarangMasuk.noInvoice,
          stokMasuk: existingBarangMasuk.stokMasuk,
          totalHarga: existingBarangMasuk.totalHarga,
          status: existingBarangMasuk.status,
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
      message: "Barang masuk berhasil dihapus",
      data: existingBarangMasuk,
    });
  } catch (error) {
    console.error("Delete barang masuk error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus barang masuk" },
      { status: 500 }
    );
  }
}