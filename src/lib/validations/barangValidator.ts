import { z } from 'zod';

export const barangSchema = z.object({
  nama: z.string().min(1, "Nama barang wajib diisi"),
  stok: z.number().int().min(0, "Stok minimal 0"),
  harga: z.number().min(0, "Harga minimal 0"),
  keterangan: z.string().optional(),
})

export type BarangInput = z.infer<typeof barangSchema>;