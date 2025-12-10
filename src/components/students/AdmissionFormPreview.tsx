"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { StudentDTO } from "@/types/models";

interface Props {
  student: StudentDTO;
  onClose: () => void;
}

const safeDate = (value?: string) => {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not set" : format(date, "PPP");
};

const safeDateTime = (value?: string | Date) => {
  if (!value) return "Not set";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "Not set" : format(date, "PPPpp");
};

const buildPrintableAdmission = (student: StudentDTO) => {
  const today = format(new Date(), "PPPpp");
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Admission Form - ${student.name}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #0f172a; padding: 32px; }
        .card { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 24px; padding: 32px; color: #0f172a; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
        .title { margin: 0; font-size: 28px; }
        .section { margin-top: 24px; }
        .section-title { font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
        .info-grid { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .info-box { flex: 1; min-width: 220px; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; }
        .info-box ul { list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.6; }
        .notes { background: #f8fafc; border-radius: 16px; padding: 16px; font-size: 14px; color: #475569; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <p style="font-size:12px; letter-spacing:0.3em; text-transform:uppercase; color:#94a3b8; margin:0;">Admission form</p>
            <h1 class="title">Morning Roots</h1>
          </div>
          <div style="text-align:right; font-size:12px; color:#94a3b8;">
            <p style="margin:0;">Morning Roots School</p>
            <p style="margin:0;">Generated ${today}</p>
          </div>
        </div>
        <div class="section">
          <div class="info-grid">
            <div>
              <p class="section-title">Student</p>
              <p style="font-size:18px; margin:0;">${student.name}</p>
              <p style="font-size:14px; color:#64748b; margin:4px 0 0;">
                ${student.classGroup} · ${student.className}
              </p>
            </div>
            <div style="text-align:right;">
              <p class="section-title">Admission no.</p>
              <p style="font-size:18px; margin:0;">${student.admissionNo}</p>
            </div>
          </div>
        </div>
        <div class="section info-grid">
          <div class="info-box">
            <p class="section-title">Personal</p>
            <ul>
              <li>DOB: ${safeDate(student.dob as any)}</li>
              <li>Contact: ${student.cellNo}</li>
              <li>B-Form: ${student.bFormNo}</li>
            </ul>
          </div>
          <div class="info-box">
            <p class="section-title">Guardian</p>
            <ul>
              <li>Name: ${student.fatherName}</li>
              <li>CNIC: ${student.fatherCnic}</li>
              <li>Cell: ${student.fatherCellNo}</li>
            </ul>
          </div>
        </div>
        <div class="section info-grid">
          <div class="info-box">
            <p class="section-title">Academic</p>
            <ul>
              <li>Class: ${student.className}</li>
              <li>Group: ${student.classGroup}</li>
              <li>Status: ${student.status}</li>
            </ul>
          </div>
          <div class="info-box">
            <p class="section-title">Fee summary</p>
            <ul>
              <li>Admission fee: PKR ${student.admissionFee.toLocaleString()}</li>
              <li>Monthly fee: PKR ${student.monthlyFee.toLocaleString()}</li>
              <li>Admission date: ${safeDate(student.admissionDate as any)}</li>
            </ul>
          </div>
        </div>
        ${
          student.notes
            ? `<div class="section notes">
                 <p class="section-title" style="margin-bottom:4px;">Notes</p>
                 ${student.notes}
               </div>`
            : ""
        }
      </div>
    </body>
  </html>`;
};

export const AdmissionFormPreview = ({ student, onClose }: Props) => {
  const printableHtml = useMemo(
    () => buildPrintableAdmission(student),
    [student]
  );

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(printableHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12">
              <Image
                src="/vision-logo.svg"
                alt="Morning Roots Logo"
                width={48}
                height={48}
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                Admission record
              </p>
              <h3 className="text-xl font-semibold">Morning Roots</h3>
              <p className="text-[11px] text-slate-200">
                Generated {safeDateTime(new Date())}
              </p>
            </div>
          </div>
          <div className="space-x-2">
            <button
              className="rounded-full bg-white/10 px-4 py-2 text-sm text-white"
              onClick={handlePrint}
            >
              Print form
            </button>
            <button
              className="rounded-full border border-white/40 px-4 py-2 text-sm text-white"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div
          className="mt-6 rounded-3xl bg-white p-8 text-slate-900 shadow-2xl"
        >
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-400">Student</p>
              <p className="text-lg font-semibold text-slate-900">
                {student.name}
              </p>
              <p className="text-sm text-slate-500">
                {student.classGroup} · {student.className}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-slate-400">
                Admission number
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {student.admissionNo}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 text-sm md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs uppercase text-slate-400">Personal data</p>
              <ul className="mt-2 space-y-1">
                <li>
                  <span className="text-slate-500">DOB:</span>{" "}
                  {safeDate(student.dob as any)}
                </li>
                <li>
                  <span className="text-slate-500">Contact:</span>{" "}
                  {student.cellNo}
                </li>
                <li>
                  <span className="text-slate-500">B-Form:</span>{" "}
                  {student.bFormNo}
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs uppercase text-slate-400">Guardian data</p>
              <ul className="mt-2 space-y-1">
                <li>
                  <span className="text-slate-500">Name:</span>{" "}
                  {student.fatherName}
                </li>
                <li>
                  <span className="text-slate-500">CNIC:</span>{" "}
                  {student.fatherCnic}
                </li>
                <li>
                  <span className="text-slate-500">Cell:</span>{" "}
                  {student.fatherCellNo}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-4 text-sm md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs uppercase text-slate-400">Academic</p>
              <ul className="mt-2 space-y-1">
                <li>
                  <span className="text-slate-500">Class:</span>{" "}
                  {student.className}
                </li>
                <li>
                  <span className="text-slate-500">Class group:</span>{" "}
                  {student.classGroup}
                </li>
                <li>
                  <span className="text-slate-500">Status:</span>{" "}
                  {student.status}
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs uppercase text-slate-400">Fee summary</p>
              <ul className="mt-2 space-y-1">
                <li>
                  <span className="text-slate-500">Admission fee:</span>{" "}
                  PKR {student.admissionFee.toLocaleString()}
                </li>
                <li>
                  <span className="text-slate-500">Monthly fee:</span>{" "}
                  PKR {student.monthlyFee.toLocaleString()}
                </li>
                <li>
                  <span className="text-slate-500">Admission date:</span>{" "}
                  {safeDate(student.admissionDate as any)}
                </li>
              </ul>
            </div>
          </div>

          {student.notes && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="text-xs uppercase text-slate-400">Notes</p>
              <p className="mt-2 whitespace-pre-line">{student.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

