import React, { useState, useEffect } from "react";
import { Receipt } from "@/entities/Receipt";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { TrendingUp, DollarSign, Calendar, ShoppingBag } from "lucide-react";

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
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Analytics & Insights
            </h1>
            <p className="text-slate-600">Visual breakdown of your spending patterns</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48 border-slate-200 bg-white/80 backdrop-blur-sm">
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
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Spending</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${getTotalSpending().toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Transactions</p>
                  <p className="text-2xl font-bold text-slate-900">{filteredReceipts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Average Transaction</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${getAverageTransaction().toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Categories</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {getCategoryData().length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="border-b border-indigo-100/50">
              <CardTitle className="text-xl font-bold text-slate-900">Spending by Category</CardTitle>
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

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="border-b border-indigo-100/50">
              <CardTitle className="text-xl font-bold text-slate-900">Top Merchants</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getMerchantData()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                  <XAxis type="number" stroke="#64748B" />
                  <YAxis dataKey="name" type="category" width={100} stroke="#64748B" />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="amount" fill="#6366F1" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="border-b border-indigo-100/50">
            <CardTitle className="text-xl font-bold text-slate-900">Spending Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={getMonthlyTrend()}>
                <defs>
                  <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E0E7FF',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`$${value}`, 'Total']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  fill="url(#colorLine)"
                  dot={{ fill: '#8B5CF6', r: 5 }}
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