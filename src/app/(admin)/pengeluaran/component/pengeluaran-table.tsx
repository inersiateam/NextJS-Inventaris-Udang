"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft2, ArrowRight2, Sort } from "iconsax-react";
import { useState, useTransition, useMemo, memo } from "react";
import PengeluaranDialog from "./Dialog";
import PengeluaranDropdown from "./Pengeluaran-dropdown";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { IPengeluaran } from "@/types/interfaces/IPengeluaran";

interface Props {
  data: IPengeluaran[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalPengeluaran: number;
  };
  currentFilters?: {
    bulan?: number;
    tahun?: number;
  };
}

const MONTHS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
] as const;

const PengeluaranRow = memo(({ item }: { item: IPengeluaran }) => (
  <TableRow className="hover:bg-gray-50">
    <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm">
      {formatDate(new Date(item.tanggal))}
    </TableCell>
    <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center font-medium text-xs md:text-sm">
      {item.keterangan}
    </TableCell>
    <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm">
      {item.jumlah}
    </TableCell>
    <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-sky-700 text-xs md:text-sm">
      {formatCurrency(item.totalHarga)}
    </TableCell>
    <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center">
      <PengeluaranDropdown item={item} />
    </TableCell>
  </TableRow>
));

PengeluaranRow.displayName = "PengeluaranRow";

export default function PengeluaranTable({
  data,
  pagination,
  summary,
  currentFilters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openDialog, setOpenDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentPage = pagination?.page || 1;
  const itemsPerPage = pagination?.limit ?? 5;
  const totalPages = pagination?.totalPages ?? 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, pagination?.total ?? 0);

  const currentMonth = useMemo(() => {
    if (!currentFilters?.bulan) return "Semua Bulan";
    const month = MONTHS.find((m) => m.value === currentFilters.bulan);
    return month?.label || "Semua Bulan";
  }, [currentFilters?.bulan]);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  const updatePage = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const handleFilterChange = (bulan: number | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      const now = new Date();
      params.set("page", "1");

      if (bulan === null) {
        params.delete("bulan");
        params.delete("tahun");
      } else {
        params.set("bulan", String(bulan));
        params.set("tahun", String(currentFilters?.tahun || now.getFullYear()));
      }

      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <>
      <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="bg-sky-50 border border-sky-200 px-4 py-2 rounded-lg">
          <p className="text-xs text-gray-600">Total Pengeluaran</p>
          <p className="text-lg md:text-xl font-bold text-sky-700">
            {formatCurrency(summary.totalPengeluaran)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <p className="text-sm text-gray-600">
          Menampilkan {startIndex + 1} - {endIndex} dari {pagination?.total}{" "}
          data
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2"
                disabled={isPending}
              >
                <Sort size={24} color="#f000" variant="Outline" />
                <span>{currentMonth}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 max-h-[300px] overflow-y-auto"
            >
              <DropdownMenuItem
                onClick={() => handleFilterChange(null)}
                className={!currentFilters?.bulan ? "bg-sky-50" : ""}
              >
                Semua Bulan
              </DropdownMenuItem>
              {MONTHS.map((month) => (
                <DropdownMenuItem
                  key={month.value}
                  onClick={() => handleFilterChange(month.value)}
                  className={
                    currentFilters?.bulan === month.value ? "bg-sky-50" : ""
                  }
                >
                  {month.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setOpenDialog(true)}
            className="w-full sm:w-auto"
          >
            Tambah Data
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-600 text-white hover:bg-sky-600">
              {["Tanggal", "Keterangan", "Jumlah", "Total Harga", "Aksi"].map(
                (head) => (
                  <TableHead
                    key={head}
                    className="text-white whitespace-nowrap px-4 md:px-6 py-4 text-center font-semibold text-xs md:text-sm"
                  >
                    {head}
                  </TableHead>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-base md:text-lg font-medium">
                      Belum ada data pengeluaran
                    </p>
                    <p className="text-xs md:text-sm">
                      Klik tombol "Tambah Data" untuk menambahkan pengeluaran
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => <PengeluaranRow key={item.id} item={item} />)
            )}
          </TableBody>
        </Table>
      </div>

      {pagination?.total > 0 && (
        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pb-20 md:pb-0">
          <p className="text-xs md:text-sm text-gray-600 order-2 sm:order-1">
            Halaman {currentPage} dari {totalPages}
          </p>

          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updatePage(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="gap-1 text-xs md:text-sm"
            >
              <ArrowLeft2 size={24} color="#000" variant="Outline" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
              {pageNumbers.map((page, index) => (
                <Button
                  key={index}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => typeof page === "number" && updatePage(page)}
                  disabled={page === "..." || isPending}
                  className={`min-w-[32px] md:min-w-[40px] text-xs md:text-sm ${
                    page === "..." ? "cursor-default hover:bg-transparent" : ""
                  }`}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => updatePage(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="gap-1 text-xs md:text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight2 size={24} color="#000" variant="Outline" />
            </Button>
          </div>
        </div>
      )}

      <PengeluaranDialog open={openDialog} onOpenChange={setOpenDialog} />
    </>
  );
}
