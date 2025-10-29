"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  createBarangAction,
  updateBarangAction,
} from "../actions/barangActions";
import { toast } from "sonner";
import { BarangWithRelations } from "@/types/interfaces/IBarang";
import { Satuan } from "@prisma/client";

interface DialogBarangProps {
  mode?: "create" | "edit";
  barang?: BarangWithRelations;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function DialogBarang({
  mode = "create",
  barang,
  onSuccess,
  trigger,
}: DialogBarangProps) {
  const [open, setOpen] = useState(false);
  const [nama, setNama] = useState(barang?.nama || "");
  const [harga, setHarga] = useState(barang?.harga?.toString() || "");
  const [satuan, setSatuan] = useState<Satuan>(barang?.satuan || "KG");
  const [loading, setLoading] = useState(false);

  // Debug log
  console.log("Current satuan value:", satuan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting with satuan:", satuan, "type:", typeof satuan);

    if (!nama.trim()) {
      toast.error("Nama barang harus diisi");
      return;
    }

    if (!harga || parseFloat(harga) <= 0) {
      toast.error("Harga harus lebih dari 0");
      return;
    }

    if (!satuan) {
      toast.error("Satuan harus dipilih");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (mode === "create") {
        result = await createBarangAction({
          nama: nama.trim(),
          harga: parseInt(harga),
          satuan: satuan,
        });
      } else if (barang) {
        result = await updateBarangAction({
          id: barang.id,
          nama: nama.trim(),
          harga: parseInt(harga),
          satuan: satuan,
        });
      }

      if (result?.success) {
        toast.success(result.message);
        setOpen(false);
        setNama("");
        setHarga("");
        setSatuan("KG");
        onSuccess?.();
      } else {
        toast.error(result?.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error submit barang:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      setOpen(newOpen);
      if (!newOpen && mode === "create") {
        setNama("");
        setHarga("");
        setSatuan("KG");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="flex justify-end">
            <Button className="w-full sm:w-auto">Tambah Data</Button>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Tambah Barang" : "Edit Barang"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Tambah barang disini. Klik simpan setelah selesai."
                : "Edit data barang. Klik simpan untuk menyimpan perubahan."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nama_barang">Nama Barang:</Label>
              <Input
                id="nama_barang"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama barang"
                disabled={loading}
                required
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="grid gap-2">
                <Label htmlFor="harga">Harga:</Label>
                <Input
                  id="harga"
                  type="number"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  placeholder="Masukkan harga"
                  disabled={loading}
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div className="grid gap-2 w-[120px]">
                <Label htmlFor="satuan">Satuan:</Label>
                <Select
                  value={satuan}
                  onValueChange={(value) => setSatuan(value as Satuan)}
                  disabled={loading}
                  required
                >
                  <SelectTrigger id="satuan">
                    <SelectValue placeholder="Pilih satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="LITER">LITER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="bg-primary hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
