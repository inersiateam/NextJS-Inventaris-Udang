import z from "zod";

export const pengeluaranSchema = z.object({
  keterangan: z.string().min(3, "Keterangan minimal 3 karakter"),
  jumlah: z.number().int().positive("Jumlah harus positif"),
  totalHarga: z.number().int().positive("Total harga harus positif"),
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
});

export type PengeluaranInput = z.infer<typeof pengeluaranSchema>;
