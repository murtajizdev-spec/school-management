"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import { changePasswordSchema } from "@/lib/validators/account";
import { z } from "zod";

type FormValues = z.infer<typeof changePasswordSchema>;

export const ChangePasswordSheet = () => {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const currentPasswordRegister = register("currentPassword");
  const newPasswordRegister = register("newPassword");

  const onSubmit = async (values: FormValues) => {
    const promise = fetch("/api/account/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? "Failed to update password");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Updating password...",
      success: "Password updated",
      error: (err) => err.message,
    });

    try {
      await promise;
      reset();
      setOpen(false);
    } catch {
      // handled in toast
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--card)",
          color: "var(--text-secondary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-strong)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        <ShieldCheck className="h-4 w-4" style={{ color: "inherit" }} />
        Change password
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="h-full w-full max-w-md p-8 text-sm shadow-2xl"
              style={{
                backgroundColor: "var(--card)",
                color: "var(--text-primary)",
              }}
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "tween" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-xs uppercase tracking-[0.3em]"
                    style={{ color: "var(--text-secondary-muted)" }}
                  >
                    Security
                  </p>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Update password
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <div>
                  <label 
                    className="text-xs uppercase"
                    style={{ color: "var(--form-label-text)" }}
                  >
                    Current password
                  </label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none transition-colors"
                    style={{
                      borderColor: "var(--form-input-border)",
                      backgroundColor: "var(--form-input-bg)",
                      color: "var(--form-input-text)",
                    }}
                    {...currentPasswordRegister}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                    }}
                    onBlur={(e) => {
                      currentPasswordRegister.onBlur(e);
                      e.currentTarget.style.borderColor = "var(--form-input-border)";
                    }}
                  />
                  {errors.currentPassword && (
                    <p className="mt-1 text-xs" style={{ color: "var(--red-error-text)" }}>
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label 
                    className="text-xs uppercase"
                    style={{ color: "var(--form-label-text)" }}
                  >
                    New password
                  </label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-none transition-colors"
                    style={{
                      borderColor: "var(--form-input-border)",
                      backgroundColor: "var(--form-input-bg)",
                      color: "var(--form-input-text)",
                    }}
                    {...newPasswordRegister}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                    }}
                    onBlur={(e) => {
                      newPasswordRegister.onBlur(e);
                      e.currentTarget.style.borderColor = "var(--form-input-border)";
                    }}
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-xs" style={{ color: "var(--red-error-text)" }}>
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
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
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save password
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

