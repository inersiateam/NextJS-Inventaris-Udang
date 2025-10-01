import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh huruf, angka, dan underscore"
    ),

  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(100, "Password terlalu panjang"),

  jabatan: z.enum(["ABL", "ATM"], {
    message: "Jabatan harus ABL atau ATM",
  }),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
