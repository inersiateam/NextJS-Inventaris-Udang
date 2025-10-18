import { Jabatan } from "@prisma/client";

export interface UpdateProfileInput {
  username: string;
}

export interface UpdateProfileParams extends UpdateProfileInput {
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordParams {
  adminId: number;
  oldPassword: string;
  newPassword: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ProfileData {
  id: number;
  username: string;
  jabatan: Jabatan;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: ProfileData;
}

export interface PasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}
