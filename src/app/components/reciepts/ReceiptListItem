import React from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ExternalLink, FileText, Calendar, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const categoryColors = {
  food_dining: "bg-orange-100 text-orange-700 border-orange-200",
  groceries: "bg-green-100 text-green-700 border-green-200",
  transportation: "bg-blue-100 text-blue-700 border-blue-200",
  utilities: "bg-yellow-100 text-yellow-700 border-yellow-200",
  healthcare: "bg-red-100 text-red-700 border-red-200",
  entertainment: "bg-purple-100 text-purple-700 border-purple-200",
  shopping: "bg-pink-100 text-pink-700 border-pink-200",
  travel: "bg-indigo-100 text-indigo-700 border-indigo-200",
  business_services: "bg-cyan-100 text-cyan-700 border-cyan-200",
  office_supplies: "bg-teal-100 text-teal-700 border-teal-200",
  software_subscriptions: "bg-violet-100 text-violet-700 border-violet-200",
  other: "bg-gray-100 text-gray-700 border-gray-200"
};

export default function ReceiptListItem({ receipt, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm hover:bg-indigo-50/50 cursor-pointer transition-all duration-200 border-b border-slate-100 last:border-b-0"
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
          <FileText className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0 grid md:grid-cols-5 gap-4 items-center">
        <div className="md:col-span-2">
          <h4 className="font-semibold text-slate-900 truncate">{receipt.merchant}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <p className="text-sm text-slate-500">
              {format(new Date(receipt.date), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        <div className="hidden md:block">
          <Badge variant="outline" className={`${categoryColors[receipt.category]} border text-xs`}>
            {receipt.category?.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {receipt.payment_method && (
            <>
              <CreditCard className="w-3 h-3 text-slate-400" />
              <span className="text-sm text-slate-600">
                {receipt.payment_method.replace(/_/g, ' ')}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3">
          <p className="text-lg font-bold text-slate-900">
            ${receipt.total_amount.toFixed(2)}
          </p>
          {receipt.file_url && (
            <a
              href={receipt.file_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 hover:bg-indigo-100 rounded-lg transition-colors duration-200"
            >
              <ExternalLink className="w-4 h-4 text-indigo-600" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}