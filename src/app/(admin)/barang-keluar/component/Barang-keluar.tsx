"use client";

import { useState, useTransition, useMemo, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Edit2,
  Eye,
  More,
  Trash,
  ArrowLeft2,
  ArrowRight2,
  Filter,
  Sort,
} from "iconsax-react";
import dynamic from "next/dynamic";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  deleteBarangKeluarAction,
  getBarangKeluarDetailAction,
  getBarangKeluarByIdAction,
} from "../actions/barangKeluarActions";
import { useRouter, useSearchParams } from "next/navigation";
import { IBarangKeluarResponse } from "@/types/interfaces/IBarangKeluar";
import { toast } from "sonner";

const BarangKeluarDialog = dynamic(() => import("../component/Dialog"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 z-50" />,
});

const DetailDialog = dynamic(() => import("../component/detailDialog"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 z-50" />,
});

interface BarangKeluarClientProps {
  barangKeluarList: IBarangKeluarResponse[];
  barangOptions: any[];
  pelangganOptions: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentFilters?: {
    filterBulan?: number;
    status?: "BELUM_LUNAS" | "LUNAS";
  };
}

type FilterPeriod = "all" | "thisMonth" | "3months" | "6months" | "1year";
const FILTER_LABELS: Record<FilterPeriod, string> = {
  all: "Semua Data",
  thisMonth: "Bulan Ini",
  "3months": "3 Bulan Terakhir",
  "6months": "6 Bulan Terakhir",
  "1year": "1 Tahun Terakhir",
};

const FILTER_TO_MONTHS: Record<FilterPeriod, number | null> = {
  all: null,
  thisMonth: 1,
  "3months": 3,
  "6months": 6,
  "1year": 12,
};

const StatusBadge = memo(({ status }: { status: string }) => (
  <Badge
    variant={status === "LUNAS" ? "default" : "secondary"}
    className="text-white text-xs"
  >
    {status === "LUNAS" ? "Lunas" : "Belum Lunas"}
  </Badge>
));
StatusBadge.displayName = "StatusBadge";

const BarangKeluarRow = memo(
  ({
    item,
    onEdit,
    onView,
    onDelete,
  }: {
    item: IBarangKeluarResponse;
    onEdit: (item: IBarangKeluarResponse) => void;
    onView: (id: number) => void;
    onDelete: (id: number) => void;
  }) => {
    const handleEdit = useCallback(() => onEdit(item), [onEdit, item]);
    const handleView = useCallback(() => onView(item.id), [onView, item.id]);
    const handleDelete = useCallback(
      () => onDelete(item.id),
      [onDelete, item.id]
    );

    return (
      <TableRow className="hover:bg-gray-50">
        <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center font-medium text-xs md:text-sm">
          {item.noInvoice}
        </TableCell>
        <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm">
          {formatDate(item.tglKeluar)}
        </TableCell>
        <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm">
          {formatDate(item.jatuhTempo)}
        </TableCell>
        <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center font-medium text-xs md:text-sm">
          {item.namaPelanggan}
        </TableCell>
        <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm">
          {item.alamatPelanggan}
        </TableCell>
        <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-sky-700 text-xs md:text-sm">
          {formatCurrency(item.totalOmset)}
        </TableCell>
        <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-xs md:text-sm">
          {formatCurrency(item.labaBerjalan)}
        </TableCell>
        <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center">
          <StatusBadge status={item.status} />
        </TableCell>
        <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted/40">
                <More size="20" color="#000" variant="Outline" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-36">
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleView}
              >
                <Eye size={24} color="#000" variant="Outline" />
                <span className="text-sm">Detail</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleEdit}
              >
                <Edit2 size={24} color="#000" variant="Outline" />
                <span className="text-sm">Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-red-500"
                onClick={handleDelete}
              >
                <Trash size={24} color="#fd0000ff" variant="Outline" />
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
      prevProps.item.status === nextProps.item.status &&
      prevProps.item.totalOmset === nextProps.item.totalOmset
    );
  }
);
BarangKeluarRow.displayName = "BarangKeluarRow";

