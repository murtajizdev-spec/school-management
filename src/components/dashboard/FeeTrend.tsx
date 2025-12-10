"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { FeeSummaryDTO } from "@/types/models";

export const FeeTrend = () => {
  const { data, isLoading } = useSWR<FeeSummaryDTO>("/api/fees/summary");

  const breakdown = data?.breakdown?.slice(0, 6) ?? [];

  return (
    <div
      className="rounded-3xl border p-6 shadow-xl"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
        color: "var(--text-primary)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Revenue Trend
          </p>
          <h3
            className="mt-1 text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Fee collection (last 6 months)
          </h3>
        </div>
        {data && (
          <div
            className="text-right text-sm"
            style={{ color: "var(--text-secondary-muted)" }}
          >
            <p>Total collected</p>
            <p style={{ color: "var(--text-primary)" }}>
              {formatCurrency(data.overall.collected)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl p-4"
              style={{ backgroundColor: "var(--accent-muted)" }}
            >
              <div
                className="h-3 w-1/2 rounded"
                style={{ backgroundColor: "var(--accent-light)" }}
              />
            </div>
          ))}

        {!isLoading &&
          breakdown.map((item) => {
            const collectedRatio =
              item.collected /
              (item.collected + Math.max(item.outstanding, 1));
            return (
              <motion.div
                key={`${item._id.year}-${item._id.month}`}
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--card-muted)",
                }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary-muted)" }}
                    >
                      {monthLabel(item._id.month, item._id.year)}
                    </p>
                    <p
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatCurrency(item.collected)}
                    </p>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: "var(--red-error-text)" }}
                  >
                    Outstanding {formatCurrency(item.outstanding)}
                  </p>
                </div>
                <div
                  className="mt-4 h-3 rounded-full"
                  style={{ backgroundColor: "var(--accent-muted)" }}
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r"
                    style={{ background: `linear-gradient(to right, var(--accent-light), var(--accent))` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(collectedRatio * 100, 100)}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};

