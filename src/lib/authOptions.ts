import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { loginSchema } from "./validations/authValidator";
import { Jabatan } from "@prisma/client";
import { logActivity } from "./fileLogger";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = loginSchema.parse(credentials);

        const admin = await prisma.admin.findUnique({
          where: { username },
        });

        if (!admin) throw new Error("Username atau password salah");
        if (!admin.isActive)
          throw new Error("Akun Anda tidak aktif. Hubungi administrator.");

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) throw new Error("Username atau password salah");

        logActivity({
          adminId: admin.id,
          aksi: "Login",
          tabelTarget: "admin",
          dataBaru: JSON.stringify(admin)
        });

        return {
          id: admin.id.toString(),
          username: admin.username,
          jabatan: admin.jabatan as Jabatan,
          isActive: admin.isActive,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.jabatan = user.jabatan;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.jabatan = token.jabatan as Jabatan;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
