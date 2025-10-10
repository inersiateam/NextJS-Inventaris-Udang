import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { Jabatan } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const pelangganId = parseInt(params.id);

    if (isNaN(pelangganId)) {
      return NextResponse.json(
        { success: false, message: "ID pelanggan tidak valid" },
        { status: 400 }
      );
    }

    // Ambil data pelanggan dengan semua transaksi barang keluar
    const pelanggan = await prisma.pelanggan.findFirst({
      where: {
        id: pelangganId,
        admin: {
          jabatan: session.user.jabatan as Jabatan,
        },
      },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            jabatan: true,
          },
        },
        barangKeluar: {
          where: {
            admin: {
              jabatan: session.user.jabatan as Jabatan,
            },
          },
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
            transaksiKeluar: true,
          },
          orderBy: {
            tglKeluar: "desc",
          },
        },
      },
    });

    if (!pelanggan) {
      return NextResponse.json(
        { success: false, message: "Pelanggan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Agregasi pembelian per barang (hanya dari transaksi lunas)
    const barangMap = new Map<number, {
      namaBarang: string;
      jumlahPembelian: number;
      totalHarga: number;
    }>();

    pelanggan.barangKeluar
      .filter((bk) => bk.transaksiKeluar?.[0]?.status === "LUNAS")
      .forEach((bk) => {
        bk.details.forEach((detail) => {
          const existing = barangMap.get(detail.barangId);
          if (existing) {
            existing.jumlahPembelian += detail.jmlPembelian;
            existing.totalHarga += detail.subtotal;
          } else {
            barangMap.set(detail.barangId, {
              namaBarang: detail.barang.nama,
              jumlahPembelian: detail.jmlPembelian,
              totalHarga: detail.subtotal,
            });
          }
        });
      });

    const daftarBarang = Array.from(barangMap.values());

    // Hitung total pembelian keseluruhan (dari semua transaksi, tidak hanya lunas)
    const totalPembelian = pelanggan.barangKeluar.reduce((sum, bk) => {
      const detailSum = bk.details.reduce(
        (detailSum, detail) => detailSum + detail.subtotal,
        0
      );
      return sum + detailSum;
    }, 0);

    // Hitung jumlah transaksi per status
    const jumlahTransaksiLunas = pelanggan.barangKeluar.filter(
      (bk) => bk.transaksiKeluar?.[0].status === "LUNAS"
    ).length;

    const jumlahTransaksiBelumLunas = pelanggan.barangKeluar.filter(
      (bk) =>
        !bk.transaksiKeluar || bk.transaksiKeluar?.[0].status === "BELUM_LUNAS"
    ).length;

    const totalTransaksi = pelanggan.barangKeluar.length;

    return NextResponse.json({
      success: true,
      data: {
        id: pelanggan.id,
        nama: pelanggan.nama,
        alamat: pelanggan.alamat,
        totalPembelian,
        jumlahTransaksiLunas,
        jumlahTransaksiBelumLunas,
        totalTransaksi,
        admin: pelanggan.admin,
        createdAt: pelanggan.createdAt,
        updatedAt: pelanggan.updatedAt,
        daftarBarang,
      },
    });
  } catch (error) {
    console.error("GET detail pelanggan error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil detail pelanggan",
      },
      { status: 500 }
    );
  }
}