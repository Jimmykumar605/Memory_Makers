"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, IndianRupee, Sparkles } from "lucide-react";
import { OCCASIONS, PRIMARY_REGIONS, ALL_INDIAN_STATES } from "@/lib/data";

export default function HeroSearch() {
  const router = useRouter();
  const [occasion, setOccasion] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [budget, setBudget] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (occasion) params.set("occasion", occasion);
    if (stateRegion) params.set("state", stateRegion);
    if (budget) params.set("budget", budget);

    router.push(`/photographers?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl mx-auto glass-panel p-2.5 sm:p-3.5 rounded-2xl sm:rounded-full border border-emerald-500/25 hover:border-emerald-400/50 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-1">
        {/* Occasion Selector */}
        <div className="flex-1 w-full px-4 py-2 sm:border-r border-white/10 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex flex-col w-full text-left">
            <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              Occasion
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer appearance-none"
            >
              <option value="" className="bg-[#090d0b] text-white">
                All Occasions (Weddings, Pre-Wedding...)
              </option>
              {OCCASIONS.map((occ) => (
                <option key={occ.label} value={occ.label} className="bg-[#090d0b] text-white">
                  {occ.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* State / Region Selector */}
        <div className="flex-1 w-full px-4 py-2 sm:border-r border-white/10 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex flex-col w-full text-left">
            <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              State / Region
            </label>
            <select
              value={stateRegion}
              onChange={(e) => setStateRegion(e.target.value)}
              className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer appearance-none"
            >
              <option value="" className="bg-[#090d0b] text-white">
                All States (Punjab, Haryana, Delhi...)
              </option>
              <optgroup label="🌟 Featured Key States" className="bg-[#090d0b] text-emerald-400 font-semibold">
                {PRIMARY_REGIONS.map((reg) => (
                  <option key={reg} value={reg} className="bg-[#090d0b] text-white font-normal">
                    {reg}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🇮🇳 Other Indian States" className="bg-[#090d0b] text-zinc-400">
                {ALL_INDIAN_STATES.filter((s) => !PRIMARY_REGIONS.includes(s as any)).map((state) => (
                  <option key={state} value={state} className="bg-[#090d0b] text-white font-normal">
                    {state}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Budget Selector in Rupees (INR) */}
        <div className="flex-1 w-full px-4 py-2 flex items-center gap-3">
          <IndianRupee className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex flex-col w-full text-left">
            <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              Budget (INR ₹)
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer appearance-none"
            >
              <option value="" className="bg-[#090d0b] text-white">
                Any Budget
              </option>
              <option value="50000" className="bg-[#090d0b] text-white">
                Under ₹50,000
              </option>
              <option value="150000" className="bg-[#090d0b] text-white">
                ₹50,000 - ₹1,50,000
              </option>
              <option value="300000" className="bg-[#090d0b] text-white">
                ₹1,50,000 - ₹3,00,000
              </option>
              <option value="luxury" className="bg-[#090d0b] text-white">
                Luxury / ₹3,00,000+
              </option>
            </select>
          </div>
        </div>

        {/* Search CTA Button */}
        <button
          type="submit"
          className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 hover:from-emerald-300 hover:to-green-300 text-black font-semibold rounded-xl sm:rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 shrink-0 uppercase tracking-wider text-xs hover:scale-105"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
          <span>Find Artists</span>
        </button>
      </div>
    </form>
  );
}
