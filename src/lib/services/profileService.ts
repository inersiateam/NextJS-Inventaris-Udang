import { cache } from "react";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "../validations/profileValidator";
import {
  ProfileData,
  UpdateProfileParams,
  ChangePasswordParams,
  ProfileResponse,
  PasswordResponse,
} from "@/types/interfaces/IProfile";
import z from "zod";
import { logActivity } from "../fileLogger";

const PROFILE_SELECT = {
  id: true,
  username: true,
  jabatan: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const getProfile = cache(
  async (adminId: number): Promise<ProfileData | null> => {
    try {
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: PROFILE_SELECT,
      });

      return admin as ProfileData | null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw new Error("Terjadi kesalahan saat mengambil data profil");
    }
  }
);

export async function updateProfile(
  params: UpdateProfileParams
): Promise<ProfileResponse> {
  try {
    const validatedData = updateProfileSchema.parse({
      username: params.username,
    });

    const existingAdmin = await prisma.admin.findUnique({
      where: { id: params.adminId },
      select: {
        id: true,
        username: true,
      },
    });

    if (!existingAdmin) {
      throw new Error("Data admin tidak ditemukan");
    }

    const duplicateUsername = await prisma.admin.findFirst({
      where: {
        username: validatedData.username,
        id: { not: params.adminId },
      },
    });

    if (duplicateUsername) {
      throw new Error("Username sudah digunakan");
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: params.adminId },
      data: {
        username: validatedData.username,
      },
      select: PROFILE_SELECT,
    });

    logActivity({
      adminId: params.adminId,
      aksi: "UPDATE_PROFILE",
      tabelTarget: "admin",
      dataLama: JSON.stringify({
        id: existingAdmin.id,
        username: existingAdmin.username,
      }),
      dataBaru: JSON.stringify({
        id: updatedAdmin.id,
        username: updatedAdmin.username,
      }),
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Profil berhasil diperbarui",
      data: updatedAdmin as ProfileData,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validasi gagal: ${error.issues[0].message}`);
    }
    throw error;
  }
}

export async function changePassword(
  params: ChangePasswordParams
): Promise<PasswordResponse> {
  try {
    const validatedData = changePasswordSchema.parse({
      oldPassword: params.oldPassword,
      newPassword: params.newPassword,
      confirmPassword: params.newPassword,
    });

    const admin = await prisma.admin.findUnique({
      where: { id: params.adminId },
      select: {
        id: true,
        username: true,
        password: true,
      },
    });

    if (!admin) {
      throw new Error("Data admin tidak ditemukan");
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.oldPassword,
      admin.password
    );

    if (!isPasswordValid) {
      throw new Error("Password lama tidak sesuai");
    }

    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    await prisma.admin.update({
      where: { id: params.adminId },
      data: {
        password: hashedPassword,
      },
    });

    logActivity({
      adminId: params.adminId,
      aksi: "CHANGE_PASSWORD",
      tabelTarget: "admin",
      dataBaru: JSON.stringify({
        id: admin.id,
        username: admin.username,
        message: "Password changed successfully",
      }),
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Password berhasil diubah",
    };
  } catch (error) {
    console.error("Error changing password:", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validasi gagal: ${error.issues[0].message}`);
    }
    throw error;
  }
}
