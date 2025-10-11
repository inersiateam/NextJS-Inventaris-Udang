// app/barang-masuk/page.tsx
import BarangMasukTable from "./component/Barang-masuk";

export default async function Page() {
  const data = [
    {
      id: 1,
      tanggal: "1/10/2025",
      tempo: "3/10/2025",
      invoice: "IN/013/10/ABL/05/2025",
      surat: "DP.ABL.013/10/05/2025",
      nama: "Aqua Water",
      qty: 120,
      ongkir: "Rp. 230.500",
      total: "Rp. 13.230.500",
      status: "Lunas",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Barang Masuk</h1>
      <p className="text-gray-500 text-sm">
        Tambahkan item baru ke sistem, pantau stok lebih rapi
      </p>
      <BarangMasukTable data={data} />
    </div>
  );
}
