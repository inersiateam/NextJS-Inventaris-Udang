"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit2, Eye, More, Trash } from "iconsax-react";
import PelangganDialog from "./Dialog";
import { useState } from "react";

export default function Pelanggan({ data }: { data: any[] }) {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpenDialog(true)}>Tambah data</Button>
      </div>

      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-600 text-white">
              <TableHead className="text-white whitespace-nowrap px-4">Nama Pelanggan</TableHead>
              <TableHead className="text-white whitespace-nowrap px-4">Area</TableHead>
              <TableHead className="text-white whitespace-nowrap px-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="whitespace-nowrap px-4">{item.nama}</TableCell>
                <TableCell className="whitespace-nowrap px-4">{item.area}</TableCell>
                <TableCell className="whitespace-nowrap px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-end rounded-md p-1 hover:bg-muted/40"
                      >
                        <More size="20" color="#000" variant="Outline" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end" className="w-36">
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Edit2 size="20" color="#000" variant="Outline" /> <span className="text-sm">Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Eye size="20" color="#000" variant="Outline" /> <span className="text-sm">Detail</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Trash size="20" color="#000" variant="Outline" /> <span className="text-sm">Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Komponen dialog */}
      <PelangganDialog open={openDialog} onOpenChange={setOpenDialog} />
    </>
  );
}
