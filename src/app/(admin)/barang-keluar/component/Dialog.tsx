"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function BarangKeluarDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState({
    namaPelanggan: "",
    alamat: "",
    namaBarang: "",
    ongkir: "",
    jumlahBarang: "",
    hargaPerProduk: "",
    statusPembelian: "",
  });

  const [totalOmset, setTotalOmset] = useState(0);

  // Hitung total omset otomatis
  useEffect(() => {
    const jumlah = parseFloat(form.jumlahBarang) || 0;
    const harga = parseFloat(form.hargaPerProduk) || 0;
    const ongkir = parseFloat(form.ongkir) || 0;
    setTotalOmset(jumlah * harga - ongkir);
  }, [form.jumlahBarang, form.hargaPerProduk, form.ongkir]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Barang keluar baru:", form);
    onOpenChange(false);
  };

  const formatRupiah = (num: number) =>
    num.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Tambah Barang Keluar
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Isi data barang keluar di bawah ini, lalu klik simpan setelah selesai.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Kolom kiri */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Nama Pelanggan:
              </label>
              <input
                type="text"
                name="namaPelanggan"
                value={form.namaPelanggan}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Alamat:</label>
              <input
                type="text"
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Nama Barang:
              </label>
              <input
                type="text"
                name="namaBarang"
                value={form.namaBarang}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Ongkir:</label>
              <input
                type="number"
                name="ongkir"
                value={form.ongkir}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Jumlah Barang:
              </label>
              <input
                type="number"
                name="jumlahBarang"
                value={form.jumlahBarang}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Harga Per Produk:
              </label>
              <input
                type="number"
                name="hargaPerProduk"
                value={form.hargaPerProduk}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Status Pembelian:
              </label>
              <input
                type="text"
                name="statusPembelian"
                value={form.statusPembelian}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Total Omset */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-base font-medium text-gray-700">
              Total Omset:{" "}
              <span className="text-lg font-bold text-black">
                {formatRupiah(totalOmset)}
              </span>
            </p>

            <Button
              type="submit"
              className="bg-sky-700 hover:bg-sky-800 text-white rounded-lg px-5 py-2"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
