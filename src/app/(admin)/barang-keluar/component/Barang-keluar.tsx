"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit2,
  Eye,
  More,
  Trash,
  ArrowLeft2,
  ArrowRight2,
  Filter,
} from "iconsax-react";
import { useState } from "react";
import BarangKeluarDialog from "./Dialog";
import DetailDialog from "./detailDialog";
import {
  IBarangKeluarResponse,
  IBarangKeluarPagination,
} from "@/types/interfaces/IBarangKeluar";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  deleteBarangKeluarAction,
  getBarangKeluarByIdAction,
} from "../actions/barangKeluarActions";

interface Props {
  data: IBarangKeluarResponse[] | null;
  pagination: IBarangKeluarPagination | null;
  currentFilters?: {
    bulan?: number;
    tahun?: number;
    status?: "BELUM_LUNAS" | "LUNAS";
  };
}

type FilterPeriod = "all" | "thisMonth" | "3months" | "6months" | "1year";

export default function BarangKeluarTable({
  data,
  pagination,
  currentFilters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editData, setEditData] = useState<any | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(pagination?.page || 1);

  const itemsPerPage = pagination?.limit ?? 10;
  const totalPages = pagination?.totalPages ?? 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, pagination?.total ?? 0);

  const getCurrentFilterPeriod = (): FilterPeriod => {
    if (!currentFilters?.bulan && !currentFilters?.tahun) return "all";

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (
      currentFilters.bulan === currentMonth &&
      currentFilters.tahun === currentYear
    ) {
      return "thisMonth";
    }

    return "all";
  };

  const handleFilterChange = (period: FilterPeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    const now = new Date();
    params.set("page", "1");

    switch (period) {
      case "all":
        params.delete("bulan");
        params.delete("tahun");
        break;

      case "thisMonth":
        params.set("bulan", String(now.getMonth() + 1));
        params.set("tahun", String(now.getFullYear()));
        break;

      case "3months":
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 2);
        params.set("bulan", String(threeMonthsAgo.getMonth() + 1));
        params.set("tahun", String(threeMonthsAgo.getFullYear()));
        break;

      case "6months":
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 5);
        params.set("bulan", String(sixMonthsAgo.getMonth() + 1));
        params.set("tahun", String(sixMonthsAgo.getFullYear()));
        break;

      case "1year":
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        params.set("bulan", String(oneYearAgo.getMonth() + 1));
        params.set("tahun", String(oneYearAgo.getFullYear()));
        break;
    }

    router.push(`?${params.toString()}`);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      router.push(`?${params.toString()}`);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      router.push(`?${params.toString()}`);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const handleAddNew = () => {
    setDialogMode("create");
    setEditData(null);
    setOpenDialog(true);
  };

  const handleEdit = async (item: IBarangKeluarResponse) => {
    try {
      const result = await getBarangKeluarByIdAction(item.id);
      if (result.success && result.data) {
        setDialogMode("edit");
        setEditData(result.data);
        setOpenDialog(true);
      } else {
        alert("Gagal mengambil data barang keluar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat mengambil data");
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const result = await getBarangKeluarByIdAction(id);
      if (result.success && result.data) {
        setDetailData(result.data);
        setOpenDetailDialog(true);
      } else {
        alert("Gagal mengambil detail barang keluar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat mengambil detail");
    }
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteBarangKeluarAction(itemToDelete);

      if (!result.success) {
        throw new Error(result.success || "Gagal menghapus data");
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
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
  };

  const getFilterLabel = (period: FilterPeriod): string => {
    switch (period) {
      case "all":
        return "Semua Data";
      case "thisMonth":
        return "Bulan Ini";
      case "3months":
        return "3 Bulan";
      case "6months":
        return "6 Bulan";
      case "1year":
        return "1 Tahun";
      default:
        return "Semua Data";
    }
  };

  const currentFilterPeriod = getCurrentFilterPeriod();

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-sm text-gray-600">
          Menampilkan {startIndex + 1} - {endIndex} dari {pagination?.total} data
        </p>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <Filter size="18" />
                <span>{getFilterLabel(currentFilterPeriod)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleFilterChange("all")}
                className={currentFilterPeriod === "all" ? "bg-sky-50" : ""}
              >
                Semua Data
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFilterChange("thisMonth")}
                className={
                  currentFilterPeriod === "thisMonth" ? "bg-sky-50" : ""
                }
              >
                Bulan Ini
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFilterChange("3months")}
                className={currentFilterPeriod === "3months" ? "bg-sky-50" : ""}
              >
                3 Bulan Terakhir
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFilterChange("6months")}
                className={currentFilterPeriod === "6months" ? "bg-sky-50" : ""}
              >
                6 Bulan Terakhir
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFilterChange("1year")}
                className={currentFilterPeriod === "1year" ? "bg-sky-50" : ""}
              >
                1 Tahun Terakhir
              </DropdownMenuItem>
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
            {data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-12 text-gray-500"
                >
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
            ) : (
              data?.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
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
                    <Badge
                      variant={
                        item.status === "LUNAS" ? "default" : "secondary"
                      }
                      className="text-white text-xs"
                    >
                      {item.status === "LUNAS" ? "Lunas" : "Belum Lunas"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted/40">
                          <More size="20" color="#000" variant="Outline" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="bottom"
                        align="end"
                        className="w-36"
                      >
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleViewDetail(item.id)}
                        >
                          <Eye size="18" />
                          <span className="text-sm">Detail</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size="18" />
                          <span className="text-sm">Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer text-red-500"
                          onClick={() => handleDeleteClick(item.id)}
                        >
                          <Trash size="18" />
                          <span className="text-sm">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination?.total && pagination.total > 0 && (
        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pb-20 md:pb-0">
          <p className="text-xs md:text-sm text-gray-600 order-2 sm:order-1">
            Halaman {currentPage} dari {totalPages}
          </p>

          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="gap-1 text-xs md:text-sm"
            >
              <ArrowLeft2 size="16" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
              {getPageNumbers().map((page, index) => (
                <Button
                  key={index}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    typeof page === "number" && handlePageClick(page)
                  }
                  disabled={page === "..."}
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
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="gap-1 text-xs md:text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight2 size="16" />
            </Button>
          </div>
        </div>
      )}

      <BarangKeluarDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editData={editData}
        mode={dialogMode}
      />

      <DetailDialog
        open={openDetailDialog}
        onOpenChange={setOpenDetailDialog}
        data={detailData}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Barang Keluar?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data barang keluar akan
              dihapus permanen dan stok barang akan dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
