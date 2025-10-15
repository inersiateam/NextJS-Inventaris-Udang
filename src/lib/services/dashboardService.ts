import { Jabatan } from "@prisma/client";
import prisma from "../prisma";
import {
  BarangWithAdmin,
  GetBarangParams,
} from "@/types/interfaces/IDashboard";
import { DASHBOARD } from "@/lib/constants";
import {
  calculatePercentageChange,
  getMonthDateRange,
  getPreviousMonthDateRange,
  getWeekFromDate,
} from "../helpers/globalHelper";

const {
  MINGGU,
  JUTA,
  BATAS_MINIMUM_STOK,
  MAKSIMAL_ITEM_TAGIHAN,
  MAKSIMAL_PRODUK,
} = DASHBOARD;

function initializeWeeklyData() {
  return MINGGU.reduce((acc, week) => {
    acc[week] = { pendapatan: 0, pengeluaran: 0 };
    return acc;
  }, {} as Record<string, { pendapatan: number; pengeluaran: number }>);
}

export async function getBarangList({
  jabatan,
}: GetBarangParams): Promise<BarangWithAdmin[]> {
  try {
    const barangList = await prisma.barang.findMany({
      where: {
        admin: { jabatan },
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
    console.error("Error fetching barang list:", error);
    throw new Error("Terjadi kesalahan saat mengambil data barang");
  }
}

export async function getDashboardData(jabatan: Jabatan) {
  try {
    const currentDate = new Date();
    const { firstDayOfMonth } = getMonthDateRange(currentDate);
    const { firstDayOfLastMonth, lastDayOfLastMonth } =
      getPreviousMonthDateRange(currentDate);

    const [barangList, totalOmset, totalOmsetLastMonth] = await Promise.all([
      prisma.barang.findMany({
        where: {
          admin: { jabatan },
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

      prisma.barangKeluar.aggregate({
        where: {
          admin: { jabatan },
          tglKeluar: {
            gte: firstDayOfMonth,
            lte: currentDate,
          },
        },
        _sum: {
          totalOmset: true,
        },
      }),

      prisma.barangKeluar.aggregate({
        where: {
          admin: { jabatan },
          tglKeluar: {
            gte: firstDayOfLastMonth,
            lte: lastDayOfLastMonth,
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

    const stokBarang = barangList.filter(
      (item) => item.stok < BATAS_MINIMUM_STOK
    );

    const currentOmset = totalOmset._sum.totalOmset || 0;
    const lastMonthOmset = totalOmsetLastMonth._sum.totalOmset || 0;
    const percentageChange = calculatePercentageChange(
      currentOmset,
      lastMonthOmset
    );

    return {
      barangList: barangList as BarangWithAdmin[],
      stats: {
        total: barangList.length,
        stokRendah: stokBarang.length,
        totalNilai,
        totalOmset: currentOmset,
        percentageChange,
      },
      stokBarang,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("Terjadi kesalahan saat mengambil data dashboard");
  }
}

export async function getPelangganAktif(jabatan: Jabatan) {
  try {
    const count = await prisma.pelanggan.count({
      where: {
        admin: { jabatan },
      },
    });
    return count;
  } catch (error) {
    console.error("Error fetching pelanggan aktif:", error);
    throw new Error("Terjadi kesalahan saat mengambil data pelanggan");
  }
}

export async function getChartStatistik(jabatan: Jabatan) {
  try {
    const currentDate = new Date();
    const { firstDayOfMonth } = getMonthDateRange(currentDate);

    const [pendapatanData, pengeluaranData] = await Promise.all([
      prisma.barangKeluar.findMany({
        where: {
          admin: { jabatan },
          tglKeluar: {
            gte: firstDayOfMonth,
            lte: currentDate,
          },
        },
        select: {
          tglKeluar: true,
          totalOmset: true,
        },
      }),

      prisma.barangMasuk.findMany({
        where: {
          admin: { jabatan },
          tglMasuk: {
            gte: firstDayOfMonth,
            lte: currentDate,
          },
        },
        select: {
          tglMasuk: true,
          totalHarga: true,
        },
      }),
    ]);

    const weeklyData = initializeWeeklyData();

    pendapatanData.forEach((item) => {
      const week = getWeekFromDate(new Date(item.tglKeluar));
      weeklyData[week].pendapatan += item.totalOmset;
    });

    pengeluaranData.forEach((item) => {
      const week = getWeekFromDate(new Date(item.tglMasuk));
      weeklyData[week].pengeluaran += item.totalHarga;
    });

    const labels = Object.keys(weeklyData);
    const pendapatan = Object.values(weeklyData).map((d) =>
      Math.round(d.pendapatan / JUTA)
    );
    const pengeluaran = Object.values(weeklyData).map((d) =>
      Math.round(d.pengeluaran / JUTA)
    );

    return {
      labels,
      pendapatan,
      pengeluaran,
    };
  } catch (error) {
    console.error("Error fetching chart statistik:", error);
    throw new Error("Terjadi kesalahan saat mengambil data statistik");
  }
}

export async function getChartBarang(jabatan: Jabatan) {
  try {
    const currentDate = new Date();
    const { firstDayOfMonth } = getMonthDateRange(currentDate);

    const barangWithActivity = await prisma.barang.findMany({
      where: {
        admin: { jabatan },
        OR: [
          {
            barangMasuk: {
              some: {
                tglMasuk: {
                  gte: firstDayOfMonth,
                  lte: currentDate,
                },
              },
            },
          },
          {
            barangKeluarDetail: {
              some: {
                barangKeluar: {
                  tglKeluar: {
                    gte: firstDayOfMonth,
                    lte: currentDate,
                  },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        nama: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: MAKSIMAL_PRODUK,
    });

    let barangList = barangWithActivity;

    if (barangList.length === 0) {
      barangList = await prisma.barang.findMany({
        where: {
          admin: { jabatan },
        },
        select: {
          id: true,
          nama: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: MAKSIMAL_PRODUK,
      });
    }

    if (barangList.length === 0) {
      return [];
    }

    const chartData = await Promise.all(
      barangList.map(async (barang) => {
        const [barangTerjual, barangMasuk] = await Promise.all([
          prisma.barangKeluarDetail.aggregate({
            where: {
              barangId: barang.id,
              barangKeluar: {
                admin: { jabatan },
                tglKeluar: {
                  gte: firstDayOfMonth,
                  lte: currentDate,
                },
              },
            },
            _sum: {
              jmlPembelian: true,
            },
          }),

          prisma.barangMasuk.aggregate({
            where: {
              barangId: barang.id,
              admin: { jabatan },
              tglMasuk: {
                gte: firstDayOfMonth,
                lte: currentDate,
              },
            },
            _sum: {
              stokMasuk: true,
            },
          }),
        ]);

        return {
          id: barang.id,
          nama: barang.nama,
          labels: ["Barang terjual", "Barang masuk"],
          data: [
            barangTerjual._sum.jmlPembelian || 0,
            barangMasuk._sum.stokMasuk || 0,
          ],
        };
      })
    );

    return chartData;
  } catch (error) {
    console.error("Error fetching chart barang:", error);
    throw new Error("Terjadi kesalahan saat mengambil data chart barang");
  }
}

export async function getTagihanJatuhTempo(jabatan: Jabatan) {
  try {
    const currentDate = new Date();
    const oneMonthLater = new Date(currentDate);
    oneMonthLater.setMonth(currentDate.getMonth() + 1);

    const [barangMasuk, barangKeluar] = await Promise.all([
      prisma.barangMasuk.findMany({
        where: {
          admin: { jabatan },
          status: "BELUM_LUNAS",
          jatuhTempo: {
            gte: currentDate,
            lte: oneMonthLater,
          },
        },
        select: {
          id: true,
          noInvoice: true,
          jatuhTempo: true,
          totalHarga: true,
          barang: {
            select: {
              nama: true,
            },
          },
        },
        orderBy: {
          jatuhTempo: "asc",
        },
        take: MAKSIMAL_ITEM_TAGIHAN,
      }),

      prisma.barangKeluar.findMany({
        where: {
          admin: { jabatan },
          jatuhTempo: {
            gte: currentDate,
            lte: oneMonthLater,
          },
          transaksiKeluar: {
            some: { status: "BELUM_LUNAS" },
          },
        },
        select: {
          id: true,
          noInvoice: true,
          jatuhTempo: true,
          totalOmset: true,
          details: {
            select: {
              barang: {
                select: {
                  nama: true,
                },
              },
            },
            take: 1,
          },
        },
        orderBy: {
          jatuhTempo: "asc",
        },
        take: MAKSIMAL_ITEM_TAGIHAN,
      }),
    ]);

    const tagihanMasuk = barangMasuk.map((item) => ({
      id: item.id,
      namaBarang: item.barang.nama,
      noInvoice: item.noInvoice,
      jatuhTempo: item.jatuhTempo,
      totalBiaya: item.totalHarga,
      status: "Masuk" as const,
    }));

    const tagihanKeluar = barangKeluar.map((item) => ({
      id: item.id,
      namaBarang: item.details[0]?.barang.nama || "N/A",
      noInvoice: item.noInvoice,
      jatuhTempo: item.jatuhTempo,
      totalBiaya: item.totalOmset,
      status: "Keluar" as const,
    }));

    const allTagihan = [...tagihanMasuk, ...tagihanKeluar]
      .sort((a, b) => a.jatuhTempo.getTime() - b.jatuhTempo.getTime())
      .slice(0, MAKSIMAL_ITEM_TAGIHAN);

    return allTagihan;
  } catch (error) {
    console.error("Error fetching tagihan jatuh tempo:", error);
    throw new Error("Terjadi kesalahan saat mengambil data tagihan");
  }
}
