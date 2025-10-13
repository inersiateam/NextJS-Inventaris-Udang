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
import { useState } from "react";
import BarangKeluarDialog from "./Dialog";

export default function BarangKeluarTable({ data }: { data: any[] }) {
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
                "No Invoice",
                "Tanggal Keluar",
                "Nama Barang",
                "Nama Pelanggan",
                "Alamat Pelanggan",
                "Status",
                "Aksi",
              ].map((head) => (
                <TableHead key={head} className="text-white whitespace-nowrap px-6">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-6">{item.invoice}</TableCell>
                <TableCell className="px-6">{item.tanggal}</TableCell>
                <TableCell className="px-6">{item.namaBarang}</TableCell>
                <TableCell className="px-6">{item.pelanggan}</TableCell>
                <TableCell className="px-6">{item.alamat}</TableCell>
                <TableCell className="px-6">
                  <Badge variant={"default"} className="text-white">
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open actions"
                        className="inline-flex items-center justify-end rounded-md p-1 hover:bg-muted/40"
                      >
                        <More size="20" color="#000" variant="Outline" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end" className="w-36">
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Edit2 size="18" color="#000" variant="Outline" /> <span className="text-sm">Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Eye size="18" color="#000" variant="Outline" /> <span className="text-sm">Detail</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Trash size="18" color="#000" variant="Outline" /> <span className="text-sm">Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BarangKeluarDialog open={openDialog} onOpenChange={setOpenDialog} />
    </>
  );
}
