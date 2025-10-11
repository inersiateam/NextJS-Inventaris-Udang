"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit2, Eye, More, Trash } from "iconsax-react";

interface PengeluaranDropdownProps {
  item: any; // Replace 'any' with the actual type if known, e.g. 'PengeluaranItem'
}

export default function PengeluaranDropdown({ item }: PengeluaranDropdownProps) {
  const handleEdit = () => {
    console.log("Edit data:", item);
  };

  const handleDetail = () => {
    console.log("Detail data:", item);
  };

  const handleDelete = () => {
    console.log("Delete data:", item);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open actions"
          className="inline-flex items-center justify-end rounded-md p-1 hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring"
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
          onClick={handleDetail}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Eye size="18" color="#000" variant="Linear" />
          <span className="text-sm">Detail</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Trash size="18" color="#000" variant="Bold" />
          <span className="text-sm">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
