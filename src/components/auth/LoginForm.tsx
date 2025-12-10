"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

// Theme-aware gradients using new palette
const gradients = [
  { from: "#AAC4F5", via: "#8CA9FF", to: "#8CA9FF" },
  { from: "#FFF2C6", via: "#AAC4F5", to: "#8CA9FF" },
  { from: "#8CA9FF", via: "#8CA9FF", to: "#000000" },
];

export const LoginForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL || "",
      password: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [gradientIndex, setGradientIndex] = useState(0);

  const emailRegister = register("email");
  const passwordRegister = register("password");

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const response = await signIn("credentials", {
      ...values,
      redirect: false,
    });
    setLoading(false);

    if (response?.error) {
      toast.error("Invalid credentials");
      return;
    }

    toast.success("Welcome back!");
    router.replace("/dashboard");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="space-y-2">
          <p 
            className="inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-widest"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--text-secondary)",
            }}
          >
            Morning Roots
          </p>
          <h1 
            className="text-3xl font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Control every part of your academy with confidence.
          </h1>
          <p 
            className="text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Admissions · Fee collection · Teacher payroll · Expense tracking
          </p>
        </div>

        <motion.div
          key={gradientIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl p-6 shadow-2xl"
          style={{
            background: `linear-gradient(to bottom right, ${gradients[gradientIndex].from}, ${gradients[gradientIndex].via}, ${gradients[gradientIndex].to})`,
            color: "#ffffff",
          }}
          onMouseEnter={() =>
            setGradientIndex((prev) => (prev + 1) % gradients.length)
          }
        >
          <p className="text-lg font-medium text-white">
            "All finance, academic and HR data finally lives in one place."
          </p>
          <p className="mt-4 text-sm text-white/80">– Morning Roots Board</p>
        </motion.div>
      </div>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border p-8 shadow-xl backdrop-blur"
        style={{
          borderColor: "var(--border-strong)",
          backgroundColor: "var(--card)",
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="space-y-6">
          <div>
            <label 
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Email
            </label>
            <input
              type="email"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-colors"
              style={{
                borderColor: "var(--border-strong)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
              placeholder="admin@morningroots.com"
              {...emailRegister}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onBlur={(e) => {
                emailRegister.onBlur(e);
                e.currentTarget.style.borderColor = "var(--border-strong)";
              }}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label 
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <input
              type="password"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-colors"
              style={{
                borderColor: "var(--border-strong)",
                backgroundColor: "var(--card-muted)",
                color: "var(--text-primary)",
              }}
              placeholder="••••••••"
              {...passwordRegister}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onBlur={(e) => {
                passwordRegister.onBlur(e);
                e.currentTarget.style.borderColor = "var(--border-strong)";
              }}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative inline-flex w-full items-center justify-center rounded-xl px-4 py-3 font-medium shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--card)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.opacity = "0.9";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Access secure panel"
            )}
          </button>
        </div>
        <p 
          className="mt-6 text-center text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Passwords are hashed using bcrypt and never stored in plain text.
        </p>
      </motion.form>
    </div>
  );
};

