"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { navItems } from "./nav-items";

export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="rounded-full border border-white/10 p-2 text-white lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="absolute left-1/2 top-12 w-11/12 max-w-sm -translate-x-1/2 rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">
                  Quick Navigation
                </p>
                <button
                  className="rounded-full border border-white/10 p-2 text-white"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-white hover:border-sky-400"
                    onClick={() => setOpen(false)}
                  >
                    <item.icon className="h-5 w-5 text-sky-300" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

