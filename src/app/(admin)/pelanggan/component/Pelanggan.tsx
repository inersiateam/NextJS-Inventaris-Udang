"use client";

import { useState, useTransition, useMemo, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import { Edit2, Eye, More, Trash } from "iconsax-react";
import dynamic from "next/dynamic";
import { PelangganWithAdmin } from "@/types/interfaces/IPelanggan";
import {
  deletePelangganAction,
  getPelangganDetailAction,
} from "../actions/pelangganActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useHighlightEffect from "@/hooks/useHighlightEffect";

const PelangganDialog = dynamic(() => import("./Dialog"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 z-50" />,
});

const PelangganDetailDialog = dynamic(() => import("./Detail"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 z-50" />,
});

interface PelangganProps {
  data: PelangganWithAdmin[];
}

const PelangganRow = memo(
  ({
    item,
    onEdit,
    onView,
    onDelete,
  }: {
    item: PelangganWithAdmin;
    index: number;
    onEdit: (item: PelangganWithAdmin) => void;
    onView: (id: number) => void;
    onDelete: (id: number, nama: string) => void;
  }) => {
    const handleEdit = useCallback(() => onEdit(item), [onEdit, item]);
    const handleView = useCallback(() => onView(item.id), [onView, item.id]);
    const handleDelete = useCallback(
      () => onDelete(item.id, item.nama),
      [onDelete, item.id, item.nama]
    );

    return (
      <TableRow id={`pelanggan-${item.id}`} className="hover:bg-gray-50">
        <TableCell className="whitespace-nowrap px-4 text-center md:px-6 py-3 md:py-4 font-medium text-xs md:text-sm">
          {item.nama}
        </TableCell>
        <TableCell
          className="px-4 md:px-6 py-3 md:py-4 max-w-xs truncate text-xs text-center md:text-sm"
          title={item.alamat}
        >
          {item.alamat}
        </TableCell>
        <TableCell className="whitespace-nowrap px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm">
          {item.totalPembelian.toLocaleString("id-ID")} unit
        </TableCell>
        <TableCell className="whitespace-nowrap px-4 md:px-6 py-3 md:py-4 text-center">
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
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleView}
              >
                <Eye size="18" color="#374151" variant="Outline" />
                <span className="text-sm">Detail</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleEdit}
              >
                <Edit2 size="18" color="#374151" variant="Outline" />
                <span className="text-sm">Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-red-500"
                onClick={handleDelete}
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
      prevProps.item.nama === nextProps.item.nama &&
      prevProps.item.totalPembelian === nextProps.item.totalPembelian
    );
  }
);
PelangganRow.displayName = "PelangganRow";

const EmptyState = memo(() => (
  <TableRow>
    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
      <div className="flex flex-col items-center gap-2">
        <p className="text-base md:text-lg font-medium">
          Belum ada data pelanggan
        </p>
        <p className="text-xs md:text-sm">
          Klik tombol "Tambah Pelanggan" untuk menambahkan pelanggan baru
        </p>
      </div>
    </TableCell>
  </TableRow>
));
EmptyState.displayName = "EmptyState";

export default function Pelanggan({ data }: PelangganProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedPelanggan, setSelectedPelanggan] =
    useState<PelangganWithAdmin | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pelangganToDelete, setPelangganToDelete] = useState<{
    id: number;
    nama: string;
  } | null>(null);

  useHighlightEffect("pelanggan");

  const handleAddNew = useCallback(() => {
    setSelectedPelanggan(null);
    setOpenDialog(true);
  }, []);

  const handleEdit = useCallback((pelanggan: PelangganWithAdmin) => {
    setSelectedPelanggan(pelanggan);
    setOpenDialog(true);
  }, []);

  const handleViewDetail = useCallback(async (id: number) => {
    try {
      const result = await getPelangganDetailAction(id);

      if (result.success) {
        if ("data" in result) {
          setDetailData(result.data);
          setOpenDetailDialog(true);
        } else {
          toast.error("Gagal memuat detail pelanggan");
        }
      } else {
        const errMsg =
          "error" in result ? result.error : "Gagal memuat detail pelanggan";
        toast.error(errMsg);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat memuat detail pelanggan");
    }
  }, []);

  const handleDeleteClick = useCallback((id: number, nama: string) => {
    setPelangganToDelete({ id, nama });
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!pelangganToDelete) return;

    startTransition(async () => {
      try {
        const result = await deletePelangganAction(pelangganToDelete.id);

        if (result.success) {
          toast.success("Pelanggan berhasil dihapus");
          setDeleteDialogOpen(false);
          setPelangganToDelete(null);
          router.refresh();
        } else {
          const errorMessage =
            "error" in result ? result.error : "Gagal menghapus pelanggan";
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error instanceof Error ? error.message : "Terjadi kesalahan"
        );
      }
    });
  }, [pelangganToDelete, router]);

  const handleDialogClose = useCallback(
    (open: boolean) => {
      setOpenDialog(open);
      if (!open) {
        setSelectedPelanggan(null);
        router.refresh();
      }
    },
    [router]
  );

  return (
    <>
      <div className="flex justify-end mb-4 mt-6">
        <Button
          onClick={handleAddNew}
          className="bg-primary hover:bg-sky-700 w-full sm:w-auto"
        >
          Tambah Pelanggan
        </Button>
      </div>

      <div className="w-full overflow-x-auto rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-600 text-white hover:bg-sky-600">
              {[
                "Nama Pelanggan",
                "Alamat",
                "Total Pembelian",
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
            {data.length === 0 ? (
              <EmptyState />
            ) : (
              data.map((item, index) => (
                <PelangganRow
                  key={item.id}
                  item={item}
                  index={index}
                  onEdit={handleEdit}
                  onView={handleViewDetail}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {openDialog && (
        <PelangganDialog
          open={openDialog}
          onOpenChange={handleDialogClose}
          pelanggan={selectedPelanggan}
        />
      )}

      {openDetailDialog && (
        <PelangganDetailDialog
          open={openDetailDialog}
          onOpenChange={setOpenDetailDialog}
          data={detailData}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">
              Hapus Pelanggan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Apakah Anda yakin ingin menghapus pelanggan "
              {pelangganToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.
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
