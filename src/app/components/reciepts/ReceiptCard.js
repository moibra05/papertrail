import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ExternalLink, FileText, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useUserClient } from "@/providers/UserProvider";
import { createClient } from "../../../../utils/supabase/client";

const categoryColors = {
  food_dining: "from-orange-500 to-red-500",
  groceries: "from-green-500 to-emerald-500",
  transportation: "from-blue-500 to-cyan-500",
  utilities: "from-yellow-500 to-orange-500",
  healthcare: "from-red-500 to-pink-500",
  entertainment: "from-purple-500 to-pink-500",
  shopping: "from-pink-500 to-rose-500",
  travel: "from-indigo-500 to-purple-500",
  business_services: "from-cyan-500 to-blue-500",
  office_supplies: "from-teal-500 to-green-500",
  software_subscriptions: "from-violet-500 to-purple-500",
  other: "from-gray-500 to-slate-500",
};

export default function ReceiptCard({ receipt, onClick }) {
  const userClient = useUserClient();
  const folders = userClient.folders || [];
  const supabase = createClient();

  const handleMove = async (e) => {
    const folderId = e.target.value || null;
    try {
      await supabase
        .from("receipts")
        .update({ folder_id: folderId })
        .eq("id", receipt.id);
      userClient.refresh();
    } catch (err) {
      console.error("Failed to move receipt", err);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 overflow-hidden p-0 gap-0"
        onClick={onClick}
      >
        <div
          className={`h-2 bg-gradient-to-r ${categoryColors[receipt.category]}`}
        />
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-slate-900 truncate">
                  {receipt.merchant}
                </h3>
              </div>
              <p className="text-sm text-slate-500">
                {format(new Date(receipt.created_at), "MMMM d, yyyy")}
              </p>
            </div>
            {receipt.file_url && (
              <a
                href={receipt.file_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="ml-2 p-2 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4 text-indigo-600" />
              </a>
            )}
          </div>

          <div className="mb-3">
            <p className="text-2xl font-bold text-slate-900">
              ${receipt.total_amount.toFixed(2)}
            </p>
            {receipt.tax_amount && (
              <p className="text-xs text-slate-500">
                Tax: ${receipt.tax_amount.toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge
              variant="outline"
              className="text-xs border-indigo-200 text-indigo-700"
            >
              {receipt.category?.replace(/_/g, " ")}
            </Badge>
            {receipt.payment_method && (
              <Badge variant="outline" className="text-xs border-slate-200">
                {receipt.payment_method.replace(/_/g, " ")}
              </Badge>
            )}
          </div>

          <div className="mt-3">
            <label className="text-xs text-slate-500 block mb-1">
              Move to folder
            </label>
            <select
              onChange={handleMove}
              value={receipt.folder_id || ""}
              onClick={(e) => e.stopPropagation()}
              className="w-full border rounded px-2 py-1 bg-white text-sm"
            >
              <option value="">Unassigned</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {receipt.tags && receipt.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="w-3 h-3 text-slate-400" />
              {receipt.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-xs text-slate-500">
                  {tag}
                  {i < Math.min(receipt.tags.length - 1, 2) ? "," : ""}
                </span>
              ))}
            </div>
          )}

          {receipt.notes && (
            <p className="text-sm text-slate-600 mt-3 line-clamp-2">
              {receipt.notes}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
