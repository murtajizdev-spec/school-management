"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { feePaymentSchema } from "@/lib/validators/fee";
import { z } from "zod";
import { FeeRecordDTO, StudentDTO } from "@/types/models";
import { SearchableStudentSelect } from "./SearchableStudentSelect";

type FormValues = z.input<typeof feePaymentSchema>;

interface Props {
  students: StudentDTO[];
  onSuccess: (record: FeeRecordDTO) => void;
}

const buildDefaults = (): FormValues =>
  ({
    studentId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amountDue: 0,
    amountPaid: 0,
    method: "cash",
    admissionFeePortion: 0,
    scholarshipPercent: 0,
    scholarshipAmount: 0,
    remarks: "",
  } as FormValues);

export const FeePaymentForm = ({ students, onSuccess }: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(feePaymentSchema),
    defaultValues: buildDefaults(),
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedStudentId = watch("studentId");
  const scholarshipPercent = watch("scholarshipPercent") ?? 0;
  const scholarshipAmount = watch("scholarshipAmount") ?? 0;
  const month = watch("month");
  const year = watch("year");

  const [existingRecord, setExistingRecord] = useState<FeeRecordDTO | null>(null);
  const [existingLoading, setExistingLoading] = useState(false);
  const outstanding = useMemo(
    () =>
      existingRecord
        ? Math.max(existingRecord.amountDue - existingRecord.amountPaid, 0)
        : null,
    [existingRecord]
  );

  useEffect(() => {
    if (!selectedStudentId) return;
    const student = students.find(
      (item) => item._id === selectedStudentId
    );
    if (student) {
      const percent = Math.min(Math.max(student.scholarshipPercent ?? 0, 0), 100);
      const scholarshipAmt = Math.max((student.monthlyFee * percent) / 100, 0);
      const netDue = Math.max(student.monthlyFee - scholarshipAmt, 0);
      setValue("scholarshipPercent", percent);
      setValue("scholarshipAmount", scholarshipAmt);
      setValue("amountDue", netDue);
      setValue("amountPaid", netDue);
    }
  }, [selectedStudentId, setValue, students]);

  useEffect(() => {
    const fetchExisting = async () => {
      if (!selectedStudentId || !month || !year) {
        setExistingRecord(null);
        return;
      }
      setExistingLoading(true);
      try {
        const res = await fetch(
          `/api/fees?studentId=${selectedStudentId}&month=${month}&year=${year}`
        );
        if (!res.ok) {
          setExistingRecord(null);
          return;
        }
        const data: FeeRecordDTO[] = await res.json();
        const record = data?.[0];
        if (!record) {
          setExistingRecord(null);
          return;
        }
        setExistingRecord(record);
        const outstanding = Math.max(record.amountDue - record.amountPaid, 0);
        const fallbackPercent = record.student?.scholarshipPercent ?? 0;
        const percent = record.scholarshipPercent ?? fallbackPercent;
        const percentClamped = Math.min(Math.max(percent, 0), 100);
        const baseMonthly = record.student?.monthlyFee ?? record.amountDue;
        const scholarshipAmt =
          record.scholarshipAmount ??
          Math.max((baseMonthly * percentClamped) / 100, 0);
    setValue("amountDue", record.amountDue);
    setValue("amountPaid", outstanding > 0 ? outstanding : 0);
        setValue("scholarshipPercent", percentClamped);
        setValue("scholarshipAmount", scholarshipAmt);
      } catch {
        setExistingRecord(null);
      } finally {
        setExistingLoading(false);
      }
    };
    fetchExisting();
  }, [month, year, selectedStudentId, setValue]);

  useEffect(() => {
    const student = students.find((item) => item._id === selectedStudentId);
    if (!student) return;
    const percent = Math.min(Math.max(scholarshipPercent || 0, 0), 100);
    const scholarshipAmt = Math.max((student.monthlyFee * percent) / 100, 0);
    const netDue = Math.max(student.monthlyFee - scholarshipAmt, 0);
    setValue("scholarshipAmount", scholarshipAmt);
    setValue("amountDue", netDue);
    setValue("amountPaid", netDue);
  }, [scholarshipPercent, selectedStudentId, setValue, students]);

  const onSubmit = async (values: FormValues) => {
    if (outstanding !== null && outstanding <= 0) {
      toast("Fee already paid for this month/year");
      return;
    }

    const payload = { ...values };
    const promise = fetch("/api/fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error ?? "Failed to record payment");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Recording payment...",
      success: "Fee saved and slip generated",
      error: (err) => err.message,
    });

    try {
      const record = await promise;
      onSuccess(record);
      reset(buildDefaults());
      setExistingRecord(null);
      setValue("studentId", "");
    } catch {
      //
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
      {existingRecord && (
        <div
          className="rounded-xl border px-4 py-3 text-xs"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card-muted)",
            color: "var(--text-primary)",
          }}
        >
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Already paid for {month}/{year}: {existingRecord.status}
          </p>
          <p style={{ color: "var(--text-secondary-muted)" }}>
            Slip {existingRecord.slipNumber} · Paid {existingRecord.amountPaid} /{" "}
            {existingRecord.amountDue}{" "}
            {existingRecord.paidOn ? `on ${new Date(existingRecord.paidOn).toDateString()}` : ""}
          </p>
          <p style={{ color: "var(--text-secondary-muted)" }}>
            Outstanding: {Math.max(existingRecord.amountDue - existingRecord.amountPaid, 0)}
          </p>
        </div>
      )}
      {existingLoading && (
        <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
          Checking existing payment...
        </p>
      )}
      <SearchableStudentSelect
        students={students}
        value={selectedStudentId || ""}
        onChange={(studentId) => setValue("studentId", studentId)}
      />
      {errors.studentId && (
        <p className="text-xs text-rose-400">{errors.studentId.message}</p>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Month</label>
          <input
            type="number"
            min={1}
            max={12}
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("month", { valueAsNumber: true })}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Year</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("year", { valueAsNumber: true })}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Amount due</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("amountDue", { valueAsNumber: true })}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Amount paid</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("amountPaid", { valueAsNumber: true })}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Admission fee portion</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("admissionFeePortion", { valueAsNumber: true })}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>
            Scholarship (%)
          </label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("scholarshipPercent", { valueAsNumber: true })}
            min={0}
            max={100}
            placeholder="0-100%"
          />
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary-muted)" }}>
            Prefilled from admission form. Set to 0 if scholarship removed.
          </p>
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>
            Scholarship amount (auto)
          </label>
          <input
            type="number"
            readOnly
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            value={Number(scholarshipAmount) || 0}
          />
        </div>
      </div>
      <div>
        <label style={{ color: "var(--form-label-text)" }}>Remarks</label>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
          style={{
            borderColor: "var(--form-input-border)",
            backgroundColor: "var(--form-input-bg)",
            color: "var(--form-input-text)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          {...register("remarks")}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          backgroundColor: "var(--form-button-bg)",
          color: "var(--form-button-text)",
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.backgroundColor = "var(--form-button-hover)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--form-button-bg)";
        }}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Mark as paid & generate slip
      </button>
    </form>
  );
};

