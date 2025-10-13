import { getPengeluaranAction } from "./actions/pengeluaranActions";
import PengeluaranTable from "./component/pengeluaran-table";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    bulan?: string;
    tahun?: string;
  }>;
}

function TableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-lg w-full" />
      <div className="h-64 bg-gray-200 rounded-lg w-full" />
      <div className="h-10 bg-gray-200 rounded-lg w-1/3 ml-auto" />
    </div>
  );
}

async function PengeluaranContent({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const bulan = params.bulan ? parseInt(params.bulan) : undefined;
  const tahun = params.tahun ? parseInt(params.tahun) : undefined;

  const result = await getPengeluaranAction({
    page,
    limit: 10,
    bulan: bulan?.toString(),
    tahun: tahun?.toString(),
  });

  if ("error" in result) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error</p>
        <p className="text-sm">{result.error}</p>
      </div>
    );
  }

  return (
    <PengeluaranTable
      data={result.data}
      pagination={result.pagination}
      summary={result.summary}
      currentFilters={{ bulan, tahun }}
    />
  );
}

export default async function Pengeluaran({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 p-2">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Pengeluaran
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Kelola data pengeluaran, pantau keuangan lebih rapi
        </p>
      </header>

      <Suspense fallback={<TableSkeleton />}>
        <PengeluaranContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

export const revalidate = 0;
export const dynamic = "force-dynamic";
