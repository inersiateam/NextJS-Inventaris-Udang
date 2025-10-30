import z from "zod";

export const barangMasukSchema = z.object({
  barangId: z.number().int().positive("Pilih Barang yang valid"),
  noInvoice: z.string().min(1, "No. Invoice harus diisi"),
  noSuratJalan: z.string().min(1, "No. Surat jalan harus diisi"),
  stokMasuk: z.number().int().positive("Stok masuk minimal 1"),
  tglMasuk: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Tanggal masuk harus dalam format YYYY-MM-DD"
    ),
  ongkir: z.number().min(0, "Ongkir harus bernilai minimal 0").default(0),
  keterangan: z.string().optional(),
  status: z.enum(["LUNAS", "BELUM_LUNAS"]).optional(),
});

export type BarangMasukInput = z.infer<typeof barangMasukSchema>;
