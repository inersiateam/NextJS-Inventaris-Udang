import { redirect } from "next/navigation";
import {
  getDashboardGuestData,
  getPelangganAktifGuest,
  getChartStatistikGuest,
  getChartBarangGuest,
  getTagihanJatuhTempoGuest,
} from "@/lib/services/dashboardGuestService";
import DashboardGuestClient from "./dashboardGuestClient";
import {
  OmsetCard,
  ProductCard,
  PelangganCard,
} from "@/app/(admin)/dashboard/components/dashboardComponents";
import GuestNavbar from "./components/Navbar";

type SearchParams = {
  type?: string;
};

export default async function DashboardGuestPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const guestType = searchParams?.type as "abl" | "atm" | undefined;

  if (!guestType || (guestType !== "abl" && guestType !== "atm")) {
    redirect("/guest-selection");
  }

  const [
    dashboardData,
    pelangganAktif,
    chartStatistik,
    chartBarang,
    tagihanJatuhTempo,
  ] = await Promise.all([
    getDashboardGuestData(guestType),
    getPelangganAktifGuest(guestType),
    getChartStatistikGuest(guestType),
    getChartBarangGuest(guestType),
    getTagihanJatuhTempoGuest(guestType),
  ]);

  const { stats, barangList } = dashboardData;
  const latestBarang = barangList.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestNavbar guestType={guestType} />

      <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
       
        <section
          className={`grid gap-3 ${
            latestBarang.length === 1
              ? "grid-cols-1 lg:grid-cols-3"
              : latestBarang.length === 2
              ? "grid-cols-1 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
          }`}
        >
          <OmsetCard
            totalOmset={stats.totalOmset}
            percentageChange={stats.percentageChange}
          />

          {latestBarang.length > 0 && (
            <>
              {latestBarang.map((barang) => (
                <ProductCard
                  key={barang.id}
                  nama={barang.nama}
                  stok={barang.stok}
                />
              ))}
            </>
          )}

          <PelangganCard count={pelangganAktif} />
        </section>

        <DashboardGuestClient
          chartStatistik={chartStatistik}
          chartBarang={chartBarang}
          tagihanJatuhTempo={tagihanJatuhTempo}
          guestType={guestType}
        />
      </div>
    </div>
  );
}
