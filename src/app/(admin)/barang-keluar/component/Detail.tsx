"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Import } from "iconsax-react";

interface BarangKeluarDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: any;
}

export default function BarangKeluarDetailDialog({
  open,
  onOpenChange,
  data,
}: BarangKeluarDetailDialogProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[85vw] w-full md:w-[85vw] bg-white rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Detail Barang Keluar
          </DialogTitle>
          
        </DialogHeader>

        <div className="grid grid-cols-2 gap-y-1 text-sm mb-4">
          <div>
            No. Invoice : <span className="font-semibold">{data.invoice}</span>
          </div>
          <div>
            Nama Barang :{" "}
            <span className="font-semibold">{data.namaBarang}</span>
          </div>

          <div>
            Tanggal Keluar :{" "}
            <span className="font-semibold">{data.tanggal}</span>
          </div>
          <div>
            Nama Pelanggan :{" "}
            <span className="font-semibold">{data.pelanggan}</span>
          </div>

          <div>
            Jatuh Tempo :{" "}
            <span className="font-semibold text-gray-800">
              {data.jatuhTempo}
            </span>
          </div>
          <div>
            Alamat Pelanggan :{" "}
            <span className="font-semibold">{data.alamat}</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-sky-600 text-white">
                <TableHead className="text-white text-center">
                  Nama Barang
                </TableHead>
                <TableHead className="text-white text-center">
                  Jumlah Barang
                </TableHead>
                <TableHead className="text-white text-center">
                  Harga Per Produk
                </TableHead>
                <TableHead className="text-white text-center">
                  Total Omset
                </TableHead>
                <TableHead className="text-white text-center">
                  Total Modal
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-center">{data.namaBarang}</TableCell>
                <TableCell className="text-center">{data.jumlah}</TableCell>
                <TableCell className="text-center">{data.harga}</TableCell>
                <TableCell className="text-center">{data.totalOmset}</TableCell>
                <TableCell className="text-center">{data.totalModal}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button className="flex items-center gap-2">
            <Import size="18" color="#fff" variant="Outline" />
            Unduh
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keluar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
