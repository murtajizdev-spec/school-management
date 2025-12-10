"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  Wallet,
  Coins,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const cardConfig = [
  {
    key: "students",
    label: "Active students",
    icon: Users,
    formatter: (value: number) => value.toLocaleString(),
  },
  {
    key: "teachers",
    label: "Teachers",
    icon: GraduationCap,
    formatter: (value: number) => value.toLocaleString(),
  },
  {
    key: "feeCollected",
    label: "Fee collected",
    icon: Wallet,
    formatter: formatCurrency,
  },
  {
    key: "feeOutstanding",
    label: "Outstanding",
    icon: AlertTriangle,
    formatter: formatCurrency,
  },
  {
    key: "totalExpenses",
    label: "Expenses",
    icon: Coins,
    formatter: formatCurrency,
  },
  {
    key: "net",
    label: "Net profit",
    icon: ArrowUpRight,
    formatter: formatCurrency,
  },
] as const;

export const OverviewCards = () => {
  const { data, isLoading } = useSWR("/api/dashboard/overview");

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {cardConfig.map((card, index) => {
        const Icon = card.icon;
        const value = data ? data[card.key] ?? 0 : 0;
        return (
          <motion.div
            key={card.key}
            className="rounded-3xl border p-5 shadow-xl"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-xs uppercase tracking-[0.3em]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {card.label}
                </p>
                <p 
                  className="mt-3 text-2xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {isLoading ? "..." : card.formatter(value)}
                </p>
              </div>
              <span 
                className="rounded-2xl p-3"
                style={{
                  backgroundColor: "var(--accent-muted)",
                  color: "var(--accent)",
                }}
              >
                <Icon className="h-5 w-5" style={{ color: "var(--icon-color-primary)" }} />
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

