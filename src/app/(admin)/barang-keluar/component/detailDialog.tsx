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
import { generateInvoicePDF } from "@/lib/generatorInvoice";
import { generateSuratJalanPDF } from "@/lib/generatorSuratJalan";

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DetailData | null;
  jabatan: "ABL" | "ATM";
}

export default function DetailDialog({
  open,
  onOpenChange,
  data,
  jabatan,
}: DetailDialogProps) {
  if (!data) return null;

  const handleDownloadInvoice = () => {
    if (data) {
      generateInvoicePDF(data, jabatan);
    }
  };

  const handleDownloadSuratJalan = () => {
    if (data) {
      generateSuratJalanPDF(data, jabatan);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] sm:max-w-4xl rounded-xl p-3 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 sm:pb-3">
          <DialogTitle className="text-sm sm:text-lg font-semibold text-gray-900">
            Detail Barang Keluar
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-[10px] sm:text-xs">
            Lihat detail anda disini, unduh untuk invoice nya!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-[2px] sm:gap-y-1 text-[10px] sm:text-[13px]">
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

          <div className="overflow-x-auto rounded mt-1">
            <Table className="w-full text-[9px] sm:text-[13px]">
              <TableHeader>
                <TableRow className="bg-sky-600 text-white">
                  <TableHead className="text-center py-1 sm:py-2 text-white">
                    Barang
                  </TableHead>
                  <TableHead className="text-center py-1 sm:py-2 text-white">
                    Jumlah
                  </TableHead>
                  <TableHead className="text-center py-1 sm:py-2 text-white">
                    Harga Jual
                  </TableHead>
                  <TableHead className="text-center py-1 sm:py-2 text-white">
                    Subtotal Omset
                  </TableHead>
                  <TableHead className="text-center py-1 sm:py-2 text-white">
                    Subtotal Modal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-center py-0.5 sm:py-2">
                      {item.namaBarang}
                    </TableCell>
                    <TableCell className="text-center py-0.5 sm:py-2">
                      {item.jmlPembelian} {item.satuan}
                    </TableCell>
                    <TableCell className="text-center py-0.5 sm:py-2">
                      {formatCurrency(item.hargaJual)}
                    </TableCell>
                    <TableCell className="text-center py-0.5 sm:py-2">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                    <TableCell className="text-center py-0.5 sm:py-2">
                      {formatCurrency(item.subtotalModal || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border-t pt-3 space-y-1 text-[10px] sm:text-[13px]">
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
              <span>Ongkir:</span>
              <span className="font-semibold">
                {formatCurrency(data.ongkir)}
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
              <span className="font-bold text-green-600 text-[11px] sm:text-sm">
                {formatCurrency(data.labaBerjalan)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end justify-start gap-1 sm:gap-2 mt-2">
            <Button
              type="button"
              onClick={handleDownloadInvoice}
              className="bg-primary hover:bg-sky-700 text-white text-[9px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 h-6 sm:h-8 w-auto sm:w-auto"
            >
              Unduh Invoice
            </Button>
            {jabatan === "ABL" && (
              <Button
                type="button"
                onClick={handleDownloadSuratJalan}
                className="bg-green-600 hover:bg-green-700 text-white text-[9px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 h-6 sm:h-8 w-auto sm:w-auto"
              >
                Unduh Surat Jalan
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-[9px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 h-6 sm:h-8 w-auto sm:w-auto"
            >
              Keluar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}