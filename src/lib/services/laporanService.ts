import { Jabatan } from "@prisma/client";
import { cache } from "react";
import prisma from "../prisma";
import {
  LaporanStats,
  ChartLaporanData,
  TopPelanggan,
  PembagianProvit,
  ChartBarangItem,
} from "@/types/interfaces/ILaporan";
import { getMonthDateRange, getWeekFromDate } from "../helpers/globalHelper";
import { DASHBOARD } from "../constants";

export const getBarangTabsForLaporan = cache(
  async (jabatan: Jabatan): Promise<Array<{ id: number; nama: string }>> => {
    try {
      const barangList = await prisma.barang.findMany({
        where: { admin: { jabatan } },
        select: { id: true, nama: true },
        orderBy: { nama: "asc" },
      });

      return barangList;
    } catch (error) {
      console.error("Error fetching barang tabs:", error);
      return [];
    }
  }
);

function getDateRangeByPeriode(periode: number) {
  const currentDate = new Date();

  if (periode === 1) {
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  } else {
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - periode + 1,
      1
    );
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }
}

function getPreviousPeriodRange(periode: number) {
  const currentDate = new Date();

  if (periode === 1) {
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  } else {
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - periode * 2 + 1,
      1
    );
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - periode + 1,
      0
    );
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }
}

function getPeriodeLabel(periode: number): string {
  if (periode === 1) {
    return new Date().toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  } else if (periode === 3) {
    return "3 Bulan Terakhir";
  } else if (periode === 6) {
    return "6 Bulan Terakhir";
  } else if (periode === 12) {
    return "12 Bulan Terakhir";
  } else {
    return `${periode} Bulan Terakhir`;
  }
}

