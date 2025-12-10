"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Search,
  Edit3,
  Trash2,
  UserX,
  ReceiptText,
} from "lucide-react";
import toast from "react-hot-toast";
import { TeacherForm } from "./TeacherForm";
import { SalaryPaymentForm } from "./SalaryPaymentForm";
import { SalarySlipPreview } from "./SalarySlipPreview";
import { formatCurrency } from "@/lib/utils";
import { SalaryPaymentDTO, TeacherDTO } from "@/types/models";
import { useDashboardRefresh } from "@/hooks/useDashboardRefresh";

export const TeacherManagementPanel = () => {
  const { data: teachers, mutate } = useSWR<TeacherDTO[]>("/api/teachers");
  const { data: salaries, mutate: mutateSalaries } =
    useSWR<SalaryPaymentDTO[]>("/api/salaries");
  const [search, setSearch] = useState("");
  const [editingTeacher, setEditingTeacher] = useState<TeacherDTO | undefined>();
  const [slip, setSlip] = useState<SalaryPaymentDTO | undefined>();
  const { refreshDashboard } = useDashboardRefresh();

  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];
    return teachers.filter((teacher) =>
      [teacher.name, teacher.cnic, ...(teacher.subjects ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [teachers, search]);

  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const total = teachers?.length ?? 0;
    const active =
      teachers?.filter((teacher) => teacher.status === "active").length ??
      0;
    const payroll =
      teachers
        ?.filter((teacher) => teacher.status === "active")
        .reduce((sum: number, teacher) => sum + teacher.salary, 0) ?? 0;
    const salaryPaidThisMonth =
      salaries
        ?.filter(
          (entry) => entry.month === currentMonth && entry.year === currentYear
        )
        .reduce((sum: number, entry) => sum + entry.amount, 0) ?? 0;
    return { total, active, payroll, salaryPaidThisMonth };
  }, [teachers, salaries]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;
    const promise = fetch(`/api/teachers/${id}`, { method: "DELETE" }).then(
      async (res) => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.error ?? "Failed to delete");
        }
      }
    );
    toast.promise(promise, {
      loading: "Removing...",
      success: "Teacher deleted",
      error: (err) => err.message,
    });
    try {
      await promise;
      mutate();
    } catch {
      //
    }
  };

  const handleMarkLeft = async (teacher: TeacherDTO) => {
    const promise = fetch(`/api/teachers/${teacher._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: teacher.status === "left" ? "active" : "left",
        leftOn: teacher.status === "left" ? undefined : new Date().toISOString(),
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error ?? "Failed to update");
      }
    });
    toast.promise(promise, {
      loading: "Updating status...",
      success: "Status updated",
      error: (err) => err.message,
    });
    try {
      await promise;
      mutate();
    } catch {
      //
    }
  };

  const handleDeleteSalarySlip = async (paymentId: string) => {
    if (!confirm("Delete this salary slip? This will also remove its expense.")) {
      return;
    }

    const promise = fetch(`/api/salaries/${paymentId}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error ?? "Failed to delete slip");
      }
    });

    toast.promise(promise, {
      loading: "Deleting slip...",
      success: "Salary slip deleted",
      error: (err) => err.message,
    });

    try {
      await promise;
      await Promise.all([
        mutateSalaries(),
        refreshDashboard(["/api/expenses", "/api/salaries"]),
      ]);
    } catch {
      //
    }
  };

  return (
    <div className="space-y-6">
      {slip && (
        <SalarySlipPreview payment={slip} onClose={() => setSlip(undefined)} />
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <div
          className="rounded-3xl border p-6 shadow-xl"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
            color: "var(--text-primary)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="rounded-2xl p-3"
              style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}
            >
              <GraduationCap className="h-5 w-5" style={{ color: "var(--icon-color-primary)" }} />
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--text-secondary)" }}
              >
                Faculty
              </p>
              <h3
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {editingTeacher ? "Edit teacher" : "Add instructor"}
              </h3>
            </div>
          </div>
          <div className="mt-6">
            <TeacherForm
              mode={editingTeacher ? "edit" : "create"}
              teacherId={editingTeacher?._id}
              initialData={
                editingTeacher
                  ? {
                      ...editingTeacher,
                      subjects: Array.isArray(editingTeacher.subjects)
                        ? editingTeacher.subjects.join(", ")
                        : editingTeacher.subjects ?? "",
                      joinedOn: editingTeacher.joinedOn
                        ? new Date(editingTeacher.joinedOn).toISOString().split("T")[0]
                        : undefined,
                    }
                  : undefined
              }
              onSuccess={() => {
                mutate();
                setEditingTeacher(undefined);
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
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--text-secondary)" }}
              >
                Payroll
              </p>
              <h3
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Salary disbursement
              </h3>
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary-muted)" }}
              >
                Total monthly payroll {formatCurrency(summary.payroll)}
              </p>
            </div>
            <div
              className="text-right text-xs"
              style={{ color: "var(--text-secondary-muted)" }}
            >
              <p>Paid this month</p>
              <p style={{ color: "var(--text-primary)" }}>
                {formatCurrency(summary.salaryPaidThisMonth)}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <SalaryPaymentForm
              teachers={teachers ?? []}
              onSuccess={(payment) => {
                setSlip(payment);
                mutateSalaries();
              }}
            />
          </div>
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
              Teachers list
            </p>
            <h3
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {summary.active} active / {summary.total} total
            </h3>
          </div>
          <div className="relative w-full max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-3 h-4 w-4"
              style={{ color: "var(--icon-color)" }}
            />
            <input
              placeholder="Search by name, CNIC or subject"
              className="w-full rounded-full border py-2 pl-10 pr-4 text-sm focus:outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 space-y-3 max-h-[520px] overflow-y-auto pr-2">
          {(filteredTeachers ?? []).map((teacher) => (
            <motion.div
              key={teacher._id}
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {teacher.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
                    {teacher.qualification} · {teacher.experience}
                  </p>
                </div>
                <div
                  className="text-right text-xs"
                  style={{ color: "var(--text-secondary-muted)" }}
                >
                  <p>Salary {formatCurrency(teacher.salary)}</p>
                  <p>Status {teacher.status}</p>
                </div>
              </div>
              <div
                className="mt-3 flex flex-wrap items-center gap-2 text-xs"
                style={{ color: "var(--text-secondary-muted)" }}
              >
                {(teacher.subjects ?? []).map((subject: string) => (
                  <span
                    key={subject}
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: "var(--accent-muted)" }}
                  >
                    {subject}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <button
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onClick={() => setEditingTeacher(teacher)}
                >
                  <Edit3 className="h-4 w-4" style={{ color: "var(--icon-color-primary)" }} />
                  Edit
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--red-error-text)",
                  }}
                  onClick={() => handleDelete(teacher._id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                  onClick={() => handleMarkLeft(teacher)}
                >
                  <UserX className="h-4 w-4" />
                  {teacher.status === "left" ? "Mark active" : "Mark left"}
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onClick={() => {
                    const payment = salaries?.find(
                      (entry) => entry.teacher?._id === teacher._id
                    );
                    if (payment) {
                      setSlip(payment);
                    } else {
                      toast("No salary slip yet. Record a salary first.");
                    }
                  }}
                >
                  <ReceiptText className="h-4 w-4" style={{ color: "var(--icon-color-primary)" }} />
                  Last salary slip
                </button>
                {salaries?.some(
                  (entry) => entry.teacher?._id === teacher._id
                ) && (
                  <button
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--red-error-text)",
                    }}
                    onClick={() => {
                      const payment = salaries?.find(
                        (entry) => entry.teacher?._id === teacher._id
                      );
                      if (payment) {
                        handleDeleteSalarySlip(payment._id);
                      } else {
                        toast("No salary slip to delete.");
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete slip
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {filteredTeachers?.length === 0 && (
            <p className="text-sm text-[#ADD8E6]">
              No teachers yet. Add your first instructor on the left.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

