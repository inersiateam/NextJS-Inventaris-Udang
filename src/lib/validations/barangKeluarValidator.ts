import z from "zod";

export const barangKeluarItemSchema = z.object({
  barangId: z.number().int().positive("ID barang harus valid"),
  jmlPembelian: z.number().int().positive("Jumlah pembelian minimal 1"),
  hargaJual: z.number().positive("Harga jual harus lebih dari 0"),
});

export const barangKeluarSchema = z.object({
  pelangganId: z.number().int().positive("ID pelanggan harus valid"),
  tglKeluar: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Tanggal keluar harus dalam format YYYY-MM-DD"
    ),
  ongkir: z.number().min(0, "Ongkir harus bernilai minimal 0").default(0),
  items: z
    .array(barangKeluarItemSchema)
    .min(1, "Minimal harus ada 1 item barang"),
  status: z.enum(["LUNAS", "BELUM_LUNAS"]).optional().default("BELUM_LUNAS"),
  noPo: z.string().optional(),
});

export type BarangKeluarInput = z.infer<typeof barangKeluarSchema>;
export type BarangKeluarItemInput = z.infer<typeof barangKeluarItemSchema>;