export const getLaporanStatsByPeriode = cache(
  async (jabatan: Jabatan, periode: number = 1): Promise<LaporanStats> => {
    try {
      const { startDate, endDate } = getDateRangeByPeriode(periode);
      const { startDate: prevStartDate, endDate: prevEndDate } =
        getPreviousPeriodRange(periode);

      const currentBarangKeluar = await prisma.barangKeluarDetail.findMany({
        where: {
          barangKeluar: {
            tglKeluar: { gte: startDate, lte: endDate },
            admin: { jabatan },
          },
        },
        select: {
          jmlPembelian: true,
          hargaJual: true,
        },
      });

      const omset = currentBarangKeluar.reduce(
        (sum, detail) => sum + detail.jmlPembelian * detail.hargaJual,
        0
      );

      const barangKeluarWithDetails = await prisma.barangKeluarDetail.findMany({
        where: {
          barangKeluar: {
            tglKeluar: { gte: startDate, lte: endDate },
            admin: { jabatan },
          },
        },
        include: {
          barang: {
            select: {
              harga: true,
            },
          },
        },
      });

      const totalHPP = barangKeluarWithDetails.reduce(
        (sum, detail) => sum + detail.jmlPembelian * detail.barang.harga,
        0
      );

      const totalBiayaKeluar = await prisma.transaksiKeluar.aggregate({
        where: {
          barangKeluar: {
            tglKeluar: { gte: startDate, lte: endDate },
            admin: { jabatan },
          },
        },
        _sum: {
          totalBiayaKeluar: true,
        },
      });

      const modal = totalHPP + (totalBiayaKeluar._sum.totalBiayaKeluar || 0);
      const labaBerjalan = omset - modal;

      const pengeluaranOperasional = await prisma.pengeluaran.aggregate({
        where: {
          tanggal: { gte: startDate, lte: endDate },
          admin: { jabatan },
        },
        _sum: {
          totalHarga: true,
        },
      });

      const pengeluaran = pengeluaranOperasional._sum.totalHarga || 0;
      const labaBersih = labaBerjalan - pengeluaran;

      const prevBarangKeluar = await prisma.barangKeluarDetail.findMany({
        where: {
          barangKeluar: {
            tglKeluar: { gte: prevStartDate, lte: prevEndDate },
            admin: { jabatan },
          },
        },
        select: {
          jmlPembelian: true,
          hargaJual: true,
        },
      });

      const prevOmset = prevBarangKeluar.reduce(
        (sum, detail) => sum + detail.jmlPembelian * detail.hargaJual,
        0
      );

      const prevBarangKeluarWithDetails =
        await prisma.barangKeluarDetail.findMany({
          where: {
            barangKeluar: {
              tglKeluar: { gte: prevStartDate, lte: prevEndDate },
              admin: { jabatan },
            },
          },
          include: {
            barang: {
              select: {
                harga: true,
              },
            },
          },
        });

      const prevTotalHPP = prevBarangKeluarWithDetails.reduce(
        (sum, detail) => sum + detail.jmlPembelian * detail.barang.harga,
        0
      );

      const prevTotalBiayaKeluar = await prisma.transaksiKeluar.aggregate({
        where: {
          barangKeluar: {
            tglKeluar: { gte: prevStartDate, lte: prevEndDate },
            admin: { jabatan },
          },
        },
        _sum: {
          totalBiayaKeluar: true,
        },
      });

      const prevModal =
        prevTotalHPP + (prevTotalBiayaKeluar._sum.totalBiayaKeluar || 0);
      const prevLabaBerjalan = prevOmset - prevModal;

      const prevPengeluaranOperasional = await prisma.pengeluaran.aggregate({
        where: {
          tanggal: { gte: prevStartDate, lte: prevEndDate },
          admin: { jabatan },
        },
        _sum: {
          totalHarga: true,
        },
      });

      const prevPengeluaran = prevPengeluaranOperasional._sum.totalHarga || 0;
      const prevLabaBersih = prevLabaBerjalan - prevPengeluaran;

      const omsetChange =
        prevOmset === 0
          ? omset > 0
            ? 100
            : 0
          : ((omset - prevOmset) / prevOmset) * 100;

      const modalChange =
        prevModal === 0
          ? modal > 0
            ? 100
            : 0
          : ((modal - prevModal) / Math.abs(prevModal)) * 100;

      const labaJalanChange =
        prevLabaBerjalan === 0
          ? labaBerjalan > 0
            ? 100
            : 0
          : ((labaBerjalan - prevLabaBerjalan) / Math.abs(prevLabaBerjalan)) *
            100;

      const pengeluaranChange =
        prevPengeluaran === 0
          ? pengeluaran > 0
            ? 100
            : 0
          : ((pengeluaran - prevPengeluaran) / prevPengeluaran) * 100;

      const labaBersihChange =
        prevLabaBersih === 0
          ? labaBersih > 0
            ? 100
            : 0
          : ((labaBersih - prevLabaBersih) / Math.abs(prevLabaBersih)) * 100;

      return {
        omset,
        labaBerjalan,
        modal,
        pengeluaran,
        labaBersih,
        percentageChange: {
          omset: Math.round(omsetChange * 100) / 100,
          labaBerjalan: Math.round(labaJalanChange * 100) / 100,
          modal: Math.round(modalChange * 100) / 100,
          pengeluaran: Math.round(pengeluaranChange * 100) / 100,
          labaBersih: Math.round(labaBersihChange * 100) / 100,
        },
        periodeLabel: getPeriodeLabel(periode),
      };
    } catch (error) {
      console.error("Error fetching laporan stats:", error);
      throw new Error(
        "Terjadi kesalahan saat mengambil data statistik laporan"
      );
    }
  }
);

