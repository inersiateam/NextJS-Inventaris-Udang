"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  BarangOption,
  BarangMasukWithRelations,
} from "@/lib/services/barangMasukService";
import { useRouter } from "next/navigation";
import {
  createBarangMasukAction,
  updateBarangMasukAction,
} from "@/app/(admin)/barang-masuk/actions/barangMasukActions";

interface BarangMasukDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barangOptions: BarangOption[];
  editData?: BarangMasukWithRelations | null;
  mode?: "create" | "edit";
}

export default function BarangMasukDialog({
  open,
  onOpenChange,
  barangOptions,
  editData = null,
  mode = "create",
}: BarangMasukDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    tglMasuk: "",
    noInvoice: "",
    noSuratJalan: "",
    barangId: "",
    stokMasuk: "",
    ongkir: "",
    status: "BELUM_LUNAS" as "BELUM_LUNAS" | "LUNAS",
    keterangan: "",
  });

  const [selectedBarang, setSelectedBarang] = useState<BarangOption | null>(
    null
  );
  const [jatuhTempo, setJatuhTempo] = useState("");
  const [totalModal, setTotalModal] = useState(0);

  useEffect(() => {
    if (mode === "edit" && editData) {
      setForm({
        tglMasuk: new Date(editData.tglMasuk).toISOString().split("T")[0],
        noInvoice: editData.noInvoice,
        noSuratJalan: editData.noSuratJalan,
        barangId: editData.barang.id.toString(),
        stokMasuk: editData.stokMasuk.toString(),
        ongkir: editData.ongkir.toString(),
        status: editData.status as "BELUM_LUNAS" | "LUNAS",
        keterangan: editData.keterangan || "",
      });

      const barang = barangOptions.find((b) => b.id === editData.barang.id);
      setSelectedBarang(barang || null);
    } else {
      // Reset form for create mode
      setForm({
        tglMasuk: "",
        noInvoice: "",
        noSuratJalan: "",
        barangId: "",
        stokMasuk: "",
        ongkir: "",
        status: "BELUM_LUNAS",
        keterangan: "",
      });
      setSelectedBarang(null);
      setJatuhTempo("");
      setTotalModal(0);
    }
  }, [mode, editData, barangOptions, open]);

  useEffect(() => {
    if (form.tglMasuk) {
      const tglMasuk = new Date(form.tglMasuk);
      const tempo = new Date(tglMasuk);
      tempo.setMonth(tempo.getMonth() + 1);
      setJatuhTempo(tempo.toISOString().split("T")[0]);
    }
  }, [form.tglMasuk]);

  useEffect(() => {
    if (selectedBarang && form.stokMasuk) {
      const jumlah = parseInt(form.stokMasuk) || 0;
      const ongkir = parseInt(form.ongkir) || 0;
      const total = selectedBarang.harga * jumlah + ongkir;
      setTotalModal(total);
    } else {
      setTotalModal(0);
    }
  }, [selectedBarang, form.stokMasuk, form.ongkir]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleBarangChange = (value: string) => {
    const barang = barangOptions.find((b) => b.id.toString() === value);
    setSelectedBarang(barang || null);
    setForm({ ...form, barangId: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        barangId: parseInt(form.barangId),
        noInvoice: form.noInvoice,
        noSuratJalan: form.noSuratJalan,
        tglMasuk: form.tglMasuk,
        stokMasuk: parseInt(form.stokMasuk),
        ongkir: parseInt(form.ongkir) || 0,
        status: form.status,
        keterangan: form.keterangan || undefined,
      };

      let result;
      if (mode === "edit" && editData) {
        result = await updateBarangMasukAction({
          id: editData.id,
          ...payload,
        });
      } else {
        result = await createBarangMasukAction(payload);
      }

      if (!result.success) {
        throw new Error(
          result.success ||
            `Gagal ${
              mode === "edit" ? "memperbarui" : "menambahkan"
            } barang masuk`
        );
      }

      onOpenChange(false);
      setForm({
        tglMasuk: "",
        noInvoice: "",
        noSuratJalan: "",
        barangId: "",
        stokMasuk: "",
        ongkir: "",
        status: "BELUM_LUNAS",
        keterangan: "",
      });
      setSelectedBarang(null);
      setJatuhTempo("");
      setTotalModal(0);

      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900">
            {mode === "edit" ? "Edit Barang Masuk" : "Tambah Barang Masuk"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs sm:text-sm">
            {mode === "edit"
              ? "Perbarui data barang masuk. Klik simpan setelah selesai."
              : "Tambahkan data barang masuk baru. Klik simpan setelah selesai."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Tanggal: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tglMasuk"
                value={form.tglMasuk}
                onChange={handleChange}
                required
                className="rounded-md bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Jatuh Tempo:
              </label>
              <input
                type="date"
                value={jatuhTempo}
                disabled
                className="rounded-md bg-gray-200 px-3 py-2 text-sm cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                No Invoice: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="noInvoice"
                value={form.noInvoice}
                onChange={handleChange}
                required
                placeholder="Contoh: INV/001/01/2025"
                className="rounded-md bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                No Surat Jalan: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="noSuratJalan"
                value={form.noSuratJalan}
                onChange={handleChange}
                required
                placeholder="Contoh: SJ/001/01/2025"
                className="rounded-md bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Nama Barang: <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.barangId}
                onValueChange={handleBarangChange}
                required
              >
                <SelectTrigger className="bg-gray-100 text-sm focus:ring-2 focus:ring-sky-500">
                  <SelectValue placeholder="Pilih barang" />
                </SelectTrigger>
                <SelectContent>
                  {barangOptions.map((barang) => (
                    <SelectItem key={barang.id} value={barang.id.toString()}>
                      {barang.nama} - {formatCurrency(barang.harga)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Jumlah Barang: <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stokMasuk"
                value={form.stokMasuk}
                onChange={handleChange}
                required
                min="1"
                placeholder="0"
                className="rounded-md bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Ongkir:
              </label>
              <input
                type="number"
                name="ongkir"
                value={form.ongkir}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="rounded-md bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Status Pembelian: <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm({ ...form, status: value as "BELUM_LUNAS" | "LUNAS" })
                }
                required
              >
                <SelectTrigger className="bg-gray-100 text-sm focus:ring-2 focus:ring-sky-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BELUM_LUNAS">Belum Lunas</SelectItem>
                  <SelectItem value="LUNAS">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 sm:col-span-2 flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Keterangan:
              </label>
              <textarea
                name="keterangan"
                value={form.keterangan}
                onChange={handleChange}
                rows={3}
                placeholder="Keterangan tambahan (opsional)"
                className="rounded-md bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>
          </div>

          <div className="pt-2 text-gray-900 text-sm sm:text-base font-semibold border-t">
            Total Modal:
            <span className="ml-2 text-base sm:text-lg font-bold text-sky-700">
              {formatCurrency(totalModal)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto text-sm"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-sky-700 hover:bg-sky-800 text-white text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
