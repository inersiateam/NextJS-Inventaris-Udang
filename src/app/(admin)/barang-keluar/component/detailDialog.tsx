"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { DetailData } from "@/types/interfaces/IBarangKeluar";

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DetailData | null;
  adminName?: string;
  adminRole?: string;
}

export default function DetailDialog({
  open,
  onOpenChange,
  data,
}: DetailDialogProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl rounded-xl p-3 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-sm sm:text-base font-semibold text-gray-900">
            Detail Barang Keluar
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-[10px] sm:text-xs">
            Lihat detail anda disini, unduh untuk invoice nya!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-[2px] text-[10px] sm:text-[12px]">
            <div>
              No. Invoice:{" "}
              <span className="font-semibold">{data.noInvoice}</span>
            </div>
            <div>
              Nama Pelanggan:{" "}
              <span className="font-semibold">{data.namaPelanggan}</span>
            </div>
            <div>
              Tanggal Keluar:{" "}
              <span className="font-semibold">
                {formatDate(data.tglKeluar)}
              </span>
            </div>
            <div>
              Jatuh Tempo:{" "}
              <span className="font-semibold">
                {formatDate(data.jatuhTempo)}
              </span>
            </div>
          </div>

          {/* Table section */}
          <div className="overflow-x-auto rounded mt-1">
            <Table className="w-full text-[9px] sm:text-[11px]">
              <TableHeader>
                <TableRow className="bg-sky-600 text-white">
                  <TableHead className="text-center py-1">Barang</TableHead>
                  <TableHead className="text-center py-1">Jumlah</TableHead>
                  <TableHead className="text-center py-1">Harga Jual</TableHead>
                  <TableHead className="text-center py-1">
                    Subtotal Omset
                  </TableHead>
                  <TableHead className="text-center py-1">
                    Subtotal Modal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-center py-0.5">
                      {item.namaBarang}
                    </TableCell>
                    <TableCell className="text-center py-0.5">
                      {item.jmlPembelian}
                    </TableCell>
                    <TableCell className="text-center py-0.5">
                      {formatCurrency(item.hargaJual)}
                    </TableCell>
                    <TableCell className="text-center py-0.5">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                    <TableCell className="text-center py-0.5">
                      {formatCurrency(item.subtotalModal || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary section */}
          <div className="border-t pt-3 space-y-1 text-[10px] sm:text-[12px]">
            <div className="flex justify-between">
              <span>Total Omset:</span>
              <span className="font-semibold text-sky-700">
                {formatCurrency(data.totalOmset)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Modal:</span>
              <span className="font-semibold">
                {formatCurrency(data.totalModal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Laba Kotor:</span>
              <span className="font-semibold">
                {formatCurrency(data.labaKotor)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Discount (fee manager/teknisi):</span>
              <span className="font-semibold">
                {formatCurrency(data.totalFee)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Laba Berjalan:</span>
              <span className="font-bold text-green-600 text-[11px] sm:text-[13px]">
                {formatCurrency(data.labaBerjalan)}
              </span>
            </div>
          </div>

          {/* Buttons - responsive */}
          <div className="flex flex-col sm:flex-row sm:justify-end justify-start gap-1 mt-2">
            <Button
              type="button"
              className="bg-primary hover:bg-sky-700 text-white text-[9px] sm:text-xs px-2 py-1 h-6 w-auto sm:w-auto"
            >
              Unduh Invoice
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-[9px] sm:text-xs px-2 py-1 h-6 w-auto sm:w-auto"
            >
              Keluar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