export const getChartLaporanByPeriode = cache(
  async (jabatan: Jabatan, periode: number = 1): Promise<ChartLaporanData> => {
    try {
      const currentDate = new Date();
      const labels: string[] = [];
      const pengeluaran: number[] = [];
      const pendapatan: number[] = [];

      if (periode === 1) {
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

        const weeklyData = DASHBOARD.MINGGU.reduce((acc, week) => {
          acc[week] = { pendapatan: 0, pengeluaran: 0 };
          return acc;
        }, {} as Record<string, { pendapatan: number; pengeluaran: number }>);

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

        Object.keys(weeklyData).forEach((week) => {
          labels.push(week);
          pendapatan.push(Math.round(weeklyData[week].pendapatan / 1000000));
          pengeluaran.push(Math.round(weeklyData[week].pengeluaran / 1000000));
        });
      } else {
        for (let i = periode - 1; i >= 0; i--) {
          const targetDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );
          const bulan = targetDate.getMonth() + 1;
          const tahun = targetDate.getFullYear();

          const startDate = new Date(tahun, bulan - 1, 1);
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date(tahun, bulan, 0);
          endDate.setHours(23, 59, 59, 999);

          const monthName = targetDate.toLocaleDateString("id-ID", {
            month: "short",
          });
          labels.push(monthName);

          const barangKeluarDetails = await prisma.barangKeluarDetail.findMany({
            where: {
              barangKeluar: {
                tglKeluar: { gte: startDate, lte: endDate },
                admin: { jabatan },
              },
            },
            select: {
              jmlPembelian: true,
              hargaJual: true,
            },
          });

          const totalOmset = barangKeluarDetails.reduce(
            (sum, detail) => sum + detail.jmlPembelian * detail.hargaJual,
            0
          );

          const barangKeluarWithHPP = await prisma.barangKeluarDetail.findMany({
            where: {
              barangKeluar: {
                tglKeluar: { gte: startDate, lte: endDate },
                admin: { jabatan },
              },
            },
            include: {
              barang: {
                select: {
                  harga: true,
                },
              },
            },
          });

          const totalHPP = barangKeluarWithHPP.reduce(
            (sum, detail) => sum + detail.jmlPembelian * detail.barang.harga,
            0
          );

          const totalBiayaKeluar = await prisma.transaksiKeluar.aggregate({
            where: {
              barangKeluar: {
                tglKeluar: { gte: startDate, lte: endDate },
                admin: { jabatan },
              },
            },
            _sum: {
              totalBiayaKeluar: true,
            },
          });

          const totalModal =
            totalHPP + (totalBiayaKeluar._sum.totalBiayaKeluar || 0);

          pendapatan.push(Math.round(totalOmset / 1000000));
          pengeluaran.push(Math.round(totalModal / 1000000));
        }
      }

      return { labels, pengeluaran, pendapatan };
    } catch (error) {
      console.error("Error fetching chart laporan:", error);
      throw new Error("Terjadi kesalahan saat mengambil data chart laporan");
    }
  }
);

export const getPembagianProvitByPeriode = cache(
  async (jabatan: Jabatan, periode: number = 1): Promise<PembagianProvit[]> => {
    try {
      const currentDate = new Date();
      const dataPerBulan: PembagianProvit[] = [];

      const bulanList: Array<{ bulan: number; tahun: number; label: string }> =
        [];

      for (let i = periode - 1; i >= 0; i--) {
        const targetDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        const bulan = targetDate.getMonth() + 1;
        const tahun = targetDate.getFullYear();
        const label = targetDate.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });

        bulanList.push({ bulan, tahun, label });
      }

      for (const {
        bulan: targetBulan,
        tahun: targetTahun,
        label,
      } of bulanList) {
        const startDate = new Date(targetTahun, targetBulan - 1, 1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(targetTahun, targetBulan, 0);
        endDate.setHours(23, 59, 59, 999);

        const barangKeluarDetails = await prisma.barangKeluarDetail.findMany({
          where: {
            barangKeluar: {
              tglKeluar: { gte: startDate, lte: endDate },
              admin: { jabatan },
            },
          },
          select: {
            jmlPembelian: true,
            hargaJual: true,
          },
        });

        const omset = barangKeluarDetails.reduce(
          (sum, detail) => sum + detail.jmlPembelian * detail.hargaJual,
          0
        );

        const barangKeluarWithHPP = await prisma.barangKeluarDetail.findMany({
          where: {
            barangKeluar: {
              tglKeluar: { gte: startDate, lte: endDate },
              admin: { jabatan },
            },
          },
          include: {
            barang: {
              select: {
                harga: true,
              },
            },
          },
        });

        const totalHPP = barangKeluarWithHPP.reduce(
          (sum, detail) => sum + detail.jmlPembelian * detail.barang.harga,
          0
        );

        const totalBiayaKeluar = await prisma.transaksiKeluar.aggregate({
          where: {
            barangKeluar: {
              tglKeluar: { gte: startDate, lte: endDate },
              admin: { jabatan },
            },
          },
          _sum: {
            totalBiayaKeluar: true,
          },
        });

        const modal = totalHPP + (totalBiayaKeluar._sum.totalBiayaKeluar || 0);
        const labaBerjalan = omset - modal;

        const pengeluaranData = await prisma.pengeluaran.aggregate({
          where: {
            tanggal: { gte: startDate, lte: endDate },
            admin: { jabatan },
          },
          _sum: { totalHarga: true },
        });

        const totalPengeluaran = pengeluaranData._sum.totalHarga || 0;
        const labaBersih = labaBerjalan - totalPengeluaran;

        if (jabatan === "ATM") {
          dataPerBulan.push({
            bulan: label,
            owner1: Math.floor(labaBersih * 0.45),
            owner2: Math.floor(labaBersih * 0.45),
            owner3: 0,
            kas: Math.floor(labaBersih * 0.1),
          });
        } else {
          dataPerBulan.push({
            bulan: label,
            owner1: Math.floor(labaBersih * 0.3),
            owner2: Math.floor(labaBersih * 0.3),
            owner3: Math.floor(labaBersih * 0.3),
            kas: Math.floor(labaBersih * 0.1),
          });
        }
      }

      return dataPerBulan;
    } catch (error) {
      console.error("Error fetching pembagian provit:", error);
      throw new Error("Terjadi kesalahan saat mengambil data pembagian provit");
    }
  }
);

