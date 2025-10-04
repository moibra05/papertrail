"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  FolderModalProvider,
  useFolderModal,
} from "@/providers/FolderModalProvider";
import { usePathname } from "next/navigation";

function HeaderControls() {
  const { openNewFolder, openNewFolderWithParent } = useFolderModal();
  const pathname = usePathname();

  // If we're on /folders/[id] use that id as parent when creating new folder
  const handleClick = () => {
    try {
      if (pathname) {
        const match = pathname.match(/^\/folders\/(.+)$/);
        if (match && match[1]) {
          openNewFolderWithParent(match[1]);
          return;
        }
      }
    } catch (e) {
      // fallback to regular new folder
    }
    openNewFolder();
  };

  return (
    <Button
      onClick={handleClick}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
    >
      <Plus className="w-5 h-5 mr-2" />
      New Folder
    </Button>
  );
}

export default function FolderLayout({ children }) {
  return (
    <FolderModalProvider>
      <div className="p-4 md:p-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Folders
              </h1>
              <p className="text-slate-600">
                Organize your receipts into folders
              </p>
            </div>
            <HeaderControls />
          </div>
          {children}
        </div>
      </div>
    </FolderModalProvider>
  );
}
