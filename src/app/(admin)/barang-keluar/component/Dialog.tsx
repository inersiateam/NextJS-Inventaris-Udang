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
import { BarangOption, PelangganOption } from "@/types/interfaces/IBarangMasuk";
import { useRouter } from "next/navigation";
import {
  createBarangKeluarAction,
  updateBarangKeluarAction,
} from "@/app/(admin)/barang-keluar/actions/barangKeluarActions";
import { toast } from "sonner";
import { IBarangKeluarItem } from "@/types/interfaces/IBarangKeluar";

interface BarangKeluarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barangOptions: BarangOption[];
  pelangganOptions: PelangganOption[];
  editData?: any | null;
  mode?: "create" | "edit";
}

const getInitialFormState = () => ({
  pelangganId: "",
  tglKeluar: new Date().toISOString().split("T")[0],
  ongkir: "",
  status: "BELUM_LUNAS" as "BELUM_LUNAS" | "LUNAS",
});

const getInitialItemsState = (): IBarangKeluarItem[] => [
  { barangId: 0, jmlPembelian: 0, hargaJual: 0 },
];

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

const BarangItemRow = memo(
  ({
    item,
    index,
    barangList,
    isPending,
    onItemChange,
    onRemove,
    canRemove,
  }: {
    item: IBarangKeluarItem;
    index: number;
    barangList: BarangOption[];
    isPending: boolean;
    onItemChange: (
      index: number,
      field: keyof IBarangKeluarItem,
      value: string
    ) => void;
    onRemove: (index: number) => void;
    canRemove: boolean;
  }) => {
    const handleBarangChange = useCallback(
      (value: string) => {
        onItemChange(index, "barangId", value);
      },
      [index, onItemChange]
    );

    const handleJmlChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onItemChange(index, "jmlPembelian", e.target.value);
      },
      [index, onItemChange]
    );

    const handleHargaChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onItemChange(index, "hargaJual", e.target.value);
      },
      [index, onItemChange]
    );

    const handleRemove = useCallback(() => {
      onRemove(index);
    }, [index, onRemove]);

    return (
      <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="sm:hidden text-xs font-semibold text-gray-600">
          Item #{index + 1}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">
              Barang: <span className="text-red-500">*</span>
            </label>
            <Select
              value={item.barangId.toString()}
              onValueChange={handleBarangChange}
              required
              disabled={isPending}
            >
              <SelectTrigger className="bg-white text-sm focus:ring-2 focus:ring-sky-500">
                <SelectValue placeholder="Pilih Barang" />
              </SelectTrigger>
              <SelectContent>
                {barangList.map((barang) => (
                  <SelectItem key={barang.id} value={barang.id.toString()}>
                    {barang.nama} (Stok: {barang.stok})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">
              Jumlah: <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={item.jmlPembelian || ""}
              onChange={handleJmlChange}
              required
              min="1"
              placeholder="0"
              disabled={isPending}
              className="rounded-md bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="sm:col-span-3 flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">
              Harga Jual: <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={item.hargaJual || ""}
              onChange={handleHargaChange}
              required
              min="0"
              placeholder="0"
              disabled={isPending}
              className="rounded-md bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700 invisible hidden sm:block">
              Aksi
            </label>
            {canRemove && (
              <Button
                type="button"
                onClick={handleRemove}
                variant="destructive"
                size="sm"
                disabled={isPending}
                className="w-full text-sm h-9"
              >
                Hapus
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);
BarangItemRow.displayName = "BarangItemRow";

function BarangKeluarDialog({
  open,
  onOpenChange,
  barangOptions,
  pelangganOptions,
  editData = null,
  mode = "create",
}: BarangKeluarDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(getInitialFormState);
  const [items, setItems] = useState<IBarangKeluarItem[]>(getInitialItemsState);

  const totalOmset = useMemo(() => {
    const total = items.reduce((sum, item) => {
      return sum + item.jmlPembelian * item.hargaJual;
    }, 0);
    const ongkir = parseFloat(form.ongkir) || 0;
    return total - ongkir;
  }, [items, form.ongkir]);

  useEffect(() => {
    if (!open) {
      setForm(getInitialFormState());
      setItems(getInitialItemsState());
      return;
    }

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
  }, [open, mode, editData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePelangganChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, pelangganId: value }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setForm((prev) => ({
      ...prev,
      status: value as "BELUM_LUNAS" | "LUNAS",
    }));
  }, []);

  const handleItemChange = useCallback(
    (index: number, field: keyof IBarangKeluarItem, value: string) => {
      setItems((prev) => {
        const newItems = [...prev];
        newItems[index] = {
          ...newItems[index],
          [field]:
            field === "barangId" ? parseInt(value) : parseFloat(value) || 0,
        };
        return newItems;
      });
    },
    []
  );

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { barangId: 0, jmlPembelian: 0, hargaJual: 0 },
    ]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => {
      if (prev.length > 1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const payload = {
        pelangganId: parseInt(form.pelangganId),
        tglKeluar: form.tglKeluar,
        ongkir: parseFloat(form.ongkir) || 0,
        status: form.status,
        items: items.filter(
          (item) =>
            item.barangId > 0 && item.jmlPembelian > 0 && item.hargaJual > 0
        ),
      };

      startTransition(async () => {
        try {
          const result =
            mode === "edit" && editData
              ? await updateBarangKeluarAction({ id: editData.id, ...payload })
              : await createBarangKeluarAction(payload);

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
    [form, items, mode, editData, onOpenChange, router]
  );

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Pelanggan: <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.pelangganId}
                onValueChange={handlePelangganChange}
                required
                disabled={isPending}
              >
                <SelectTrigger className="bg-gray-100 text-sm focus:ring-2 focus:ring-sky-500">
                  <SelectValue placeholder="Pilih Pelanggan" />
                </SelectTrigger>
                <SelectContent>
                  {pelangganOptions.map((pelanggan) => (
                    <SelectItem
                      key={pelanggan.id}
                      value={pelanggan.id.toString()}
                    >
                      {pelanggan.nama}
                      {pelanggan.alamat && ` - ${pelanggan.alamat}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormInput
              label="Tanggal Keluar"
              type="date"
              name="tglKeluar"
              value={form.tglKeluar}
              onChange={handleChange}
              required
              disabled={isPending}
            />

            <FormInput
              label="Ongkir"
              type="number"
              name="ongkir"
              value={form.ongkir}
              onChange={handleChange}
              placeholder="0"
              disabled={isPending}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Status Pembayaran: <span className="text-red-500">*</span>
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
          </div>

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
                disabled={isPending}
                className="text-sky-600 w-full sm:w-auto text-sm"
              >
                + Tambah Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <BarangItemRow
                  key={index}
                  item={item}
                  index={index}
                  barangList={barangOptions}
                  isPending={isPending}
                  onItemChange={handleItemChange}
                  onRemove={removeItem}
                  canRemove={items.length > 1}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 text-gray-900 text-sm sm:text-base font-semibold border-t">
            Total Omset:
            <span className="ml-2 text-base sm:text-lg font-bold text-sky-700">
              {formatCurrency(totalOmset)}
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

export default memo(BarangKeluarDialog);
