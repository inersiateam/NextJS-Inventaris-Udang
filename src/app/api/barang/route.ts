import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { barangSchema } from "@/lib/validations/barangValidator";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Silahkan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const { jabatan, id: adminId } = session.user;
    if (!["ABL", "ATM"].includes(jabatan)) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk menambah barang" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = barangSchema.parse(body);
    const newBarang = await prisma.barang.create({
      data: {
        nama: validatedData.nama,
        harga: validatedData.harga,
        stok: validatedData.stok,
        adminId: parseInt(adminId),
      },
      include: {
        admin: {
          select: {
            username: true,
            jabatan: true,
          },
        },
      },
    });

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(adminId),
        aksi: "CREATE",
        tabelTarget: "barang",
        dataBaru: JSON.stringify(newBarang),
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Barang berhasil ditambahkan",
        data: newBarang,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Post barang error: ", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat menambah barang" },
      { status: 500 }
    );
  }
}