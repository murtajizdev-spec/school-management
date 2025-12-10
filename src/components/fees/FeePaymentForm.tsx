"use client";

import { useEffect } from "react";
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

export const FeePaymentForm = ({ students, onSuccess }: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(feePaymentSchema),
    defaultValues: {
      studentId: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amountDue: 0,
      amountPaid: 0,
      method: "cash",
      admissionFeePortion: 0,
      remarks: "",
    } as FormValues,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedStudentId = watch("studentId");

  useEffect(() => {
    if (!selectedStudentId) return;
    const student = students.find(
      (item) => item._id === selectedStudentId
    );
    if (student) {
      setValue("amountDue", student.monthlyFee);
      setValue("amountPaid", student.monthlyFee);
    }
  }, [selectedStudentId, setValue, students]);

  const onSubmit = async (values: FormValues) => {
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
    } catch {
      //
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
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

