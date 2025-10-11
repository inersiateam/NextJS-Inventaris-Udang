import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PengeluaranDialog from "./component/Dialog";
import PengeluaranDropdown from "./component/Pengeluaran-dropdown";

export default function Pengeluaran() {
  // contoh data dummy (bisa nanti ganti ambil dari DB)
  const data = [
    {
      id: 1,
      tanggal: "2025-10-01",
      keterangan: "Beli Galon Aqua",
      quantity: 10,
      harga: 50000,
    },
    {
      id: 2,
      tanggal: "2025-10-03",
      keterangan: "Beli Tisu Kantor",
      quantity: 5,
      harga: 30000,
    },
  ];

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengeluaran</h1>
        <p className="text-gray-500 text-sm">
          Tambahkan item baru ke sistem, pantau stok lebih rapi
        </p>
      </div>

      <div className="mb-4 flex justify-end">
        <PengeluaranDialog />
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-600 text-white">
              <TableHead className="text-white px-4 whitespace-nowrap">
                Tanggal
              </TableHead>
              <TableHead className="text-white px-4 whitespace-nowrap">
                Keterangan
              </TableHead>
              <TableHead className="text-white px-4 whitespace-nowrap">
                Quantity
              </TableHead>
              <TableHead className="text-white px-4 whitespace-nowrap">
                Harga
              </TableHead>
              <TableHead className="text-white px-4 whitespace-nowrap">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-4 whitespace-nowrap">{item.tanggal}</TableCell>
                <TableCell className="px-4 whitespace-nowrap">{item.keterangan}</TableCell>
                <TableCell className="px-4 whitespace-nowrap">{item.quantity}</TableCell>
                <TableCell className="px-4 whitespace-nowrap">
                  Rp {item.harga.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="px-4 whitespace-nowrap">
                  <PengeluaranDropdown item={item} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
