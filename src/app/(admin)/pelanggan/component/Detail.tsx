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

interface PelangganDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: any;
}

export default function PelangganDetailDialog({
  open,
  onOpenChange,
  data,
}: PelangganDetailDialogProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl rounded-xl p-3 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 sm:pb-3">
          <DialogTitle className="text-sm sm:text-lg font-semibold text-gray-900">
            Detail Pelanggan
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-[10px] sm:text-xs">
            Lihat profil dan detail transaksi pelanggan di bawah ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-[2px] sm:gap-y-1 text-[10px] sm:text-[13px]">
            <div>
              Nama Pelanggan: <span className="font-semibold">{data.nama}</span>
            </div>
            <div>
              Area: <span className="font-semibold">{data.alamat}</span>
            </div>
            <div>
              Jumlah Transaksi Lunas:{" "}
              <span className="font-semibold">{data.jumlahTransaksiLunas}</span>
            </div>
            <div>
              Jumlah Transaksi Belum Lunas:{" "}
              <span className="font-semibold">
                {data.jumlahTransaksiBelumLunas}
              </span>
            </div>
            <div>
              Total Transaksi:{" "}
              <span className="font-semibold">{data.totalTransaksi}</span>
            </div>
          </div>

          <div className="flex justify-end pt-2 sm:pt-4">
            <div className="text-right">
              <p className="text-xs sm:text-sm font-semibold">
                Total Pembelian:
              </p>
              <p className="text-lg sm:text-2xl font-bold text-sky-700">
                Rp.{" "}
                {data.totalPembelian?.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                })}
              </p>
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
                    Jumlah Pembelian
                  </TableHead>
                  <TableHead className="text-center py-1 sm:py-2 text-white">
                    Total Harga
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.daftarBarang && data.daftarBarang.length > 0 ? (
                  data.daftarBarang.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="text-center py-0.5 sm:py-2">
                        {item.namaBarang}
                      </TableCell>
                      <TableCell className="text-center py-0.5 sm:py-2">
                        {item.jumlahPembelian}
                      </TableCell>
                      <TableCell className="text-center py-0.5 sm:py-2">
                        Rp.{" "}
                        {item.totalHarga.toLocaleString("id-ID", {
                          minimumFractionDigits: 0,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-gray-500 py-8"
                    >
                      Tidak ada data barang
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-2 sm:mt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              Keluar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
