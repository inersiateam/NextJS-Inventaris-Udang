"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit2, More, Trash } from "iconsax-react";
import { IPengeluaran } from "@/types/interfaces/IPengeluaran";
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
import { useState, useTransition, memo } from "react";
import { deletePengeluaranAction } from "../actions/pengeluaranActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const PengeluaranDialog = dynamic(() => import("./Dialog"), {
  ssr: false,
});

interface PengeluaranDropdownProps {
  item: IPengeluaran;
}

function PengeluaranDropdown({ item }: PengeluaranDropdownProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEdit = () => {
    setShowEdit(true);
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deletePengeluaranAction(item.id);

        if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.success(result.message);
          setShowDelete(false);
          router.refresh();
        }
      } catch (error) {
        toast.error("Terjadi kesalahan saat menghapus data");
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open actions"
            className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <More size="20" color="#000" variant="Outline" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-36">
          <DropdownMenuItem
            onClick={handleEdit}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Edit2 size="18" color="#000" variant="Linear" />
            <span className="text-sm">Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 cursor-pointer text-red-600"
          >
            <Trash size="18" color="#dc2626" variant="Bold" />
            <span className="text-sm">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showEdit && (
        <PengeluaranDialog
          open={showEdit}
          onOpenChange={setShowEdit}
          editData={item}
        />
      )}

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">
              Hapus Pengeluaran?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Apakah Anda yakin ingin menghapus pengeluaran "{item.keterangan}"?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              className="w-full sm:w-auto text-xs sm:text-sm"
              disabled={isPending}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default memo(PengeluaranDropdown);
