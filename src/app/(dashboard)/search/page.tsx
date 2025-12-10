"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, FileText, Loader2, Printer, Search, Wallet } from "lucide-react";
import { format } from "date-fns";
import { FeeRecordDTO, SalaryPaymentDTO, StudentDTO, TeacherDTO } from "@/types/models";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { AdmissionFormPreview } from "@/components/students/AdmissionFormPreview";
import { FeeSlipPreview } from "@/components/fees/FeeSlipPreview";
import { SalarySlipPreview } from "@/components/teachers/SalarySlipPreview";

type StudentResult = {
  type: "student";
  student: StudentDTO;
  currentMonthFee?: FeeRecordDTO;
  feeHistory: FeeRecordDTO[];
};

type TeacherResult = {
  type: "teacher";
  teacher: TeacherDTO;
  currentMonthSalary?: SalaryPaymentDTO;
  salaryHistory: SalaryPaymentDTO[];
};

type SearchResponse = {
  query: string;
  students: StudentResult[];
  teachers: TeacherResult[];
};

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error ?? "Failed to search");
    }
    return res.json();
  });

const formatPaidOn = (paidOn?: string) =>
  paidOn ? format(new Date(paidOn), "PPP") : "Not paid yet";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchTerm = (searchParams.get("q") ?? "").trim();

  const [query, setQuery] = useState(searchTerm);
  const [admissionPreview, setAdmissionPreview] = useState<StudentDTO | null>(null);
  const [feeSlipPreview, setFeeSlipPreview] = useState<FeeRecordDTO | null>(null);
  const [salarySlipPreview, setSalarySlipPreview] = useState<SalaryPaymentDTO | null>(null);

  useEffect(() => {
    setQuery(searchTerm);
  }, [searchTerm]);

  const { data, error, isLoading } = useSWR<SearchResponse>(
    () => (searchTerm ? `/api/search?q=${encodeURIComponent(searchTerm)}` : null),
    fetcher,
    { revalidateOnFocus: false }
  );

  const hasResults = useMemo(
    () => (data?.students?.length ?? 0) + (data?.teachers?.length ?? 0) > 0,
    [data]
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next = query.trim();
    router.replace(`/search${next ? `?q=${encodeURIComponent(next)}` : ""}`);
  };

  return (
    <div className="space-y-6">
      {admissionPreview && (
        <AdmissionFormPreview
          student={admissionPreview}
          onClose={() => setAdmissionPreview(null)}
        />
      )}
      {feeSlipPreview && (
        <FeeSlipPreview
          record={feeSlipPreview}
          onClose={() => setFeeSlipPreview(null)}
        />
      )}
      {salarySlipPreview && (
        <SalarySlipPreview
          payment={salarySlipPreview}
          onClose={() => setSalarySlipPreview(null)}
        />
      )}
      <div
        className="rounded-3xl border p-6 shadow-xl"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-3 h-4 w-4"
              style={{ color: "var(--icon-color)" }}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search students or teachers by name, admission no, CNIC, subject..."
              className="w-full rounded-full border py-2 pl-10 pr-4 text-sm focus:outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold"
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
            }}
          >
            Search
          </button>
        </form>

        {isLoading && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching...
          </div>
        )}
        {error && (
          <p className="mt-4 text-sm" style={{ color: "var(--red-error-text)" }}>
            {error.message}
          </p>
        )}
        {!isLoading && !error && searchTerm && !hasResults && (
          <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            No matches found for “{searchTerm}”.
          </p>
        )}
        {!searchTerm && (
          <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            Type a name, admission number, CNIC, or subject to start searching.
          </p>
        )}
      </div>

      {data?.students?.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Students
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.students.map((entry) => {
              const history = Array.isArray(entry.feeHistory) ? entry.feeHistory : [];
              const totalCollected = history.reduce(
                (sum, r) => sum + (r?.amountPaid ?? 0),
                0
              );
              const totalOutstanding = history.reduce(
                (sum, r) =>
                  sum + Math.max((r?.amountDue ?? 0) - (r?.amountPaid ?? 0), 0),
                0
              );

              return (
                <div
                  key={entry.student._id}
                  className="rounded-2xl border p-4 shadow-sm"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
                >
                  <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border-muted)" }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {entry.student.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        Adm #{entry.student.admissionNo} • {entry.student.classGroup} {entry.student.className}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p style={{ color: "var(--text-secondary)" }}>Total collected</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(totalCollected)}
                      </p>
                      <p style={{ color: "var(--text-secondary)" }}>Outstanding</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--amber-warning-text)" }}>
                        {formatCurrency(totalOutstanding)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 justify-between">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor:
                          entry.student.status === "active"
                            ? "var(--accent-muted)"
                            : "var(--card-muted)",
                        color:
                          entry.student.status === "active"
                            ? "var(--accent)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {entry.student.status}
                    </span>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => setAdmissionPreview(entry.student)}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                        style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                      >
                        <FileText className="h-4 w-4" />
                        Admission form
                      </button>
                      <button
                        disabled={!entry.feeHistory.length}
                        onClick={() => {
                          if (entry.feeHistory.length) {
                            setFeeSlipPreview(entry.feeHistory[0]);
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold disabled:opacity-50"
                        style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                      >
                        <Printer className="h-4 w-4" />
                        Latest fee slip
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border px-3 py-2"
                    style={{ borderColor: "var(--border-muted)", backgroundColor: "var(--card-muted)" }}>
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                      Current month fee
                    </p>
                    {entry.currentMonthFee ? (
                      <div className="mt-1 space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span>
                            {monthLabel(entry.currentMonthFee.month, entry.currentMonthFee.year)}
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold"
                            style={{ color: entry.currentMonthFee.status === "paid" ? "var(--green-success-text)" : "var(--amber-warning-text)" }}>
                            <BadgeCheck className="h-4 w-4" />
                            {entry.currentMonthFee.status} ({formatCurrency(entry.currentMonthFee.amountPaid)}/{formatCurrency(entry.currentMonthFee.amountDue)})
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          Paid on: {formatPaidOn(entry.currentMonthFee.paidOn)}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                        No slip recorded for this month yet.
                      </p>
                    )}
                  </div>

                  {history.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                        Recent fee slips
                      </p>
                      <div className="space-y-2 max-h-56 overflow-auto pr-1">
                        {history.slice(0, 12).map((record) => (
                          <div
                            key={record._id}
                            className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                            style={{ borderColor: "var(--border-muted)", backgroundColor: "var(--card-muted)" }}
                          >
                            <div>
                              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                                {monthLabel(record.month, record.year)}
                              </p>
                              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                Slip {record.slipNumber} · {formatPaidOn(record.paidOn)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                Paid {formatCurrency(record.amountPaid)} / {formatCurrency(record.amountDue)}
                              </p>
                              <span
                                className="rounded-full px-2 py-1 text-xs font-semibold"
                                style={{
                                  backgroundColor: "var(--card)",
                                  color:
                                    record.status === "paid"
                                      ? "var(--green-success-text)"
                                      : record.status === "partial"
                                        ? "var(--amber-warning-text)"
                                        : "var(--text-secondary)",
                                }}
                              >
                                {record.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {data?.teachers?.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Teachers
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.teachers.map((entry) => {
              const salaryHistory = Array.isArray(entry.salaryHistory) ? entry.salaryHistory : [];
              return (
                <div
                  key={entry.teacher._id}
                  className="rounded-2xl border p-4 shadow-sm"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {entry.teacher.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        CNIC {entry.teacher.cnic} • {entry.teacher.subjects?.join(", ")}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor:
                          entry.teacher.status === "active"
                            ? "var(--accent-muted)"
                            : "var(--card-muted)",
                        color:
                          entry.teacher.status === "active"
                            ? "var(--accent)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {entry.teacher.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      disabled={!salaryHistory.length}
                      onClick={() => {
                        if (salaryHistory.length) {
                          setSalarySlipPreview(salaryHistory[0]);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold disabled:opacity-50"
                      style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                    >
                      <Printer className="h-4 w-4" />
                      Latest salary slip
                    </button>
                  </div>

                  <div
                    className="mt-3 rounded-xl border px-3 py-2"
                    style={{ borderColor: "var(--border-muted)", backgroundColor: "var(--card-muted)" }}
                  >
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                      Current month salary
                    </p>

                    {entry.currentMonthSalary ? (
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span>
                          {monthLabel(entry.currentMonthSalary.month, entry.currentMonthSalary.year)}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "var(--green-success-text)" }}>
                          <Wallet className="h-4 w-4" />
                          {formatCurrency(entry.currentMonthSalary.amount)}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                        No salary recorded for this month yet.
                      </p>
                    )}
                  </div>

                  {salaryHistory.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                        Recent salary slips
                      </p>

                      <div className="space-y-2 max-h-56 overflow-auto pr-1">
                        {salaryHistory.slice(0, 12).map((record) => (
                          <div
                            key={record._id}
                            className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                            style={{ borderColor: "var(--border-muted)", backgroundColor: "var(--card-muted)" }}
                          >
                            <div>
                              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                                {monthLabel(record.month, record.year)}
                              </p>
                              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                Slip {record.slipNumber}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                Paid {formatCurrency(record.amount)}
                              </p>
                              <span
                                className="rounded-full px-2 py-1 text-xs font-semibold"
                                style={{ backgroundColor: "var(--card)", color: "var(--green-success-text)" }}
                              >
                                paid
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

