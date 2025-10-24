import { getJabatan } from "@/lib/helpers/globalHelper";
import {
  getLaporanStatsByPeriode,
  getChartLaporanByPeriode,
  getPembagianProvitByPeriode,
  getTopPelangganByPeriode,
  getChartBarangLaporanByPeriode,
  getBarangTabsForLaporan,
} from "@/lib/services/laporanService";
import LaporanClient from "./components/laporanClient";

export const revalidate = 20;
export const dynamic = "force-dynamic";

export default async function Page() {
  const jabatan = await getJabatan();

  const barangTabs = await getBarangTabsForLaporan(jabatan);
  const topPelangganPromises = barangTabs.map((barang) =>
    getTopPelangganByPeriode(jabatan, barang.id, 1)
  );

  const [
    laporanStats,
    chartLaporan,
    pembagianProvit,
    chartBarang,
    ...topPelangganResults
  ] = await Promise.all([
    getLaporanStatsByPeriode(jabatan, 1),
    getChartLaporanByPeriode(jabatan, 1),
    getPembagianProvitByPeriode(jabatan, 1),
    getChartBarangLaporanByPeriode(jabatan, 1),
    ...topPelangganPromises,
  ]);

  const topPelangganByBarang: Record<string, any[]> = {};
  barangTabs.forEach((barang, index) => {
    topPelangganByBarang[barang.id] = topPelangganResults[index];
  });

  return (
    <LaporanClient
      initialStats={laporanStats}
      initialChartLaporan={chartLaporan}
      initialPembagianProvit={pembagianProvit}
      initialTopPelangganByBarang={topPelangganByBarang}
      initialChartBarang={chartBarang}
      initialBarangTabs={barangTabs}
      jabatan={jabatan}
    />
  );
}
