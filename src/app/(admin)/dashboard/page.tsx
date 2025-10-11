import { getJabatan } from "@/lib/helpers/globalHelper";
import {
  getDashboardData,
  getPelangganAktif,
  getChartStatistik,
  getChartBarang,
  getTagihanJatuhTempo,
} from "@/lib/services/barangService";
import DashboardClient from "./dashboardClient";
import {
  OmsetCard,
  ProductCard,
  EmptyProductCard,
  PelangganCard,
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
  const latestBarang = barangList.slice(0, 2);

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Visualisasi data, manajemen informasi, dan insight!
        </p>
      </header>

      {/* Stats Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <>
            <EmptyProductCard />
            <EmptyProductCard />
          </>
        )}

        <PelangganCard count={pelangganAktif} />
      </section>

      {/* Charts and Bills */}
      <DashboardClient
        chartStatistik={chartStatistik}
        chartBarang={chartBarang}
        tagihanJatuhTempo={tagihanJatuhTempo}
      />
    </div>
  );
}
