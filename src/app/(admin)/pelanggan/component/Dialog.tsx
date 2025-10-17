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
import { PelangganWithAdmin } from "@/types/interfaces/IPelanggan";
import { toast } from "sonner";
import { createPelangganAction, updatePelangganAction } from "../actions/pelangganActions";

interface PelangganDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pelanggan?: PelangganWithAdmin | null;
}

export default function PelangganDialog({
  open,
  onOpenChange,
  pelanggan,
}: PelangganDialogProps) {
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!pelanggan;

  useEffect(() => {
    if (pelanggan) {
      setNama(pelanggan.nama);
      setAlamat(pelanggan.alamat);
    } else {
      setNama("");
      setAlamat("");
    }
  }, [pelanggan, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nama.trim() || !alamat.trim()) {
      toast.error("Nama dan alamat harus diisi");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const input = {
        nama: nama.trim(),
        alamat: alamat.trim(),
      };

      const result = isEdit
        ? await updatePelangganAction(pelanggan.id, input)
        : await createPelangganAction(input);

      if (result.success) {
        toast.success(result.success);
        setNama("");
        setAlamat("");
        onOpenChange(true);
      } else {
        toast.error(result.success || "Terjadi kesalahan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNama("");
      setAlamat("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Pelanggan" : "Tambah Pelanggan"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            {isEdit 
              ? "Perbarui informasi pelanggan. Klik simpan setelah selesai."
              : "Tambahkan pelanggan baru ke sistem. Klik simpan setelah selesai."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nama Pelanggan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Contoh: Tambak Makmur Jaya"
              required
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Alamat <span className="text-red-500">*</span>
            </label>
            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
              placeholder="Contoh: Jl. Raya Pantai No. 123, Banyuwangi"
              required
              disabled={isSubmitting}
              rows={3}
              maxLength={255}
            />
            <span className="text-xs text-gray-500">
              {alamat.length}/255 karakter
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg px-5 py-2"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-sky-700 text-white rounded-lg px-5 py-2"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}