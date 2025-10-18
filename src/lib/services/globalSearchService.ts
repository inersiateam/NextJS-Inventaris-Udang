import { Jabatan } from "@prisma/client";
import prisma from "@/lib/prisma";

export interface SearchResult {
  type: "barang" | "pelanggan" | "barang_masuk" | "barang_keluar";
  id: number;
  title: string;
  subtitle: string;
  metadata?: string;
  url: string;
}

export interface GlobalSearchResponse {
  success: boolean;
  results: SearchResult[];
  total: number;
}

export async function globalSearch(
  query: string,
  jabatan: Jabatan,
  limit: number = 10
): Promise<GlobalSearchResponse> {
  try {
    if (!query || query.trim().length < 2) {
      return {
        success: true,
        results: [],
        total: 0,
      };
    }

    const searchTerm = query.trim();
    const results: SearchResult[] = [];

    // Search Barang
    const barangResults = await prisma.barang.findMany({
      where: {
        admin: { jabatan },
        nama: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        nama: true,
        stok: true,
        harga: true,
      },
      take: limit,
    });

    results.push(
      ...barangResults.map((item) => ({
        type: "barang" as const,
        id: item.id,
        title: item.nama,
        subtitle: `Stok: ${item.stok}`,
        metadata: `Harga: Rp ${item.harga.toLocaleString("id-ID")}`,
        url: `/barang?highlight=${item.id}`,
      }))
    );

    // Search Pelanggan
    const pelangganResults = await prisma.pelanggan.findMany({
      where: {
        admin: { jabatan },
        OR: [
          {
            nama: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            alamat: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        nama: true,
        alamat: true,
      },
      take: limit,
    });

    results.push(
      ...pelangganResults.map((item) => ({
        type: "pelanggan" as const,
        id: item.id,
        title: item.nama,
        subtitle: item.alamat,
        url: `/pelanggan?highlight=${item.id}`,
      }))
    );

    // Search Barang Masuk (by invoice or surat jalan)
    const barangMasukResults = await prisma.barangMasuk.findMany({
      where: {
        admin: { jabatan },
        OR: [
          {
            noInvoice: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            noSuratJalan: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        noInvoice: true,
        noSuratJalan: true,
        tglMasuk: true,
        barang: {
          select: {
            nama: true,
          },
        },
      },
      take: limit,
    });

    results.push(
      ...barangMasukResults.map((item) => ({
        type: "barang_masuk" as const,
        id: item.id,
        title: `Invoice: ${item.noInvoice}`,
        subtitle: item.barang.nama,
        metadata: `Tgl: ${new Date(item.tglMasuk).toLocaleDateString("id-ID")}`,
        url: `/barang-masuk?highlight=${item.id}`,
      }))
    );

    // Search Barang Keluar (by invoice)
    const barangKeluarResults = await prisma.barangKeluar.findMany({
      where: {
        admin: { jabatan },
        noInvoice: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        noInvoice: true,
        tglKeluar: true,
        pelanggan: {
          select: {
            nama: true,
          },
        },
      },
      take: limit,
    });

    results.push(
      ...barangKeluarResults.map((item) => ({
        type: "barang_keluar" as const,
        id: item.id,
        title: `Invoice: ${item.noInvoice}`,
        subtitle: `Pelanggan: ${item.pelanggan.nama}`,
        metadata: `Tgl: ${new Date(item.tglKeluar).toLocaleDateString("id-ID")}`,
        url: `/barang-keluar?highlight=${item.id}`,
      }))
    );

    // Limit total results
    const limitedResults = results.slice(0, limit);

    return {
      success: true,
      results: limitedResults,
      total: limitedResults.length,
    };
  } catch (error) {
    console.error("Error in global search:", error);
    throw new Error("Terjadi kesalahan saat mencari data");
  }
}