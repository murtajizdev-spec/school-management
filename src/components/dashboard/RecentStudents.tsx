"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { format } from "date-fns";
import { StudentDTO } from "@/types/models";

export const RecentStudents = () => {
  const { data } = useSWR<StudentDTO[]>("/api/students?limit=5");

  return (
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
          className="rounded-full p-3"
          style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}
        >
          <Users className="h-5 w-5" style={{ color: "var(--icon-color-primary)" }} />
        </div>
        <div>
          <p
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Admissions
          </p>
          <h3
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Recent student entries
          </h3>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {(data ?? []).map((student, index) => (
          <motion.div
            key={student._id}
            className="flex items-center justify-between rounded-2xl border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--card-muted)",
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {student.name}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary-muted)" }}
              >
                {student.classGroup} · {student.className}
              </p>
            </div>
            <p
              className="text-xs"
              style={{ color: "var(--text-secondary-muted)" }}
            >
              {student.admissionDate
                ? format(new Date(student.admissionDate), "MMM d")
                : "—"}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

