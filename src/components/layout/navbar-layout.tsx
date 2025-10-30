"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Bell, CircleUser, Menu, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppNavbarProps {
  onProfileClick?: () => void;
  onLogout?: () => void;
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

interface SearchResult {
  type: "barang" | "pelanggan" | "barang_masuk" | "barang_keluar";
  id: number;
  title: string;
  subtitle: string;
  metadata?: string;
  url: string;
}

const typeLabels = {
  barang: "Barang",
  pelanggan: "Pelanggan",
  barang_masuk: "Barang Masuk",
  barang_keluar: "Barang Keluar",
};

const typeColors = {
  barang: "bg-blue-100 text-blue-700",
  pelanggan: "bg-green-100 text-green-700",
  barang_masuk: "bg-purple-100 text-purple-700",
  barang_keluar: "bg-orange-100 text-orange-700",
};

export default function AppNavbar({ onLogout, onMenuClick }: AppNavbarProps) {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const username = session?.user?.username;
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`
        );
        const data = await response.json();

        if (data.success) {
          setSearchResults(data.results);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setShowResults(false);
    setSearchQuery("");
    setIsMobileSearchOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleResultClick(searchResults[0]);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-16 bg-white dark:bg-gray-900 border-b">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition border border-gray-300"
        >
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div ref={searchRef} className="relative hidden md:block w-64 lg:w-80">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Cari barang, pelanggan, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              className="w-full pl-8 pr-10 py-1.5 text-sm rounded-lg border border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 focus:outline-none"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {isSearching && (
              <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            )}
          </form>

          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}-${index}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        typeColors[result.type]
                      }`}
                    >
                      {typeLabels[result.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {result.subtitle}
                      </p>
                      {result.metadata && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {result.metadata}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showResults &&
            searchQuery.length >= 2 &&
            searchResults.length === 0 &&
            !isSearching && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Tidak ada hasil ditemukan
                </p>
              </div>
            )}
        </div>

        <button
          aria-label="icon"
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="hidden md:block h-6 border-l border-gray-300 dark:border-gray-600"></div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
            <CircleUser className="h-8 w-8 text-gray-700 dark:text-gray-300" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-2 w-40">
            {mounted && status === "authenticated" ? (
              <>
                <DropdownMenuItem disabled>Hai, {username}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile`}>Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    if (onLogout) onLogout();
                    signOut({ callbackUrl: "/login" });
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isMobileSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <div className="bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center gap-2 mb-4">
              <button
                aria-label="mobile"
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <Search className="h-5 w-5" />
              </button>
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 focus:outline-none"
                />
              </form>
            </div>

            {isSearching && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <button
                    aria-label="search"
                    key={`${result.type}-${result.id}-${index}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          typeColors[result.type]
                        }`}
                      >
                        {typeLabels[result.type]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {result.subtitle}
                        </p>
                        {result.metadata && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {result.metadata}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 &&
              searchResults.length === 0 &&
              !isSearching && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Tidak ada hasil ditemukan
                </p>
              )}
          </div>
        </div>
      )}
    </header>
  );
}