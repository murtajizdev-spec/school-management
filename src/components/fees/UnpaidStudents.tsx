"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { formatCurrency, monthLabel } from "@/lib/utils";

type UnpaidStudent = {
  _id: string;
  admissionNo: string;
  name: string;
  classGroup: string;
  className: string;
  monthlyFee: number;
  outstanding: number;
};

type ApiResponse = {
  month: number;
  year: number;
  unpaid: UnpaidStudent[];
  summary: {
    totalActive: number;
    paidCount: number;
    unpaidCount: number;
    paidAmount: number;
    unpaidAmount: number;
  };
};

type Props = {
  month?: number;
  year?: number;
  title?: string;
  scrollable?: boolean;
  maxHeight?: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to load unpaid students");
  }
  return res.json() as Promise<ApiResponse>;
};

export const UnpaidStudents = ({ month, year, title, scrollable = true, maxHeight = "max-h-[420px]" }: Props) => {
  const search = new URLSearchParams();
  if (month) search.set("month", String(month));
  if (year) search.set("year", String(year));
  const endpoint = `/api/students/unpaid${search.toString() ? `?${search.toString()}` : ""}`;

  const { data, error, isLoading } = useSWR<ApiResponse>(endpoint, fetcher, {
    revalidateOnFocus: false,
  });

  if (error) {
    return (
      <p className="text-sm" style={{ color: "var(--red-error-text)" }}>
        Could not load unpaid students.
      </p>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="h-12 animate-pulse rounded-2xl"
            style={{ backgroundColor: "var(--accent-muted)" }}
          />
        ))}
      </div>
    );
  }

  if (data.unpaid.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-secondary-muted)" }}>
        All active students are paid up for the selected period.
      </p>
    );
  }

  const scrollClass = scrollable ? `${maxHeight} overflow-y-auto pr-2` : "";

  const handlePrint = () => {
    if (!data) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const rows = data.unpaid
      .map(
        (student) =>
          `<tr>
            <td>${student.name}</td>
            <td>${student.admissionNo}</td>
            <td>${student.classGroup} - ${student.className}</td>
            <td>${monthLabel(student.month, student.year)}</td>
            <td style="text-align:right">${formatCurrency(student.outstanding)}</td>
            <td style="text-align:right">${formatCurrency(student.monthlyFee)}</td>
          </tr>`
      )
      .join("");
    printWindow.document.write(`
      <html>
        <head>
          <title>Outstanding students</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            h1 { font-size: 18px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; }
            th { background: #f5f5f5; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Outstanding students (${monthLabel(data.month, data.year)})</h1>
          <p>Total outstanding: ${formatCurrency(data.summary.unpaidAmount)} | Students: ${data.summary.unpaidCount}</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Admission #</th>
                <th>Class</th>
                <th>Month</th>
                <th>Outstanding</th>
                <th>Monthly fee</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className={`mt-4 space-y-3 ${scrollClass}`}>
      {title && (
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h4>
          <span className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
            {monthLabel(data.month, data.year)}
          </span>
          {data && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              Print list
            </button>
          )}
        </div>
      )}
      <div
        className="flex flex-wrap items-center gap-4 rounded-2xl border px-4 py-3 text-sm"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--card-muted)",
          color: "var(--text-primary)",
        }}
      >
        <div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Summary
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
            Active {data.summary.totalActive} · Paid {data.summary.paidCount} · Unpaid{" "}
            {data.summary.unpaidCount}
          </p>
        </div>
        <div className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
          <p>
            Paid amount{" "}
            <span style={{ color: "var(--text-primary)" }}>
              {formatCurrency(data.summary.paidAmount)}
            </span>
          </p>
          <p>
            Outstanding{" "}
            <span style={{ color: "var(--text-primary)" }}>
              {formatCurrency(data.summary.unpaidAmount)}
            </span>
          </p>
        </div>
      </div>

      {data.unpaid.map((student, index) => (
        <motion.div
          key={student.admissionNo}
          className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card-muted)",
            color: "var(--text-primary)",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {student.name} ({student.admissionNo})
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
              {student.classGroup} · {student.className}
            </p>
          </div>
          <div className="text-right text-xs" style={{ color: "var(--text-secondary-muted)" }}>
            <p>
              Outstanding{" "}
              <span style={{ color: "var(--text-primary)" }}>
                {formatCurrency(student.outstanding)}
              </span>
            </p>
            <p>Monthly fee {formatCurrency(student.monthlyFee)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};


