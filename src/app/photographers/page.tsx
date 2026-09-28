"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, SlidersHorizontal, Sparkles, MapPin, X } from "lucide-react";
import PhotographerCard from "@/components/PhotographerCard";
import BookingModal from "@/components/BookingModal";
import { PHOTOGRAPHERS, OCCASIONS } from "@/lib/data";
import { Photographer, OccasionType } from "@/lib/types";

function PhotographersDirectoryContent() {
  const searchParams = useSearchParams();
  const initialOccasion = searchParams.get("occasion") || "";
  const initialCity = searchParams.get("city") || "";
  const initialBudget = searchParams.get("budget") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState(initialOccasion);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedBudget, setSelectedBudget] = useState(initialBudget);
  const [sortBy, setSortBy] = useState<"rating" | "price-asc" | "price-desc" | "experience">("rating");
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Filter and sort photographers
  const filteredPhotographers = useMemo(() => {
    return PHOTOGRAPHERS.filter((p) => {
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBusiness = p.businessName.toLowerCase().includes(query);
        const matchesCity = p.city.toLowerCase().includes(query);
        const matchesSpecialty = p.specialties.some((s) => s.toLowerCase().includes(query));
        if (!matchesName && !matchesBusiness && !matchesCity && !matchesSpecialty) {
          return false;
        }
      }

      // Occasion filter
      if (selectedOccasion) {
        const matchesOccasion = p.specialties.some((s) =>
          s.toLowerCase().includes(selectedOccasion.toLowerCase())
        );
        if (!matchesOccasion) return false;
      }

      // City filter
      if (selectedCity) {
        if (!p.city.toLowerCase().includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      // Budget filter
      if (selectedBudget) {
        if (selectedBudget === "1000" && p.startingPrice > 1000) return false;
        if (selectedBudget === "2000" && (p.startingPrice < 1000 || p.startingPrice > 2500)) return false;
        if (selectedBudget === "luxury" && p.startingPrice < 2500) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-asc") return a.startingPrice - b.startingPrice;
      if (sortBy === "price-desc") return b.startingPrice - a.startingPrice;
      if (sortBy === "experience") return b.experienceYears - a.experienceYears;
      return 0;
    });
  }, [searchQuery, selectedOccasion, selectedCity, selectedBudget, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedOccasion("");
    setSelectedCity("");
    setSelectedBudget("");
  };

  const handleQuickInquire = (photographer: Photographer) => {
    setSelectedPhotographer(photographer);
    setIsBookingModalOpen(true);
  };

  const hasActiveFilters = Boolean(searchQuery || selectedOccasion || selectedCity || selectedBudget);

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Page Title */}
        <div className="text-center sm:text-left space-y-2 border-b border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Visual Artisans</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Find the Perfect Photographer for Your Occasion
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
            Filter by royal wedding rituals, scenic destination escapes, cinematic drone specialists, or intimate maternity portraits.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, studio or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e101a] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Occasion Dropdown */}
            <div>
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e101a] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
              >
                <option value="">All Occasions & Ceremonies</option>
                {OCCASIONS.map((occ) => (
                  <option key={occ.label} value={occ.label}>
                    {occ.label}
                  </option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e101a] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
              >
                <option value="">All Cities & Destinations</option>
                <option value="Jaipur">Jaipur / Udaipur</option>
                <option value="Mumbai">Mumbai / Goa</option>
                <option value="New Delhi">New Delhi / NCR</option>
                <option value="New York">New York, USA</option>
                <option value="San Francisco">San Francisco, USA</option>
              </select>
            </div>

            {/* Budget Dropdown */}
            <div>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e101a] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
              >
                <option value="">Any Starting Budget</option>
                <option value="1000">Under $1,000</option>
                <option value="2000">$1,000 - $2,500</option>
                <option value="luxury">Luxury Tier ($2,500+)</option>
              </select>
            </div>
          </div>

          {/* Occasion Quick Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/[0.06] pb-1">
            <span className="text-xs font-mono uppercase text-zinc-400 shrink-0 mr-1">
              Quick Filter:
            </span>
            {["Wedding", "Pre-Wedding", "Destination", "Traditional & Cultural", "Maternity & Baby", "Drone & Cinematic"].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedOccasion(selectedOccasion === tag ? "" : tag)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    selectedOccasion === tag
                      ? "bg-amber-400 text-black font-semibold"
                      : "bg-white/[0.04] text-zinc-300 hover:text-white border border-white/10"
                  }`}
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>

        {/* Results Bar: Count + Sort + Clear Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-white">{filteredPhotographers.length}</strong> master visual artists
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-mono uppercase">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0e101a] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="experience">Years of Experience</option>
            </select>
          </div>
        </div>

        {/* Photographers Grid */}
        {filteredPhotographers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPhotographers.map((photographer) => (
              <PhotographerCard
                key={photographer.id}
                photographer={photographer}
                onQuickInquire={handleQuickInquire}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel rounded-2xl border border-white/10 p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">No Photographers Found</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              We couldn&apos;t find any photographers matching your current criteria. Try expanding your search or clearing specific filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-xl bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      <BookingModal
        photographer={selectedPhotographer}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}

export default function PhotographersDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090d] flex items-center justify-center text-amber-400 font-mono text-sm">
          Loading Directory...
        </div>
      }
    >
      <PhotographersDirectoryContent />
    </Suspense>
  );
}
