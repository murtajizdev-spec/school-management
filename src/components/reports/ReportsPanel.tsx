"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { DownloadCloud, Activity, Users, Wallet } from "lucide-react";
import { formatCurrency, monthLabel } from "@/lib/utils";
import {
  DashboardOverview,
  ExpenseDTO,
  FeeSummaryDTO,
  StudentDTO,
  TeacherDTO,
} from "@/types/models";

export const ReportsPanel = () => {
  const { data: overview } =
    useSWR<DashboardOverview>("/api/dashboard/overview");
  const { data: fees } = useSWR<FeeSummaryDTO>("/api/fees/summary");
  const { data: students } = useSWR<StudentDTO[]>("/api/students");
  const { data: teachers } = useSWR<TeacherDTO[]>("/api/teachers");
  const { data: expenses } = useSWR<ExpenseDTO[]>("/api/expenses");

  const leftStudents =
    students?.filter((student) => student.status === "left").length ?? 0;
  const activeTeachers =
    teachers?.filter((teacher) => teacher.status === "active").length ?? 0;

  const generatedAt = useMemo(() => new Date().toLocaleString(), []);

  const exportReport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Students active", overview?.students ?? 0],
      ["Students left", leftStudents],
      ["Teachers active", activeTeachers],
      ["Fee collected", formatCurrency(overview?.feeCollected ?? 0)],
      ["Fee outstanding", formatCurrency(overview?.feeOutstanding ?? 0)],
      ["Expenses", formatCurrency(overview?.totalExpenses ?? 0)],
      ["Net profit", formatCurrency(overview?.net ?? 0)],
    ];

    (fees?.breakdown ?? []).forEach((item) => {
      rows.push([
        `Fee ${monthLabel(item._id.month, item._id.year)}`,
        formatCurrency(item.collected),
      ]);
    });

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "morning-roots-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
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
              Intelligence
            </p>
            <h3
              className="text-2xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Strategic insights snapshot
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary-muted)" }}>
              Updated {generatedAt}
            </p>
          </div>
          <button
            onClick={exportReport}
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <DownloadCloud className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Net profit",
              value: formatCurrency(overview?.net ?? 0),
              icon: Wallet,
            },
            {
              label: "Outstanding fees",
              value: formatCurrency(overview?.feeOutstanding ?? 0),
              icon: Activity,
            },
            {
              label: "Students left",
              value: leftStudents,
              icon: Users,
            },
            {
              label: "Active teachers",
              value: activeTeachers,
              icon: Users,
            },
          ].map((card, index) => (
            <motion.div
              key={card.label}
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <card.icon className="h-5 w-5" style={{ color: "var(--icon-color-primary)" }} />
              <p
                className="mt-2 text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--text-secondary)" }}
              >
                {card.label}
              </p>
              <p
                className="mt-1 text-2xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {card.value}
              </p>
            </motion.div>
          ))}
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
          Monthly fee performance
        </p>
        <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-2">
          {(fees?.breakdown ?? []).map((item) => (
            <div
              key={`${item._id.year}-${item._id.month}`}
              className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
            >
              <p style={{ color: "var(--text-primary)" }}>
                {monthLabel(item._id.month, item._id.year)}
              </p>
              <div
                className="text-right text-xs"
                style={{ color: "var(--text-secondary-muted)" }}
              >
                <p>Collected {formatCurrency(item.collected)}</p>
                <p>Outstanding {formatCurrency(item.outstanding)}</p>
              </div>
            </div>
          ))}
          {(fees?.breakdown ?? []).length === 0 && (
            <p className="text-sm" style={{ color: "var(--text-secondary-muted)" }}>
              No fee history to display yet.
            </p>
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
          Expense ledger
        </p>
        <div className="mt-4 space-y-2 text-sm max-h-[420px] overflow-y-auto pr-2">
          {(expenses ?? []).map((expense) => (
            <div
              key={expense._id}
              className="flex items-center justify-between rounded-2xl border px-4 py-3"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
            >
              <div>
                <p style={{ color: "var(--text-primary)" }}>{expense.title}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
                  {expense.category}
                </p>
              </div>
              <p>{formatCurrency(expense.amount)}</p>
            </div>
          ))}
          {(expenses ?? []).length === 0 && (
            <p className="text-sm" style={{ color: "var(--text-secondary-muted)" }}>
              No expense records captured yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

