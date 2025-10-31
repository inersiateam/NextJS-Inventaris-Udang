import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/services/profileService";
import ProfileClient from "./profileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  const profile = await getProfile(parseInt(session.user.id));

  if (!profile) {
    return (
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">Gagal memuat data profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profil</h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Kelola informasi profil dan keamanan akun Anda
        </p>
      </header>

      <ProfileClient profile={profile} />
    </div>
  );
}

export const revalidate = 0;
export const dynamic = "force-dynamic";
