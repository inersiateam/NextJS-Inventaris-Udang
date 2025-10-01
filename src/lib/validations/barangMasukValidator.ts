import z from "zod";

export const barangMasukSchema = z.object({
  barangId: z.number().int().positive("ID barang harus valid"),
  stokMasuk: z.number().int().positive("Stok masuk minimal 1"),
  tglMasuk: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  ongkir: z.number().int().min(0, "Ongkir minimal 0").default(0),
  keterangan: z.string().optional(),
});

export type BarangMasukInput = z.infer<typeof barangMasukSchema>;