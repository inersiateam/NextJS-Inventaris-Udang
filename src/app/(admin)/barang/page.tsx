import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit2, More, Trash } from "iconsax-react"
import DialogTambahBarang from "./component/Dialog"

export default function BarangPage() {
  return (
    <>
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Barang</h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Tambahkan item baru ke sistem, pantau stok lebih rapi
        </p>
      </header>

      {/* Komponen client */}
      <DialogTambahBarang />

      <Table>
        <TableHeader>
          <TableRow className="bg-primary text-white">
            <TableHead className="text-white whitespace-nowrap px-4">Barang</TableHead>
            <TableHead className="text-white whitespace-nowrap px-4">Harga</TableHead>
            <TableHead className="text-white whitespace-nowrap px-4 item-end">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Aqua Water</TableCell>
            <TableCell>Rp. 55.000</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted/40">
                    <More size="20" color="#000" variant="Outline" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-36">
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Edit2 size="20" color="#000" variant="Outline" />
                    <span className="text-sm">Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-500">
                    <Trash size="18" color="#ff0000ff" variant="Outline" />
                    <span className="text-sm">Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}
