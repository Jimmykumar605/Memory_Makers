"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, IndianRupee, ChevronDown, Check } from "lucide-react";
import { OCCASIONS, PRIMARY_REGIONS, ALL_INDIAN_STATES } from "@/lib/data";

const BUDGET_OPTIONS = [
  {
    value: "",
    label: "Any Budget",
    description: "Browse all pricing tiers & packages",
  },
  {
    value: "50000",
    label: "Under ₹50,000",
    description: "Intimate events, pre-weddings & portraits",
  },
  {
    value: "150000",
    label: "₹50,000 - ₹1,50,000",
    description: "Full day ceremonies, candid sets & rituals",
  },
  {
    value: "300000",
    label: "₹1,50,000 - ₹3,00,000",
    description: "Multi-day events, 4K drones & heirloom albums",
  },
  {
    value: "luxury",
    label: "Luxury Tier (₹3,00,000+)",
    description: "Grand royal palace & master artist collectives",
  },
];

export default function HeroSearch() {
  const router = useRouter();
  const [occasion, setOccasion] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [budget, setBudget] = useState("");

  const [activeDropdown, setActiveDropdown] = useState<"occasion" | "state" | "budget" | null>(null);
  const [openDirection, setOpenDirection] = useState<"down" | "up">("down");
  const containerRef = useRef<HTMLFormElement>(null);

  // Smart directional placement: if space below is limited and top has more room, open upwards
  const toggleDropdown = (
    dropdown: "occasion" | "state" | "budget",
    target: HTMLElement | null
  ) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null);
      return;
    }

    if (target) {
      const rect = target.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Menu needs ~300px. If space below is < 320px and top has more space, open upwards
      if (spaceBelow < 320 && spaceAbove > spaceBelow) {
        setOpenDirection("up");
      } else {
        setOpenDirection("down");
      }
    }

    setActiveDropdown(dropdown);
  };

  // Recheck position on resize or scroll while a dropdown is active
  useEffect(() => {
    if (!activeDropdown) return;

    const handleReposition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 320 && spaceAbove > spaceBelow) {
          setOpenDirection("up");
        } else {
          setOpenDirection("down");
        }
      }
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, { passive: true });
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition);
    };
  }, [activeDropdown]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveDropdown(null);
    const params = new URLSearchParams();
    if (occasion) params.set("occasion", occasion);
    if (stateRegion) params.set("state", stateRegion);
    if (budget) params.set("budget", budget);

    router.push(`/photographers?${params.toString()}`);
  };

  const getBudgetLabel = (val: string) => {
    const found = BUDGET_OPTIONS.find((b) => b.value === val);
    return found ? found.label : "Any Budget";
  };

  const popoverPositionClass =
    openDirection === "up"
      ? "bottom-[calc(100%+8px)] slide-in-from-bottom-2"
      : "top-[calc(100%+8px)] slide-in-from-top-2";

  return (
    <form
      ref={containerRef}
      onSubmit={handleSearch}
      className="hero-search-pill relative w-full max-w-4xl mx-auto p-2 sm:p-2.5 rounded-2xl sm:rounded-full bg-white dark:bg-[#070b09]/90 border border-slate-200 dark:border-emerald-500/25 shadow-xl sm:shadow-2xl shadow-slate-200/60 dark:shadow-emerald-950/40 backdrop-blur-xl transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1.5">
        {/* ========================================================================= */}
        {/* 1. OCCASION SELECTOR */}
        {/* ========================================================================= */}
        <div className="relative flex-1 w-full">
          <button
            type="button"
            onClick={(e) => toggleDropdown("occasion", e.currentTarget)}
            className={`w-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-3 text-left transition-all duration-200 rounded-xl sm:rounded-full cursor-pointer ${activeDropdown === "occasion"
                ? "bg-slate-100/90 dark:bg-emerald-500/10 ring-1 ring-emerald-500/30"
                : "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
              }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${activeDropdown === "occasion" || occasion
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200/80 dark:border-emerald-400/20 text-emerald-600 dark:text-emerald-400"
                }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 dark:text-zinc-400 leading-tight mb-0.5">
                Occasion
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                {occasion || "All Occasions"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${activeDropdown === "occasion"
                  ? openDirection === "up"
                    ? "rotate-180 text-emerald-600 dark:text-emerald-400"
                    : "rotate-180 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-zinc-500"
                }`}
            />
          </button>

          {/* Occasion Popover Menu */}
          {activeDropdown === "occasion" && (
            <div
              className={`absolute ${popoverPositionClass} left-0 w-full sm:w-80 bg-white dark:bg-[#0c120e] border border-slate-200 dark:border-emerald-500/30 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/80 backdrop-blur-2xl p-2 z-50 animate-in fade-in duration-150`}
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400 px-3 py-1.5 flex items-center justify-between">
                <span>Select Occasion Type</span>
                {occasion && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOccasion("");
                    }}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="max-h-[min(300px,calc(100vh-140px))] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setOccasion("");
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs sm:text-sm cursor-pointer ${!occasion
                      ? "bg-emerald-50 text-emerald-950 font-bold dark:bg-emerald-500/20 dark:text-emerald-300"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white"
                    }`}
                >
                  <div>
                    <div className="font-semibold">All Occasions</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal">
                      All ceremonies, shoots & festivities
                    </div>
                  </div>
                  {!occasion && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                  )}
                </button>

                <div className="my-1.5 h-px bg-slate-100 dark:bg-white/10" />

                {OCCASIONS.map((occ) => {
                  const isSelected = occasion === occ.label;
                  return (
                    <button
                      key={occ.label}
                      type="button"
                      onClick={() => {
                        setOccasion(occ.label);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-xl transition-all flex items-center justify-between text-xs sm:text-sm cursor-pointer ${isSelected
                          ? "bg-emerald-50 text-emerald-950 font-bold dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white"
                        }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold truncate">{occ.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal truncate">
                          {occ.description}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Subtle Divider (Desktop) */}
        <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-white/10 self-center shrink-0" />

        {/* ========================================================================= */}
        {/* 2. STATE / REGION SELECTOR */}
        {/* ========================================================================= */}
        <div className="relative flex-1 w-full">
          <button
            type="button"
            onClick={(e) => toggleDropdown("state", e.currentTarget)}
            className={`w-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-3 text-left transition-all duration-200 rounded-xl sm:rounded-full cursor-pointer ${activeDropdown === "state"
                ? "bg-slate-100/90 dark:bg-emerald-500/10 ring-1 ring-emerald-500/30"
                : "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
              }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${activeDropdown === "state" || stateRegion
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200/80 dark:border-emerald-400/20 text-emerald-600 dark:text-emerald-400"
                }`}
            >
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 dark:text-zinc-400 leading-tight mb-0.5">
                State / Region
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                {stateRegion || "All States"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${activeDropdown === "state"
                  ? "rotate-180 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-zinc-500"
                }`}
            />
          </button>

          {/* State / Region Popover Menu */}
          {activeDropdown === "state" && (
            <div
              className={`absolute ${popoverPositionClass} left-0 sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-84 bg-white dark:bg-[#0c120e] border border-slate-200 dark:border-emerald-500/30 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/80 backdrop-blur-2xl p-2 z-50 animate-in fade-in duration-150`}
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400 px-3 py-1.5 flex items-center justify-between">
                <span>Select Location</span>
                {stateRegion && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStateRegion("");
                    }}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="max-h-[min(300px,calc(100vh-140px))] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setStateRegion("");
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs sm:text-sm cursor-pointer ${!stateRegion
                      ? "bg-emerald-50 text-emerald-950 font-bold dark:bg-emerald-500/20 dark:text-emerald-300"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white"
                    }`}
                >
                  <div>
                    <div className="font-semibold">All States & Regions</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal">
                      Pan-India verified visual artists
                    </div>
                  </div>
                  {!stateRegion && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                  )}
                </button>

                {/* Featured Key States */}
                <div className="mt-2 mb-1 px-3 py-1 bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    🌟 Featured Key States
                  </span>
                  <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 font-mono">
                    North & West
                  </span>
                </div>

                {PRIMARY_REGIONS.map((reg) => {
                  const isSelected = stateRegion === reg;
                  return (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => {
                        setStateRegion(reg);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-xl transition-all flex items-center justify-between text-xs sm:text-sm cursor-pointer ${isSelected
                          ? "bg-emerald-50 text-emerald-950 font-bold dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white"
                        }`}
                    >
                      <span className="font-semibold">{reg}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}

                {/* Other Indian States */}
                <div className="mt-3 mb-1 px-3 py-1 bg-slate-100/80 dark:bg-white/5 rounded-lg flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                    🇮🇳 Other Indian States
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                    Pan-India
                  </span>
                </div>

                {ALL_INDIAN_STATES.filter((s) => !PRIMARY_REGIONS.includes(s as any)).map((state) => {
                  const isSelected = stateRegion === state;
                  return (
                    <button
                      key={state}
                      type="button"
                      onClick={() => {
                        setStateRegion(state);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-xl transition-all flex items-center justify-between text-xs sm:text-sm cursor-pointer ${isSelected
                          ? "bg-emerald-50 text-emerald-950 font-bold dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white"
                        }`}
                    >
                      <span>{state}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Subtle Divider (Desktop) */}
        <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-white/10 self-center shrink-0" />

        {/* ========================================================================= */}
        {/* 3. BUDGET SELECTOR */}
        {/* ========================================================================= */}
        <div className="relative flex-1 w-full">
          <button
            type="button"
            onClick={(e) => toggleDropdown("budget", e.currentTarget)}
            className={`w-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-3 text-left transition-all duration-200 rounded-xl sm:rounded-full cursor-pointer ${activeDropdown === "budget"
                ? "bg-slate-100/90 dark:bg-emerald-500/10 ring-1 ring-emerald-500/30"
                : "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
              }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${activeDropdown === "budget" || budget
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200/80 dark:border-emerald-400/20 text-emerald-600 dark:text-emerald-400"
                }`}
            >
              <IndianRupee className="w-4 h-4" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 dark:text-zinc-400 leading-tight mb-0.5">
                Budget (INR ₹)
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                {getBudgetLabel(budget)}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${activeDropdown === "budget"
                  ? "rotate-180 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-zinc-500"
                }`}
            />
          </button>

          {/* Budget Popover Menu */}
          {activeDropdown === "budget" && (
            <div
              className={`absolute ${popoverPositionClass} left-0 sm:left-auto sm:right-0 w-full sm:w-84 bg-white dark:bg-[#0c120e] border border-slate-200 dark:border-emerald-500/30 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/80 backdrop-blur-2xl p-2 z-50 animate-in fade-in duration-150`}
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400 px-3 py-1.5 flex items-center justify-between">
                <span>Select Starting Budget</span>
                {budget && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBudget("");
                    }}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="max-h-[min(300px,calc(100vh-140px))] overflow-y-auto space-y-1 custom-scrollbar">
                {BUDGET_OPTIONS.map((opt) => {
                  const isSelected = budget === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setBudget(opt.value);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs sm:text-sm cursor-pointer ${isSelected
                          ? "bg-emerald-50 text-emerald-950 font-bold dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white"
                        }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold truncate">{opt.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal truncate">
                          {opt.description}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. SEARCH CTA BUTTON */}
        {/* ========================================================================= */}
        <button
          type="submit"
          className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl sm:rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 shrink-0 uppercase tracking-wider text-xs hover:scale-105 cursor-pointer"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
          <span>Find Artists</span>
        </button>
      </div>
    </form>
  );
}
