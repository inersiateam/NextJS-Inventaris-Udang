import { Badge } from "@/components/ui/badge";
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
import { Edit, Edit2, Eye, More, More2, Trash } from "iconsax-react";

export default function BarangMasuk() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Barang Masuk</h1>
        <p className="text-gray-500 text-sm">
          Tambahkan item baru ke sistem, pantau stok lebih rapi
        </p>
      </div>
      <div className="mb-4 flex justify-end">
        <Button>Tambah data</Button>
      </div>
      <div className="w-full overflow-x-auto bg-white rounded-lg ">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-600 text-white">
              <TableHead className="text-white whitespace-nowrap px-12">
                Tanggal
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-12">
                Jatuh Tempo
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-12">
                No Invoice
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-12">
                No Surat Jalan
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-12">
                Nama Barang
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-12">
                QTY
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-12">
                Ongkir
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-12">
                Total
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-12">
                Status
              </TableHead>
              <TableHead className="text-white whitespace-nowrap px-12">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="whitespace-nowrap px-12">
                1/10/2025
              </TableCell>
              <TableCell className="whitespace-nowrap px-12">
                Paket Invoice
              </TableCell>
              <TableCell className="whitespace-nowrap px-12">
                IN/013/10/ABL/05/2025
              </TableCell>
              <TableCell className="whitespace-nowrap px-12">
                DP.ABL.013/10/05/2025
              </TableCell>
              <TableCell className="whitespace-nowrap px-12">
                Aqua Water
              </TableCell>
              <TableCell className="whitespace-nowrap px-12">120</TableCell>
              <TableCell className="whitespace-nowrap px-12">
                Rp. 230.500
              </TableCell>
              <TableCell className="whitespace-nowrap px-12">
                Rp. 13.230.500
              </TableCell>
              <TableCell className="whitespace-nowrap px-12">
                <Badge variant={"default"} className="text-white">
                  Lunas
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap px-12">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open actions"
                      className="inline-flex items-end justify-end rounded-md p-1 hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring"
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
