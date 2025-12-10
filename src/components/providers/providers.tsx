"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/contexts/ThemeContext";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
};

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <SessionProvider>
        <SWRConfig value={{ fetcher, shouldRetryOnError: false }}>
          {children}
          <Toaster position="top-right" />
        </SWRConfig>
      </SessionProvider>
    </ThemeProvider>
  );
};

