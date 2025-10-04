import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChevronDown } from "lucide-react";

export default function SpendingChart({ receipts }) {
  const [selectedView, setSelectedView] = useState('spending');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const viewOptions = [
    {value: 'spending', label: 'Spending', title: 'Spending Trends' },
    {value: 'category', label: 'Category', title: 'Category Analysis' },
    {value: 'merchant', label: 'Merchant', title: 'Merchant Breakdown' }
  ]

  const getCurrentTitle = () => {
    return viewOptions.find(option => option.value === selectedView)?.title || 'Analytics Dashboard';
  };

  const getMonthlyData = () => {
    const monthlyTotals = {};
    receipts.forEach(receipt => {
      const month = new Date(receipt.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + receipt.total_amount;
    });
    
    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({ month, total: parseFloat(total.toFixed(2)) }))
      .slice(-6);
  };

  return (
    <Card className="border-0 bg-surface backdrop-blur-sm shadow-lg">
      <CardHeader className="border-b border-subtle">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">{getCurrentTitle()}</CardTitle>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground focus:outline-none border border-subtle rounded-lg bg-surface-solid hover:bg-input"
            >
                {viewOptions.find(option => option.value === selectedView)?.label}
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-card border border-subtle rounded-lg shadow-lg contain-content">
                {viewOptions.map(option => (
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
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getMonthlyData()}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.8}/>
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
            <Bar dataKey="total" fill="url(#colorTotal)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}