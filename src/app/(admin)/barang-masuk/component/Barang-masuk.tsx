"use client";

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
import { Edit2, Eye, More, Trash } from "iconsax-react";
import BarangMasukDialog from "./Dialog";
import { useState } from "react";

export default function BarangMasukTable({ data }: { data: any[] }) {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpenDialog(true)}>Tambah data</Button>
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-600 text-white">
              {[
                "Tanggal",
                "Jatuh Tempo",
                "No Invoice",
                "No Surat Jalan",
                "Nama Barang",
                "QTY",
                "Ongkir",
                "Total",
                "Status",
                "Aksi",
              ].map((head) => (
                <TableHead
                  key={head}
                  className="text-white whitespace-nowrap px-12"
                >
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-12">{item.tanggal}</TableCell>
                <TableCell className="px-12">{item.tempo}</TableCell>
                <TableCell className="px-12">{item.invoice}</TableCell>
                <TableCell className="px-12">{item.surat}</TableCell>
                <TableCell className="px-12">{item.nama}</TableCell>
                <TableCell className="px-12">{item.qty}</TableCell>
                <TableCell className="px-12">{item.ongkir}</TableCell>
                <TableCell className="px-12">{item.total}</TableCell>
                <TableCell className="px-12">
                  <Badge variant="default" className="text-white">
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-12">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-end justify-end rounded-md p-1 hover:bg-muted/40">
                        <More size="20" color="#000" variant="Outline" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end" className="w-36">
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Edit2 size="18" /> <span className="text-sm">Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Eye size="18" /> <span className="text-sm">Detail</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Trash size="18" /> <span className="text-sm">Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog tambah barang masuk */}
      <BarangMasukDialog open={openDialog} onOpenChange={setOpenDialog} />
    </>
  );
}
