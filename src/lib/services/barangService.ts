import { Jabatan } from "@prisma/client";
import prisma from "../prisma";
import { cache } from "react";
import {
  BarangWithAdmin,
  GetBarangParams,
} from "@/types/interfaces/barang/IBarang";

export const getBarangList = cache(
  async ({ jabatan }: GetBarangParams): Promise<BarangWithAdmin[]> => {
    try {
      const barangList = await prisma.barang.findMany({
        where: {
          admin: {
            jabatan: jabatan as Jabatan,
          },
        },
        select: {
          id: true,
          nama: true,
          stok: true,
          harga: true,
          createdAt: true,
          admin: {
            select: {
              username: true,
              jabatan: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return barangList as BarangWithAdmin[];
    } catch (error) {
      console.error("Error fetching barang: ", error);
      throw new Error("Terjadi kesalahan saat mengambil data barang");
    }
  }
);

export const getBarangById = cache(
  async (id: number, jabatan: Jabatan): Promise<BarangWithAdmin | null> => {
    try {
      const barang = await prisma.barang.findFirst({
        where: {
          id,
          admin: {
            jabatan: jabatan as Jabatan,
          },
        },
        include: {
          admin: {
            select: { username: true, jabatan: true },
          },
        },
      });

      return barang;
    } catch (error) {
      console.error("Error fetching barang by ID: ", error);
      throw new Error("Terjadi kesalahan saat mengambil data barang");
    }
  }
);

export const getDashboardData = cache(async (jabatan: Jabatan) => {
  try {
    const [barangList, totalOmset] = await Promise.all([
      prisma.barang.findMany({
        where: {
          admin: {
            jabatan: jabatan as Jabatan,
          },
        },
        select: {
          id: true,
          nama: true,
          stok: true,
          harga: true,
          createdAt: true,
          admin: {
            select: {
              username: true,
              jabatan: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Hitung total omset dari transaksi keluar bulan ini
      prisma.barangKeluar.aggregate({
        where: {
          admin: {
            jabatan: jabatan as Jabatan,
          },
          tglKeluar: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: new Date(),
          },
        },
        _sum: {
          totalOmset: true,
        },
      }),
    ]);

    const totalNilai = barangList.reduce(
      (acc, item) => acc + item.harga * item.stok,
      0
    );

    const stokBarang = barangList;

    return {
      barangList: barangList as BarangWithAdmin[],
      stats: {
        total: barangList.length,
        stokRendah: stokBarang.length,
        totalNilai,
        totalOmset: totalOmset._sum.totalOmset || 0,
      },
      stokBarang,
    };
  } catch (error) {
    console.error("Error fetching dashboard data: ", error);
    throw new Error("Terjadi kesalahan saat mengambil data dashboard");
  }
});

export const getPelangganAktif = cache(async (jabatan: Jabatan) => {
  try {
    const count = await prisma.pelanggan.count({
      where: {
        admin: {
          jabatan: jabatan as Jabatan,
        },
      },
    });
    return count;
  } catch (error) {
    console.error("Error fetching pelanggan aktif: ", error);
    throw new Error("Terjadi kesalahan saat mengambil data pelanggan");
  }
});
