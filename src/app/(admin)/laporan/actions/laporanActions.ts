"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  getLaporanStatsByPeriode,
  getChartLaporanByPeriode,
  getPembagianProvitByPeriode,
  getTopPelangganByPeriode,
  getChartBarangLaporanByPeriode,
} from "@/lib/services/laporanService";
import { Jabatan } from "@prisma/client";
import {
  LaporanStatsResponse,
  ChartLaporanResponse,
  PembagianProvitResponse,
  TopPelangganResponse,
  ChartBarangResponse,
} from "@/types/interfaces/ILaporan";

export async function getLaporanStatsAction(
  periode: number = 1
): Promise<LaporanStatsResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const stats = await getLaporanStatsByPeriode(
      session.user.jabatan as Jabatan,
      periode
    );

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error in getLaporanStatsAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data statistik",
    };
  }
}

export async function getChartLaporanAction(
  periode: number = 1
): Promise<ChartLaporanResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const chartData = await getChartLaporanByPeriode(
      session.user.jabatan as Jabatan,
      periode
    );

    return {
      success: true,
      data: chartData,
    };
  } catch (error) {
    console.error("Error in getChartLaporanAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data chart",
    };
  }
}

export async function getPembagianProvitAction(
  periode: number = 1
): Promise<PembagianProvitResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const pembagian = await getPembagianProvitByPeriode(
      session.user.jabatan as Jabatan,
      periode
    );

    return {
      success: true,
      data: pembagian,
    };
  } catch (error) {
    console.error("Error in getPembagianProvitAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data pembagian provit",
    };
  }
}

export async function getTopPelangganAction(
  barangNama: string = "all",
  periode: number = 1
): Promise<TopPelangganResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const topPelanggan = await getTopPelangganByPeriode(
      session.user.jabatan as Jabatan,
      barangNama,
      periode
    );

    return {
      success: true,
      data: topPelanggan,
    };
  } catch (error) {
    console.error("Error in getTopPelangganAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data top pelanggan",
    };
  }
}

export async function getChartBarangLaporanAction(
  periode: number = 1
): Promise<ChartBarangResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const chartBarang = await getChartBarangLaporanByPeriode(
      session.user.jabatan as Jabatan,
      periode
    );

    return {
      success: true,
      data: chartBarang,
    };
  } catch (error) {
    console.error("Error in getChartBarangLaporanAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data chart barang",
    };
  }
}
