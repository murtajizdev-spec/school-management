"use client";

import useSWR from "swr";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { ExpenseForm } from "./ExpenseForm";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { DashboardOverview, ExpenseDTO } from "@/types/models";
import { useDashboardRefresh } from "@/hooks/useDashboardRefresh";
import { DashboardRefreshButton } from "@/components/dashboard/DashboardRefreshButton";

export const ExpenseManagementPanel = () => {
  const {
    data: expenses,
    mutate: mutateExpenses,
    isLoading,
  } = useSWR<ExpenseDTO[]>("/api/expenses");
  const {
    data: overview,
  } = useSWR<DashboardOverview>("/api/dashboard/overview");
  const { refreshDashboard } = useDashboardRefresh();

  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const totals = useMemo(() => {
    if (!expenses) {
      return {
        total: 0,
        categories: {} as Record<string, number>,
        count: 0,
      };
    }
    const categories: Record<string, number> = {};
    let total = 0;
    let count = 0;

    expenses.forEach((expense) => {
      const incurred = new Date(expense.incurredOn);
      const m = incurred.getMonth() + 1;
      const y = incurred.getFullYear();
      if (m === currentMonth && y === currentYear) {
        total += expense.amount;
        count += 1;
        categories[expense.category] =
          (categories[expense.category] || 0) + expense.amount;
      }
    });

    return { total, categories, count };
  }, [expenses, currentMonth, currentYear]);

  const handleDelete = async (id: string) => {
    const promise = fetch(`/api/expenses/${id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error ?? "Failed to delete expense");
      }
    });
    toast.promise(promise, {
      loading: "Removing expense...",
      success: "Expense deleted",
      error: (err) => err.message,
    });
    try {
      await promise;
      await Promise.all([
        mutateExpenses(),
        refreshDashboard(["/api/expenses"]),
      ]);
    } catch {
      //
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
        <div
          className="rounded-3xl border p-6 shadow-xl"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
            color: "var(--text-primary)",
          }}
        >
          <div>
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: "var(--text-secondary)" }}
            >
              Add expense
            </p>
            <h3
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Track operational spend
            </h3>
          </div>
          <div className="mt-6">
            <ExpenseForm
              onSuccess={async () => {
                await Promise.all([
                  mutateExpenses(),
                  refreshDashboard(["/api/expenses"]),
                ]);
              }}
            />
          </div>
        </div>

        <div
          className="rounded-3xl border p-6 shadow-xl"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
            color: "var(--text-primary)",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--text-secondary)" }}
              >
                Expense summary (this month)
              </p>
              <h3
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {formatCurrency(totals.total)}
              </h3>
              <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
                Entries: {totals.count}
              </p>
            </div>
            <div
              className="text-right text-xs"
              style={{ color: "var(--text-secondary-muted)" }}
            >
              <DashboardRefreshButton
                className="mt-2"
                label="Refresh overview"
                extraKeys={["/api/expenses"]}
              />
            </div>
          </div>

          {Object.keys(totals.categories).length > 0 && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {Object.entries(totals.categories).map(([category, amount]) => (
                <div
                  key={category}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--card-muted)",
                    color: "var(--text-primary)",
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-[0.3em]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {category}
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatCurrency(amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="rounded-3xl border p-6 shadow-xl"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--card)",
          color: "var(--text-primary)",
        }}
      >
        <p
          className="text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--text-secondary)" }}
        >
          Expenses this month
        </p>
        <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-2">
          {isLoading && (
            <p className="text-sm" style={{ color: "var(--text-secondary-muted)" }}>
              Loading expenses...
            </p>
          )}
          {!isLoading &&
            (expenses ?? [])
              .filter((expense) => {
                const incurred = new Date(expense.incurredOn);
                const m = incurred.getMonth() + 1;
                const y = incurred.getFullYear();
                return m === currentMonth && y === currentYear;
              })
              .map((expense) => (
                <motion.div
                  key={expense._id}
                  className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--card-muted)",
                    color: "var(--text-primary)",
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <p style={{ color: "var(--text-primary)" }}>{expense.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
                      {expense.category} · {format(new Date(expense.incurredOn), "PPP")}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-3 text-xs"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span>{formatCurrency(expense.amount)}</span>
                    <button
                      className="rounded-full border p-2"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--red-error-text)",
                      }}
                      onClick={() => handleDelete(expense._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
          {!isLoading &&
            (expenses ?? []).filter((expense) => {
              const incurred = new Date(expense.incurredOn);
              const m = incurred.getMonth() + 1;
              const y = incurred.getFullYear();
              return m === currentMonth && y === currentYear;
            }).length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No expenses recorded for this month.
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

