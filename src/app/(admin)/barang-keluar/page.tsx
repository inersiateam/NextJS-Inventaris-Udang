import { getJabatan } from "@/lib/helpers/globalHelper";
import {
  getBarangKeluarWithPagination,
  getBarangList,
  getPelangganList,
} from "@/lib/services/barangKeluarService";
import BarangKeluarClient from "./component/Barang-keluar";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    filterBulan?: string;
    status?: "BELUM_LUNAS" | "LUNAS";
  }>;
}

function TableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-32" />
        </div>
      </div>
      <div className="h-96 bg-gray-200 rounded-lg w-full" />
      <div className="h-10 bg-gray-200 rounded w-1/3 ml-auto" />
    </div>
  );
}

async function BarangKeluarContent({ searchParams }: PageProps) {
  const jabatan = await getJabatan();
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const filterBulan = params.filterBulan
    ? parseInt(params.filterBulan)
    : undefined;
  const status = params.status || undefined;

  const [barangKeluarData, barangOptions, pelangganOptions] = await Promise.all(
    [
      getBarangKeluarWithPagination(jabatan, {
        page,
        limit: 5,
        filterBulan,
        status,
      }),
      getBarangList(jabatan),
      getPelangganList(jabatan),
    ]
  );

  if (!barangKeluarData.success) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error</p>
        <p className="text-sm">Gagal memuat data barang keluar</p>
      </div>
    );
  }

  return (
    <BarangKeluarClient
      barangKeluarList={barangKeluarData.data}
      barangOptions={barangOptions}
      pelangganOptions={pelangganOptions}
      pagination={barangKeluarData.pagination}
      currentFilters={{ filterBulan, status }}
      jabatan={jabatan}
    />
  );
}

export default async function Page({ searchParams }: PageProps) {
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

      <Suspense fallback={<TableSkeleton />}>
        <BarangKeluarContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

export const revalidate = 0;
export const dynamic = "force-dynamic";
