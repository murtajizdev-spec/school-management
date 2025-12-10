"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { salaryPaymentSchema } from "@/lib/validators/salary";
import { z } from "zod";
import { SalaryPaymentDTO, TeacherDTO } from "@/types/models";

type FormValues = z.infer<typeof salaryPaymentSchema>;

interface Props {
  teachers: TeacherDTO[];
  onSuccess: (record: SalaryPaymentDTO) => void;
}

export const SalaryPaymentForm = ({ teachers, onSuccess }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(salaryPaymentSchema),
    defaultValues: {
      teacherId: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: 0,
      remarks: "",
    } as FormValues,
  });

  const onSubmit = async (values: FormValues) => {
    const teacher = teachers.find((item) => item._id === values.teacherId);
    const payload = {
      ...values,
      amount: values.amount || teacher?.salary || 0,
    };

    const promise = fetch("/api/salaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to record salary");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Recording salary...",
      success: "Salary slip generated",
      error: (err) => err.message,
    });

    try {
      const result = await promise;
      reset();
      onSuccess(result);
    } catch {
      //
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
      <div>
        <label style={{ color: "var(--form-label-text)" }}>Teacher</label>
        <select
          className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
          style={{
            borderColor: "var(--form-input-border)",
            backgroundColor: "var(--form-input-bg)",
            color: "var(--form-input-text)",
          }}
          {...register("teacherId")}
        >
          <option value="">Select teacher</option>
          {teachers.map((teacher) => (
            <option key={teacher._id} value={teacher._id}>
              {teacher.name} ({teacher.salary.toLocaleString()} PKR)
            </option>
          ))}
        </select>
        {errors.teacherId && (
          <p className="text-xs" style={{ color: "var(--red-error-text)" }}>
            {errors.teacherId.message}
          </p>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
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
            {...register("year", { valueAsNumber: true })}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Amount</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            {...register("amount", { valueAsNumber: true })}
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
          {...register("remarks")}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
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
        Pay salary
      </button>
    </form>
  );
};

