"use client"

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { TrendingUp, DollarSign, Calendar, ShoppingBag } from "lucide-react";
import StatCard from "../../components/dashboard/StatCards";

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

export default function AnalyticsPage() {
  const [receipts, setReceipts] = useState([]);
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    const data = await Receipt.list("-date");
    setReceipts(data);
  };

  const filterByTimeRange = (receipts) => {
    if (timeRange === "all") return receipts;
    const now = new Date();
    const cutoff = new Date();
    if (timeRange === "month") cutoff.setMonth(now.getMonth() - 1);
    if (timeRange === "3months") cutoff.setMonth(now.getMonth() - 3);
    if (timeRange === "year") cutoff.setFullYear(now.getFullYear() - 1);
    return receipts.filter(r => new Date(r.date) >= cutoff);
  };

  const filteredReceipts = filterByTimeRange(receipts);

  const getCategoryData = () => {
    const categoryTotals = {};
    filteredReceipts.forEach(r => {
      const cat = r.category || 'other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + r.total_amount;
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value: parseFloat(value.toFixed(2))
    }));
  };

  const getMerchantData = () => {
    const merchantTotals = {};
    filteredReceipts.forEach(r => {
      merchantTotals[r.merchant] = (merchantTotals[r.merchant] || 0) + r.total_amount;
    });
    return Object.entries(merchantTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({
        name,
        amount: parseFloat(value.toFixed(2))
      }));
  };

  const getMonthlyTrend = () => {
    const monthlyTotals = {};
    filteredReceipts.forEach(r => {
      const month = new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + r.total_amount;
    });
    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({
        month,
        total: parseFloat(total.toFixed(2))
      }))
      .slice(-12);
  };

  const getTotalSpending = () => {
    return filteredReceipts.reduce((sum, r) => sum + r.total_amount, 0);
  };

  const getAverageTransaction = () => {
    return filteredReceipts.length > 0 ? getTotalSpending() / filteredReceipts.length : 0;
  };

  return (
  <div className="p-4 md:p-8 min-h-full">
    <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Analytics & Insights
            </h1>
            <p className="text-muted">Visual breakdown of your spending patterns</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48 border-subtle bg-surface backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Spending"
            value={`$${getTotalSpending().toFixed(2)}`}
            icon={DollarSign}
            gradient="from-indigo-500 to-purple-500"
          />

          <StatCard
            title="Transactions"
            value={filteredReceipts.length}
            icon={ShoppingBag}
            gradient="from-green-500 to-emerald-500"
          />

          <StatCard
            title="Avg. Transaction"
            value={`$${getAverageTransaction().toFixed(2)}`}
            icon={TrendingUp}
            gradient="from-blue-500 to-cyan-500"
          />

          <StatCard
            title="Categories"
            value={getCategoryData().length}
            icon={Calendar}
            gradient="from-orange-500 to-red-500"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-0 bg-surface backdrop-blur-sm shadow-lg dark:shadow-gray-500/10">
            <CardHeader className="border-b border-subtle">
              <CardTitle className="text-xl font-bold text-foreground">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getCategoryData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getCategoryData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 bg-surface backdrop-blur-sm shadow-lg dark:shadow-gray-500/10">
            <CardHeader className="border-b border-subtle">
              <CardTitle className="text-xl font-bold text-foreground">Top Merchants</CardTitle>
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
                  <Bar dataKey="amount" fill="#6366F1" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 bg-surface backdrop-blur-sm shadow-lg dark:shadow-gray-500/10">
          <CardHeader className="border-b border-subtle">
            <CardTitle className="text-xl font-bold text-foreground">Spending Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={getMonthlyTrend()}>
                <defs>
                  <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
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
                  stroke="#6366F1"
                  strokeWidth={3}
                  fill="url(#colorLine)"
                  dot={{ fill: "#8B5CF6", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}