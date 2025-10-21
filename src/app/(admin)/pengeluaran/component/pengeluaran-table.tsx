"use client";

import { useState, useTransition, useMemo, memo, useCallback } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft2,
  ArrowRight2,
  Sort,
  Edit2,
  More,
  Trash,
} from "iconsax-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { IPengeluaran } from "@/types/interfaces/IPengeluaran";
import { deletePengeluaranAction } from "../actions/pengeluaranActions";
import { toast } from "sonner";

const PengeluaranDialog = dynamic(() => import("./Dialog"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 z-50" />,
});

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

const PengeluaranRow = memo(
  ({
    item,
    onEdit,
    onDelete,
  }: {
    item: IPengeluaran;
    onEdit: (item: IPengeluaran) => void;
    onDelete: (id: number, keterangan: string) => void;
  }) => {
    const handleEdit = useCallback(() => onEdit(item), [onEdit, item]);
    const handleDelete = useCallback(
      () => onDelete(item.id, item.keterangan),
      [onDelete, item.id, item.keterangan]
    );

    return (
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted/40"
              >
                <More size="20" color="#000" variant="Outline" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-36">
              <DropdownMenuItem
                onClick={handleEdit}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Edit2 size="18" color="#374151" variant="Outline" />
                <span className="text-sm">Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="flex items-center gap-2 cursor-pointer text-red-500"
              >
                <Trash size="18" color="#fd0000ff" variant="Outline" />
                <span className="text-sm">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.totalHarga === nextProps.item.totalHarga
    );
  }
);
PengeluaranRow.displayName = "PengeluaranRow";

const EmptyState = memo(() => (
  <TableRow>
    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
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
));
EmptyState.displayName = "EmptyState";

const PaginationButton = memo(
  ({
    page,
    currentPage,
    onClick,
    disabled,
  }: {
    page: number | string;
    currentPage: number;
    onClick: (page: number) => void;
    disabled: boolean;
  }) => {
    const handleClick = useCallback(() => {
      if (typeof page === "number") onClick(page);
    }, [page, onClick]);

    return (
      <Button
        variant={page === currentPage ? "default" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={page === "..." || disabled}
        className={`min-w-[32px] md:min-w-[40px] text-xs md:text-sm ${
          page === "..." ? "cursor-default hover:bg-transparent" : ""
        }`}
      >
        {page}
      </Button>
    );
  }
);
PaginationButton.displayName = "PaginationButton";

export default function PengeluaranTable({
  data,
  pagination,
  summary,
  currentFilters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState<IPengeluaran | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    keterangan: string;
  } | null>(null);

  const { currentPage, itemsPerPage, totalPages, startIndex, endIndex } =
    useMemo(
      () => ({
        currentPage: pagination?.page || 1,
        itemsPerPage: pagination?.limit || 10,
        totalPages: pagination?.totalPages || 1,
        startIndex: ((pagination?.page || 1) - 1) * (pagination?.limit || 10),
        endIndex: Math.min(
          ((pagination?.page || 1) - 1) * (pagination?.limit || 10) +
            (pagination?.limit || 10),
          pagination?.total || 0
        ),
      }),
      [pagination]
    );

  const currentMonth = useMemo(() => {
    if (!currentFilters?.bulan) return "Semua Bulan";
    const month = MONTHS.find((m) => m.value === currentFilters.bulan);
    return month?.label || "Semua Bulan";
  }, [currentFilters?.bulan]);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      pages.push(...[1, 2, 3, 4, "...", totalPages]);
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        1,
        "...",
        ...Array.from({ length: 4 }, (_, i) => totalPages - 3 + i)
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }

    return pages;
  }, [currentPage, totalPages]);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      return params.toString();
    },
    [searchParams]
  );

  const updatePage = useCallback(
    (page: number) => {
      startTransition(() => {
        const queryString = updateSearchParams({ page: String(page) });
        router.push(`?${queryString}`, { scroll: false });
      });
    },
    [router, updateSearchParams]
  );

  const handleFilterChange = useCallback(
    (bulan: number | null) => {
      startTransition(() => {
        const now = new Date();
        const queryString = updateSearchParams({
          page: "1",
          bulan: bulan?.toString() || null,
          tahun: bulan
            ? String(currentFilters?.tahun || now.getFullYear())
            : null,
        });
        router.push(`?${queryString}`, { scroll: false });
      });
    },
    [router, updateSearchParams, currentFilters?.tahun]
  );

  const handleAddNew = useCallback(() => {
    setEditData(null);
    setOpenDialog(true);
  }, []);

  const handleEdit = useCallback((item: IPengeluaran) => {
    setEditData(item);
    setOpenDialog(true);
  }, []);

  const handleDeleteClick = useCallback((id: number, keterangan: string) => {
    setItemToDelete({ id, keterangan });
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;

    startTransition(async () => {
      try {
        const result = await deletePengeluaranAction(itemToDelete.id);

        if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.success(result.message || "Berhasil menghapus data");
          setDeleteDialogOpen(false);
          setItemToDelete(null);
          router.refresh();
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error instanceof Error ? error.message : "Terjadi kesalahan"
        );
      }
    });
  }, [itemToDelete, router]);

  const handleDialogClose = useCallback(
    (open: boolean) => {
      setOpenDialog(open);
      if (!open) {
        setEditData(null);
        router.refresh();
      }
    },
    [router]
  );

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
          <p className="text-xs text-gray-600">Total Pengeluaran</p>
          <p className="text-lg md:text-xl font-bold text-sky-700">
            {formatCurrency(summary.totalPengeluaran)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2"
                disabled={isPending}
              >
                <Sort size={24} color="#000" variant="Outline" />
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

          <Button onClick={handleAddNew} className="w-full sm:w-auto">
            Tambah Data
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        Menampilkan {startIndex + 1} - {endIndex} dari {pagination?.total || 0}{" "}
        data
      </p>

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
              <EmptyState />
            ) : (
              data.map((item) => (
                <PengeluaranRow
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))
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
                <PaginationButton
                  key={`${page}-${index}`}
                  page={page}
                  currentPage={currentPage}
                  onClick={updatePage}
                  disabled={isPending}
                />
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

      {openDialog && (
        <PengeluaranDialog
          open={openDialog}
          onOpenChange={handleDialogClose}
          editData={editData}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">
              Hapus Pengeluaran?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Apakah Anda yakin ingin menghapus pengeluaran "
              {itemToDelete?.keterangan}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={isPending}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-xs sm:text-sm"
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
