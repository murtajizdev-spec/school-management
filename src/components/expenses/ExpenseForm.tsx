"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { expenseSchema } from "@/lib/validators/expense";
import { z } from "zod";

const expenseFormSchema = expenseSchema.extend({
  incurredOn: z.string().optional(),
});

type FormValues = z.infer<typeof expenseFormSchema>;

interface Props {
  onSuccess?: () => void;
}

export const ExpenseForm = ({ onSuccess }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: "",
      category: "operations",
      amount: 0,
      incurredOn: new Date().toISOString().split("T")[0],
      notes: "",
    } as FormValues,
  });

  const onSubmit = async (values: FormValues) => {
    const promise = fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to save expense");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Saving expense...",
      success: "Expense saved",
      error: (err) => err.message,
    });

    try {
      await promise;
      reset();
      onSuccess?.();
    } catch {
      //
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
      <div>
        <label style={{ color: "var(--form-label-text)" }}>Title</label>
        <input
          className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
          style={{
            borderColor: "var(--form-input-border)",
            backgroundColor: "var(--form-input-bg)",
            color: "var(--form-input-text)",
          }}
          {...register("title")}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
        />
        {errors.title && (
          <p className="text-xs text-rose-400">{errors.title.message}</p>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Category</label>
          <select
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
          style={{
            borderColor: "var(--form-input-border)",
            backgroundColor: "var(--form-input-bg)",
            color: "var(--form-input-text)",
          }}
          {...register("category")}
          >
            <option value="teacher-salary">Teacher salary</option>
            <option value="operations">Operations</option>
            <option value="utilities">Utilities</option>
            <option value="other">Other</option>
          </select>
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
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
            {...register("amount", { valueAsNumber: true })}
          />
        </div>
      </div>
      <div>
        <label style={{ color: "var(--form-label-text)" }}>Date</label>
        <input
          type="date"
          className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
          style={{
            borderColor: "var(--form-input-border)",
            backgroundColor: "var(--form-input-bg)",
            color: "var(--form-input-text)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          {...register("incurredOn")}
        />
      </div>
      <div>
        <label style={{ color: "var(--form-label-text)" }}>Notes</label>
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
          {...register("notes")}
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
        Add expense
      </button>
    </form>
  );
};

