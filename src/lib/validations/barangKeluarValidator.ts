import z from "zod";

const barangKeluarSchema = z.object({
  barangId: z.number().int().positive("ID barang harus valid"),
  pelangganId: z.number().int().positive("ID pelanggan harus valid"),
  jmlPembelian: z.number().int().positive("Jumlah pembelian minimal 1"),
  hargaJual: z.number().min(0, "Harga jual minimal 0"),
  tglKeluar: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  ongkir: z.number().int().min(0, "Ongkir minimal 0").default(0),
});

type BarangKeluarInput = z.infer<typeof barangKeluarSchema>;
