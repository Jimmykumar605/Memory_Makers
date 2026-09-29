"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // When route changes finish, hide progress
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Listen to link clicks to show instant tactile feedback
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        !href.startsWith("#") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:") &&
        !target.getAttribute("target")
      ) {
        // If clicking a new page link, trigger navigation progress bar
        try {
          const targetUrl = new URL(href, window.location.href);
          if (
            targetUrl.origin === window.location.origin &&
            targetUrl.pathname + targetUrl.search !== window.location.pathname + window.location.search
          ) {
            setIsNavigating(true);
          }
        } catch {
          // ignore
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-black/40 overflow-hidden pointer-events-none">
      <div className="h-full bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 shadow-[0_0_12px_#34d399] animate-progress-indeterminate" />
    </div>
  );
}
