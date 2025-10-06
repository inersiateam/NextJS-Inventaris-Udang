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

export default function BarangMasuk() {
  return (
    <>
    
   <div className="mb-4 flex justify-end">
  <Button>Tambah data</Button>
</div>
   <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-sky-600 text-white">
            <TableHead className="text-white whitespace-nowrap px-12">Tanggal</TableHead>
            <TableHead className="text-white whitespace-nowrap px-12">Jatuh Tempo</TableHead>
            <TableHead className="text-white whitespace-nowrap px-12">No Invoice</TableHead>
            <TableHead className="text-white whitespace-nowrap px-12">No Surat Jalan</TableHead>
            <TableHead className="text-white whitespace-nowrap px-12">Nama Barang</TableHead>
            <TableHead className="text-white whitespace-nowrap px-12">QTY</TableHead>
            <TableHead className="text-white whitespace-nowrap px-12">Ongkir</TableHead>
            <TableHead className="text-white whitespace-nowrap px-12">Total</TableHead>
            <TableHead className="text-white whitespace-nowrap px-12">Status</TableHead>
            <TableHead className="text-white whitespace-nowrap px-12">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="whitespace-nowrap px-12">1/10/2025</TableCell>
            <TableCell className="whitespace-nowrap px-12">Paket Invoice</TableCell>
            <TableCell className="whitespace-nowrap px-12">IN/013/10/ABL/05/2025</TableCell>
            <TableCell className="whitespace-nowrap px-12">DP.ABL.013/10/05/2025</TableCell>
            <TableCell className="whitespace-nowrap px-12">Aqua Water</TableCell>
            <TableCell className="whitespace-nowrap px-12">120</TableCell>
            <TableCell className="whitespace-nowrap px-12">Rp. 230.500</TableCell>
            <TableCell className="whitespace-nowrap px-12">Rp. 13.230.500</TableCell>
            <TableCell className="whitespace-nowrap px-12">
              <Badge variant={"default"} className="text-white">
                Lunas
              </Badge>
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
          <TableRow>
            <TableCell className="whitespace-nowrap px-12">1/10/2025</TableCell>
            <TableCell className="whitespace-nowrap px-12">Paket Invoice</TableCell>
            <TableCell className="whitespace-nowrap px-12">IN/013/10/ABL/05/2025</TableCell>
            <TableCell className="whitespace-nowrap px-12">DP.ABL.013/10/05/2025</TableCell>
            <TableCell className="whitespace-nowrap px-12">Aqua Water</TableCell>
            <TableCell className="whitespace-nowrap px-12">120</TableCell>
            <TableCell className="whitespace-nowrap px-12">Rp. 230.500</TableCell>
            <TableCell className="whitespace-nowrap px-12">Rp. 13.230.500</TableCell>
            <TableCell className="whitespace-nowrap px-12">
              <Badge variant={"default"} className="text-white">
                Lunas
              </Badge>
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