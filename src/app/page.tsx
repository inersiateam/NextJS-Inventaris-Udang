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
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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
    <div className="flex items-center justify-center min-h-dvh max-h-dvh overflow-hidden bg-gray-100 px-4 py-4">
      <main
        className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-md max-h-[95vh] overflow-y-auto"
        role="main"
        aria-labelledby="login-title"
      >
        {/* Title */}
        <h1
          id="login-title"
          className="text-center text-xl sm:text-2xl font-semibold text-gray-800 mb-2"
        >
          Sign in
        </h1>
        <p className="text-center text-xs sm:text-sm text-gray-600 mb-6">
          Silahkan masukkan data pribadi anda!
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div className="relative">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => setUsernameFocused(false)}
              className="w-full pl-12 pr-4 py-4 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black peer"
              placeholder=" "
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <label
              htmlFor="username"
              className={`absolute left-10 bg-white px-2 transition-all duration-200 pointer-events-none ${
                username || usernameFocused
                  ? "-top-2.5 text-xs text-blue-600"
                  : "top-4 text-sm text-gray-500"
              }`}
            >
              Username
            </label>
          </div>

          {/* Password Field */}
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="w-full pl-12 pr-12 py-4 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black peer"
              placeholder=" "
            />
            <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <label
              htmlFor="password"
              className={`absolute left-10 bg-white px-2 transition-all duration-200 ease-in-out pointer-events-none ${
                password || passwordFocused
                  ? "-top-2.5 text-xs text-blue-600"
                  : "top-4 text-sm text-gray-500"
              }`}
            >
              Password
            </label>
            <button
              type="button"
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
            className="w-full text-sm sm:text-base py-2 mt-3"
            variant="default"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="w-full border-t border-gray-300"></div>
          <Button
            type="button"
            disabled={isLoading}
            variant="outline"
            className="w-full text-gray-600 border-gray-300 hover:bg-gray-50 text-sm sm:text-base py-3"
            onClick={() => router.push("/guest-selection")}
          >
            Login sebagai tamu
          </Button>
        </form>
      </main>
    </div>
  );
}
