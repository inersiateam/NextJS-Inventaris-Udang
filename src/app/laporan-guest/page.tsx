import { redirect } from "next/navigation";
import {
  getLaporanStatsByPeriodeGuest,
  getChartLaporanByPeriodeGuest,
  getPembagianProvitByPeriodeGuest,
  getTopPelangganByPeriodeGuest,
  getChartBarangLaporanByPeriodeGuest,
  getBarangTabsForLaporanGuest,
} from "@/lib/services/laporanGuestService";
import LaporanGuestClient from "./components/laporanGuestClient";

export const revalidate = 20;
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { type?: string };
}

export default async function LaporanGuestPage({ searchParams }: PageProps) {
  const type = searchParams.type;

  if (!type || (type !== "abl" && type !== "atm")) {
    redirect("/guest-selection");
  }

  const barangTabs = await getBarangTabsForLaporanGuest(type);
  const topPelangganPromises = barangTabs.map((barang) =>
    getTopPelangganByPeriodeGuest(type, barang.id, 1)
  );

  const [
    laporanStats,
    chartLaporan,
    pembagianProvit,
    chartBarang,
    ...topPelangganResults
  ] = await Promise.all([
    getLaporanStatsByPeriodeGuest(type, 1),
    getChartLaporanByPeriodeGuest(type, 1),
    getPembagianProvitByPeriodeGuest(type, 1),
    getChartBarangLaporanByPeriodeGuest(type, 1),
    ...topPelangganPromises,
  ]);

  const topPelangganByBarang: Record<string, any[]> = {};
  barangTabs.forEach((barang, index) => {
    topPelangganByBarang[barang.id] = topPelangganResults[index];
  });

  return (
    <LaporanGuestClient
      initialStats={laporanStats}
      initialChartLaporan={chartLaporan}
      initialPembagianProvit={pembagianProvit}
      initialTopPelangganByBarang={topPelangganByBarang}
      initialChartBarang={chartBarang}
      initialBarangTabs={barangTabs}
      type={type}
    />
  );
}