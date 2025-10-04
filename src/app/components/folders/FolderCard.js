import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FolderCard({ folder, receiptCount, onEdit, onDelete, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <div
          className="h-3 rounded-t-xl"
          style={{ backgroundColor: folder.color }}
        />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: folder.color }}
              >
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold text-slate-900 truncate">
                  {folder.name}
                </CardTitle>
                <p className="text-sm text-slate-500">
                  {receiptCount} receipts
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4 text-slate-400" />
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