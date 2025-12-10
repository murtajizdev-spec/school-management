"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { useDashboardRefresh } from "@/hooks/useDashboardRefresh";

interface Props {
  label?: string;
  extraKeys?: string[];
  className?: string;
}

export const DashboardRefreshButton = ({
  label = "Refresh metrics",
  extraKeys = [],
  className = "",
}: Props) => {
  const { refreshDashboard } = useDashboardRefresh();
  const [pending, startTransition] = useTransition();
  const [manualLoading, setManualLoading] = useState(false);
  const isLoading = pending || manualLoading;

  const handleRefresh = () => {
    setManualLoading(true);
    startTransition(async () => {
      await refreshDashboard(extraKeys);
      setManualLoading(false);
    });
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition disabled:opacity-60 ${className}`}
      style={{
        borderColor: "var(--border)",
        color: "var(--text-primary)",
        backgroundColor: "var(--card)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--accent-muted)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--card)";
      }}
    >
      <RotateCcw
        className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
        style={{ color: "var(--icon-color)" }}
      />
      {label}
    </button>
  );
};

