import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { getBarangWithPagination } from "@/lib/services/barangService"
import { Jabatan } from "@prisma/client"
import BarangClient from "./component/BarangClient"
import { redirect } from "next/navigation"

export default async function BarangPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const initialData = await getBarangWithPagination({
    jabatan: session.user.jabatan as Jabatan,
    page: 1,
    limit: 10,
  })

  return (
    <div className="space-y-6 p-2">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Barang
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Tambahkan item baru ke sistem, pantau stok lebih rapi
        </p>
      </header>

      <BarangClient 
        initialData={initialData.data}
        initialPage={initialData.pagination.page}
        initialTotalPages={initialData.pagination.totalPages}
      />
    </div>
  )
}