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
} from "@/types/interfaces/IBarangMasuk";
import { useRouter } from "next/navigation";
import {
  createBarangMasukAction,
  updateBarangMasukAction,
} from "@/app/(admin)/barang-masuk/actions/barangMasukActions";
import { toast } from "sonner";

interface BarangMasukDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barangOptions: BarangOption[];
  editData?: BarangMasukWithRelations | null;
  mode?: "create" | "edit";
}

const getInitialFormState = () => ({
  tglMasuk: "",
  noInvoice: "",
  noSuratJalan: "",
  barangId: "",
  stokMasuk: "",
  ongkir: "",
  status: "BELUM_LUNAS" as "BELUM_LUNAS" | "LUNAS",
  keterangan: "",
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
    className = "",
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
        className={`rounded-md bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${className}`}
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
    disabled = false,
    rows = 3,
    placeholder = "",
  }: any) => (
    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1">
      <label className="text-xs sm:text-sm font-medium text-gray-700">
        {label}:
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className="rounded-md bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
      />
    </div>
  )
);
FormTextarea.displayName = "FormTextarea";

function BarangMasukDialog({
  open,
  onOpenChange,
  barangOptions,
  editData = null,
  mode = "create",
}: BarangMasukDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(getInitialFormState);
  const [selectedBarang, setSelectedBarang] = useState<BarangOption | null>(
    null
  );

  const jatuhTempo = useMemo(() => {
    if (!form.tglMasuk) return "";
    const tglMasuk = new Date(form.tglMasuk);
    const tempo = new Date(tglMasuk);
    tempo.setMonth(tempo.getMonth() + 1);
    return tempo.toISOString().split("T")[0];
  }, [form.tglMasuk]);

  const totalModal = useMemo(() => {
    if (!selectedBarang || !form.stokMasuk) return 0;
    const jumlah = parseInt(form.stokMasuk) || 0;
    const ongkir = parseInt(form.ongkir) || 0;
    return selectedBarang.harga * jumlah + ongkir;
  }, [selectedBarang?.harga, form.stokMasuk, form.ongkir]);

  useEffect(() => {
    if (!open) {
      setForm(getInitialFormState());
      setSelectedBarang(null);
      return;
    }

    if (mode === "edit" && editData) {
      const barang = barangOptions.find((b) => b.id === editData.barang.id);
      setSelectedBarang(barang || null);

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
    }
  }, [open, mode, editData, barangOptions]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleBarangChange = useCallback(
    (value: string) => {
      const barang = barangOptions.find((b) => b.id.toString() === value);
      setSelectedBarang(barang || null);
      setForm((prev) => ({ ...prev, barangId: value }));
    },
    [barangOptions]
  );

  const handleStatusChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, status: value as "BELUM_LUNAS" | "LUNAS" }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

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

      startTransition(async () => {
        try {
          const result =
            mode === "edit" && editData
              ? await updateBarangMasukAction({ id: editData.id, ...payload })
              : await createBarangMasukAction(payload);

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
    [form, mode, editData, onOpenChange, router]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-auto pb-8">
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
            <FormInput
              label="Tanggal"
              type="date"
              name="tglMasuk"
              value={form.tglMasuk}
              onChange={handleChange}
              required
              disabled={isPending}
            />

            <FormInput
              label="Jatuh Tempo"
              type="date"
              value={jatuhTempo}
              disabled
              className="bg-gray-200 cursor-not-allowed"
            />

            <FormInput
              label="No Invoice"
              name="noInvoice"
              value={form.noInvoice}
              onChange={handleChange}
              required
              disabled={isPending}
              placeholder="Contoh: INV/001/01/2025"
            />

            <FormInput
              label="No Surat Jalan"
              name="noSuratJalan"
              value={form.noSuratJalan}
              onChange={handleChange}
              required
              disabled={isPending}
              placeholder="Contoh: SJ/001/01/2025"
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Nama Barang: <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.barangId}
                onValueChange={handleBarangChange}
                required
                disabled={isPending}
              >
                <SelectTrigger className="bg-gray-100 text-sm focus:ring-2 focus:ring-sky-500">
                  <SelectValue placeholder="Pilih barang" />
                </SelectTrigger>
                <SelectContent>
                  {barangOptions.map((barang) => (
                    <SelectItem key={barang.id} value={barang.id.toString()}>
                      {barang.nama} ({barang.satuan}) -{" "}
                      {formatCurrency(barang.harga)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormInput
              label="Jumlah Barang"
              type="number"
              name="stokMasuk"
              value={form.stokMasuk}
              onChange={handleChange}
              required
              disabled={isPending}
              placeholder="0"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <FormInput
              label="Ongkir"
              type="number"
              name="ongkir"
              value={form.ongkir}
              onChange={handleChange}
              disabled={isPending}
              placeholder="0"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Status Pembelian: <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.status}
                onValueChange={handleStatusChange}
                required
                disabled={isPending}
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

            <FormTextarea
              label="Keterangan"
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              disabled={isPending}
              placeholder="Keterangan tambahan (opsional)"
            />
          </div>

          <div className="pt-2 text-gray-900 text-sm sm:text-base font-semibold border-t">
            Total Modal:
            <span className="ml-2 text-base sm:text-lg font-bold text-sky-700">
              {formatCurrency(totalModal)}
            </span>
          </div>

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
              className="w-full sm:w-auto bg-sky-700 hover:bg-sky-800 text-white text-sm"
              disabled={isPending}
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default memo(BarangMasukDialog);
