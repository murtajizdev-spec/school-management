"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { studentSchema } from "@/lib/validators/student";
import { z } from "zod";
import { CLASS_GROUPS, CLASS_NAMES } from "@/types/enums";

const studentFormSchema = studentSchema.extend({
  dob: z.string(),
  admissionDate: z.string().optional(),
  status: z.enum(["active", "left"]).optional(),
});

type FormValues = z.infer<typeof studentFormSchema>;

interface Props {
  mode: "create" | "edit";
  studentId?: string;
  initialData?: Partial<FormValues>;
  onSuccess?: () => void;
}

const buildDefaultValues = (): FormValues =>
  ({
    admissionNo: "",
    name: "",
    classGroup: "Science",
    className: "",
    dob: new Date().toISOString().split("T")[0],
    cellNo: "",
    bFormNo: "",
    fatherName: "",
    fatherCnic: "",
    fatherCellNo: "",
    admissionFee: 0,
    monthlyFee: 0,
    scholarshipPercent: 0,
    admissionDate: new Date().toISOString().split("T")[0],
    status: "active",
    notes: "",
  } as unknown as FormValues);

export const StudentForm = ({
  mode,
  initialData,
  studentId,
  onSuccess,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: buildDefaultValues(),
  });

  useEffect(() => {
    if (mode === "create" && !initialData) {
      reset(buildDefaultValues());
    }
  }, [initialData, mode, reset]);

  const classOptions = useMemo(() => CLASS_NAMES, []);

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        dob: initialData.dob
          ? new Date(initialData.dob as unknown as string)
              .toISOString()
              .split("T")[0]
          : new Date().toISOString().split("T")[0],
        admissionDate: initialData.admissionDate
          ? new Date(initialData.admissionDate as unknown as string)
              .toISOString()
              .split("T")[0]
          : new Date().toISOString().split("T")[0],
        className: initialData.className ?? "",
        scholarshipPercent: initialData.scholarshipPercent ?? 0,
      } as FormValues);
    }
  }, [initialData, reset]);

  const showNextActions = (message: string) => {
    toast.custom(
      (t) => (
        <div
          className="w-full max-w-xs rounded-xl border p-3 text-sm shadow-lg"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
          }}
        >
          <p className="font-semibold">{message}</p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Form cleared. Choose your next step.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded-lg px-3 py-1 text-xs font-semibold text-white shadow-sm transition"
              style={{ backgroundColor: "var(--accent)" }}
              onClick={() => {
                reset(buildDefaultValues());
                toast.dismiss(t.id);
              }}
            >
              Add another
            </button>
            <button
              type="button"
              className="rounded-lg border px-3 py-1 text-xs font-semibold transition"
              onClick={() => toast.dismiss(t.id)}
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
                backgroundColor: "var(--card-muted)",
              }}
            >
              Close
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      admissionFee: Number(values.admissionFee),
      monthlyFee: Number(values.monthlyFee),
      scholarshipPercent: Number(values.scholarshipPercent ?? 0),
    };

    const endpoint =
      mode === "create"
        ? "/api/students"
        : `/api/students/${studentId}`;

    const method = mode === "create" ? "POST" : "PATCH";

    const promise = fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to save student");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: mode === "create" ? "Saving student..." : "Updating...",
      success: mode === "create"
        ? "Student admitted successfully"
        : "Student updated",
      error: (err) => err.message,
    });

    try {
      await promise;
      onSuccess?.();
      reset(buildDefaultValues());
      if (mode === "edit") {
        showNextActions("Student updated");
      }
    } catch {
      // handled
    }
  };

  const [nextAdmissionNo, setNextAdmissionNo] = useState("");

  useEffect(() => {
    const fetchNextAdmission = async () => {
      if (mode === "edit") return;
      try {
        const res = await fetch("/api/students/next-admission");
        if (!res.ok) return;
        const data = await res.json();
        if (data.admissionNo) {
          setNextAdmissionNo(data.admissionNo);
          setValue("admissionNo", data.admissionNo);
        }
      } catch {
        // ignore
      }
    };
    fetchNextAdmission();
  }, [mode, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Admission number</label>
          <input
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("admissionNo")}
            placeholder={nextAdmissionNo || "MR-00001"}
            readOnly
            disabled={mode === "edit"}
          />
          {errors.admissionNo && (
            <p className="text-xs text-rose-400">{errors.admissionNo.message}</p>
          )}
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Student name</label>
          <input
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-rose-400">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Class / Section</label>
          <select
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("className")}
          >
            <option value="">Select class</option>
            {classOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.className && (
            <p className="text-xs text-rose-400">{errors.className.message}</p>
          )}
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Class group</label>
          <select
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("classGroup")}
          >
            {CLASS_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Date of birth</label>
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
            {...register("dob")}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Cell number</label>
          <input
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("cellNo")}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>B-Form no</label>
          <input
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("bFormNo")}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Father name</label>
          <input
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("fatherName")}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Father CNIC</label>
          <input
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("fatherCnic")}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Father cell</label>
          <input
            className="mt-1 w-full rounded-xl border px-4 py-2 transition-colors"
            style={{
              borderColor: "var(--form-input-border)",
              backgroundColor: "var(--form-input-bg)",
              color: "var(--form-input-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            {...register("fatherCellNo")}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Admission fee (PKR)</label>
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
            {...register("admissionFee", { valueAsNumber: true })}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Monthly fee (PKR)</label>
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
            {...register("monthlyFee", { valueAsNumber: true })}
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
            placeholder="0-100%"
            min={0}
            max={100}
          />
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary-muted)" }}>
            Set 0 to remove later. Discount applies on fee slips automatically.
          </p>
        </div>
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
          {...register("notes")}
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
        {mode === "create" ? "Admit student" : "Save changes"}
      </button>
    </form>
  );
};

