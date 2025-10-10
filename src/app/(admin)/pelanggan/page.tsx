// app/pelanggan/page.tsx
import Pelanggan from "./component/Pelanggan";

export default function Page() {
  // Halaman ini server-side (tidak pakai "use client")
  // Bisa ambil data dari database di sini (pakai prisma, fetch, dsb.)
  const pelanggan = [
    { id: 1, nama: "Tambak Makmur Jaya", area: "Banyuwangi" },
    { id: 2, nama: "PT Sumber Laut", area: "Situbondo" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Pelanggan</h1>
      <p className="text-gray-500 text-sm">
        Tambahkan item baru ke sistem, pantau stok lebih rapi
      </p>
      {/* Client Component di bawah */}
      <Pelanggan data={pelanggan} />
    </div>
  );
}
