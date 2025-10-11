"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function BarangMasukDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState({
    tanggal: "",
    tempo: "",
    invoice: "",
    surat: "",
    nama: "",
    jumlah: "",
    status: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Tambah Barang Masuk
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Ubah profil Anda di sini. Klik simpan setelah selesai.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Tanggal:</label>
              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Jatuh Tempo:</label>
              <input
                type="date"
                name="tempo"
                value={form.tempo}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">No Invoice:</label>
              <input
                type="text"
                name="invoice"
                value={form.invoice}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">No Surat Jalan:</label>
              <input
                type="text"
                name="surat"
                value={form.surat}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nama Barang:</label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Jumlah Barang:</label>
              <input
                type="number"
                name="jumlah"
                value={form.jumlah}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Status Pembelian:</label>
              <input
                type="text"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="rounded-md bg-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="pt-2 text-gray-900 font-semibold">
            Total Modal:
            <span className="ml-2 text-lg font-bold text-black"></span>
          </div>

          <div className="flex justify-end pt-4">
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
