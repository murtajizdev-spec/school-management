"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { ExpenseDTO } from "@/types/models";

type Props = {
  title: string;
  month?: number;
  year?: number;
};

export const PeriodExpenses = ({ title, month, year }: Props) => {
  const search = new URLSearchParams();
  if (month) search.set("month", String(month));
  if (year) search.set("year", String(year));
  const endpoint = `/api/expenses${search.toString() ? `?${search.toString()}` : ""}`;

  const { data, isLoading, error } = useSWR<ExpenseDTO[]>(endpoint);
  const total = (data ?? []).reduce((sum, exp) => sum + exp.amount, 0);

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
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
            Expenses
          </p>
          <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h3>
          <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3 max-h-[340px] overflow-y-auto pr-2">
        {isLoading && (
          <p className="text-sm" style={{ color: "var(--text-secondary-muted)" }}>
            Loading expenses...
          </p>
        )}
        {error && (
          <p className="text-sm" style={{ color: "var(--red-error-text)" }}>
            Failed to load expenses for this period.
          </p>
        )}
        {!isLoading &&
          !error &&
          (data ?? []).map((expense) => (
            <motion.div
              key={expense._id}
              className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <p style={{ color: "var(--text-primary)" }}>{expense.title}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
                  {expense.category} · {format(new Date(expense.incurredOn), "PPP")}
                </p>
              </div>
              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(expense.amount)}
              </p>
            </motion.div>
          ))}
        {!isLoading && !error && (data ?? []).length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No expenses recorded for this period.
          </p>
        )}
      </div>
    </div>
  );
};

