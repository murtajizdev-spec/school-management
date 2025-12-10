"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { Search, LogOut } from "lucide-react";
import { ChangePasswordSheet } from "@/components/account/ChangePasswordSheet";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const titles: Record<string, string> = {
  "/dashboard": "Control Room",
  "/students": "Admissions",
  "/fees": "Fee Submission",
  "/teachers": "Faculty Hub",
  "/expenses": "Expense Control",
  "/reports": "Insights & Profit",
};

export const TopBar = ({ user }: { user?: { name?: string | null } }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const title = titles[pathname ?? "/dashboard"] ?? "Control Room";

  return (
    <header 
      className="sticky top-0 z-30 border-b backdrop-blur"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
        opacity: 0.95,
      }}
    >
      <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p 
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--text-secondary)" }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </motion.h1>
        </div>

        <div className="flex flex-1 items-center gap-3 md:justify-end">
          <MobileNav />
          <div className="relative hidden w-full max-w-sm md:block">
            <Search 
              className="pointer-events-none absolute left-3 top-3 h-4 w-4"
              style={{ color: "var(--icon-color)" }}
            />
            <input
              type="text"
              placeholder="Global search (students, teachers, slips...)"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && search.trim()) {
                  router.push(`/search?q=${encodeURIComponent(search.trim())}`);
                }
              }}
              className="w-full rounded-full border py-2 pl-10 pr-4 text-sm focus:outline-none"
              style={{
                borderColor: "var(--border-strong)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-strong)";
              }}
            />
          </div>

          <ChangePasswordSheet />

          <ThemeToggle />

          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition"
            style={{
              backgroundColor: "var(--accent-light)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-light)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
          >
            <LogOut className="h-4 w-4" style={{ color: "inherit" }} />
            Sign out
          </button>
        </div>
      </div>
      <div 
        className="border-t px-4 py-2 text-xs"
        style={{
          borderColor: "var(--border)",
          color: "var(--text-secondary)",
        }}
      >
        Logged in as <span style={{ color: "var(--text-primary)" }}>{user?.name ?? "Admin"}</span>
      </div>
    </header>
  );
};

