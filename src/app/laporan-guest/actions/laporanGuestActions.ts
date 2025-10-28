"use server";

import {
  getLaporanStatsByPeriodeGuest,
  getChartLaporanByPeriodeGuest,
  getPembagianProvitByPeriodeGuest,
  getTopPelangganByPeriodeGuest,
  getChartBarangLaporanByPeriodeGuest,
  getBarangTabsForLaporanGuest,
} from "@/lib/services/laporanGuestService";

export async function getLaporanStatsGuestAction(type: string, periode: number) {
  try {
    const data = await getLaporanStatsByPeriodeGuest(type, periode);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching laporan stats:", error);
    return { success: false, error: "Failed to fetch laporan stats" };
  }
}

export async function getChartLaporanGuestAction(type: string, periode: number) {
  try {
    const data = await getChartLaporanByPeriodeGuest(type, periode);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching chart laporan:", error);
    return { success: false, error: "Failed to fetch chart laporan" };
  }
}

export async function getPembagianProvitGuestAction(type: string, periode: number) {
  try {
    const data = await getPembagianProvitByPeriodeGuest(type, periode);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching pembagian provit:", error);
    return { success: false, error: "Failed to fetch pembagian provit" };
  }
}

export async function getTopPelangganGuestAction(
  type: string,
  barangId: number,
  periode: number
) {
  try {
    const data = await getTopPelangganByPeriodeGuest(type, barangId, periode);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching top pelanggan:", error);
    return { success: false, error: "Failed to fetch top pelanggan" };
  }
}

export async function getChartBarangLaporanGuestAction(type: string, periode: number) {
  try {
    const data = await getChartBarangLaporanByPeriodeGuest(type, periode);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching chart barang:", error);
    return { success: false, error: "Failed to fetch chart barang" };
  }
}