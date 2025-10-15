"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useState,
  useEffect,
  useTransition,
  useMemo,
  useCallback,
} from "react";
import {
  createPengeluaranAction,
  updatePengeluaranAction,
} from "../actions/pengeluaranActions";
import { IPengeluaran } from "@/types/interfaces/IPengeluaran";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface PengeluaranDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: IPengeluaran | null;
}

export default function PengeluaranDialog({
  open,
  onOpenChange,
  editData,
}: PengeluaranDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    tanggal: "",
    keterangan: "",
    jumlah: "",
    harga: "",
  });

  const total = useMemo(() => {
    const qty = parseFloat(form.jumlah) || 0;
    const harga = parseFloat(form.harga) || 0;
    return qty * harga;
  }, [form.jumlah, form.harga]);

  useEffect(() => {
    if (open) {
      if (editData) {
        const tanggalFormatted = new Date(editData.tanggal)
          .toISOString()
          .split("T")[0];
        setForm({
          tanggal: tanggalFormatted,
          keterangan: editData.keterangan,
          jumlah: editData.jumlah.toString(),
          harga: (editData.totalHarga / editData.jumlah).toString(),
        });
      } else {
        setForm({ tanggal: "", keterangan: "", jumlah: "", harga: "" });
      }
    }
  }, [editData, open]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      tanggal: form.tanggal,
      keterangan: form.keterangan,
      jumlah: parseInt(form.jumlah),
      totalHarga: total,
    };

    startTransition(async () => {
      try {
        const result = editData
          ? await updatePengeluaranAction(editData.id, payload)
          : await createPengeluaranAction(payload);

        if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.success(result.message);
          setForm({ tanggal: "", keterangan: "", jumlah: "", harga: "" });
          onOpenChange(false);
          router.refresh();
        }
      } catch (error) {
        toast.error("Terjadi kesalahan");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            {editData ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs sm:text-sm">
            {editData
              ? "Ubah data pengeluaran di bawah ini"
              : "Masukkan data pengeluaran di bawah ini, lalu klik simpan"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4 mt-2 sm:mt-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Tanggal:
            </label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              required
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Keterangan:
            </label>
            <input
              type="text"
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              placeholder="Contoh: Pembelian alat tulis"
              className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              required
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Jumlah:
            </label>
            <input
              type="number"
              name="jumlah"
              value={form.jumlah}
              onChange={handleChange}
              placeholder="0"
              min="1"
              className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              required
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Harga Satuan:
            </label>
            <input
              type="number"
              name="harga"
              value={form.harga}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              required
              disabled={isPending}
            />
          </div>

          <div className="pt-2 border-t">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Total Pengeluaran:
                </p>
                <p className="text-base sm:text-lg font-bold text-sky-700">
                  {formatCurrency(total)}
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 sm:flex-none bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm"
                  disabled={isPending}
                >
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
