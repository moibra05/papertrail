"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChevronDown } from "lucide-react";

export default function SpendingChart({ receipts }) {
  const [selectedView, setSelectedView] = useState("spending");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const viewOptions = [
    { value: "spending", label: "Spending", title: "Spending Trends" },
    { value: "category", label: "Category", title: "Category Analysis" },
    { value: "merchant", label: "Merchant", title: "Merchant Breakdown" },
  ];

  const getCurrentTitle = () => {
    return (
      viewOptions.find((option) => option.value === selectedView)?.title ||
      "Dashboard"
    );
  };

  const getMonthlyData = () => {
    const monthlyTotals = {};
    receipts.forEach((receipt) => {
      const month = new Date(receipt.purchase_date).toLocaleDateString(
        "en-US",
        { month: "short", year: "numeric" }
      );
      monthlyTotals[month] = (monthlyTotals[month] || 0) + receipt.total_amount;
    });

    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({ month, total: parseFloat(total.toFixed(2)) }))
      .slice(-6);
  };

  const getCategoryData = () => {
    const categoryTotals = {};
    receipts.forEach((r) => {
      const cat = r.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + r.total_amount;
    });
    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount: parseFloat(amount.toFixed(2)),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  };

  const getMerchantData = () => {
    const merchantTotals = {};
    receipts.forEach((r) => {
      const m = r.merchant || "Unknown";
      merchantTotals[m] = (merchantTotals[m] || 0) + r.total_amount;
    });
    return Object.entries(merchantTotals)
      .map(([name, amount]) => ({
        name,
        amount: parseFloat(amount.toFixed(2)),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  };

  return (
    <Card className="border-0 bg-surface backdrop-blur-sm shadow-lg dark:shadow-gray-500/10 h-full">
      <CardHeader className="border-b border-accent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">
            {getCurrentTitle()}
          </CardTitle>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground focus:outline-none border border-subtle rounded-lg bg-surface-solid hover:bg-input"
            >
              {
                viewOptions.find((option) => option.value === selectedView)
                  ?.label
              }
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-card border border-subtle rounded-lg shadow-lg z-20 dark:shadow-gray-500/10 contain-content">
                {viewOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-input border-b last:border-b-0"
                    onClick={() => {
                      setSelectedView(option.value);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full min-h-96">
        {selectedView === "spending" ? (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={getMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis
                stroke="#64748B"
                allowDecimals={false}
                tickCount={8}
                domain={[0, "dataMax"]}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E0E7FF",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [`$${value}`, "Total"]}
              />
              <Bar
                dataKey="total"
                fill="#3c7bf8"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={
                selectedView === "category"
                  ? getCategoryData()
                  : getMerchantData()
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
              <XAxis dataKey="name" stroke="#64748B" interval={0} angle={-10}/>
              <YAxis
                stroke="#64748B"
                allowDecimals={false}
                tickCount={8}
                domain={[0, "dataMax"]}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E0E7FF",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [`$${value}`, "Total"]}
              />
              <Bar dataKey="amount" fill="#3c7bf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
