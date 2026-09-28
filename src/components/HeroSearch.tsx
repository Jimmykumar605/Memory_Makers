"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, DollarSign, Sparkles } from "lucide-react";
import { OCCASIONS } from "@/lib/data";

export default function HeroSearch() {
  const router = useRouter();
  const [occasion, setOccasion] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (occasion) params.set("occasion", occasion);
    if (location) params.set("city", location);
    if (budget) params.set("budget", budget);

    router.push(`/photographers?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl mx-auto glass-panel p-2.5 sm:p-3.5 rounded-2xl sm:rounded-full border border-white/15 shadow-2xl shadow-black/80 backdrop-blur-xl"
    >
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-1">
        {/* Occasion Selector */}
        <div className="flex-1 w-full px-4 py-2 sm:border-r border-white/10 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex flex-col w-full text-left">
            <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              Occasion
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer appearance-none"
            >
              <option value="" className="bg-[#12141f] text-white">
                All Occasions (Weddings, Pre-Wedding...)
              </option>
              {OCCASIONS.map((occ) => (
                <option key={occ.label} value={occ.label} className="bg-[#12141f] text-white">
                  {occ.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Selector */}
        <div className="flex-1 w-full px-4 py-2 sm:border-r border-white/10 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex flex-col w-full text-left">
            <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer appearance-none"
            >
              <option value="" className="bg-[#12141f] text-white">
                Any Location / Destination
              </option>
              <option value="Jaipur" className="bg-[#12141f] text-white">
                Jaipur / Udaipur
              </option>
              <option value="Mumbai" className="bg-[#12141f] text-white">
                Mumbai / Goa
              </option>
              <option value="New Delhi" className="bg-[#12141f] text-white">
                New Delhi / NCR
              </option>
              <option value="New York" className="bg-[#12141f] text-white">
                New York, USA
              </option>
              <option value="San Francisco" className="bg-[#12141f] text-white">
                San Francisco / California
              </option>
            </select>
          </div>
        </div>

        {/* Budget Selector */}
        <div className="flex-1 w-full px-4 py-2 flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex flex-col w-full text-left">
            <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              Budget Range
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer appearance-none"
            >
              <option value="" className="bg-[#12141f] text-white">
                Any Budget
              </option>
              <option value="1000" className="bg-[#12141f] text-white">
                Starting Under $1,000
              </option>
              <option value="2000" className="bg-[#12141f] text-white">
                $1,000 - $2,500
              </option>
              <option value="luxury" className="bg-[#12141f] text-white">
                Luxury / $2,500+
              </option>
            </select>
          </div>
        </div>

        {/* Search CTA Button */}
        <button
          type="submit"
          className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-semibold rounded-xl sm:rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 shrink-0 uppercase tracking-wider text-xs"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
          <span>Find Artists</span>
        </button>
      </div>
    </form>
  );
}
