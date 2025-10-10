import { Jabatan } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    jabatan: Jabatan;
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      jabatan: Jabatan;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    jabatan: Jabatan;
  }
}
