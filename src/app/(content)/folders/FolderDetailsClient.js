"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import ReceiptListItem from "@/app/components/reciepts/ReceiptListItem";
import FolderCard from "@/app/components/folders/FolderCard";
import { useUserClient } from "@/providers/UserProvider";
import { useFolderModal } from "@/providers/FolderModalProvider";

export default function FolderDetailsClient({
  folder,
  subfolders: initialSubfolders,
  receipts: initialReceipts,
}) {
  const router = useRouter();
  const userClient = useUserClient();

  const clientFolders = userClient.folders || [];
  const clientReceipts = userClient.receipts || [];

  const subfolders = clientFolders.length
    ? clientFolders.filter((f) => f.parent_id === folder?.id)
    : initialSubfolders || [];

  const receipts = clientReceipts.length
    ? clientReceipts.filter((r) => r.folder_id === folder?.id)
    : initialReceipts || [];

  const getFolderReceiptCount = (folderId) => {
    const allReceipts = userClient.receipts || [];
    return allReceipts.filter((r) => r.folder_id === folderId).length;
  };

  const { openEditFolder, handleDelete: modalHandleDelete } = useFolderModal();

  const handleEdit = (f) => openEditFolder(f);

  const handleDeleteClick = async (f) => {
    if (!confirm("Delete this folder? Receipts will not be deleted.")) return;
    await modalHandleDelete(f.id);
    userClient.refresh();
  };

  const getSubfolderCount = (folderId) => {
    const all = userClient.folders || [];
    return all.filter((f) => f.parent_id === folderId).length;
  };

  if (!folder) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold">Folder not found</h3>
          <p className="text-sm text-slate-500">
            This folder does not exist or you don't have access.
          </p>
          <div className="mt-4">
            <Link href="/folders" className="text-indigo-600">
              Back to folders
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded hover:bg-slate-100"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">{folder.name}</h1>
          <p className="text-sm text-slate-500">{receipts.length} receipts</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{folder.description}</p>

      {subfolders.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grow items-stretch">
            {subfolders.map((folder, index) => (
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
        </div>
      )}

      <div>
        {receipts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">No receipts yet</p>
            <p className="text-slate-400 mt-2">
              Add receipts to this folder and start organizing
            </p>
          </div>
        ) : (
          <div className="divide-y divide-accent bg-background backdrop-blur-sm shadow-lg overflow-hidden rounded-lg">
            {receipts.map((r) => (
              <ReceiptListItem key={r.id} receipt={r} onClick={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
