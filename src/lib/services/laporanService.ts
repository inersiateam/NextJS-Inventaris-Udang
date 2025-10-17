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

      console.log("Stats Date Range:", {
        current: { start: startDate.toISOString(), end: endDate.toISOString() },
        previous: {
          start: prevStartDate.toISOString(),
          end: prevEndDate.toISOString(),
        },
      });

      // Current period transactions
      const [currentTransaksi, currentModal, currentPengeluaran] =
        await Promise.all([
          prisma.barangKeluar.findMany({
            where: {
              tglKeluar: { gte: startDate, lte: endDate },
              admin: { jabatan },
            },
            include: {
              transaksiKeluar: {
                select: {
                  labaBerjalan: true,
                },
              },
            },
          }),
          // Modal dari barang masuk
          prisma.barangMasuk.aggregate({
            where: {
              tglMasuk: { gte: startDate, lte: endDate },
              admin: { jabatan },
            },
            _sum: { totalHarga: true },
          }),

          prisma.pengeluaran.aggregate({
            where: {
              tanggal: { gte: startDate, lte: endDate },
              admin: { jabatan },
            },
            _sum: { totalHarga: true },
          }),
        ]);

      const [prevTransaksi, prevModalData, prevPengeluaran] = await Promise.all([
        prisma.barangKeluar.findMany({
          where: {
            tglKeluar: { gte: prevStartDate, lte: prevEndDate },
            admin: { jabatan },
          },
          include: {
            transaksiKeluar: {
              select: {
                labaBerjalan: true,
              },
            },
          },
        }),
        prisma.barangMasuk.aggregate({
          where: {
            tglMasuk: { gte: prevStartDate, lte: prevEndDate },
            admin: { jabatan },
          },
          _sum: { totalHarga: true },
        }),
        prisma.pengeluaran.aggregate({
          where: {
            tanggal: { gte: prevStartDate, lte: prevEndDate },
            admin: { jabatan },
          },
          _sum: { totalHarga: true },
        }),
      ]);

      // Calculate current stats
      const omset = currentTransaksi.reduce((sum, t) => sum + t.totalOmset, 0);
      const labaBerjalan = currentTransaksi.reduce(
        (sum, t) => sum + (t.transaksiKeluar?.[0]?.labaBerjalan || 0),
        0
      );
      const modal = currentModal._sum.totalHarga || 0;
      const pengeluaran = currentPengeluaran._sum.totalHarga || 0;
      const totalPengeluaran = modal + pengeluaran;
      const labaBersih = labaBerjalan - pengeluaran; // Laba Bersih = Laba Berjalan - Pengeluaran Operasional

      // Calculate previous stats
      const prevLabaBerjalan = prevTransaksi.reduce(
        (sum, t) => sum + (t.transaksiKeluar?.[0]?.labaBerjalan || 0),
        0
      );
      const prevModal = prevModalData._sum.totalHarga || 0;
      const prevPengeluaranTotal = prevPengeluaran._sum.totalHarga || 0;
      const prevLabaBersih = prevLabaBerjalan - prevPengeluaranTotal;

      // Calculate percentage changes
      const omsetChange =
        omset === 0 &&
        currentTransaksi.reduce((sum, t) => sum + t.totalOmset, 0) === 0
          ? 0
          : ((omset - prevTransaksi.reduce((sum, t) => sum + t.totalOmset, 0)) /
              (prevTransaksi.reduce((sum, t) => sum + t.totalOmset, 0) || 1)) *
            100;

      const labaJalanChange =
        prevLabaBerjalan === 0
          ? labaBerjalan > 0
            ? 100
            : 0
          : ((labaBerjalan - prevLabaBerjalan) / prevLabaBerjalan) * 100;

      const modalChange =
        prevModal === 0
          ? modal > 0
            ? 100
            : 0
          : ((modal - prevModal) / prevModal) * 100;

      const pengeluaranChange =
        prevPengeluaranTotal === 0
          ? pengeluaran > 0
            ? 100
            : 0
          : ((pengeluaran - prevPengeluaranTotal) / prevPengeluaranTotal) * 100;

      const labaBersihChange =
        prevLabaBersih === 0
          ? labaBersih > 0
            ? 100
            : 0
          : ((labaBersih - prevLabaBersih) / prevLabaBersih) * 100;

      console.log("Stats Summary:", {
        omset,
        labaBerjalan,
        modal,
        pengeluaran,
        totalPengeluaran,
        labaBersih,
        changes: {
          omset: Math.round(omsetChange * 100) / 100,
          labaBerjalan: Math.round(labaJalanChange * 100) / 100,
          modal: Math.round(modalChange * 100) / 100,
          pengeluaran: Math.round(pengeluaranChange * 100) / 100,
          labaBersih: Math.round(labaBersihChange * 100) / 100,
        },
      });

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

        const weeklyData = DASHBOARD.MINGGU.reduce((acc, week) => {
          acc[week] = { pendapatan: 0, pengeluaran: 0 };
          return acc;
        }, {} as Record<string, { pendapatan: number; pengeluaran: number }>);

        pendapatanData.forEach((item) => {
          const week = getWeekFromDate(new Date(item.tglKeluar));
          weeklyData[week].pendapatan += item.totalOmset;
        });

        pengeluaranData.forEach((item) => {
          const week = getWeekFromDate(new Date(item.tglMasuk));
          weeklyData[week].pengeluaran += item.totalHarga;
        });

        Object.keys(weeklyData).forEach((week) => {
          labels.push(week);
          pendapatan.push(Math.round(weeklyData[week].pendapatan / 1000000));
          pengeluaran.push(Math.round(weeklyData[week].pengeluaran / 1000000));
        });

        console.log("Chart Data (Weekly):", {
          labels,
          pengeluaran,
          pendapatan,
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

          const [barangKeluar, barangMasuk, pengeluaranData] =
            await Promise.all([
              prisma.barangKeluar.aggregate({
                where: {
                  tglKeluar: { gte: startDate, lte: endDate },
                  admin: { jabatan },
                },
                _sum: { totalOmset: true },
              }),
              prisma.barangMasuk.aggregate({
                where: {
                  tglMasuk: { gte: startDate, lte: endDate },
                  admin: { jabatan },
                },
                _sum: { totalHarga: true },
              }),
              prisma.pengeluaran.aggregate({
                where: {
                  tanggal: { gte: startDate, lte: endDate },
                  admin: { jabatan },
                },
                _sum: { totalHarga: true },
              }),
            ]);

          const totalPendapatan = barangKeluar._sum.totalOmset || 0;
          const totalModal = barangMasuk._sum.totalHarga || 0;
          const totalPengeluaranBulanan = pengeluaranData._sum.totalHarga || 0;
          const totalPengeluaran = totalModal + totalPengeluaranBulanan;

          pendapatan.push(Math.round(totalPendapatan / 1000000));
          pengeluaran.push(Math.round(totalPengeluaran / 1000000));
        }

        console.log("Chart Data (Monthly):", {
          labels,
          pengeluaran,
          pendapatan,
        });
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

        const [transaksi, pengeluaranData] = await Promise.all([
          prisma.barangKeluar.findMany({
            where: {
              tglKeluar: { gte: startDate, lte: endDate },
              admin: { jabatan },
            },
            include: {
              transaksiKeluar: {
                select: {
                  labaBerjalan: true,
                },
              },
            },
          }),
          prisma.pengeluaran.aggregate({
            where: {
              tanggal: { gte: startDate, lte: endDate },
              admin: { jabatan },
            },
            _sum: { totalHarga: true },
          }),
        ]);

        const labaBerjalan = transaksi.reduce(
          (sum, t) => sum + (t.transaksiKeluar?.[0]?.labaBerjalan || 0),
          0
        );
        const totalPengeluaran = pengeluaranData._sum.totalHarga || 0;
        const labaBersih = labaBerjalan - totalPengeluaran;

        dataPerBulan.push({
          bulan: label,
          owner1: Math.floor(labaBersih * 0.3),
          owner2: Math.floor(labaBersih * 0.3),
          owner3: Math.floor(labaBersih * 0.3),
          kas: Math.floor(labaBersih * 0.1),
        });
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
    barangNama: string = "all",
    periode: number = 1
  ): Promise<TopPelanggan[]> => {
    try {
      const { startDate, endDate } = getDateRangeByPeriode(periode);

      const whereCondition: any = {
        admin: { jabatan },
        tglKeluar: { gte: startDate, lte: endDate },
      };

      if (barangNama !== "all") {
        whereCondition.details = {
          some: {
            barang: {
              nama: {
                contains: barangNama,
                mode: "insensitive",
              },
            },
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
          barangNama:
            barangNama === "all"
              ? "Semua Produk"
              : barangNama.includes("difire")
              ? "Aqua Difire"
              : "Aqua Water",
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
