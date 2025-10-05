"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";
import { Receipt } from "lucide-react";
import {
  Folder,
  Search,
  BarChart2,
  ChevronRight,
  Receipt as ReceiptIcon,
  DollarSign,
  Shield,
  CloudUpload,
  Layers,
} from "lucide-react";
import StatsCard from "@/app/components/dashboard/StatCards";
import RecentReceipts from "@/app/components/dashboard/RecentReceipts";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-rose-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-lg dark:shadow-gray-500/10 text-white">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div className="font-semibold">PaperTrail</div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[var(--primary)] p-2 shadow-md flex items-center justify-center text-white">
                <Receipt className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
                  PaperTrail
                </h1>
                <p className="text-sm text-muted mt-1">
                  Receipts that behave — less mess, more meaning.
                </p>
              </div>
            </div>

            <h2 className="mt-8 text-2xl md:text-3xl font-bold leading-tight">
              Take control of your spending — automatically
            </h2>
            <p className="mt-4 text-base text-muted max-w-xl">
              Upload receipts, categorize expenses, organize them into folders,
              and view clean insights — all in one lightweight app that respects
              your data.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 w-full">
              <Link
                href="/login"
                aria-label="Sign in to PaperTrail"
                className="w-full"
              >
                <Button className="p-6 bg-primary text-white font-semibold w-full">
                  <span className="font-bold text-xl">Get started</span>
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="overflow-hidden group hover:shadow-2xl transition-shadow px-3 gap-3">
                <div className="px-3 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--primary)] text-white shadow-md">
                      <Folder className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">
                      Folders
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-muted px-3">
                  Group receipts by project, client, or trip for fast retrieval
                  and organization.
                </p>
                <div className="p-3 pb-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    href="/folders"
                    className="text-primary flex items-center gap-2 group-hover:underline"
                  >
                    <span className="text-sm font-medium">Explore</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>

              <Card className="overflow-hidden group hover:shadow-2xl transition-shadow px-3 gap-3">
                <div className="px-3 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--primary)] text-white shadow-md">
                      <Search className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">
                      Quick Search
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-muted px-3">
                  Instantly filter receipts by merchant, category, or date —
                  find what you need fast.
                </p>
                <div className="p-3 pb-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    href="/receipts"
                    className="text-primary flex items-center gap-2 group-hover:underline"
                  >
                    <span className="text-sm font-medium">Search</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>

              <Card className="overflow-hidden group hover:shadow-2xl transition-shadow px-3 gap-3">
                <div className="px-3 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--primary)] text-white shadow-md">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">
                      Insights
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-muted px-3">
                  Monthly totals, category breakdowns, and top merchants at a
                  glance.
                </p>
                <div className="p-3 pb-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    href="/dashboard"
                    className="text-primary flex items-center gap-2 group-hover:underline"
                  >
                    <span className="text-sm font-medium">View</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full lg:w-1/2"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
              <div className="p-6">
                <h3 className="text-lg font-bold">Dashboard preview</h3>
                <p className="text-sm text-muted mt-1">
                  Live charts, recent receipts, and quick actions.
                </p>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                {/* mock data for preview */}
                <PreviewInner />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h3 className="text-2xl font-bold">Why PaperTrail?</h3>
          <p className="mt-3 text-muted max-w-2xl">
            Simple UI, fast uploads, and structured data you can trust. Built
            for people who want to spend less time organizing and more time
            doing.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group border hover:shadow-lg transform transition-all hover:-translate-y-1 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:bg-surface dark:border dark:border-slate-700">
              <div className="p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm dark:from-indigo-600 dark:to-purple-700 dark:bg-gradient-to-br">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-black">
                    Privacy-first
                  </h4>
                  <p className="mt-1 text-xs text-slate-700 line-clamp-2">
                    Your receipts stay private — export when you want, delete
                    when you don’t.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="group border hover:shadow-lg transform transition-all hover:-translate-y-1 bg-gradient-to-br from-emerald-50 to-green-100 dark:bg-surface dark:border dark:border-slate-700">
              <div className="p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm dark:from-emerald-500 dark:to-teal-600 dark:bg-gradient-to-br">
                  <CloudUpload className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-black">
                    AI-powered OCR
                  </h4>
                  <p className="mt-1 text-xs line-clamp-2 text-slate-700">
                    Smart image processing extracts merchant, date, and totals
                    from photos.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="group border hover:shadow-lg transform transition-all hover:-translate-y-1 bg-gradient-to-br from-rose-50 to-pink-100 dark:bg-surface dark:border dark:border-slate-700">
              <div className="p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-sm dark:from-rose-500 dark:to-pink-600 dark:bg-gradient-to-br">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-black">
                    Organized by design
                  </h4>
                  <p className="mt-1 text-xs text-slate-700 line-clamp-2">
                    Folders, tags, and filters make it fast to find and export
                    what matters.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted">
          © {new Date().getFullYear()} PaperTrail. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

function PreviewInner() {
  const sampleReceipts = [
    {
      id: "r1",
      merchant: "Coffee Shop",
      purchase_date: new Date("2025-10-05").toISOString(),
      total_amount: 4.2,
      category: "food_dining",
      file_url: "",
    },
    {
      id: "r2",
      merchant: "Grocery Mart",
      purchase_date: new Date("2025-07-02").toISOString(),
      total_amount: 52.4,
      category: "groceries",
      file_url: "",
    },
    {
      id: "r3",
      merchant: "Stationery Co",
      purchase_date: new Date("2025-04-23").toISOString(),
      total_amount: 12.0,
      category: "office_supplies",
      file_url: "",
    },
    {
      id: "r4",
      merchant: "Taxi App",
      purchase_date: new Date("2025-01-15").toISOString(),
      total_amount: 18.75,
      category: "transportation",
      file_url: "",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Total Receipts"
          value={sampleReceipts.length}
          icon={ReceiptIcon}
          gradient="from-indigo-500 to-purple-500"
        />
        <StatsCard
          title="Total Spending"
          value={`$${sampleReceipts
            .reduce((s, r) => s + r.total_amount, 0)
            .toFixed(2)}`}
          icon={DollarSign}
          gradient="from-emerald-400 to-teal-500"
        />
      </div>
      <div>
        <RecentReceipts
          receipts={sampleReceipts}
          isLoading={false}
          onSelectReceipt={() => {}}
        />
      </div>
    </div>
  );
}
