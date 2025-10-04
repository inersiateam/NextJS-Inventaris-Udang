import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InvoiceTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-sky-600 text-white">
          <TableHead className="text-white">Tanggal</TableHead>
          <TableHead className="text-white">Jatuh Tempo</TableHead>
          <TableHead className="text-white">No Invoice</TableHead>
          <TableHead className="text-white">No Surat Jalan</TableHead>
          <TableHead className="text-white">Nama Barang</TableHead>
          <TableHead className="text-white">QTY</TableHead>
          <TableHead className="text-white">Ongkir</TableHead>
          <TableHead className="text-white">Total</TableHead>
          <TableHead className="text-white">Status</TableHead>
          <TableHead className="text-white">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>1/10/2025</TableCell>
          <TableCell>Paket Invoice</TableCell>
          <TableCell>IN/013/10/ABL/05/2025</TableCell>
          <TableCell>DP.ABL.013/10/05/2025</TableCell>
          <TableCell>Aqua Water</TableCell>
          <TableCell>120</TableCell>
          <TableCell>Rp. 20.000</TableCell>
          <TableCell>Rp. 20.000</TableCell>
          <TableCell>
            <Badge variant={"secondary"} className="text-white">Lunas</Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
