"use client";

import useSWR from "swr";
import { format } from "date-fns";
import { AlertTriangle, Users, UserCheck, Wallet, Coins } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { DashboardOverview, ExpenseSummaryDTO, FeeSummaryDTO, StudentDTO } from "@/types/models";

type MonthRow = {
  year: number;
  month: number;
  feeCollected: number;
  feeOutstanding: number;
  expenses: number;
  net: number;
};

export const MonthlyArchive = () => {
  const { data: feeSummary } = useSWR<FeeSummaryDTO>("/api/fees/summary");
  const { data: expenseSummary } = useSWR<ExpenseSummaryDTO>("/api/expenses/summary");
  const { data: overview } = useSWR<DashboardOverview>("/api/dashboard/overview");
  const { data: students } = useSWR<StudentDTO[]>("/api/students");

  const months: MonthRow[] = [];
  const feeMap = new Map<string, { collected: number; outstanding: number }>();
  const expMap = new Map<string, number>();

  (feeSummary?.breakdown ?? []).forEach((f) => {
    feeMap.set(`${f._id.year}-${f._id.month}`, {
      collected: f.collected,
      outstanding: f.outstanding,
    });
  });

  (expenseSummary?.breakdown ?? []).forEach((e) => {
    expMap.set(`${e._id.year}-${e._id.month}`, e.total);
  });

  const allKeys = new Set<string>([...feeMap.keys(), ...expMap.keys()]);
  allKeys.forEach((key) => {
    const [yearStr, monthStr] = key.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const fee = feeMap.get(key);
    const expenses = expMap.get(key) ?? 0;
    const feeCollected = fee?.collected ?? 0;
    const feeOutstanding = fee?.outstanding ?? 0;
    months.push({
      year,
      month,
      feeCollected,
      feeOutstanding,
      expenses,
      net: feeCollected - expenses,
    });
  });

  months.sort((a, b) => b.year - a.year || b.month - a.month);

  const yearly = months.reduce<Record<number, { fee: number; outstanding: number; expenses: number }>>(
    (acc, row) => {
      if (!acc[row.year]) {
        acc[row.year] = { fee: 0, outstanding: 0, expenses: 0 };
      }
      acc[row.year].fee += row.feeCollected;
      acc[row.year].outstanding += row.feeOutstanding;
      acc[row.year].expenses += row.expenses;
      return acc;
    },
    {}
  );

  const yearlyRows = Object.entries(yearly)
    .map(([year, v]) => ({
      year: Number(year),
      feeCollected: v.fee,
      feeOutstanding: v.outstanding,
      expenses: v.expenses,
      net: v.fee - v.expenses,
    }))
    .sort((a, b) => b.year - a.year);

  const [clientNow, setClientNow] = useState<Date | null>(null);
  useEffect(() => {
    setClientNow(new Date());
  }, []);

  const currentKey = useMemo(() => {
    if (!clientNow) return null;
    return `${clientNow.getFullYear()}-${clientNow.getMonth() + 1}`;
  }, [clientNow]);

  const overall = months.reduce(
    (acc, row) => {
      acc.feeCollected += row.feeCollected;
      acc.feeOutstanding += row.feeOutstanding;
      acc.expenses += row.expenses;
      acc.net += row.net;
      return acc;
    },
    { feeCollected: 0, feeOutstanding: 0, expenses: 0, net: 0 }
  );

  const studentsLeft = (students ?? []).filter((s) => s.status === "left").length;
  const activeTeachers = overview?.teachers ?? 0;
  const outstandingFees = overview?.feeOutstanding ?? overall.feeOutstanding;
  const netProfit = overview?.net ?? overall.net;
  const feeCollected = overview?.feeCollected ?? overall.feeCollected;
  const totalExpenses = overview?.totalExpenses ?? overall.expenses;

  const handleExportCsv = () => {
    const headers = ["Year", "Month", "Fee collected", "Outstanding", "Expenses", "Net"];
    const rows = months.map((row) => [
      row.year,
      row.month,
      row.feeCollected,
      row.feeOutstanding,
      row.expenses,
      row.net,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "archive.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl border p-6 shadow-xl"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--text-primary)" }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
              Intelligence
            </p>
            <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Strategic insights snapshot
            </h3>
            <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
              Updated {clientNow ? format(clientNow, "PPpp") : "—"}
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            Export CSV
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-muted)", color: "var(--text-primary)" }}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
              <Coins className="h-4 w-4" />
              <span>Net profit</span>
            </div>
            <p
              className="mt-2 text-xl font-semibold"
              style={{ color: netProfit >= 0 ? "var(--text-primary)" : "var(--red-error-text)" }}
            >
              {formatCurrency(netProfit)}
            </p>
          </div>
          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-muted)", color: "var(--text-primary)" }}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
              <Coins className="h-4 w-4" />
              <span>Net expenses</span>
            </div>
            <p className="mt-2 text-xl font-semibold">{formatCurrency(totalExpenses)}</p>
          </div>
          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-muted)", color: "var(--text-primary)" }}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
              <Wallet className="h-4 w-4" />
              <span>Net fee collected</span>
            </div>
            <p className="mt-2 text-xl font-semibold">{formatCurrency(feeCollected)}</p>
          </div>
          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-muted)", color: "var(--text-primary)" }}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
              <AlertTriangle className="h-4 w-4" />
              <span>Outstanding fees</span>
            </div>
            <p className="mt-2 text-xl font-semibold">{formatCurrency(outstandingFees)}</p>
          </div>
          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-muted)", color: "var(--text-primary)" }}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
              <Users className="h-4 w-4" />
              <span>Students left</span>
            </div>
            <p className="mt-2 text-xl font-semibold">{studentsLeft}</p>
          </div>
          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-muted)", color: "var(--text-primary)" }}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
              <UserCheck className="h-4 w-4" />
              <span>Active teachers</span>
            </div>
            <p className="mt-2 text-xl font-semibold">{activeTeachers}</p>
          </div>
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
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
              Monthly archive
            </p>
            <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Fee, outstanding, expenses, and net by month
            </h3>
            <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
              Data covers all recorded months; highlighted row = current month.
            </p>
          </div>
          <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
            Updated {format(new Date(), "PPpp")}
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border)" }}>
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead
                style={{
                  backgroundColor: "var(--card-muted)",
                  color: "var(--text-secondary)",
                }}
              >
                <tr>
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-4 py-3 text-right">Fee collected</th>
                  <th className="px-4 py-3 text-right">Outstanding</th>
                  <th className="px-4 py-3 text-right">Expenses</th>
                  <th className="px-4 py-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {months.map((row) => {
                  const key = `${row.year}-${row.month}`;
                  const isCurrent = currentKey ? key === currentKey : false;
                  return (
                    <tr
                      key={key}
                      style={{
                        backgroundColor: isCurrent ? "var(--accent-muted)" : "transparent",
                        color: "var(--text-primary)",
                      }}
                    >
                      <td className="px-4 py-3">{monthLabel(row.month, row.year)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(row.feeCollected)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(row.feeOutstanding)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(row.expenses)}</td>
                      <td
                        className="px-4 py-3 text-right"
                        style={{ color: row.net >= 0 ? "var(--text-primary)" : "var(--red-error-text)" }}
                      >
                        {formatCurrency(row.net)}
                      </td>
                    </tr>
                  );
                })}
                {months.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center" style={{ color: "var(--text-secondary-muted)" }}>
                      No monthly data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
              Yearly rollup
            </p>
            <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Aggregated fee, outstanding, expenses, net per year
            </h3>
          </div>
          <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
            All recorded years
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border)" }}>
          <div className="max-h-[360px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead
                style={{
                  backgroundColor: "var(--card-muted)",
                  color: "var(--text-secondary)",
                }}
              >
                <tr>
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-right">Fee collected</th>
                  <th className="px-4 py-3 text-right">Outstanding</th>
                  <th className="px-4 py-3 text-right">Expenses</th>
                  <th className="px-4 py-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {yearlyRows.map((row) => (
                  <tr key={row.year} style={{ color: "var(--text-primary)" }}>
                    <td className="px-4 py-3">{row.year}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.feeCollected)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.feeOutstanding)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.expenses)}</td>
                    <td
                      className="px-4 py-3 text-right"
                      style={{ color: row.net >= 0 ? "var(--text-primary)" : "var(--red-error-text)" }}
                    >
                      {formatCurrency(row.net)}
                    </td>
                  </tr>
                ))}
                {yearlyRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center" style={{ color: "var(--text-secondary-muted)" }}>
                      No yearly data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

