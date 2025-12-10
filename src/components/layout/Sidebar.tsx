"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import { navItems } from "./nav-items";

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside 
      className="hidden w-64 flex-col border-r p-6 lg:flex"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      <div className="mb-8 flex items-center gap-3">
        <div 
          className="rounded-2xl p-2"
          style={{
            backgroundColor: "var(--accent-muted)",
            color: "var(--accent)",
          }}
        >
          <LayoutDashboard className="h-6 w-6" style={{ color: "var(--icon-color-primary)" }} />
        </div>
        <div>
          <p 
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Morning
          </p>
          <p 
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Roots
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    backgroundColor: "var(--accent-muted)",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                />
              )}
              <item.icon
                className="relative z-10 h-5 w-5"
                style={{ color: active ? "var(--icon-color-primary)" : "var(--icon-color)" }}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

