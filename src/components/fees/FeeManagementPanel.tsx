"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Wallet,
  Search,
  ChevronRight,
  Receipt,
  UserCircle2,
  Trash2,
} from "lucide-react";
import { FeePaymentForm } from "./FeePaymentForm";
import { FeeSlipPreview } from "./FeeSlipPreview";
import { SearchableStudentSelect } from "./SearchableStudentSelect";
import { UnpaidStudents } from "./UnpaidStudents";
import { format } from "date-fns";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { FeeRecordDTO, StudentDTO } from "@/types/models";
import { useDashboardRefresh } from "@/hooks/useDashboardRefresh";
import { CLASS_NAMES } from "@/types/enums";

export const FeeManagementPanel = () => {
  const { data: students } = useSWR<StudentDTO[]>("/api/students");
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  // Fetch full year; page list will filter to current month, ledger can see whole year
  const feeKey = `/api/fees?year=${currentYear}`;
  const {
    data: fees,
    mutate,
    isLoading,
  } = useSWR<FeeRecordDTO[]>(feeKey);

  const [search, setSearch] = useState("");
  const [ledgerStudentId, setLedgerStudentId] = useState<string>("");
  const [slipRecord, setSlipRecord] = useState<FeeRecordDTO | undefined>();
  const { refreshDashboard } = useDashboardRefresh();
  const [classFilter, setClassFilter] = useState<"all" | (typeof CLASS_NAMES)[number]>("all");

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (classFilter === "all") return students;
    return students.filter((s) => s.className === classFilter);
  }, [students, classFilter]);

  useEffect(() => {
    if (
      ledgerStudentId &&
      !filteredStudents.some((s) => s._id === ledgerStudentId)
    ) {
      setLedgerStudentId("");
    }
  }, [ledgerStudentId, filteredStudents]);

  const filteredFees = useMemo(() => {
    if (!fees) return [];
    return fees.filter((fee) => {
      const needle = search.toLowerCase();
      const matchesSearch =
        fee.slipNumber.toLowerCase().includes(needle) ||
        fee.student?.name?.toLowerCase().includes(needle) ||
        fee.student?.admissionNo?.toLowerCase().includes(needle);
      const isCurrentMonth = fee.month === currentMonth && fee.year === currentYear;
      const matchesClass =
        classFilter === "all" ? true : fee.student?.className === classFilter;
      return matchesSearch && isCurrentMonth && matchesClass;
    });
  }, [fees, search, currentMonth, currentYear, classFilter]);

  const ledgerRecords = useMemo(() => {
    if (!ledgerStudentId || !fees) return [];
    return fees
      .filter((record) => record.student?._id === ledgerStudentId)
      .sort((a, b) => b.year - a.year || b.month - a.month);
  }, [fees, ledgerStudentId]);

  const ledgerTotals = useMemo(() => {
    if (!ledgerRecords.length) return { paid: 0, outstanding: 0 };
    return ledgerRecords.reduce(
      (acc, record) => {
        acc.paid += record.amountPaid;
        acc.outstanding += Math.max(record.amountDue - record.amountPaid, 0);
        return acc;
      },
      { paid: 0, outstanding: 0 }
    );
  }, [ledgerRecords]);

  const collective = useMemo(() => {
    if (!fees) return [];
    const map = new Map<
      string,
      { student: StudentDTO; paid: number; outstanding: number }
    >();
    fees.forEach((record) => {
      if (!record.student) return;
      if (!map.has(record.student._id)) {
        map.set(record.student._id, {
          student: record.student,
          paid: 0,
          outstanding: 0,
        });
      }
      const entry = map.get(record.student._id)!;
      entry.paid += record.amountPaid;
      entry.outstanding += Math.max(record.amountDue - record.amountPaid, 0);
    });
    return Array.from(map.values()).sort((a, b) => b.paid - a.paid);
  }, [fees]);

  const totals = useMemo(() => {
    if (!fees) return { paid: 0, outstanding: 0 };
    return fees
      .filter((record) => record.month === currentMonth && record.year === currentYear)
      .reduce(
        (acc: { paid: number; outstanding: number }, record) => {
          acc.paid += record.amountPaid;
          acc.outstanding += Math.max(record.amountDue - record.amountPaid, 0);
          return acc;
        },
        { paid: 0, outstanding: 0 }
      );
  }, [fees, currentMonth, currentYear]);

  if (!students) {
    return (
      <p className="text-sm text-[#ADD8E6]/70">Loading students...</p>
    );
  }

  const refreshAll = async () => {
    await Promise.all([mutate(), refreshDashboard([feeKey])]);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this fee slip? This action cannot be undone."
    );
    if (!confirmed) return;
    const promise = fetch(`/api/fees/${id}`, { method: "DELETE" }).then(
      async (res) => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.error ?? "Unable to delete slip");
        }
      }
    );
    toast.promise(promise, {
      loading: "Removing slip...",
      success: "Slip deleted",
      error: (err) => err.message,
    });
    try {
      await promise;
      await refreshAll();
    } catch {
      //
    }
  };

  return (
    <div className="space-y-6">
      {slipRecord && (
        <FeeSlipPreview
          record={slipRecord}
          onClose={() => setSlipRecord(undefined)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
        <div
          className="rounded-3xl border p-6 shadow-xl"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
            color: "var(--text-primary)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="rounded-2xl p-3"
              style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}
            >
              <Wallet className="h-5 w-5" style={{ color: "var(--icon-color-primary)" }} />
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--text-secondary)" }}
              >
                Fee submission
              </p>
              <h3
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Record payment
              </h3>
            </div>
          </div>
          <div className="mt-6">
            <FeePaymentForm
              students={filteredStudents}
              onSuccess={async (record) => {
                setSlipRecord(record);
                await refreshAll();
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
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p
                  className="text-xs uppercase tracking-[0.3em]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Net fee status (this month)
                </p>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {formatCurrency(totals.paid)} collected
                </h3>
                <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
                  Outstanding {formatCurrency(totals.outstanding)}
                </p>
              </div>
              {ledgerStudentId && (
                <div
                  className="rounded-2xl border p-4 text-xs"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--card-muted)", color: "var(--text-primary)" }}
                >
                  <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
                    Selected student totals (year)
                  </p>
                  <div className="mt-2 space-y-1">
                    <p>
                      Collected: <span className="font-semibold">{formatCurrency(ledgerTotals.paid)}</span>
                    </p>
                    <p>
                      Outstanding: <span className="font-semibold">{formatCurrency(ledgerTotals.outstanding)}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-3 h-4 w-4"
                  style={{ color: "var(--icon-color)" }}
                />
                <input
                  placeholder="Search by name / admission no / slip"
                  className="w-full rounded-full border py-2 pl-10 pr-4 text-sm focus:outline-none"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--card-muted)",
                    color: "var(--text-primary)",
                  }}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select
                value={classFilter}
                onChange={(event) =>
                  setClassFilter(
                    event.target.value as "all" | (typeof CLASS_NAMES)[number]
                  )
                }
                className="rounded-full border px-3 py-2 text-sm"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--card-muted)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="all">All classes</option>
                {CLASS_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
              {isLoading && (
                <p className="text-sm" style={{ color: "var(--text-secondary-muted)" }}>
                  Loading fee records...
                </p>
              )}
              {!isLoading &&
                filteredFees.map((record) => (
                  <motion.div
                    key={record._id}
                    className="rounded-2xl border p-4 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--card-muted)",
                      color: "var(--text-primary)",
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ color: "var(--text-primary)" }}>{record.student?.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
                          {monthLabel(record.month, record.year)} ·{" "}
                          {record.student?.admissionNo}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {formatCurrency(record.amountPaid)}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
                          Slip {record.slipNumber} ·{" "}
                          {record.paidOn ? format(new Date(record.paidOn), "PPP") : "Not paid yet"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <button
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                        onClick={() => setSlipRecord(record)}
                      >
                        <Receipt className="h-4 w-4" style={{ color: "var(--icon-color-primary)" }} />
                        View slip
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                        onClick={() => setLedgerStudentId(record.student?._id)}
                      >
                        <UserCircle2 className="h-4 w-4" style={{ color: "var(--icon-color-primary)" }} />
                        Ledger
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--red-error-text)",
                        }}
                        onClick={() => handleDelete(record._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete slip
                      </button>
                      <span
                        className="rounded-full px-3 py-1"
                        style={{
                          backgroundColor: "var(--accent-muted)",
                          color: "var(--text-secondary-muted)",
                        }}
                      >
                        Status {record.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              {!isLoading && filteredFees.length === 0 && (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  No fee records found for your search.
                </p>
              )}
            </div>
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: "var(--text-secondary)" }}
            >
              Individual ledger
            </p>
            <h3
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Monthly record per student
            </h3>
          </div>
          <div className="w-full md:w-auto">
            <SearchableStudentSelect
              students={filteredStudents}
              value={ledgerStudentId}
              onChange={setLedgerStudentId}
              placeholder="Search student for ledger..."
            />
          </div>
        </div>

        {ledgerStudentId && (
          <div className="mt-4 space-y-3">
            <div
              className="rounded-2xl border p-4"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card-muted)", color: "var(--text-primary)" }}
            >
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
                Student totals (year)
              </p>
              <div className="mt-2 text-sm space-y-1">
                <p>
                  Collected:{" "}
                  <span className="font-semibold">{formatCurrency(ledgerTotals.paid)}</span>
                </p>
                <p>
                  Outstanding:{" "}
                  <span className="font-semibold">{formatCurrency(ledgerTotals.outstanding)}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2">
              {ledgerRecords.length === 0 && (
                <p className="text-sm text-[#ADD8E6]/70">
                  No payments recorded yet for this student.
                </p>
              )}
              {ledgerRecords.map((record) => (
                <div
                  key={record._id}
                  className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--card-muted)",
                    color: "var(--text-primary)",
                  }}
                >
                  <div>
                    <p style={{ color: "var(--text-primary)" }}>
                      {monthLabel(record.month, record.year)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
                      Due {formatCurrency(record.amountDue)}
                    </p>
                  </div>
                  <div
                    className="text-right text-xs"
                    style={{ color: "var(--text-secondary-muted)" }}
                  >
                    <p style={{ color: "var(--text-primary)" }}>
                      Paid {formatCurrency(record.amountPaid)}
                    </p>
                    <p>
                      Balance {formatCurrency(Math.max(record.amountDue - record.amountPaid, 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: "var(--text-secondary)" }}
            >
              Collective record
            </p>
            <h3
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Fee health per student
            </h3>
          </div>
        </div>
        <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto pr-2">
          {collective.map((entry) => (
            <div
              key={entry.student._id}
              className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
            >
              <div className="flex items-center gap-3">
                <ChevronRight className="h-4 w-4" style={{ color: "var(--icon-color)" }} />
                <div>
                  <p style={{ color: "var(--text-primary)" }}>{entry.student.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
                    {entry.student.classGroup} · {entry.student.admissionNo}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs">
                <p style={{ color: "var(--text-primary)" }}>
                  Paid {formatCurrency(entry.paid)}
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  Outstanding {formatCurrency(entry.outstanding)}
                </p>
              </div>
            </div>
          ))}
          {collective.length === 0 && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No fee records yet. Once you record payments, the collective view will update.
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
    <div className="flex items-center justify-between">
      <div>
        <p
          className="text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--text-secondary)" }}
        >
          Unpaid this month
        </p>
        <h3
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Students with outstanding fees
        </h3>
      </div>
      <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
        Month {new Date().toLocaleString("en-US", { month: "short", year: "numeric" })}
      </p>
    </div>

    <UnpaidStudents />
  </div>
    </div>
  );
};

