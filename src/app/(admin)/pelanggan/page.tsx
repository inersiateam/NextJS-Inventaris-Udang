// app/pelanggan/page.tsx
import Pelanggan from "./component/Pelanggan";
import { getPelangganAction } from "./actions/pelangganActions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const result = await getPelangganAction();

  if (!result.success) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pelanggan</h1>
        <p className="text-red-500 text-sm mt-2">
          {result.success || "Gagal memuat data pelanggan"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Pelanggan</h1>
      <p className="text-gray-500 text-sm">
        Kelola data pelanggan, pantau transaksi dan riwayat pembelian
      </p>
      <Pelanggan data={'data' in result ? result.data : []} />
    </div>
  );
}