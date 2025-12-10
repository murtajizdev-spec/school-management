"use client";

import useSWR from "swr";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { ExpenseDTO } from "@/types/models";

const COLORS = ["#8CA9FF", "#AAC4F5", "#7a9aff", "#6f8fe8"];

export const ExpenseBreakdown = () => {
  const { data } = useSWR<ExpenseDTO[]>("/api/expenses");

  const grouped = (data ?? []).reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const chartData = Object.entries(grouped).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

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
            Expenses
          </p>
          <h3
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Spending distribution
          </h3>
        </div>
        <p
          className="text-sm"
          style={{ color: "var(--text-secondary-muted)" }}
        >
          Total {formatCurrency(total || 0)}
        </p>
      </div>

      {chartData.length === 0 ? (
        <p
          className="mt-8 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          No expense records yet. Salary slips automatically appear here.
        </p>
      ) : (
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const item = payload[0];
                  return (
                    <motion.div
                      className="rounded-xl border px-3 py-2 text-xs"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--card-muted)",
                        color: "var(--text-primary)",
                      }}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {item.payload.name}
                      </p>
                      <p style={{ color: "var(--text-secondary)" }}>
                        {formatCurrency(item.payload.value)}
                      </p>
                    </motion.div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

