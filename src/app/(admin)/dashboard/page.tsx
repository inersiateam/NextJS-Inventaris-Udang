import { getJabatan } from "@/lib/helpers/globalHelper";
import {
  getDashboardData,
  getPelangganAktif,
  getChartStatistik,
  getChartBarang,
  getTagihanJatuhTempo,
} from "@/lib/services/dashboardService";
import DashboardClient from "./dashboardClient";
import {
  OmsetCard,
  ProductCard,
  PelangganCard,
  EmptyProductCard,
} from "./components/dashboardComponents";

export default async function Page() {
  const jabatan = await getJabatan();

  const [
    dashboardData,
    pelangganAktif,
    chartStatistik,
    chartBarang,
    tagihanJatuhTempo,
  ] = await Promise.all([
    getDashboardData(jabatan),
    getPelangganAktif(jabatan),
    getChartStatistik(jabatan),
    getChartBarang(jabatan),
    getTagihanJatuhTempo(jabatan),
  ]);

  const { stats, barangList } = dashboardData;
  const latestBarang = barangList.slice(0, 3);

  // Hitung total card: 1 Omset + jumlah barang + 1 Pelanggan
  const totalCards = 1 + latestBarang.length + 1;

  // Tentukan grid columns berdasarkan jumlah card
  const getGridCols = () => {
    if (totalCards <= 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (totalCards === 4) return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4";
    if (totalCards === 5) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"; // untuk 6+ card
  };
  return (
    <div className="space-y-6 p-2">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Visualisasi data, manajemen informasi, dan insight!
        </p>
      </header>

      <section className={`grid ${getGridCols()} gap-3`}>
        {" "}
        <OmsetCard
          totalOmset={stats.totalOmset}
          percentageChange={stats.percentageChange}
        />
        {latestBarang.length > 0 ? (
          <>
            {latestBarang.map((barang) => (
              <ProductCard
                key={barang.id}
                nama={barang.nama}
                stok={barang.stok}
              />
            ))}
            {latestBarang.length === 1 && <EmptyProductCard />}
          </>
        ) : (
          <></>
        )}
        <PelangganCard count={pelangganAktif} />
      </section>

      <DashboardClient
        chartStatistik={chartStatistik}
        chartBarang={chartBarang}
        tagihanJatuhTempo={tagihanJatuhTempo}
      />
    </div>
  );
}
