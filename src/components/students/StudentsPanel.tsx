"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  Printer,
  UserX,
  RefreshCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { StudentForm } from "./StudentForm";
import { AdmissionFormPreview } from "./AdmissionFormPreview";
import { formatCurrency } from "@/lib/utils";
import { StudentDTO } from "@/types/models";
import { useDashboardRefresh } from "@/hooks/useDashboardRefresh";
import { DashboardRefreshButton } from "@/components/dashboard/DashboardRefreshButton";
import { CLASS_NAMES } from "@/types/enums";

export const StudentsPanel = () => {
  const { data, mutate, isLoading } = useSWR<StudentDTO[]>("/api/students");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "left">(
    "all"
  );
  const [classFilter, setClassFilter] = useState<"all" | (typeof CLASS_NAMES)[number]>("all");
  const [editingStudent, setEditingStudent] = useState<StudentDTO | undefined>();
  const [previewStudent, setPreviewStudent] =
    useState<StudentDTO | undefined>();
  const { refreshDashboard } = useDashboardRefresh();
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editingStudent && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      toast.custom(
        (t) => (
          <div
            className="w-full max-w-xs rounded-xl border p-3 text-sm shadow-lg"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <p className="font-semibold">Editing student</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {editingStudent.name} · {editingStudent.admissionNo}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded-lg px-3 py-1 text-xs font-semibold text-white shadow-sm transition"
                style={{ backgroundColor: "var(--accent)" }}
                onClick={() => {
                  formRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                  toast.dismiss(t.id);
                }}
              >
                Jump to form
              </button>
              <button
                type="button"
                className="rounded-lg border px-3 py-1 text-xs font-semibold transition"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                onClick={() => toast.dismiss(t.id)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        { duration: 4500 }
      );
    }
  }, [editingStudent]);

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    return data.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.admissionNo.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true : student.status === statusFilter;
      const matchesClass =
        classFilter === "all" ? true : student.className === classFilter;
      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [data, search, statusFilter, classFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student? This action cannot be undone.")) return;
    const promise = fetch(`/api/students/${id}`, { method: "DELETE" }).then(
      async (res) => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.error ?? "Failed to delete");
        }
      }
    );
    toast.promise(promise, {
      loading: "Removing...",
      success: "Student deleted",
      error: (err) => err.message,
    });
    try {
      await promise;
      await mutate();
      await refreshDashboard(["/api/students", "/api/students?limit=5"]);
    } catch {
      //
    }
  };

  const handleMarkLeft = async (student: StudentDTO) => {
    const promise = fetch(`/api/students/${student._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "left" }),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error ?? "Failed to update");
      }
    });
    toast.promise(promise, {
      loading: "Marking as left...",
      success: "Student marked as left",
      error: (err) => err.message,
    });
    try {
      await promise;
      await mutate();
      await refreshDashboard(["/api/students", "/api/students?limit=5"]);
    } catch {
      //
    }
  };

  const stats = useMemo(() => {
    const total = data?.length ?? 0;
    const active =
      data?.filter((s) => s.status === "active").length ?? 0;
    const left = total - active;
    return { total, active, left };
  }, [data]);

  return (
    <div className="space-y-6">
      {previewStudent && (
        <AdmissionFormPreview
          student={previewStudent}
          onClose={() => setPreviewStudent(undefined)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
        <div
          className="rounded-3xl border p-6 shadow-xl"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
            color: "var(--text-primary)",
          }}
          ref={formRef}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--text-secondary)" }}
              >
                {editingStudent ? "Edit student" : "New admission"}
              </p>
              <h3
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {editingStudent ? editingStudent.name : "Admission form"}
              </h3>
            </div>
            {editingStudent && (
              <button
                onClick={() => setEditingStudent(undefined)}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <RefreshCcw className="h-3 w-3" />
                Reset form
              </button>
            )}
          </div>
          <div className="mt-6">
            <StudentForm
              mode={editingStudent ? "edit" : "create"}
              studentId={editingStudent?._id}
              initialData={editingStudent}
              onSuccess={async () => {
                await mutate();
                await refreshDashboard([
                  "/api/students",
                  "/api/students?limit=5",
                ]);
                setEditingStudent(undefined);
              }}
            />
          </div>
        </div>

        <div
          className="rounded-3xl border p-6 shadow-xl"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
            color: "var(--text-primary)",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--text-secondary)" }}
              >
                Student records
              </p>
              <h3
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Manage admissions
              </h3>
            </div>
            <div className="flex gap-2">
              {(["all", "active", "left"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className="rounded-full px-3 py-1 text-xs"
                  style={{
                    backgroundColor:
                      statusFilter === status ? "var(--accent-muted)" : "transparent",
                    color:
                      statusFilter === status
                        ? "var(--text-primary)"
                        : "var(--text-secondary-muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {status}
                </button>
              ))}
              <DashboardRefreshButton
                label="Refresh list"
                extraKeys={["/api/students", "/api/students?limit=5"]}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-secondary)" }}>
              Filter by class
            </span>
            <select
              value={classFilter}
              onChange={(event) =>
                setClassFilter(
                  event.target.value as "all" | (typeof CLASS_NAMES)[number]
                )
              }
              className="w-full max-w-xs rounded-full border px-3 py-2 text-sm"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
            >
              <option value="all">All classes</option>
              {CLASS_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div
            className="mt-4 flex flex-wrap gap-3 text-xs"
            style={{ color: "var(--text-secondary-muted)" }}
          >
            <span
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: "var(--accent-muted)" }}
            >
              Total {stats.total}
            </span>
            <span
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: "var(--accent-muted)", color: "var(--text-secondary)" }}
            >
              Active {stats.active}
            </span>
            <span
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: "var(--accent-muted)", color: "var(--red-error-text)" }}
            >
              Left {stats.left}
            </span>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-3 h-4 w-4"
                style={{ color: "var(--icon-color)" }}
              />
              <input
                placeholder="Search by name or admission no"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-full border py-2 pl-10 pr-4 text-sm focus:outline-none"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--card-muted)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <button
              onClick={() => mutate()}
              className="rounded-full border p-2"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <PlusCircle className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 space-y-3 max-h-[540px] overflow-y-auto pr-2">
            {isLoading && (
              <p className="text-sm text-[#ADD8E6]/70">Loading students...</p>
            )}
            {!isLoading &&
              filteredStudents.map((student) => (
                <motion.div
                  key={student._id}
                  className="rounded-2xl border border-[#4682B4]/20 bg-black/40 p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#FAF9F6]">
                        {student.name}
                      </p>
                      <p className="text-xs text-[#ADD8E6]/70">
                        {student.classGroup} · {student.className} ·{" "}
                        {student.admissionNo}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#ADD8E6]/70">
                      <span>Admission fee {formatCurrency(student.admissionFee)}</span>
                      <span>Monthly {formatCurrency(student.monthlyFee)}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#ADD8E6]/70">
                    <span className="rounded-full bg-[#4682B4]/20 px-3 py-1">
                      Father: {student.fatherName}
                    </span>
                    <span className="rounded-full bg-[#4682B4]/20 px-3 py-1">
                      Contact: {student.cellNo}
                    </span>
                    <span className="rounded-full bg-[#4682B4]/20 px-3 py-1">
                      Last fee:{" "}
                      {student.lastFeePaidOn
                        ? format(new Date(student.lastFeePaidOn), "MMM d")
                        : "Pending"}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-[#4682B4]/30 px-3 py-1 text-[#FAF9F6]"
                      onClick={() => setEditingStudent(student)}
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-[#4682B4]/30 px-3 py-1 text-[#FAF9F6]"
                      onClick={() => setPreviewStudent(student)}
                    >
                      <Printer className="h-4 w-4" />
                      Admission form
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-[#4682B4]/30 px-3 py-1 text-red-300"
                      onClick={() => handleDelete(student._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                    {student.status === "active" && (
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-[#4682B4]/30 px-3 py-1 text-amber-300"
                        onClick={() => handleMarkLeft(student)}
                      >
                        <UserX className="h-4 w-4" />
                        Mark left
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            {!isLoading && filteredStudents.length === 0 && (
              <p className="text-sm text-[#ADD8E6]/70">
                No students found. Adjust your filters or add a new admission.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

