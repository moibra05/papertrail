"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import ReceiptCard from "@/app/components/reciepts/ReceiptCard";
import ReceiptDetailsModal from "@/app/components/reciepts/ReceiptDetailsModal";
import ReceiptListItem from "@/app/components/reciepts/ReceiptListItem";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateSort, setDateSort] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [expandedFolders, setExpandedFolders] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [receiptsData, foldersData] = await Promise.all([
      Receipt.list("-created_date"),
      FolderEntity.list("-created_date"),
    ]);
    setReceipts(receiptsData);
    setFolders(foldersData);

    const expanded = {};
    foldersData.forEach((f) => (expanded[f.id] = true));
    expanded["no-folder"] = true;
    setExpandedFolders(expanded);

    setIsLoading(false);
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const filterReceipts = (receipts) => {
    return receipts
      .filter((r) => {
        const matchesSearch =
          r.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          categoryFilter === "all" || r.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (dateSort === "newest") return new Date(b.date) - new Date(a.date);
        if (dateSort === "oldest") return new Date(a.date) - new Date(b.date);
        if (dateSort === "highest") return b.total_amount - a.total_amount;
        if (dateSort === "lowest") return a.total_amount - b.total_amount;
        return 0;
      });
  };

  const getReceiptsForFolder = (folderId) => {
    return filterReceipts(receipts.filter((r) => r.folder_id === folderId));
  };

  const getReceiptsWithoutFolder = () => {
    return filterReceipts(receipts.filter((r) => !r.folder_id));
  };

  const getTotalFilteredReceipts = () => {
    return filterReceipts(receipts).length;
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            All Receipts
          </h1>
          <p className="text-slate-600">
            Browse, search, and manage your receipts
          </p>
        </div>

        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full md:w-40 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="food_dining">Food & Dining</SelectItem>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="transportation">
                      Transportation
                    </SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateSort} onValueChange={setDateSort}>
                  <SelectTrigger className="w-full md:w-40 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Amount</SelectItem>
                    <SelectItem value="lowest">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {getTotalFilteredReceipts()} of {receipts.length}{" "}
                receipts
              </p>

              <div className="flex gap-1 border border-slate-200 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {folders.map((folder) => {
            const folderReceipts = getReceiptsForFolder(folder.id);
            if (folderReceipts.length === 0) return null;

            return (
              <Card
                key={folder.id}
                className="border-0 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleFolder(folder.id)}
                >
                  <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                    {expandedFolders[folder.id] ? (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    )}
                  </button>

                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
                    style={{ backgroundColor: folder.color }}
                  >
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{folder.name}</h3>
                    <p className="text-sm text-slate-500">
                      {folderReceipts.length} receipts
                    </p>
                  </div>

                  <Badge variant="outline" className="border-slate-200">
                    $
                    {folderReceipts
                      .reduce((sum, r) => sum + r.total_amount, 0)
                      .toFixed(2)}
                  </Badge>
                </div>

                <AnimatePresence>
                  {expandedFolders[folder.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50/50">
                          {folderReceipts.map((receipt) => (
                            <ReceiptCard
                              key={receipt.id}
                              receipt={receipt}
                              onClick={() => setSelectedReceipt(receipt)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {folderReceipts.map((receipt) => (
                            <ReceiptListItem
                              key={receipt.id}
                              receipt={receipt}
                              onClick={() => setSelectedReceipt(receipt)}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}

          {getReceiptsWithoutFolder().length > 0 && (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleFolder("no-folder")}
              >
                <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                  {expandedFolders["no-folder"] ? (
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  )}
                </button>

                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md bg-slate-400">
                  <FileText className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Uncategorized</h3>
                  <p className="text-sm text-slate-500">
                    {getReceiptsWithoutFolder().length} receipts
                  </p>
                </div>

                <Badge variant="outline" className="border-slate-200">
                  $
                  {getReceiptsWithoutFolder()
                    .reduce((sum, r) => sum + r.total_amount, 0)
                    .toFixed(2)}
                </Badge>
              </div>

              <AnimatePresence>
                {expandedFolders["no-folder"] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50/50">
                        {getReceiptsWithoutFolder().map((receipt) => (
                          <ReceiptCard
                            key={receipt.id}
                            receipt={receipt}
                            onClick={() => setSelectedReceipt(receipt)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {getReceiptsWithoutFolder().map((receipt) => (
                          <ReceiptListItem
                            key={receipt.id}
                            receipt={receipt}
                            onClick={() => setSelectedReceipt(receipt)}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}
        </div>

        {getTotalFilteredReceipts() === 0 && !isLoading && (
          <div className="text-center py-16">
            <FileText className="w-20 h-20 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No receipts found</p>
            <p className="text-slate-400 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <ReceiptDetailsModal
        receipt={selectedReceipt}
        open={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        onDelete={loadData}
      />
    </div>
  );
}
