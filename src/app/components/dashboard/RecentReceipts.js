import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ExternalLink, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function RecentReceipts({ receipts, isLoading, onSelectReceipt }) {
  return (
    <Card className="border-0 bg-surface backdrop-blur-sm shadow-lg dark:shadow-gray-500/10">
      <CardHeader className="border-b border-subtle pb-4">
        <CardTitle className="text-xl font-bold text-foreground">Recent Receipts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-subtle">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : receipts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-muted mb-4" />
              <p className="text-muted font-medium">No receipts yet</p>
              <p className="text-sm text-muted mt-1">Upload your first receipt to get started</p>
            </div>
          ) : (
            receipts.slice(0, 8).map((receipt, index) => (
              <motion.div
                key={receipt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectReceipt(receipt)}
                className="p-4 hover:bg-input/10 cursor-pointer transition-colors duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{receipt.merchant}</h4>
                    <p className="text-sm text-muted">
                      {format(new Date(receipt.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-foreground">
                      ${receipt.total_amount.toFixed(2)}
                    </p>
                    {receipt.file_url && (
                      <a
                        href={receipt.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted hover:text-foreground inline-block mt-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={`${categoryColors[receipt.category]} border text-xs`}>
                    {receipt.category?.replace(/_/g, ' ')}
                  </Badge>
                  {receipt.payment_method && (
                    <Badge variant="outline" className="text-xs border-subtle">
                      {receipt.payment_method.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}