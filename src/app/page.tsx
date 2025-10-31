"use client";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye, LockIcon, Mail } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Username atau password salah");
      } else {
        const session = await getSession();
        if (session) {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      setError("Terjadi kesalahan saat login. Silahkan tunggu 5 menit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-6 sm:px-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 sm:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md scale-95 transition-transform">

        {/* Title */}
        <h2 className="text-center text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
          Sign in
        </h2>
        <p className="text-center text-xs sm:text-sm text-gray-600 mb-6">
          Do you already have an account?{" "}
          <a href="/signup" className="text-blue-700 font-semibold hover:underline">
            Sign up
          </a>
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label
            htmlFor="username"
              className={`absolute left-12 transition-all duration-200 pointer-events-none ${
                username
                  ? "-top-2 text-xs sm:text-sm text-gray-600 bg-white px-1"
                  : "sm:top-4 top-5 text-xs sm:text-sm text-gray-500"
              }`}
            >
              Username
            </label>
            <Mail className="absolute left-4 top-4 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-black"
            />
          </div>

          <div className="relative">
            <label
              className={`absolute left-12 transition-all duration-200 pointer-events-none ${
                password
                  ? "-top-2 text-xs sm:text-sm text-gray-600 bg-white px-1"
                  : "sm:top-4 top-5 text-xs sm:text-sm text-gray-500"
              }`}
            >
              Password
            </label>
            <LockIcon className="absolute left-4 top-4 text-gray-500 w-4 h-4" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-black"
            />
            <button
              type="button"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1 p-3 text-gray-400 hover:text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-600">Remember me</span>
            </label>
            <a
              href="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot password
            </a>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full text-sm sm:text-base py-2 sm:py-3"
            variant="default"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="w-full border-t border-gray-300"></div>
          <Button
            type="button"
            disabled={isLoading}
            variant="outline"
            className="w-full text-gray-600 border-gray-300 hover:bg-gray-50 text-sm sm:text-base py-2 sm:py-3"
            onClick={() => router.push("/guest-selection")}
          >
            Login sebagai tamu
          </Button>
        </form>
      </div>
    </div>
  );
}
