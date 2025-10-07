import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash } from "iconsax-react";

export default function Pengeluaran() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengeluaran</h1>
        <p className="text-gray-500 text-sm">
          Tambahkan item baru ke sistem, pantau stok lebih rapi
        </p>
      </div>
      <div className="mb-4 flex justify-end">
        <Button>Tambah data</Button>
      </div>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-600 text-white">
              <TableHead className="text-white whitespace-nowrap px-4">
                Tanggal
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-4">
                Keterangan
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-4">
                Quantity
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-4">
                Harga
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-4">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="whitespace-nowrap px-4">
                2025-10-01
              </TableCell>
              <TableCell className="whitespace-nowrap px-4">
                Aqua Water
              </TableCell>
              <TableCell className="whitespace-nowrap px-4">
                Tambak Makmur Jaya
              </TableCell>
              <TableCell className="whitespace-nowrap px-4">
                Banyuwangi
              </TableCell>
              
              <TableCell className="whitespace-nowrap">
                <div className="flex gap-2">
                  <Button variant="edit" size="icon" className="rounded-2xl">
                    <Edit size="20" color="black" />
                  </Button>
                  <Button variant="delete" size="icon" className="rounded-2xl">
                    <Trash size="20" color="#dc2626" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
}
