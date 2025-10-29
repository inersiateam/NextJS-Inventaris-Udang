import z from "zod";

export const barangSchema = z.object({
  nama: z
    .string()
    .min(1, "Nama barang harus diisi")
    .max(100, "Nama barang maksimal 100 karakter"),
  harga: z
    .number()
    .int("Harga harus berupa bilangan bulat")
    .positive("Harga harus lebih dari 0"),
  satuan: z.enum(["KG", "LITER"], {
    message: "Satuan harus KG atau LITER",
  }),
});

export type BarangInput = z.infer<typeof barangSchema>;
