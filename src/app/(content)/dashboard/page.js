"use client";

import React, { useState, useEffect } from "react";
// import { Receipt as ReceiptEntity } from "@/entities/Receipt";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, DollarSign, TrendingUp, Calendar } from "lucide-react";

import StatsCard from "../../components/dashboard/StatCards";
import RecentReceipts from "../../components/dashboard/RecentReceipts";
import SpendingChart from "../../components/dashboard/SpendingChart";
import ReceiptDetailsModal from "../../components/reciepts/ReceiptDetailsModal";
import Link from "next/link";

export default function Home() {
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    setIsLoading(true);
    const data = await ReceiptEntity.list("-created_date");
    setReceipts(data);
    setIsLoading(false);
  };

  const getTotalSpending = () => {
    return receipts.reduce((sum, r) => sum + r.total_amount, 0);
  };

  const getMonthlySpending = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    return receipts
      .filter((r) => {
        const d = new Date(r.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, r) => sum + r.total_amount, 0);
  };

  const getAverageSpending = () => {
    return receipts.length > 0 ? getTotalSpending() / receipts.length : 0;
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Welcome to PaperTrail
            </h1>
            <p className="text-slate-600">
              Manage your receipts and track expenses effortlessly
            </p>
          </div>
          <Link href="/upload">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg text-white">
              <Plus className="w-5 h-5 mr-2" />
              Upload Receipt
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Receipts"
            value={receipts.length}
            icon={Receipt}
            gradient="from-indigo-500 to-purple-500"
          />
          <StatsCard
            title="Total Spending"
            value={`$${getTotalSpending().toFixed(2)}`}
            icon={DollarSign}
            gradient="from-green-500 to-emerald-500"
          />
          <StatsCard
            title="This Month"
            value={`$${getMonthlySpending().toFixed(2)}`}
            icon={Calendar}
            gradient="from-blue-500 to-cyan-500"
            trend={
              receipts.length > 0
                ? `${
                    receipts.filter(
                      (r) =>
                        new Date(r.date).getMonth() === new Date().getMonth()
                    ).length
                  } receipts`
                : ""
            }
          />
          <StatsCard
            title="Average per Receipt"
            value={`$${getAverageSpending().toFixed(2)}`}
            icon={TrendingUp}
            gradient="from-orange-500 to-red-500"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SpendingChart receipts={receipts} />
          </div>
          <div>
            <RecentReceipts
              receipts={receipts}
              isLoading={isLoading}
              onSelectReceipt={setSelectedReceipt}
            />
          </div>
        </div>
      </div>

      <ReceiptDetailsModal
        receipt={selectedReceipt}
        open={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        onDelete={loadReceipts}
      />
    </div>
  );
}
