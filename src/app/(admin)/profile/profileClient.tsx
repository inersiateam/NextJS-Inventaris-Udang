"use client";

import { useState, useTransition, useCallback, memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateProfileAction,
  changePasswordAction,
} from "@/app/(admin)/profile/actions/profileActions";
import { toast } from "sonner";
import { ProfileData } from "@/types/interfaces/IProfile";
import { signOut } from "next-auth/react";

interface ProfileClientProps {
  profile: ProfileData;
}

const ProfileTab = memo(
  ({
    profile,
    isPending,
    onSubmit,
  }: {
    profile: ProfileData;
    isPending: boolean;
    onSubmit: (username: string) => void;
  }) => {
    const [username, setUsername] = useState(profile.username);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(username);
      },
      [username, onSubmit]
    );

    return (
      <Card>
        <CardHeader></CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-3 mb-5">
              <Label htmlFor="jabatan">Jabatan</Label>
              <Input
                id="jabatan"
                value={profile.jabatan}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Update Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }
);
ProfileTab.displayName = "ProfileTab";

const PasswordTab = memo(
  ({
    isPending,
    onSubmit,
  }: {
    isPending: boolean;
    onSubmit: (
      oldPassword: string,
      newPassword: string,
      confirmPassword: string
    ) => void;
  }) => {
    const [form, setForm] = useState({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
          toast.error("Konfirmasi password tidak cocok");
          return;
        }

        onSubmit(form.oldPassword, form.newPassword, form.confirmPassword);
      },
      [form, onSubmit]
    );

    const handleChange = useCallback(
      (field: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
          setForm((prev) => ({ ...prev, [field]: e.target.value }));
        },
      []
    );

    return (
      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="password-lama">Password Lama</Label>
              <Input
                id="password-lama"
                type="password"
                value={form.oldPassword}
                onChange={handleChange("oldPassword")}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password-baru">Password Baru</Label>
              <Input
                id="password-baru"
                type="password"
                value={form.newPassword}
                onChange={handleChange("newPassword")}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid gap-3 mb-5">
              <Label htmlFor="konfirmasi-password">Konfirmasi Password</Label>
              <Input
                id="konfirmasi-password"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                required
                disabled={isPending}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Save password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }
);
PasswordTab.displayName = "PasswordTab";

export default function ProfileClient({ profile }: ProfileClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateProfile = useCallback((username: string) => {
    startTransition(async () => {
      try {
        const result = await updateProfileAction({ username });

        if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.success(result.message || "Profil berhasil diperbarui");
          toast.info("Silakan login kembali dengan username baru");
          setTimeout(() => {
            signOut({ callbackUrl: "/login" });
          }, 2000);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error instanceof Error ? error.message : "Terjadi kesalahan"
        );
      }
    });
  }, []);

  const handleChangePassword = useCallback(
    (oldPassword: string, newPassword: string, confirmPassword: string) => {
      startTransition(async () => {
        try {
          const result = await changePasswordAction({
            oldPassword,
            newPassword,
            confirmPassword,
          });

          if ("error" in result) {
            toast.error(result.error);
          } else {
            toast.success(result.message || "Password berhasil diubah");
            toast.info("Silakan login kembali dengan password baru");
            setTimeout(() => {
              signOut({ callbackUrl: "/login" });
            }, 2000);
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error(
            error instanceof Error ? error.message : "Terjadi kesalahan"
          );
        }
      });
    },
    []
  );

  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab
          profile={profile}
          isPending={isPending}
          onSubmit={handleUpdateProfile}
        />
      </TabsContent>

      <TabsContent value="password">
        <PasswordTab isPending={isPending} onSubmit={handleChangePassword} />
      </TabsContent>
    </Tabs>
  );
}
