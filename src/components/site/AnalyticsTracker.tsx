"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const sessionId =
      sessionStorage.getItem("mas-cafe-session") ??
      `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("mas-cafe-session", sessionId);

    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "page_view",
        path: pathname,
        sessionId,
        userAgent: navigator.userAgent,
      }),
    });
  }, [pathname]);

  return null;
}
