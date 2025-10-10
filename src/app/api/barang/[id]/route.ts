import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { barangSchema } from "@/lib/validations/barangValidator";
import { Jabatan } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: "Anda tidak memiliki akses untuk mengubah barang" },
        { status: 403 }
      );
    }

    const barangId = parseInt(params.id);

    if (isNaN(barangId)) {
      return NextResponse.json(
        { error: "ID barang tidak valid" },
        { status: 400 }
      );
    }

    const existingBarang = await prisma.barang.findFirst({
      where: {
        id: barangId,
        admin: {
          jabatan: jabatan as Jabatan,
        },
      },
    });

    if (!existingBarang) {
      return NextResponse.json(
        { error: "Barang tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = barangSchema.parse(body);

    const updatedBarang = await prisma.barang.update({
      where: { id: barangId },
      data: {
        nama: validatedData.nama,
        harga: validatedData.harga,
        stok: validatedData.stok,
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
        aksi: "UPDATE",
        tabelTarget: "barang",
        dataLama: JSON.stringify(existingBarang),
        dataBaru: JSON.stringify(updatedBarang),
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Barang berhasil diperbarui",
      data: updatedBarang,
    });
  } catch (error) {
    console.error("Update barang error: ", error);

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
      { error: "Terjadi kesalahan saat memperbarui barang" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: "Anda tidak memiliki akses untuk menghapus barang" },
        { status: 403 }
      );
    }

    const barangId = parseInt(params.id);

    if (isNaN(barangId)) {
      return NextResponse.json(
        { error: "ID barang tidak valid" },
        { status: 400 }
      );
    }

    const existingBarang = await prisma.barang.findFirst({
      where: {
        id: barangId,
        admin: {
          jabatan: jabatan as Jabatan,
        },
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

    if (!existingBarang) {
      return NextResponse.json(
        { error: "Barang tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.barang.delete({
      where: { id: barangId },
    });

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(adminId),
        aksi: "DELETE",
        tabelTarget: "barang",
        dataLama: JSON.stringify(existingBarang),
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Barang berhasil dihapus",
      data: existingBarang,
    });
  } catch (error) {
    console.error("Delete barang error: ", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus barang" },
      { status: 500 }
    );
  }
}