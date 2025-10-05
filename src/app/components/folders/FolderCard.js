import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FolderOpen, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FolderCard({
  folder,
  receiptCount,
  subfolderCount,
  onEdit,
  onDelete,
  index,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-0 bg-surface backdrop-blur-sm shadow-lg dark:shadow-gray-500/10 not-only:not-visited:hover:shadow-xl hover:scale-101 transition-all duration-300 min-w-0 pt-0 h-full gap-0">
        <div
          className="h-3 rounded-t-xl"
          style={{ backgroundColor: folder.color }}
        />
        <CardHeader className="pb-3 pt-4 min-w-0">
          <div className="flex items-start justify-between min-w-0 gap-3">
            <Link
              href={`/folders/${folder.id}`}
              className="cursor-pointer flex items-start justify-between min-w-0 gap-3"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md dark:shadow-gray-500/10"
                style={{ backgroundColor: folder.color }}
              >
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <CardTitle
                  className="text-base font-bold text-foreground truncate w-full overflow-hidden whitespace-nowrap"
                  title={folder.name}
                >
                  {folder.name}
                </CardTitle>
                <p className="text-sm text-muted">
                  {receiptCount} receipts
                  {typeof subfolderCount === "number" && (
                    <span className="ml-2">· {subfolderCount} subfolders</span>
                  )}
                </p>
              </div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4 text-muted" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(folder)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Folder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(folder.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        {folder.description && (
          <CardContent>
            <p className="text-sm text-slate-600 line-clamp-2">
              {folder.description}
            </p>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
