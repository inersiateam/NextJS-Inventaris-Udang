// app/barang-keluar/page.tsx
import BarangKeluarTable from "./component/Barang-keluar";

export default async function Page() {
  const data = [
    {
      id: 1,
      invoice: "IN/013/10/ABL/05/2025",
      tanggal: "2025-10-01",
      namaBarang: "Aqua Water",
      pelanggan: "Tambak Makmur Jaya",
      jumlah:"10",
      harga:"Rp.55.000",
      totalOmset:"Rp.500.000",
      totalModal:"Rp.450.000",
      jatuhTempo:"2025-10-10",
      alamat: "Banyuwangi",
      status: "Lunas",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Barang Keluar</h1>
      <p className="text-gray-500 text-sm">
        Tambahkan item baru ke sistem, pantau stok lebih rapi
      </p>

      <BarangKeluarTable data={data} />
    </div>
  );
}
