import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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

    // Filter berdasarkan bulan dan tahun
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
        status: "BELUM_LUNAS",
      };
    }

    const [barangKeluar, total] = await Promise.all([
      prisma.barangKeluar.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tglKeluar: "desc" },
        include: {
          barang: {
            select: {
              id: true,
              nama: true,
              harga: true,
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
        },
      }),
      prisma.barangKeluar.count({ where }),
    ]);

    const barangKeluarWithTransaksi = await Promise.all(
      barangKeluar.map(async (item) => {
        const transaksi = await prisma.transaksiKeluar.findFirst({
          where: {
            barangKeluarId: item.id,
          },
        });

        return {
          id: item.id,
          noInvoice: item.noInvoice,
          tglKeluar: item.tglKeluar,
          jatuhTempo: item.jatuhTempo,
          namaPelanggan: item.pelanggan.nama,
          alamatPelanggan: item.pelanggan.alamat,
          namaBarang: item.barang.nama,
          jmlPembelian: item.jmlPembelian,
          hargaJual: item.hargaJual,
          totalOmset: item.totalOmset,
          totalModal: item.totalModal,
          labaKotor: item.labaKotor,
          totalFee: transaksi?.totalFee || 0,
          ongkir: transaksi?.ongkir || 0,
          totalBiayaKeluar: transaksi?.totalBiayaKeluar || 0,
          labaBerjalan: transaksi?.labaBerjalan || 0,
          status: transaksi?.status || "BELUM_LUNAS",
        };
      })
    );

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "READ",
        tabelTarget: "barang_keluar",
        dataBaru: JSON.stringify(barangKeluarWithTransaksi),
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
      data: barangKeluarWithTransaksi,
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
