import z from "zod";

const barangKeluarItemSchema = z.object({
  barangId: z.number().int().positive("ID barang harus valid"),
  jmlPembelian: z.number().int().positive("Jumlah pembelian minimal 1"),
  hargaJual: z.number().min(0, "Harga jual minimal 0"),
});

export const barangKeluarSchema = z.object({
  pelangganId: z.number().int().positive("ID pelanggan harus valid"),
  tglKeluar: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  ongkir: z.number().int().min(0, "Ongkir minimal 0").default(0),
  items: z
    .array(barangKeluarItemSchema)
    .min(1, "Minimal harus ada 1 item barang"),
  status: z.enum(["LUNAS", "BELUM_LUNAS"]).optional().default("BELUM_LUNAS"),
});

export type BarangKeluarInput = z.infer<typeof barangKeluarSchema>;
export type BarangKeluarItemInput = z.infer<typeof barangKeluarItemSchema>;