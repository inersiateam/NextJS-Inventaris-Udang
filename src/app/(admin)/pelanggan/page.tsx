import { Suspense } from "react";
import Pelanggan from "./component/Pelanggan";
import { getPelangganAction } from "./actions/pelangganActions";

function TableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-end">
        <div className="h-10 bg-gray-200 rounded w-40" />
      </div>
      <div className="h-96 bg-gray-200 rounded-lg w-full" />
    </div>
  );
}

async function PelangganContent() {
  const result = await getPelangganAction();

  if (!result.success) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error</p>
        <p className="text-sm">Gagal memuat data pelanggan</p>
      </div>
    );
  }

  return <Pelanggan data={"data" in result ? result.data : []} />;
}

export default async function Page() {
  return (
    <div className="space-y-6 p-2">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Pelanggan
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Kelola data pelanggan, pantau transaksi dan riwayat pembelian
        </p>
      </header>

      <Suspense fallback={<TableSkeleton />}>
        <PelangganContent />
      </Suspense>
    </div>
  );
}

export const revalidate = 0;
export const dynamic = "force-dynamic";
