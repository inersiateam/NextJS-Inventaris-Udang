import prisma from "@/lib/prisma";
import { Jabatan } from "@prisma/client";
import { DASHBOARD } from "@/lib/constants";
import {
  calculatePercentageChange,
  getMonthDateRange,
  getPreviousMonthDateRange,
  getWeekFromDate,
} from "../helpers/globalHelper";

type GuestType = "abl" | "atm";

const {
  MINGGU,
  JUTA,
  BATAS_MINIMUM_STOK,
  MAKSIMAL_ITEM_TAGIHAN,
  MAKSIMAL_PRODUK,
} = DASHBOARD;

function getJabatanFromGuestType(guestType: GuestType): Jabatan {
  return guestType === "abl" ? Jabatan.ABL : Jabatan.ATM;
}

function initializeWeeklyData() {
  return MINGGU.reduce((acc, week) => {
    acc[week] = { pendapatan: 0, pengeluaran: 0 };
    return acc;
  }, {} as Record<string, { pendapatan: number; pengeluaran: number }>);
}

export async function getDashboardGuestData(guestType: GuestType) {
  try {
    const jabatan = getJabatanFromGuestType(guestType);
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

    const currentOmset = totalOmset._sum.totalOmset || 0;
    const lastMonthOmset = totalOmsetLastMonth._sum.totalOmset || 0;
    const percentageChange = calculatePercentageChange(
      currentOmset,
      lastMonthOmset
    );

    return {
      stats: {
        totalOmset: currentOmset,
        percentageChange,
      },
      barangList,
    };
  } catch (error) {
    console.error("Error fetching dashboard guest data:", error);
    return {
      stats: {
        totalOmset: 0,
        percentageChange: 0,
      },
      barangList: [],
    };
  }
}

export async function getPelangganAktifGuest(guestType: GuestType) {
  try {
    const jabatan = getJabatanFromGuestType(guestType);

    const count = await prisma.pelanggan.count({
      where: {
        admin: { jabatan },
      },
    });

    return count;
  } catch (error) {
    console.error("Error fetching pelanggan aktif guest:", error);
    return 0;
  }
}

export async function getChartStatistikGuest(guestType: GuestType) {
  try {
    const jabatan = getJabatanFromGuestType(guestType);
    const currentDate = new Date();
    const { firstDayOfMonth } = getMonthDateRange(currentDate);

    const barangKeluarData = await prisma.barangKeluarDetail.findMany({
      where: {
        barangKeluar: {
          admin: { jabatan },
          tglKeluar: {
            gte: firstDayOfMonth,
            lte: currentDate,
          },
        },
      },
      include: {
        barangKeluar: {
          select: {
            tglKeluar: true,
          },
        },
      },
    });

    const barangKeluarWithModal = await prisma.barangKeluarDetail.findMany({
      where: {
        barangKeluar: {
          admin: { jabatan },
          tglKeluar: {
            gte: firstDayOfMonth,
            lte: currentDate,
          },
        },
      },
      include: {
        barang: {
          select: {
            harga: true,
          },
        },
        barangKeluar: {
          select: {
            tglKeluar: true,
            transaksiKeluar: {
              select: {
                totalBiayaKeluar: true,
              },
            },
          },
        },
      },
    });

    const weeklyData = initializeWeeklyData();
    barangKeluarData.forEach((item) => {
      const week = getWeekFromDate(new Date(item.barangKeluar.tglKeluar));
      const omset = item.jmlPembelian * item.hargaJual;
      weeklyData[week].pendapatan += omset;
    });

    const modalPerTransaksi = new Map<number, number>();
    barangKeluarWithModal.forEach((item) => {
      const hpp = item.jmlPembelian * item.barang.harga;
      const barangKeluarId = item.barangKeluarId;

      if (!modalPerTransaksi.has(barangKeluarId)) {
        modalPerTransaksi.set(barangKeluarId, 0);
      }

      modalPerTransaksi.set(
        barangKeluarId,
        modalPerTransaksi.get(barangKeluarId)! + hpp
      );
    });

    barangKeluarWithModal.forEach((item) => {
      const week = getWeekFromDate(new Date(item.barangKeluar.tglKeluar));
      const barangKeluarId = item.barangKeluarId;

      const modalHPP = modalPerTransaksi.get(barangKeluarId) || 0;
      const biayaKeluar =
        item.barangKeluar.transaksiKeluar?.[0]?.totalBiayaKeluar || 0;

      if (modalPerTransaksi.has(barangKeluarId)) {
        weeklyData[week].pengeluaran += modalHPP + biayaKeluar;
        modalPerTransaksi.delete(barangKeluarId);
      }
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
    console.error("Error fetching chart statistik guest:", error);
    return {
      labels: MINGGU,
      pendapatan: Array(MINGGU.length).fill(0),
      pengeluaran: Array(MINGGU.length).fill(0),
    };
  }
}

export async function getChartBarangGuest(guestType: GuestType) {
  try {
    const jabatan = getJabatanFromGuestType(guestType);
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
    console.error("Error fetching chart barang guest:", error);
    return [];
  }
}

export async function getTagihanJatuhTempoGuest(guestType: GuestType) {
  try {
    const jabatan = getJabatanFromGuestType(guestType);
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
          status: true,
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
    console.error("Error fetching tagihan jatuh tempo guest:", error);
    return [];
  }
}