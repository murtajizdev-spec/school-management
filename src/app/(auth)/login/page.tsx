import { LoginForm } from "@/components/auth/LoginForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div 
          className="rounded-full p-3"
          style={{
            backgroundColor: "var(--accent-light)",
            color: "var(--accent)",
            opacity: 0.2,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            style={{ color: "var(--accent)" }}
          >
            <path
              d="M15 3H21V9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 21H3V15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M21 3L14 10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 14L3 21" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p 
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Secure Access
          </p>
          <h2 
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Morning Roots Control Room
          </h2>
        </div>
      </div>
      <LoginForm />
    </div>
  );
}

