import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Eye, More, Trash } from "iconsax-react";

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
              
              <TableCell className="whitespace-nowrap px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open actions"
                      className="inline-flex items-center justify-end rounded-md p-1 hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <More size="20" color="#000" variant="Outline" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="bottom"
                    align="end"
                    className="w-36"
                  >
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Edit2 size="18" color="#000" variant="Linear" />{" "}
                      <span className="text-sm">Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Eye size="18" color="#000" variant="Linear" />
                      <span className="text-sm">Detail</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-2">
                      <Trash size="18" color="#000" variant="Bold" />
                      <span className="text-sm">Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
}
