"use client";

import { useTheme } from "@/lib/themeContext";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className={`w-9 h-9 rounded-xl flex items-center justify-center opacity-60 pointer-events-none ${className}`}
        aria-label="Toggle theme"
      >
        <span className="w-4 h-4 rounded-full bg-zinc-700 animate-pulse" />
      </button>
    );
  }

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative flex items-center gap-2 p-2 rounded-xl transition-all duration-300 cursor-pointer ${
        isLight
          ? "bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 hover:text-slate-900 shadow-sm hover:shadow"
          : "bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-amber-300 shadow-inner"
      } ${className}`}
      title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isLight ? (
          <Moon className="w-4 h-4 text-emerald-600 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
        ) : (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-wider uppercase font-mono pr-1">
          {isLight ? "Dark Mode" : "Light Mode"}
        </span>
      )}
    </button>
  );
}
