import { authOptions } from "@/lib/authOptions";
import {
  calculateJatuhTempo,
  generateNoInvoice,
} from "@/lib/helpers/globalHelper";
import prisma from "@/lib/prisma";
import { barangKeluarSchema } from "@/lib/validations/barangKeluarValidator";
import { Jabatan } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const { jabatan } = session.user;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const filterBulan = searchParams.get("bulan");
    const filterTahun = searchParams.get("tahun");
    const statusFilter = searchParams.get("status");

    const skip = (page - 1) * limit;
    const where: any = {
      admin: {
        jabatan: jabatan,
      },
    };

    if (filterBulan && filterTahun) {
      const bulan = parseInt(filterBulan);
      const tahun = parseInt(filterTahun);
      const startDate = new Date(tahun, bulan - 1, 1);
      const endDate = new Date(tahun, bulan, 0, 23, 59, 59);

      where.tglKeluar = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (statusFilter === "BELUM_LUNAS") {
      where.transaksiKeluar = {
        some: {
          status: "BELUM_LUNAS",
        },
      };
    }

    const [barangKeluar, total] = await Promise.all([
      prisma.barangKeluar.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tglKeluar: "desc" },
        include: {
          details: {
            include: {
              barang: {
                select: {
                  id: true,
                  nama: true,
                  harga: true,
                },
              },
            },
          },
          pelanggan: {
            select: {
              id: true,
              nama: true,
              alamat: true,
            },
          },
          admin: {
            select: {
              id: true,
              username: true,
              jabatan: true,
            },
          },
          transaksiKeluar: true,
        },
      }),
      prisma.barangKeluar.count({ where }),
    ]);

    const barangKeluarFormatted = barangKeluar.map((item) => {
      const transaksi = item.transaksiKeluar[0];

      return {
        id: item.id,
        noInvoice: item.noInvoice,
        tglKeluar: item.tglKeluar,
        jatuhTempo: item.jatuhTempo,
        namaPelanggan: item.pelanggan.nama,
        alamatPelanggan: item.pelanggan.alamat,
        items: item.details.map((detail) => ({
          namaBarang: detail.barang.nama,
          jmlPembelian: detail.jmlPembelian,
          hargaJual: detail.hargaJual,
          subtotal: detail.subtotal,
        })),
        totalOmset: item.totalOmset,
        totalModal: item.totalModal,
        labaKotor: item.labaKotor,
        totalFee: transaksi?.totalFee || 0,
        ongkir: transaksi?.ongkir || 0,
        totalBiayaKeluar: transaksi?.totalBiayaKeluar || 0,
        labaBerjalan: transaksi?.labaBerjalan || 0,
        status: transaksi?.status || "BELUM_LUNAS",
      };
    });

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "READ",
        tabelTarget: "barang_keluar",
        dataBaru: JSON.stringify(barangKeluarFormatted),
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
      data: barangKeluarFormatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      jabatan,
    });
  } catch (error) {
    console.error("Error fetching barang keluar:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data barang keluar" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Silahkan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = barangKeluarSchema.parse(body);
    const { jabatan } = session.user;

    // Validasi semua barang dan cek stok
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

    // Cek stok untuk setiap barang
    for (const item of validatedData.items) {
      const barang = barangs.find((b) => b.id === item.barangId);
      if (barang && barang.stok < item.jmlPembelian) {
        return NextResponse.json(
          {
            error: `Stok ${barang.nama} tidak mencukupi. Stok tersedia: ${barang.stok}`,
          },
          { status: 400 }
        );
      }
    }

    // Cek pelanggan
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
    const noInvoice = await generateNoInvoice(tglKeluar, session.user.jabatan);

    // Hitung total dari semua items
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

    // Total fee berdasarkan total quantity
    const totalQuantity = validatedData.items.reduce(
      (sum, item) => sum + item.jmlPembelian,
      0
    );
    const totalFee = (30000 + 10000) * totalQuantity;
    const totalBiayaKeluar = totalFee + validatedData.ongkir;
    const labaBerjalan = labaKotor - totalBiayaKeluar;

    const bulan = tglKeluar.getMonth() + 1;
    const tahun = tglKeluar.getFullYear();

    // Hitung pengeluaran bulan ini
    const startDate = new Date(tahun, bulan - 1, 1);
    const endDate = new Date(tahun, bulan, 0, 23, 59, 59);

    const totalPengeluaranBulan = await prisma.pengeluaran.aggregate({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
        admin: {
          jabatan: jabatan as Jabatan,
        },
      },
      _sum: {
        totalHarga: true,
      },
    });

    const totalPengeluaran = totalPengeluaranBulan._sum.totalHarga || 0;
    const labaBersih = labaBerjalan - totalPengeluaran;

    // Pembagian laba
    const owner1 = Math.floor(labaBersih * 0.3);
    const owner2 = Math.floor(labaBersih * 0.3);
    const owner3 = Math.floor(labaBersih * 0.3);
    const cv = Math.floor(labaBersih * 0.1);

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create barang keluar (header)
      const barangKeluar = await tx.barangKeluar.create({
        data: {
          pelangganId: validatedData.pelangganId,
          adminId: parseInt(session.user.id),
          noInvoice,
          totalOmset,
          totalModal,
          labaKotor,
          tglKeluar,
          jatuhTempo,
        },
      });

      // 2. Create detail items
      const details = await tx.barangKeluarDetail.createMany({
        data: detailsData.map((detail) => ({
          barangKeluarId: barangKeluar.id,
          ...detail,
        })),
      });

      // 3. Update stok semua barang
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

      // 4. Create transaksi keluar
      const transaksiKeluar = await tx.transaksiKeluar.create({
        data: {
          barangKeluarId: barangKeluar.id,
          adminId: parseInt(session.user.id),
          totalFee,
          ongkir: validatedData.ongkir,
          totalBiayaKeluar,
          labaBerjalan,
          status: validatedData.status || "BELUM_LUNAS",
        },
      });

      // 5. Create pendapatan
      const pendapatan = await tx.pendapatan.create({
        data: {
          transaksiKeluarId: transaksiKeluar.id,
          bulan,
          tahun,
          totalPengeluaran,
          owner1,
          owner2,
          owner3,
          cv,
          tanggal: tglKeluar,
        },
      });

      return { barangKeluar, details, transaksiKeluar, pendapatan };
    });

    // Log aktivitas
    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "CREATE",
        tabelTarget: "barang_keluar",
        dataBaru: JSON.stringify(result),
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Barang keluar berhasil ditambahkan",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating barang keluar:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validasi gagal", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}