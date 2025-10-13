"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  createBarangKeluarAction,
  updateBarangKeluarAction,
  getBarangListAction,
  getPelangganListAction,
} from "../actions/barangKeluarActions";
import { useRouter } from "next/navigation";

interface BarangItem {
  barangId: number;
  jmlPembelian: number;
  hargaJual: number;
}

interface BarangKeluarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: any | null;
  mode?: "create" | "edit";
}

export default function BarangKeluarDialog({
  open,
  onOpenChange,
  editData = null,
  mode = "create",
}: BarangKeluarDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [barangList, setBarangList] = useState<any[]>([]);
  const [pelangganList, setPelangganList] = useState<any[]>([]);

  const [form, setForm] = useState({
    pelangganId: "",
    tglKeluar: new Date().toISOString().split("T")[0],
    ongkir: "",
    status: "BELUM_LUNAS" as "BELUM_LUNAS" | "LUNAS",
  });

  const [items, setItems] = useState<BarangItem[]>([
    { barangId: 0, jmlPembelian: 0, hargaJual: 0 },
  ]);

  const [totalOmset, setTotalOmset] = useState(0);

  useEffect(() => {
    if (open) {
      loadData();
      if (mode === "edit" && editData) {
        setForm({
          pelangganId: editData.pelangganId?.toString() || "",
          tglKeluar: editData.tglKeluar
            ? new Date(editData.tglKeluar).toISOString().split("T")[0]
            : "",
          ongkir: editData.ongkir?.toString() || "",
          status: editData.status || "BELUM_LUNAS",
        });
        if (editData.items && editData.items.length > 0) {
          setItems(
            editData.items.map((item: any) => ({
              barangId: item.barangId,
              jmlPembelian: item.jmlPembelian,
              hargaJual: item.hargaJual,
            }))
          );
        }
      }
    } else {
      setForm({
        pelangganId: "",
        tglKeluar: new Date().toISOString().split("T")[0],
        ongkir: "",
        status: "BELUM_LUNAS",
      });
      setItems([{ barangId: 0, jmlPembelian: 0, hargaJual: 0 }]);
      setTotalOmset(0);
    }
  }, [open, mode, editData]);

  const loadData = async () => {
    const [barangResult, pelangganResult] = await Promise.all([
      getBarangListAction(),
      getPelangganListAction(),
    ]);

    if (barangResult.success) {
      setBarangList(barangResult.data || []);
    }
    if (pelangganResult.success) {
      setPelangganList(pelangganResult.data || []);
    }
  };

  useEffect(() => {
    const total = items.reduce((sum, item) => {
      return sum + item.jmlPembelian * item.hargaJual;
    }, 0);
    const ongkir = parseFloat(form.ongkir) || 0;
    setTotalOmset(total - ongkir);
  }, [items, form.ongkir]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (
    index: number,
    field: keyof BarangItem,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === "barangId" ? parseInt(value) : parseFloat(value) || 0,
    };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { barangId: 0, jmlPembelian: 0, hargaJual: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        pelangganId: parseInt(form.pelangganId),
        tglKeluar: form.tglKeluar,
        ongkir: parseFloat(form.ongkir) || 0,
        status: form.status,
        items: items.filter(
          (item) =>
            item.barangId > 0 && item.jmlPembelian > 0 && item.hargaJual > 0
        ),
      };

      let result;
      if (mode === "edit" && editData) {
        result = await updateBarangKeluarAction({
          id: editData.id,
          ...data,
        });
      } else {
        result = await createBarangKeluarAction(data);
      }

      if (!result.success) {
        throw new Error(
          result.success ||
            `Gagal ${
              mode === "edit" ? "memperbarui" : "menambahkan"
            } barang keluar`
        );
      }

      onOpenChange(false);
      setForm({
        pelangganId: "",
        tglKeluar: new Date().toISOString().split("T")[0],
        ongkir: "",
        status: "BELUM_LUNAS",
      });
      setItems([{ barangId: 0, jmlPembelian: 0, hargaJual: 0 }]);
      setTotalOmset(0);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (num: number) =>
    num.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900">
            {mode === "edit" ? "Edit Barang Keluar" : "Tambah Barang Keluar"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs sm:text-sm">
            {mode === "edit"
              ? "Perbarui data barang keluar. Klik simpan setelah selesai."
              : "Tambahkan data barang keluar baru. Klik simpan setelah selesai."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Form Fields - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Pelanggan: <span className="text-red-500">*</span>
              </label>
              <select
                name="pelangganId"
                value={form.pelangganId}
                onChange={handleFormChange}
                required
                className="rounded-md bg-gray-100 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Pilih Pelanggan</option>
                {pelangganList.map((pelanggan) => (
                  <option key={pelanggan.id} value={pelanggan.id}>
                    {pelanggan.nama} - {pelanggan.alamat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Tanggal Keluar: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tglKeluar"
                value={form.tglKeluar}
                onChange={handleFormChange}
                required
                className="rounded-md bg-gray-100 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Ongkir:
              </label>
              <input
                type="number"
                name="ongkir"
                value={form.ongkir}
                onChange={handleFormChange}
                placeholder="0"
                min="0"
                className="rounded-md bg-gray-100 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Status Pembayaran: <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm({ ...form, status: value as "BELUM_LUNAS" | "LUNAS" })
                }
                required
              >
                <SelectTrigger className="bg-gray-100 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BELUM_LUNAS">Belum Lunas</SelectItem>
                  <SelectItem value="LUNAS">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items Section */}
          <div className="border-t pt-4 mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Daftar Barang
              </h3>
              <Button
                type="button"
                onClick={addItem}
                variant="outline"
                size="sm"
                className="text-sky-600 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
              >
                + Tambah Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {/* Item Number - Mobile Only */}
                  <div className="sm:hidden text-xs font-semibold text-gray-600">
                    Item #{index + 1}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Barang Select */}
                    <div className="sm:col-span-5 flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Barang: <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.barangId}
                        onChange={(e) =>
                          handleItemChange(index, "barangId", e.target.value)
                        }
                        required
                        className="rounded-md bg-white px-2 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 border border-gray-300"
                      >
                        <option value="0">Pilih Barang</option>
                        {barangList.map((barang) => (
                          <option key={barang.id} value={barang.id}>
                            {barang.nama} (Stok: {barang.stok})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Jumlah Input */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Jumlah: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.jmlPembelian || ""}
                        onChange={(e) =>
                          handleItemChange(index, "jmlPembelian", e.target.value)
                        }
                        required
                        min="1"
                        placeholder="0"
                        className="rounded-md bg-white px-2 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 border border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    {/* Harga Jual Input */}
                    <div className="sm:col-span-3 flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Harga Jual: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.hargaJual || ""}
                        onChange={(e) =>
                          handleItemChange(index, "hargaJual", e.target.value)
                        }
                        required
                        min="0"
                        placeholder="0"
                        className="rounded-md bg-white px-2 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 border border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    {/* Delete Button */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700 invisible hidden sm:block">
                        Aksi
                      </label>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeItem(index)}
                          variant="destructive"
                          size="sm"
                          className="w-full text-xs sm:text-sm h-9"
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Omset */}
          <div className="pt-3 text-gray-900 text-sm sm:text-base font-semibold border-t flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
            <span>Total Omset:</span>
            <span className="text-base sm:text-lg font-bold text-sky-700 sm:ml-2">
              {formatRupiah(totalOmset)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto text-xs sm:text-sm h-9"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm h-9"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}