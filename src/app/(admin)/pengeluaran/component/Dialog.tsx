"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PengeluaranDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tanggal: "",
    keterangan: "",
    quantity: "",
    harga: "",
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const qty = parseFloat(form.quantity) || 0;
    const harga = parseFloat(form.harga) || 0;
    setTotal(qty * harga);
  }, [form.quantity, form.harga]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Data pengeluaran:", form);
    setForm({ tanggal: "", keterangan: "", quantity: "", harga: "" });
    setOpen(false);
  };

  const formatRupiah = (num: number) =>
    num.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah Data</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Tambah Pengeluaran
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Masukkan data pengeluaran di bawah ini, lalu klik simpan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Tanggal:
            </label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-100 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Keterangan:
            </label>
            <input
              type="text"
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-100 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Quantity:
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-100 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Harga:</label>
            <input
              type="number"
              name="harga"
              value={form.harga}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-100 px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <p className="text-base font-medium text-gray-700">
              Total Pengeluaran:{" "}
              <span className="font-bold text-black">
                {formatRupiah(total)}
              </span>
            </p>

            <Button
              type="submit"
              className="bg-sky-700 hover:bg-sky-800 text-white rounded-lg px-5 py-2"
            >
              Simpan{" "}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
