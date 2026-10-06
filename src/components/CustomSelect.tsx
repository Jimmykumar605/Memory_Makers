"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  group?: string;
  description?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  popoverWidth?: string;
  align?: "left" | "right" | "center";
  disabled?: boolean;
  label?: string;
  id?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  icon,
  className = "",
  popoverWidth,
  align = "left",
  disabled = false,
  label,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<"down" | "up">("down");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Auto-flip collision detection
  const calculateDirection = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Popover menu needs ~260-300px
      if (spaceBelow < 280 && spaceAbove > spaceBelow) {
        setOpenDirection("up");
      } else {
        setOpenDirection("down");
      }
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      calculateDirection();
    }
    setIsOpen((prev) => !prev);
  };

  // Re-calculate position on resize or scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => {
      calculateDirection();
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, { passive: true });
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition);
    };
  }, [isOpen]);

  // Click outside and Escape key handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Group options if grouped
  const groupedOptions = options.reduce<Record<string, CustomSelectOption[]>>((acc, option) => {
    const groupKey = option.group || "_ungrouped";
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(option);
    return acc;
  }, {});

  const hasGroups = Object.keys(groupedOptions).some((g) => g !== "_ungrouped");

  // Alignment classes for popover
  let alignClass = "left-0";
  if (align === "right") alignClass = "right-0 left-auto";
  if (align === "center") alignClass = "left-1/2 -translate-x-1/2";

  const positionClass =
    openDirection === "up"
      ? "bottom-[calc(100%+6px)] slide-in-from-bottom-2 origin-bottom"
      : "top-[calc(100%+6px)] slide-in-from-top-2 origin-top";

  return (
    <div ref={containerRef} className="relative w-full text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${
          isOpen
            ? "bg-slate-50 dark:bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 dark:text-white"
            : "bg-white dark:bg-[#070b09] border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:border-slate-300 dark:hover:border-white/20"
        } ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && (
            <span className="text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center">
              {icon}
            </span>
          )}
          <span className={`truncate text-left ${!selectedOption && value === "" ? "text-slate-500 dark:text-zinc-400" : ""}`}>
            {displayLabel}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen
              ? "rotate-180 text-emerald-600 dark:text-emerald-400"
              : "text-slate-400 dark:text-zinc-500"
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute ${positionClass} ${alignClass} ${
            popoverWidth || "w-full min-w-[200px]"
          } bg-white dark:bg-[#0c120e] border border-slate-200 dark:border-emerald-500/30 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/80 backdrop-blur-xl p-1.5 z-50 animate-in fade-in duration-150`}
        >
          <div className="max-h-[min(280px,calc(100vh-140px))] overflow-y-auto space-y-1 custom-scrollbar">
            {hasGroups ? (
              Object.entries(groupedOptions).map(([groupName, groupItems]) => (
                <div key={groupName} className="space-y-1">
                  {groupName !== "_ungrouped" && (
                    <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-slate-100/70 dark:bg-white/5 rounded-lg my-1">
                      {groupName}
                    </div>
                  )}
                  {groupItems.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onChange(opt.value);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-950 font-bold dark:bg-emerald-500/20 dark:text-emerald-300"
                            : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="truncate">{opt.label}</div>
                          {opt.description && (
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal truncate">
                              {opt.description}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-950 font-bold dark:bg-emerald-500/20 dark:text-emerald-300"
                        : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate">{opt.label}</div>
                      {opt.description && (
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal truncate">
                          {opt.description}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
