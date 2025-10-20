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
      <DialogContent className="!max-w-[98vw] sm:!max-w-[90vw] md:!max-w-[85vw] lg:!max-w-[75vw] xl:!max-w-[70vw] w-full bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 overflow-y-auto max-h-[95vh] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold">
            Detail Pelanggan
          </DialogTitle>
          <p className="text-xs sm:text-sm text-gray-500">
            Lihat profil dan detail transaksi pelanggan di bawah ini.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 mt-3 sm:mt-4 text-xs sm:text-sm gap-y-2">
          <div>
            <p>
              Nama Pelanggan:{" "}
              <span className="font-semibold">{data.nama}</span>
            </p>
          </div>
          <div>
            <p>
              Area: <span className="font-semibold">{data.alamat}</span>
            </p>
          </div>

          <div>
            Jumlah Transaksi Lunas:{" "}
            <span className="font-semibold">
              {data.jumlahTransaksiLunas}
            </span>
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

        <div className="mt-4 sm:mt-6 flex justify-end">
          <div className="text-right">
            <p className="text-sm sm:text-base font-semibold">Total Pembelian:</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              Rp.{" "}
              {data.totalPembelian?.toLocaleString("id-ID", {
                minimumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg mt-3 sm:mt-4">
          <Table className="text-xs sm:text-sm">
            <TableHeader>
              <TableRow className="bg-sky-600 text-white">
                <TableHead className="text-center text-white">
                  Barang
                </TableHead>
                <TableHead className="text-center text-white">
                  Jumlah Pembelian
                </TableHead>
                <TableHead className="text-center text-white">
                  Total Harga
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.daftarBarang && data.daftarBarang.length > 0 ? (
                data.daftarBarang.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="text-center">
                      {item.namaBarang}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.jumlahPembelian}
                    </TableCell>
                    <TableCell className="text-center">
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
                    className="text-center text-gray-500"
                  >
                    Tidak ada data barang
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-4 sm:mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            Keluar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}