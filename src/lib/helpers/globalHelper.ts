import prisma from "../prisma";

export async function generateNoInvoice(
  tglMasuk: Date,
  jabatan: string
): Promise<string> {
  const year = tglMasuk.getFullYear();
  const month = String(tglMasuk.getMonth() + 1).padStart(2, "0");
  const day = String(tglMasuk.getDate()).padStart(2, "0");
  const startOfMonth = new Date(year, tglMasuk.getMonth(), 1);
  const endOfMonth = new Date(year, tglMasuk.getMonth() + 1, 0, 23, 59, 59);

  const count = await prisma.barangMasuk.count({
    where: {
      tglMasuk: {
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
