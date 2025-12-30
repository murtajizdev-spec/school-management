"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { AlertTriangle, DownloadCloud } from "lucide-react";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { OutstandingClasswiseDTO } from "@/types/models";
import { CLASS_NAMES } from "@/types/enums";

type Props = {
  month?: number;
  year?: number;
  title?: string;
};

export const OutstandingClasswise = ({ month, year, title }: Props) => {
  const [classNameFilter, setClassNameFilter] = useState<"all" | (typeof CLASS_NAMES)[number]>("all");
  const query = new URLSearchParams();
  if (month) query.set("month", String(month));
  if (year) query.set("year", String(year));
  if (classNameFilter !== "all") query.set("className", classNameFilter);
  const endpoint = `/api/students/outstanding${query.toString() ? `?${query.toString()}` : ""}`;

  const { data, isLoading, error } = useSWR<OutstandingClasswiseDTO>(endpoint);
  const subtitle = useMemo(
    () =>
      data?.month && data.year
        ? monthLabel(data.month, data.year)
        : month && year
          ? monthLabel(month, year)
          : "All months",
    [data?.month, data?.year, month, year]
  );

  const exportCsv = () => {
    if (!data) return;
    const rows: string[][] = [
      ["Class group", "Class", "Admission #", "Student", "Month", "Year", "Outstanding", "Monthly fee"],
    ];

    data.groups.forEach((group) => {
      group.students.forEach((student) => {
        rows.push([
          group.classGroup,
          group.className,
          student.admissionNo,
          student.name,
          String(student.month),
          String(student.year),
          String(student.outstanding),
          String(student.monthlyFee),
        ]);
      });
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "outstanding-classwise.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <p className="text-sm" style={{ color: "var(--red-error-text)" }}>
        Could not load outstanding class-wise list.
      </p>
    );
  }

  return (
    <div
      className="rounded-3xl border p-6 shadow-xl"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
        color: "var(--text-primary)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
            {title ?? "Outstanding students (class wise)"}
          </p>
          <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {subtitle}
          </h3>
          {data && (
            <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
              {data.totals.outstandingStudents} students · {formatCurrency(data.totals.outstandingAmount)} due
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <DownloadCloud className="h-4 w-4" />
            Export CSV
          </button>
          <select
            value={classNameFilter}
            onChange={(event) =>
              setClassNameFilter(
                event.target.value as "all" | (typeof CLASS_NAMES)[number]
              )
            }
            className="rounded-full border px-3 py-2 text-xs font-semibold"
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
          <span
            className="rounded-2xl p-3"
            style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}
          >
            <AlertTriangle className="h-5 w-5" style={{ color: "var(--icon-color-primary)" }} />
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3 max-h-[520px] overflow-y-auto pr-2">
        {isLoading && (
          <p className="text-sm" style={{ color: "var(--text-secondary-muted)" }}>
            Loading outstanding students...
          </p>
        )}
        {!isLoading &&
          data?.groups.map((group, idx) => (
            <motion.div
              key={`${group.classGroup}-${group.className}`}
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {group.classGroup} · {group.className}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
                    {group.students.length} students
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(group.outstandingAmount)}</p>
              </div>
              <div
                className="mt-3 space-y-2 text-xs max-h-52 overflow-y-auto pr-1"
                style={{ color: "var(--text-secondary-muted)" }}
              >
                {group.students.map((student) => (
                  <div key={`${student._id}-${student.month}-${student.year}`} className="flex items-center justify-between">
                    <span>
                      {student.name} ({student.admissionNo})
                    </span>
                    <span>
                      {monthLabel(student.month, student.year)} ·{" "}
                      <span style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(student.outstanding)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        {!isLoading && data && data.groups.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-secondary-muted)" }}>
            No outstanding balances found for the selected period.
          </p>
        )}
      </div>
    </div>
  );
};

