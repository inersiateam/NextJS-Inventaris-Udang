import { z } from "zod";

export const pelangganSchema = z.object({
  nama: z.string().min(1, "Nama pelanggan wajib diisi"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
});

export type PelangganInput = z.infer<typeof pelangganSchema>;
