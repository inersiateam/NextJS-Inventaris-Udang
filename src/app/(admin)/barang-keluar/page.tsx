import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { getBarangKeluarAction } from "./actions/barangKeluarActions";
import BarangKeluarTable from "./component/Barang-keluar";

interface PageProps {
  searchParams: {
    page?: string;
    bulan?: string;
    tahun?: string;
    status?: "BELUM_LUNAS" | "LUNAS";
  };
}

export default async function BarangKeluarPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1");
  const bulan = searchParams.bulan ? parseInt(searchParams.bulan) : undefined;
  const tahun = searchParams.tahun ? parseInt(searchParams.tahun) : undefined;
  const status = searchParams.status;

  const result = await getBarangKeluarAction({
    page,
    limit: 5,
    bulan,
    tahun,
    status,
  });

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{result.success || "Gagal memuat data"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Barang Keluar
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Kelola data transaksi barang keluar, pantau stok lebih rapi
        </p>
      </header>

      <BarangKeluarTable
        data={"data" in result ? result.data : null}
        pagination={"pagination" in result ? result.pagination : null}
        currentFilters={{ bulan, tahun, status }}
      />
    </div>
  );
}
