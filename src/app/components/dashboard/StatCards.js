import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, gradient, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-0 bg-surface backdrop-blur-sm shadow-lg dark:shadow-gray-500/10 hover:shadow-xl transition-shadow duration-300">
        <div className={`absolute top-0 right-0 w-full h-19 bg-gradient-to-br ${gradient} opacity-10`} />
        <div className="p-6 relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-muted uppercase tracking-wide">{title}</p>
              <h3 className="text-3xl font-bold text-foreground mt-4">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg dark:shadow-gray-500/10`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          {trend && (
            <p className="text-sm text-muted">{trend}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}