export const getTopPelangganByPeriode = cache(
  async (
    jabatan: Jabatan,
    barangId: number | null = null,
    periode: number = 1
  ): Promise<TopPelanggan[]> => {
    try {
      const { startDate, endDate } = getDateRangeByPeriode(periode);

      const whereCondition: any = {
        admin: { jabatan },
        tglKeluar: { gte: startDate, lte: endDate },
      };

      if (barangId !== null) {
        whereCondition.details = {
          some: {
            barangId: barangId,
          },
        };
      }

      const transaksi = await prisma.barangKeluar.findMany({
        where: whereCondition,
        include: {
          pelanggan: {
            select: {
              id: true,
              nama: true,
              alamat: true,
            },
          },
          details: {
            include: {
              barang: {
                select: {
                  nama: true,
                },
              },
            },
          },
        },
      });

      const pelangganMap = new Map<
        number,
        {
          nama: string;
          alamat: string;
          totalTransaksi: number;
        }
      >();

      transaksi.forEach((t) => {
        const existing = pelangganMap.get(t.pelanggan.id);
        if (existing) {
          existing.totalTransaksi += t.details.reduce(
            (sum, d) => sum + d.jmlPembelian,
            0
          );
        } else {
          pelangganMap.set(t.pelanggan.id, {
            nama: t.pelanggan.nama,
            alamat: t.pelanggan.alamat,
            totalTransaksi: t.details.reduce(
              (sum, d) => sum + d.jmlPembelian,
              0
            ),
          });
        }
      });

      const topPelanggan = Array.from(pelangganMap.values())
        .map((p) => ({
          ...p,
          barangNama: "N/A",
        }))
        .sort((a, b) => b.totalTransaksi - a.totalTransaksi)
        .slice(0, 4);

      return topPelanggan;
    } catch (error) {
      console.error("Error fetching top pelanggan:", error);
      throw new Error("Terjadi kesalahan saat mengambil data top pelanggan");
    }
  }
);

export const getChartBarangLaporanByPeriode = cache(
  async (jabatan: Jabatan, periode: number = 1): Promise<ChartBarangItem[]> => {
    try {
      const { startDate, endDate } = getDateRangeByPeriode(periode);

      const barangList = await prisma.barang.findMany({
        where: { admin: { jabatan } },
        select: { id: true, nama: true },
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      const chartData: ChartBarangItem[] = [];

      for (const barang of barangList) {
        const barangKeluar = await prisma.barangKeluarDetail.aggregate({
          where: {
            barangId: barang.id,
            barangKeluar: {
              tglKeluar: { gte: startDate, lte: endDate },
              admin: { jabatan },
            },
          },
          _sum: { jmlPembelian: true },
        });

        const barangMasuk = await prisma.barangMasuk.aggregate({
          where: {
            barangId: barang.id,
            tglMasuk: { gte: startDate, lte: endDate },
            admin: { jabatan },
          },
          _sum: { stokMasuk: true },
        });

        chartData.push({
          nama: barang.nama,
          labels: ["Barang terjual", "Barang masuk"],
          data: [
            barangKeluar._sum.jmlPembelian || 0,
            barangMasuk._sum.stokMasuk || 0,
          ],
        });
      }

      return chartData;
    } catch (error) {
      console.error("Error fetching chart barang laporan:", error);
      throw new Error("Terjadi kesalahan saat mengambil data chart barang");
    }
  }
);
