"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { Wallet, AlertTriangle, Coins, ArrowUpRight } from "lucide-react";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { PeriodKey, PeriodOverviewResponse } from "@/types/models";

const cardConfig = [
  { key: "feeCollected", label: "Fee collected", icon: Wallet },
  { key: "feeOutstanding", label: "Outstanding", icon: AlertTriangle },
  { key: "expenses", label: "Expenses", icon: Coins },
  { key: "net", label: "Net profit", icon: ArrowUpRight },
] as const;

type Props = {
  period: PeriodKey;
  heading: string;
  description?: string;
};

export const PeriodCards = ({ period, heading, description }: Props) => {
  const { data, isLoading } = useSWR<PeriodOverviewResponse>("/api/dashboard/periods");
  const snapshot = data?.[period];
  const subtitle =
    snapshot?.month && snapshot.year
      ? monthLabel(snapshot.month, snapshot.year)
      : snapshot?.year
        ? `Year ${snapshot.year}`
        : undefined;

  return (
    <div
      className="rounded-3xl border p-6 shadow-xl"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
        color: "var(--text-primary)",
      }}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
            {heading}
          </p>
          <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {snapshot?.label ?? "Loading..."}
          </h3>
          {subtitle && (
            <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
              {subtitle}
            </p>
          )}
          {description && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary-muted)" }}>
              {description}
            </p>
          )}
        </div>
        <div className="text-right text-xs" style={{ color: "var(--text-secondary-muted)" }}>
          <p>Updated live</p>
          <p style={{ color: "var(--text-secondary)" }}>Includes expenses + salaries</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cardConfig.map((card, index) => {
          const Icon = card.icon;
          const value = snapshot ? snapshot[card.key] : 0;
          const text =
            card.key === "net" && value < 0
              ? `-${formatCurrency(Math.abs(value))}`
              : formatCurrency(value);
          return (
            <motion.div
              key={card.key}
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
                    {card.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                    {isLoading ? "..." : text}
                  </p>
                </div>
                <span
                  className="rounded-2xl p-3"
                  style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}
                >
                  <Icon className="h-5 w-5" style={{ color: "var(--icon-color-primary)" }} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

