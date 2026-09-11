"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, login } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Direct synchronous check from localStorage for page refreshes
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("am_token");
      const userStr = localStorage.getItem("am_user");

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          if (!isAuthenticated) {
            login(user, token);
          }
          setIsReady(true);
          return;
        } catch (e) {
          console.error("Failed to parse stored session:", e);
        }
      }
    }

    // 2. If already authenticated in store
    if (isAuthenticated) {
      setIsReady(true);
      return;
    }

    // 3. Only redirect if hydration is complete and no valid token exists
    const hasToken = typeof window !== "undefined" ? !!localStorage.getItem("am_token") : false;
    if (isHydrated && !hasToken && !isAuthenticated) {
      router.push("/login");
    } else if (!hasToken && !isAuthenticated) {
      // Small timeout to allow Zustand hydration or storage sync to finish
      const timer = setTimeout(() => {
        const stillToken = typeof window !== "undefined" ? !!localStorage.getItem("am_token") : false;
        if (!stillToken && !useAuthStore.getState().isAuthenticated) {
          router.push("/login");
        } else {
          setIsReady(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isHydrated, login, router]);

  if (!isReady && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-clinical-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-clinical-muted font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

