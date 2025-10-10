import prisma from "../prisma";
import { headers } from "next/headers";
import { Jabatan } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import { redirect } from "next/navigation";

export async function getJabatan(): Promise<Jabatan> {
  const headersList = await headers();
  const jabatanFromHeader = headersList.get("x-user-jabatan");
  
  if (jabatanFromHeader) {
    return jabatanFromHeader as Jabatan;
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.jabatan) {
    redirect("/login");
  }

  return session.user.jabatan as Jabatan;
}

export async function getUserFromHeaders() {
  const headersList = await headers();

  return {
    jabatan: headersList.get("x-user-jabatan") as Jabatan | null,
    id: headersList.get("x-user-id"),
    username: headersList.get("x-user-username"),
  };
}

export async function generateNoInvoice(
  tglKeluar: Date,
  jabatan: string
): Promise<string> {
  const year = tglKeluar.getFullYear();
  const month = String(tglKeluar.getMonth() + 1).padStart(2, "0");
  const day = String(tglKeluar.getDate()).padStart(2, "0");
  const startOfMonth = new Date(year, tglKeluar.getMonth(), 1);
  const endOfMonth = new Date(year, tglKeluar.getMonth() + 1, 0, 23, 59, 59);

  const count = await prisma.barangKeluar.count({
    where: {
      tglKeluar: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const nomorUrut = String(count + 1).padStart(3, "0");

  return `INV/${nomorUrut}/${day}/${jabatan}/${month}/${year}`;
}

export function calculateJatuhTempo(tglMasuk: Date): Date {
  const jatuhTempo = new Date(tglMasuk);
  jatuhTempo.setMonth(jatuhTempo.getMonth() + 1);
  return jatuhTempo;
}
