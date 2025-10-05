"use client";

import { useState, useEffect } from "react";
import { FolderOpen } from "lucide-react";
import FolderCard from "@/app/components/folders/FolderCard";
import { useUserClient } from "@/providers/UserProvider";
import { useFolderModal } from "@/providers/FolderModalProvider";

export default function FoldersPage() {
  const [folders, setFolders] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const userClient = useUserClient();

  useEffect(() => {
    // show only root folders (no parent)
    const all = userClient.folders || [];
    setFolders(all.filter((f) => !f.parent_id));
    setReceipts(userClient.receipts || []);
  }, [userClient.folders, userClient.receipts]);

  const getFolderReceiptCount = (folderId) => {
    return receipts.filter((r) => r.folder_id === folderId).length;
  };

  const getSubfolderCount = (folderId) => {
    const all = userClient.folders || [];
    return all.filter((f) => f.parent_id === folderId).length;
  };

  const { openEditFolder, handleDelete: modalHandleDelete } = useFolderModal();
  const handleEdit = (folder) => {
    openEditFolder(folder);
  };

  const handleDeleteClick = async (folder) => {
    if (!confirm("Delete this folder? Receipts will not be deleted.")) return;
    await modalHandleDelete(folder.id);
    userClient.refresh();
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder, index) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            receiptCount={getFolderReceiptCount(folder.id)}
            subfolderCount={getSubfolderCount(folder.id)}
            onEdit={() => handleEdit(folder)}
            onDelete={() => handleDeleteClick(folder)}
            index={index}
          />
        ))}
      </div>

      {folders.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen className="w-20 h-20 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg">No folders yet</p>
          <p className="text-slate-400 mt-2">
            Create your first folder to organize receipts
          </p>
        </div>
      )}
    </div>
  );
}
