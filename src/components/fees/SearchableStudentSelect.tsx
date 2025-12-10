"use client";

import { useMemo, useState } from "react";
import { Search, User } from "lucide-react";
import { StudentDTO } from "@/types/models";

interface Props {
  students: StudentDTO[];
  value: string;
  onChange: (studentId: string) => void;
  placeholder?: string;
}

export const SearchableStudentSelect = ({
  students,
  value,
  onChange,
  placeholder = "Search by name or admission number...",
}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return students.slice(0, 10); // Show first 10 when no search
    }
    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.admissionNo.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const selectedStudent = students.find((s) => s._id === value);

  const handleSelect = (studentId: string) => {
    onChange(studentId);
    setIsOpen(false);
    setSearchQuery("");
  };

  const displayValue = searchQuery || (selectedStudent ? `${selectedStudent.name} (${selectedStudent.admissionNo})` : "");

  return (
    <div className="relative">
      <label className="mb-1 block text-sm" style={{ color: "var(--form-label-text)" }}>
        Student
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-3 h-4 w-4"
          style={{ color: "var(--icon-color)" }}
        />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full rounded-xl border px-4 py-2 pl-10 pr-4 text-sm focus:outline-none"
          style={{
            borderColor: "var(--form-input-border)",
            backgroundColor: "var(--form-input-bg)",
            color: "var(--form-input-text)",
          }}
          value={displayValue}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value && value) {
              // Clear selection when input is cleared
              onChange("");
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            if (selectedStudent) {
              // Show search query when focusing
              setSearchQuery("");
            }
          }}
          onBlur={() => {
            // Delay to allow click events
            setTimeout(() => {
              setIsOpen(false);
              setSearchQuery("");
            }, 200);
          }}
        />
      </div>

      {isOpen && filteredStudents.length > 0 && (
        <div
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border shadow-xl"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
            color: "var(--text-primary)",
          }}
        >
          {filteredStudents.map((student) => (
            <button
              key={student._id}
              type="button"
              onClick={() => handleSelect(student._id)}
              className="w-full px-4 py-3 text-left text-sm transition"
              style={{
                backgroundColor:
                  value === student._id ? "var(--accent-muted)" : "transparent",
                color: value === student._id ? "var(--text-primary)" : "var(--text-primary)",
              }}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" style={{ color: "var(--icon-color)" }} />
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {student.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary-muted)" }}>
                    {student.admissionNo} · {student.classGroup} · {student.className}
                  </p>
                </div>
              </div>
            </button>
          ))}
          {filteredStudents.length === 0 && searchQuery && (
            <div className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary-muted)" }}>
              No students found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}

    </div>
  );
};

