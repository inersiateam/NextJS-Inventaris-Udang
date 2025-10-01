import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    jabatan: string;
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      jabatan: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    jabatan: string;
  }
}