const EmptyState = memo(() => (
  <TableRow>
    <TableCell colSpan={9} className="text-center py-12 text-gray-500">
      <div className="flex flex-col items-center gap-2">
        <p className="text-base md:text-lg font-medium">
          Belum ada data barang keluar
        </p>
        <p className="text-xs md:text-sm">
          Klik tombol "Tambah Data" untuk menambahkan barang keluar
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

export default function BarangKeluarClient({
  barangKeluarList,
  barangOptions,
  pelangganOptions,
  pagination,
  currentFilters,
}: BarangKeluarClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editData, setEditData] = useState<any | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const { currentPage, itemsPerPage, totalPages, startIndex, endIndex } =
    useMemo(
      () => ({
        currentPage: pagination?.page || 1,
        itemsPerPage: pagination?.limit || 5,
        totalPages: pagination?.totalPages || 1,
        startIndex: ((pagination?.page || 1) - 1) * (pagination?.limit || 5),
        endIndex: Math.min(
          ((pagination?.page || 1) - 1) * (pagination?.limit || 5) +
            (pagination?.limit || 5),
          pagination?.total || 0
        ),
      }),
      [pagination]
    );

  const currentFilterPeriod = useMemo((): FilterPeriod => {
    const filterBulan = currentFilters?.filterBulan;
    if (!filterBulan) return "all";

    const periodMap: Record<number, FilterPeriod> = {
      1: "thisMonth",
      3: "3months",
      6: "6months",
      12: "1year",
    };

    return periodMap[filterBulan] || "all";
  }, [currentFilters?.filterBulan]);

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

  const handleFilterChange = useCallback(
    (period: FilterPeriod) => {
      startTransition(() => {
        const filterBulan = FILTER_TO_MONTHS[period];
        const queryString = updateSearchParams({
          page: "1",
          filterBulan: filterBulan?.toString() || null,
        });
        router.push(`?${queryString}`, { scroll: false });
      });
    },
    [router, updateSearchParams]
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

  const handleAddNew = useCallback(() => {
    setDialogMode("create");
    setEditData(null);
    setOpenDialog(true);
  }, []);

  const handleEdit = useCallback(async (item: IBarangKeluarResponse) => {
    try {
      const result = await getBarangKeluarByIdAction(item.id);
      if (result.success && result.data) {
        setDialogMode("edit");
        setEditData(result.data);
        setOpenDialog(true);
      } else {
        toast.error("Gagal mengambil data barang keluar");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat mengambil data");
    }
  }, []);

  const handleViewDetail = useCallback(async (id: number) => {
    try {
      const result = await getBarangKeluarDetailAction(id);
      if (result.success && result.data) {
        setDetailData(result.data);
        setOpenDetailDialog(true);
      } else {
        toast.error("Gagal mengambil detail barang keluar");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat mengambil detail");
    }
  }, []);

  const handleDeleteClick = useCallback((id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;

    startTransition(async () => {
      try {
        const result = await deleteBarangKeluarAction(itemToDelete);

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

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-sm text-gray-600">
          Menampilkan {startIndex + 1} - {endIndex} dari{" "}
          {pagination?.total || 0} data
        </p>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2"
                disabled={isPending}
              >
<Sort size={24} color="#000" variant="Outline" />                <span>{FILTER_LABELS[currentFilterPeriod]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {(Object.keys(FILTER_LABELS) as FilterPeriod[]).map((period) => (
                <DropdownMenuItem
                  key={period}
                  onClick={() => handleFilterChange(period)}
                  className={currentFilterPeriod === period ? "bg-sky-50" : ""}
                >
                  {FILTER_LABELS[period]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleAddNew} className="w-full sm:w-auto">
            Tambah Data
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-600 text-white hover:bg-sky-600">
              {[
                "No Invoice",
                "Tanggal Keluar",
                "Jatuh Tempo",
                "Pelanggan",
                "Alamat",
                "Total Omset",
                "Laba Berjalan",
                "Status",
                "Aksi",
              ].map((head) => (
                <TableHead
                  key={head}
                  className="text-white whitespace-nowrap px-4 md:px-6 py-4 text-center font-semibold text-xs md:text-sm"
                >
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {barangKeluarList.length === 0 ? (
              <EmptyState />
            ) : (
              barangKeluarList.map((item) => (
                <BarangKeluarRow
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onView={handleViewDetail}
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
              <ArrowLeft2 size="16" />
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
              <ArrowRight2 size="16" />
            </Button>
          </div>
        </div>
      )}

      {openDialog && (
        <BarangKeluarDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          barangOptions={barangOptions}
          pelangganOptions={pelangganOptions}
          editData={editData}
          mode={dialogMode}
        />
      )}

      {openDetailDialog && (
        <DetailDialog
          open={openDetailDialog}
          onOpenChange={setOpenDetailDialog}
          data={detailData}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">
              Hapus Barang Keluar?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Tindakan ini tidak dapat dibatalkan. Data barang keluar akan
              dihapus permanen dan stok barang akan dikembalikan.
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
