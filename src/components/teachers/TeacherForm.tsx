"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { teacherSchema } from "@/lib/validators/teacher";
import { z } from "zod";

const teacherFormSchema = teacherSchema.extend({
  joinedOn: z.string().optional(),
  subjects: z.string().optional(),
  status: z.enum(["active", "left"]).optional(),
});

type FormValues = z.infer<typeof teacherFormSchema>;

interface Props {
  mode: "create" | "edit";
  teacherId?: string;
  initialData?: Partial<FormValues>;
  onSuccess?: () => void;
}

export const TeacherForm = ({
  mode,
  teacherId,
  initialData,
  onSuccess,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      cnic: "",
      qualification: "",
      experience: "",
      salary: 0,
      subjects: "",
      status: "active",
    } as FormValues,
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        subjects: Array.isArray(initialData.subjects)
          ? initialData.subjects.join(", ")
          : initialData.subjects ?? "",
      } as FormValues);
    }
  }, [initialData, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      subjects: typeof values.subjects === "string"
        ? values.subjects.split(",").map((subject) => subject.trim())
        : values.subjects,
    };

    const endpoint =
      mode === "create" ? "/api/teachers" : `/api/teachers/${teacherId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const promise = fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to save teacher");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: mode === "create" ? "Saving teacher..." : "Updating...",
      success: mode === "create"
        ? "Teacher added successfully"
        : "Teacher updated",
      error: (err) => err.message,
    });

    try {
      await promise;
      onSuccess?.();
      if (mode === "create") {
        reset();
      }
    } catch {
      //
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Name</label>
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
          <label style={{ color: "var(--form-label-text)" }}>CNIC</label>
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
            {...register("cnic")}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Qualification</label>
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
            {...register("qualification")}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Experience</label>
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
            {...register("experience")}
            placeholder="5 years, 2 institutions..."
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Salary (PKR)</label>
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
            {...register("salary", { valueAsNumber: true })}
          />
        </div>
        <div>
          <label style={{ color: "var(--form-label-text)" }}>Subjects (comma separated)</label>
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
            {...register("subjects" as const)}
            placeholder="Physics, Chemistry"
          />
        </div>
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
        {mode === "create" ? "Add teacher" : "Save changes"}
      </button>
    </form>
  );
};

