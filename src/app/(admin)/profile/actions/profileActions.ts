"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "@/lib/services/profileService";
import { revalidatePath } from "next/cache";
import {
  UpdateProfileInput,
  ChangePasswordInput,
} from "@/types/interfaces/IProfile";
import { getRequestHeaders } from "@/lib/helpers/globalHelper";

export async function getProfileAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const profile = await getProfile(parseInt(session.user.id));

    if (!profile) {
      return {
        success: false,
        error: "Data profil tidak ditemukan",
      };
    }

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Error in getProfileAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data",
    };
  }
}

export async function updateProfileAction(input: UpdateProfileInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const { ipAddress, userAgent } = await getRequestHeaders();

    const result = await updateProfile({
      username: input.username,
      adminId: parseInt(session.user.id),
      ipAddress,
      userAgent,
    });

    revalidatePath("/profile");

    return result;
  } catch (error) {
    console.error("Error in updateProfileAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function changePasswordAction(input: ChangePasswordInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const { ipAddress, userAgent } = await getRequestHeaders();

    const result = await changePassword({
      adminId: parseInt(session.user.id),
      oldPassword: input.oldPassword,
      newPassword: input.newPassword,
      ipAddress,
      userAgent,
    });

    revalidatePath("/profile");

    return result;
  } catch (error) {
    console.error("Error in changePasswordAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}
