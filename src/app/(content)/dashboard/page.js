"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, DollarSign, TrendingUp, Calendar, TrendingDown } from "lucide-react";
import Link from "next/link";

import StatsCard from "../../components/dashboard/StatCards";
import RecentReceipts from "../../components/dashboard/RecentReceipts";
import SpendingChart from "../../components/dashboard/SpendingChart";
import ReceiptDetailsModal from "../../components/reciepts/ReceiptDetailsModal";
import { useUserClient } from "@/providers/UserProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#EF4444",
];

export default function Home() {
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const { receipts: cachedReceipts, loading: userLoading } = useUserClient();

  useEffect(() => {
    // prefer cached receipts from UserProvider if available
    if (cachedReceipts && cachedReceipts.length > 0) {
      setReceipts(cachedReceipts);
      setIsLoading(false);
    }
  }, [cachedReceipts]);

  const getTotalSpending = () => {
    return receipts.reduce((sum, r) => sum + r.total_amount, 0);
  };

  const getMonthlySpending = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    return receipts
      .filter((r) => {
        const d = new Date(r.purchase_date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, r) => sum + r.total_amount, 0);
  };

  const getAverageSpending = () => {
    return receipts.length > 0 ? getTotalSpending() / receipts.length : 0;
  };

  // Analytics helpers
  const [timeRange, setTimeRange] = useState("all");

  const filterByTimeRange = (list) => {
    if (timeRange === "all") return list;
    const now = new Date();
    const cutoff = new Date();
    if (timeRange === "month") cutoff.setMonth(now.getMonth() - 1);
    if (timeRange === "3months") cutoff.setMonth(now.getMonth() - 3);
    if (timeRange === "year") cutoff.setFullYear(now.getFullYear() - 1);
    return list.filter((r) => new Date(r.purchase_date) >= cutoff);
  };

  const filteredReceipts = filterByTimeRange(receipts);

  const getCategoryData = () => {
    const categoryTotals = {};
    filteredReceipts.forEach((r) => {
      const cat = r.category || "other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + r.total_amount;
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value: parseFloat(value.toFixed(2)),
    }));
  };

  const getMerchantData = () => {
    const merchantTotals = {};
    filteredReceipts.forEach((r) => {
      merchantTotals[r.merchant] =
        (merchantTotals[r.merchant] || 0) + r.total_amount;
    });
    return Object.entries(merchantTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, amount: parseFloat(value.toFixed(2)) }));
  };

  const getMonthlyTrend = () => {
    const monthlyTotals = {};
    filteredReceipts.forEach((r) => {
      const month = new Date(r.purchase_date).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + r.total_amount;
    });
    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({ month, total: parseFloat(total.toFixed(2)) }))
      .slice(-12);
  };

  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome to PaperTrail
            </h1>
            <p className="text-muted">
              Manage your receipts and track expenses effortlessly
            </p>
          </div>
          {
            <Link href="/upload">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg dark:shadow-gray-500/10">
                <Plus className="w-5 h-5 mr-2" />
                Upload Receipt
              </Button>
            </Link>
          }
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
                        new Date(r.purchase_date).getMonth() ===
                        new Date().getMonth()
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

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card className="border-0 bg-surface backdrop-blur-sm shadow-lg dark:shadow-gray-500/10">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-bold text-foreground">
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getCategoryData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getCategoryData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 bg-surface backdrop-blur-sm shadow-lg dark:shadow-gray-500/10">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-bold text-foreground">
                Top Merchants
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getMerchantData()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                  <XAxis type="number" stroke="#64748B" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    stroke="#64748B"
                  />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="amount" fill="#3c7bf8" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-0 bg-surface backdrop-blur-sm shadow-lg dark:shadow-gray-500/10">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-bold text-foreground">
                Spending Trend Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={getMonthlyTrend()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                  <XAxis dataKey="month" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E0E7FF",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value) => [`$${value}`, "Total"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3c7bf8"
                    strokeWidth={3}
                    fill="#3c7bf8"
                    dot={{ fill: "#3c7bf8", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReceiptDetailsModal
        receipt={selectedReceipt}
        open={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        // onDelete={loadReceipts}
      />
    </div>
  );
}
