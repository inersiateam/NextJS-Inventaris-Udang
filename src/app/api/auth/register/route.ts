import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/authValidator";
import { ZodError } from "zod";
import { logActivity } from "@/lib/fileLogger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.admin.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const newAdmin = await prisma.admin.create({
      data: {
        username: validatedData.username,
        password: hashedPassword,
        jabatan: validatedData.jabatan,
      },
      select: {
        id: true,
        username: true,
        jabatan: true,
        isActive: true,
        createdAt: true,
      },
    });

    logActivity({
      adminId: newAdmin.id,
      aksi: "REGISTER",
      tabelTarget: "admin",
      dataBaru: JSON.stringify(newAdmin),
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        data: newAdmin,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
