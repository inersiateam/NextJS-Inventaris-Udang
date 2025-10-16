"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
// import { tambahBarang } from "../actions/barangActions"

export default function DialogTambahBarang() {
  const [nama, setNama] = useState("")
  const [harga, setHarga] = useState("")

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     await tambahBarang({ nama, harga })
//     setNama("")
//     setHarga("")
//   }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-end">
          <Button className="w-full sm:w-auto">Tambah Data</Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form>
          <DialogHeader>
            <DialogTitle>Tambah Barang</DialogTitle>
            <DialogDescription>
              Tambah barang disini, Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="nama_barang">Nama Barang:</Label>
              <Input
                id="nama_barang"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
               
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="harga">Harga</Label>
              <Input
                id="harga"
                type="number"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-primary hover:bg-blue-700 text-white">
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
