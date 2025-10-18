import { getJabatan } from "@/lib/helpers/globalHelper";
import {
  getLaporanStatsByPeriode,
  getChartLaporanByPeriode,
  getPembagianProvitByPeriode,
  getTopPelangganByPeriode,
  getChartBarangLaporanByPeriode,
} from "@/lib/services/laporanService";
import LaporanClient from "./components/laporanClient";

export const revalidate = 20;
export const dynamic = "force-dynamic";

export default async function Page() {
  const jabatan = await getJabatan();
  const [
    laporanStats,
    chartLaporan,
    pembagianProvit,
    topPelangganWater,
    topPelangganDifire,
    chartBarang,
  ] = await Promise.all([
    getLaporanStatsByPeriode(jabatan, 1),
    getChartLaporanByPeriode(jabatan, 1),
    getPembagianProvitByPeriode(jabatan, 1),
    getTopPelangganByPeriode(jabatan, "water", 1),
    getTopPelangganByPeriode(jabatan, "difire", 1),
    getChartBarangLaporanByPeriode(jabatan, 1),
  ]);

  return (
    <LaporanClient
      initialStats={laporanStats}
      initialChartLaporan={chartLaporan}
      initialPembagianProvit={pembagianProvit}
      initialTopPelangganWater={topPelangganWater}
      initialTopPelangganDifire={topPelangganDifire}
      initialChartBarang={chartBarang}
    />
  );
}
