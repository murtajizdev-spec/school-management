"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { FeeRecordDTO } from "@/types/models";

interface Props {
  record: FeeRecordDTO;
  onClose: () => void;
}

const deriveScholarship = (record: FeeRecordDTO) => {
  const percent =
    record.scholarshipPercent ??
    record.student?.scholarshipPercent ??
    0;
  const baseMonthly = record.student?.monthlyFee ?? record.amountDue;
  const amount =
    record.scholarshipAmount ??
    Math.max((baseMonthly * Math.min(Math.max(percent, 0), 100)) / 100, 0);
  return {
    percent: Math.min(Math.max(percent, 0), 100),
    amount,
  };
};

const buildPrintableFeeSlip = (record: FeeRecordDTO, paidOn?: Date | null) => {
  const today = format(new Date(), "PPP");
  const paidOnText = paidOn ? format(paidOn, "PPPpp") : "Not paid yet";
  const { percent: scholarshipPercent, amount: scholarshipAmount } = deriveScholarship(record);
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Fee Slip - ${record.student?.name ?? ""}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #0f172a; padding: 32px; }
        .card { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 24px; padding: 32px; color: #0f172a; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
        .title { margin: 0; font-size: 28px; }
        .section { margin-top: 24px; }
        .section-title { font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
        .grid { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .box { flex: 1; min-width: 220px; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; font-size: 14px; }
        .amount-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <p style="font-size:12px; letter-spacing:0.3em; text-transform:uppercase; color:#94a3b8; margin:0;">Fee Slip</p>
            <h1 class="title">Morning Roots</h1>
          </div>
          <div style="text-align:right; font-size:12px; color:#94a3b8;">
            <p style="margin:0;">Slip ${record.slipNumber}</p>
            <p style="margin:0;">Billing desk · ${today}</p>
          </div>
        </div>
        <div class="section">
          <div class="grid">
            <div>
              <p class="section-title">Student</p>
              <p style="font-size:18px; margin:0;">${record.student?.name ?? ""}</p>
              <p style="font-size:14px; color:#64748b; margin:4px 0 0;">
                ${record.student?.classGroup ?? ""} · ${record.student?.className ?? ""}
              </p>
            </div>
            <div style="text-align:right;">
              <p class="section-title">Admission number</p>
              <p style="font-size:18px; margin:0;">${record.student?.admissionNo ?? ""}</p>
            </div>
          </div>
        </div>
        <div class="section grid">
          <div class="box">
            <p class="section-title">Payment details</p>
            <p>Month: ${monthLabel(record.month, record.year)}</p>
            <p>Method: ${record.method}</p>
            <p>Status: ${record.status}</p>
            <p>Paid on: ${paidOnText}</p>
          </div>
          <div class="box">
            <p class="section-title">Amounts</p>
            <div class="amount-row">
              <span>Amount due</span>
              <strong>${formatCurrency(record.amountDue)}</strong>
            </div>
            ${
              scholarshipAmount > 0
                ? `<div class="amount-row" style="font-size:13px; color:#64748b;">
                    <span>Scholarship (${scholarshipPercent}%)</span>
                    <span>- ${formatCurrency(scholarshipAmount)}</span>
                  </div>`
                : ""
            }
            <div class="amount-row">
              <span>Amount paid</span>
              <strong style="color:#059669;">${formatCurrency(record.amountPaid)}</strong>
            </div>
            ${
              record.admissionFeePortion
                ? `<div class="amount-row" style="font-size:13px; color:#64748b;">
                    <span>Admission portion</span>
                    <span>${formatCurrency(record.admissionFeePortion)}</span>
                  </div>`
                : ""
            }
          </div>
        </div>
      </div>
    </body>
  </html>`;
};

export const FeeSlipPreview = ({ record, onClose }: Props) => {
  const paidOn = useMemo(
    () => (record.paidOn ? new Date(record.paidOn) : null),
    [record.paidOn]
  );
  const { percent: scholarshipPercent, amount: scholarshipAmount } = useMemo(
    () => deriveScholarship(record),
    [record]
  );
  const printable = useMemo(
    () => buildPrintableFeeSlip(record, paidOn),
    [record, paidOn]
  );

  const handlePrint = () => {
    const popup = window.open("", "_blank");
    if (!popup) return;
    popup.document.write(printable);
    popup.document.close();
    popup.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3">
            <Image
              src="/vision-logo.svg"
              alt="Morning Roots"
              width={48}
              height={48}
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                Fee slip
              </p>
              <p className="text-xl font-semibold">Morning Roots</p>
            </div>
          </div>
          <div className="space-x-2 text-sm">
            <button
              onClick={handlePrint}
              className="rounded-full bg-white/20 px-4 py-2"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-white/40 px-4 py-2"
            >
              Close
            </button>
          </div>
        </div>

        <div
          className="mt-6 rounded-3xl bg-white p-8 text-sm text-slate-900 shadow-2xl"
        >
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Fee Slip
              </h1>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Slip {record.slipNumber}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Morning Roots School</p>
              <p>Billing desk · {format(new Date(), "PPP")}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-400">Student</p>
              <p className="text-lg font-semibold text-slate-900">
                {record.student?.name}
              </p>
              <p className="text-sm text-slate-500">
                {record.student?.classGroup} · {record.student?.className}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-slate-400">
                Admission number
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {record.student?.admissionNo}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs uppercase text-slate-400">
                Payment details
              </p>
              <ul className="mt-2 space-y-1 text-slate-700">
                <li>Month: {monthLabel(record.month, record.year)}</li>
                <li>Method: {record.method}</li>
                <li>Status: {record.status}</li>
              <li>Paid on: {paidOn ? format(paidOn, "PPPpp") : "Not paid yet"}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 text-slate-700">
              <p className="text-xs uppercase text-slate-400">Amounts</p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Amount due</span>
                  <span className="font-semibold">
                    {formatCurrency(record.amountDue)}
                  </span>
                </div>
                {scholarshipAmount > 0 && (
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Scholarship ({scholarshipPercent}%)</span>
                    <span>- {formatCurrency(scholarshipAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Amount paid</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(record.amountPaid)}
                  </span>
                </div>
                {record.admissionFeePortion ? (
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Admission portion</span>
                    <span>
                      {formatCurrency(record.admissionFeePortion)}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

