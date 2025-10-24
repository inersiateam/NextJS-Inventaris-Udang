"use client";

import { useState, useEffect, useTransition, useCallback, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PelangganWithAdmin } from "@/types/interfaces/IPelanggan";
import { toast } from "sonner";
import {
  createPelangganAction,
  updatePelangganAction,
} from "../actions/pelangganActions";
import { useRouter } from "next/navigation";

interface PelangganDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pelanggan?: PelangganWithAdmin | null;
}

const getInitialFormState = () => ({
  nama: "",
  alamat: "",
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
    maxLength,
  }: any) => (
    <div className="flex flex-col gap-1.5">
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
        maxLength={maxLength}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      />
    </div>
  )
);
FormInput.displayName = "FormInput";

const FormTextarea = memo(
  ({
    label,
    name,
    value,
    onChange,
    required = false,
    disabled = false,
    placeholder = "",
    maxLength,
    rows = 3,
  }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs sm:text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
      />
      <span className="text-xs text-gray-500">
        {value.length}/{maxLength} karakter
      </span>
    </div>
  )
);
FormTextarea.displayName = "FormTextarea";

function PelangganDialog({
  open,
  onOpenChange,
  pelanggan,
}: PelangganDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(getInitialFormState);

  const isEdit = !!pelanggan;

  useEffect(() => {
    if (!open) {
      setForm(getInitialFormState());
      return;
    }

    if (pelanggan) {
      setForm({
        nama: pelanggan.nama,
        alamat: pelanggan.alamat,
      });
    }
  }, [open, pelanggan]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!form.nama.trim() || !form.alamat.trim()) {
        toast.error("Nama dan alamat harus diisi");
        return;
      }

      const input = {
        nama: form.nama.trim(),
        alamat: form.alamat.trim(),
      };

      startTransition(async () => {
        try {
          const result =
            isEdit && pelanggan
              ? await updatePelangganAction(pelanggan.id, input)
              : await createPelangganAction(input);

          if (result.success) {
            const successMessage = isEdit
              ? "Pelanggan berhasil diperbarui"
              : "Pelanggan berhasil ditambahkan";

            toast.success(successMessage);
            onOpenChange(false);
            router.refresh();
          } else {
            const errorMessage =
              "error" in result ? result.error : "Terjadi kesalahan";
            toast.error(errorMessage);
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat menyimpan data"
          );
        }
      });
    },
    [form, isEdit, pelanggan, onOpenChange, router]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Pelanggan" : "Tambah Pelanggan"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs sm:text-sm">
            {isEdit
              ? "Perbarui informasi pelanggan. Klik simpan setelah selesai."
              : "Tambahkan pelanggan baru ke sistem. Klik simpan setelah selesai."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <FormInput
            label="Nama Pelanggan"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            required
            disabled={isPending}
            placeholder="Contoh: Tambak Makmur Jaya"
            maxLength={100}
          />

          <FormTextarea
            label="Alamat"
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            required
            disabled={isPending}
            placeholder="Contoh: Jl. Raya Pantai No. 123, Banyuwangi"
            maxLength={255}
            rows={3}
          />

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
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
              className="w-full sm:w-auto bg-primary hover:bg-sky-700 text-white text-sm"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default memo(PelangganDialog);
