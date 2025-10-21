"use client";

import {
  useState,
  useEffect,
  useTransition,
  useMemo,
  useCallback,
  memo,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

const getInitialFormState = () => ({
  tanggal: "",
  keterangan: "",
  jumlah: "",
  harga: "",
});

const FormInput = memo(
  ({
    label,
    name,
    value,
    onChange,
    required = false,
    disabled = false,
    type = "text",
    placeholder = "",
    min,
  }: any) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs sm:text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        className={`w-full rounded-md bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
          type === "number"
            ? "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            : ""
        }`}
      />
    </div>
  )
);
FormInput.displayName = "FormInput";

function PengeluaranDialog({
  open,
  onOpenChange,
  editData,
}: PengeluaranDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(getInitialFormState);

  const isEdit = !!editData;

  const total = useMemo(() => {
    const qty = parseFloat(form.jumlah) || 0;
    const harga = parseFloat(form.harga) || 0;
    return qty * harga;
  }, [form.jumlah, form.harga]);

  useEffect(() => {
    if (!open) {
      setForm(getInitialFormState());
      return;
    }

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
    }
  }, [open, editData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const payload = {
        tanggal: form.tanggal,
        keterangan: form.keterangan,
        jumlah: parseInt(form.jumlah),
        totalHarga: total,
      };

      startTransition(async () => {
        try {
          const result =
            isEdit && editData
              ? await updatePengeluaranAction(editData.id, payload)
              : await createPengeluaranAction(payload);

          if ("error" in result) {
            toast.error(result.error);
          } else {
            toast.success(result.message || "Berhasil menyimpan data");
            onOpenChange(false);
            router.refresh();
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error(
            error instanceof Error ? error.message : "Terjadi kesalahan"
          );
        }
      });
    },
    [form, total, isEdit, editData, onOpenChange, router]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs sm:text-sm">
            {isEdit
              ? "Perbarui data pengeluaran. Klik simpan setelah selesai."
              : "Masukkan data pengeluaran. Klik simpan setelah selesai."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <FormInput
            label="Tanggal"
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            required
            disabled={isPending}
          />

          <FormInput
            label="Keterangan"
            name="keterangan"
            value={form.keterangan}
            onChange={handleChange}
            required
            disabled={isPending}
            placeholder="Contoh: Pembelian alat tulis"
          />

          <FormInput
            label="Jumlah"
            type="number"
            name="jumlah"
            value={form.jumlah}
            onChange={handleChange}
            required
            disabled={isPending}
            placeholder="0"
            min="1"
          />

          <FormInput
            label="Harga Satuan"
            type="number"
            name="harga"
            value={form.harga}
            onChange={handleChange}
            required
            disabled={isPending}
            placeholder="0"
            min="0"
          />

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

              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="w-full sm:w-auto text-sm"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto bg-sky-700 hover:bg-sky-800 text-white text-sm"
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

export default memo(PengeluaranDialog);
