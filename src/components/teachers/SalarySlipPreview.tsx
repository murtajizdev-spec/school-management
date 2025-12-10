"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { SalaryPaymentDTO } from "@/types/models";

interface Props {
  payment: SalaryPaymentDTO;
  onClose: () => void;
}

const buildPrintableSalarySlip = (
  payment: SalaryPaymentDTO,
  paidOn: Date
) => {
  const today = format(new Date(), "PPP");
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Salary Slip - ${payment.teacher?.name ?? ""}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #0f172a; padding: 32px; }
        .card { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 24px; padding: 32px; color: #0f172a; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
        .title { margin: 0; font-size: 28px; }
        .section { margin-top: 24px; }
        .section-title { font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
        .grid { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .box { flex: 1; min-width: 220px; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <p style="font-size:12px; letter-spacing:0.3em; text-transform:uppercase; color:#94a3b8; margin:0;">Salary Slip</p>
            <h1 class="title">Morning Roots</h1>
          </div>
          <div style="text-align:right; font-size:12px; color:#94a3b8;">
            <p style="margin:0;">Slip ${payment.slipNumber}</p>
            <p style="margin:0;">HR & Payroll · ${today}</p>
          </div>
        </div>
        <div class="section">
          <div class="grid">
            <div>
              <p class="section-title">Instructor</p>
              <p style="font-size:18px; margin:0;">${payment.teacher?.name ?? ""}</p>
              <p style="font-size:14px; color:#64748b; margin:4px 0 0;">CNIC ${payment.teacher?.cnic ?? ""}</p>
            </div>
            <div style="text-align:right;">
              <p class="section-title">Month</p>
              <p style="font-size:18px; margin:0;">${monthLabel(payment.month, payment.year)}</p>
            </div>
          </div>
        </div>
        <div class="section grid">
          <div class="box">
            <p class="section-title">Payment details</p>
            <p>Amount: ${formatCurrency(payment.amount)}</p>
            <p>Paid on: ${format(paidOn, "PPPpp")}</p>
            <p>Remarks: ${payment.remarks ?? "—"}</p>
          </div>
          <div class="box">
            <p class="section-title">Signature</p>
            <div style="margin-top:24px; border-bottom: 1px dashed #cbd5f5; height: 24px;"></div>
            <p style="font-size:12px; color:#94a3b8;">Authorized by</p>
          </div>
        </div>
      </div>
    </body>
  </html>`;
};

export const SalarySlipPreview = ({ payment, onClose }: Props) => {
  const defaultPaidOn = useMemo(() => new Date(), []);
  const paidOn = useMemo(
    () => (payment.paidOn ? new Date(payment.paidOn) : defaultPaidOn),
    [payment.paidOn, defaultPaidOn]
  );
  const printable = useMemo(
    () => buildPrintableSalarySlip(payment, paidOn),
    [payment, paidOn]
  );

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(printable);
    w.document.close();
    w.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/vision-logo.svg"
              alt="Morning Roots"
              width={48}
              height={48}
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Salary slip
              </p>
              <h3 className="text-xl font-semibold">
                {payment.teacher?.name ?? "Teacher"}
              </h3>
            </div>
          </div>
          <div className="space-x-2 text-sm">
            <button
              className="rounded-full bg-white/20 px-4 py-2"
              onClick={handlePrint}
            >
              Print
            </button>
            <button
              className="rounded-full border border-white/30 px-4 py-2"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
        <div
          className="mt-6 rounded-3xl bg-white p-8 text-slate-900 text-sm shadow-2xl"
        >
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Salary Slip
              </h1>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Slip {payment.slipNumber}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Morning Roots School</p>
              <p>HR & Payroll · {format(new Date(), "PPP")}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-400">Instructor</p>
              <p className="text-lg font-semibold text-slate-900">
                {payment.teacher?.name}
              </p>
              <p className="text-sm text-slate-500">
                CNIC {payment.teacher?.cnic}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-slate-400">Month</p>
              <p className="text-lg font-semibold text-slate-900">
                {monthLabel(payment.month, payment.year)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs uppercase text-slate-400">
                Payment details
              </p>
              <ul className="mt-2 space-y-1 text-slate-700">
                <li>Amount: {formatCurrency(payment.amount)}</li>
                <li>Paid on: {format(paidOn, "PPPpp")}</li>
                <li>Remarks: {payment.remarks ?? "—"}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 text-slate-700">
              <p className="text-xs uppercase text-slate-400">Signature</p>
              <div className="mt-6 h-10 border-b border-dashed border-slate-300" />
              <p className="text-xs text-slate-400">Authorized by</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

