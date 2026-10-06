"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, SlidersHorizontal, Sparkles, MapPin, X, IndianRupee } from "lucide-react";
import PhotographerCard from "@/components/PhotographerCard";
import BookingModal from "@/components/BookingModal";
import LogoLoader from "@/components/LogoLoader";
import CustomSelect, { CustomSelectOption } from "@/components/CustomSelect";
import { OCCASIONS, PRIMARY_REGIONS, ALL_INDIAN_STATES } from "@/lib/data";
import { Photographer, OccasionType } from "@/lib/types";
import { getPublicPhotographers, getSeedPublicPhotographers, savePhotographers } from "@/lib/photographerStore";
import { fetchAllPhotographersFromSupabase } from "@/lib/supabase/service";

function PhotographersDirectoryContent() {
  const searchParams = useSearchParams();
  const initialOccasion = searchParams.get("occasion") || "";
  const initialState = searchParams.get("state") || searchParams.get("city") || "";
  const initialBudget = searchParams.get("budget") || "";

  // Dynamic photographers list loaded from DB
  const [photographersList, setPhotographersList] = useState<Photographer[]>(getSeedPublicPhotographers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getPublicPhotographers();
    if (cached && cached.length > 0) {
      setPhotographersList(cached);
      setLoading(false);
    }

    // Live query straight from Supabase PostgreSQL DB
    fetchAllPhotographersFromSupabase()
      .then((remote) => {
        if (remote && remote.length > 0) {
          savePhotographers(remote);
          setPhotographersList(remote.filter((p) => p.status === "approved" || !p.status));
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const handleUpdate = () => {
      setPhotographersList(getPublicPhotographers());
    };
    window.addEventListener("mm_photographers_updated", handleUpdate);
    return () => window.removeEventListener("mm_photographers_updated", handleUpdate);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState(initialOccasion);
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedBudget, setSelectedBudget] = useState(initialBudget);
  const [sortBy, setSortBy] = useState<"rating" | "price-asc" | "price-desc" | "experience">("rating");
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Dynamic set of all states present across photographers, merging with ALL_INDIAN_STATES
  const availableStates = useMemo(() => {
    const presentStates = Array.from(new Set(photographersList.map((p) => p.state).filter(Boolean)));
    const combined = Array.from(new Set([...PRIMARY_REGIONS, ...presentStates, ...ALL_INDIAN_STATES]));
    return combined;
  }, [photographersList]);

  const stateOptions: CustomSelectOption[] = useMemo(
    () => [
      { value: "", label: "All States & Regions" },
      ...PRIMARY_REGIONS.map((reg) => ({
        value: reg,
        label: reg,
        group: "🌟 Featured Key States",
      })),
      ...availableStates
        .filter((s) => !PRIMARY_REGIONS.includes(s as any))
        .map((s) => ({
          value: s,
          label: s,
          group: "🇮🇳 Other Indian States",
        })),
    ],
    [availableStates]
  );

  const occasionOptions: CustomSelectOption[] = useMemo(
    () => [
      { value: "", label: "All Occasions & Ceremonies" },
      ...OCCASIONS.map((occ) => ({
        value: occ.label,
        label: occ.label,
        description: occ.description,
      })),
    ],
    []
  );

  const budgetOptions: CustomSelectOption[] = useMemo(
    () => [
      { value: "", label: "Any Starting Budget (INR)" },
      { value: "50000", label: "Under ₹50,000", description: "Intimate events & portraits" },
      { value: "150000", label: "₹50,000 - ₹1,50,000", description: "Full day celebrations & sets" },
      { value: "300000", label: "₹1,50,000 - ₹3,00,000", description: "Multi-day ceremonies & 4K drones" },
      { value: "luxury", label: "Luxury Tier (₹3,00,000+)", description: "Royal palace weddings & master artists" },
    ],
    []
  );

  const sortOptions: CustomSelectOption[] = useMemo(
    () => [
      { value: "rating", label: "Highest Rated" },
      { value: "price-asc", label: "Price: Low to High (₹)" },
      { value: "price-desc", label: "Price: High to Low (₹)" },
      { value: "experience", label: "Years of Experience" },
    ],
    []
  );

  // Filter and sort photographers (ONLY APPROVED ARTISTS)
  const filteredPhotographers = useMemo(() => {
    return photographersList.filter((p) => {
      const pSpecs = p.specialties || [];
      const pName = p.name || "";
      const pBiz = p.businessName || "";
      const pCity = p.city || "";
      const pState = p.state || "";

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = pName.toLowerCase().includes(query);
        const matchesBusiness = pBiz.toLowerCase().includes(query);
        const matchesCity = pCity.toLowerCase().includes(query);
        const matchesState = pState.toLowerCase().includes(query);
        const matchesSpecialty = pSpecs.some((s) => s && s.toLowerCase().includes(query));
        if (!matchesName && !matchesBusiness && !matchesCity && !matchesState && !matchesSpecialty) {
          return false;
        }
      }

      // Occasion filter
      if (selectedOccasion) {
        const matchesOccasion = pSpecs.some((s) =>
          s && s.toLowerCase().includes(selectedOccasion.toLowerCase())
        );
        if (!matchesOccasion) return false;
      }

      // State / Region filter
      if (selectedState) {
        const stateQuery = selectedState.toLowerCase();
        const matchesState = pState.toLowerCase().includes(stateQuery) || pCity.toLowerCase().includes(stateQuery);
        if (!matchesState) return false;
      }

      // Budget filter in INR (₹)
      if (selectedBudget) {
        const startingPrice = Number(p.startingPrice) || 0;
        if (selectedBudget === "50000" && startingPrice > 50000) return false;
        if (selectedBudget === "150000" && (startingPrice < 50000 || startingPrice > 150000)) return false;
        if (selectedBudget === "300000" && (startingPrice < 150000 || startingPrice > 300000)) return false;
        if (selectedBudget === "luxury" && startingPrice < 300000) return false;
      }

      return true;
    }).sort((a, b) => {
      const aRating = Number(a.rating) || 5.0;
      const bRating = Number(b.rating) || 5.0;
      const aPrice = Number(a.startingPrice) || 0;
      const bPrice = Number(b.startingPrice) || 0;
      const aExp = Number(a.experienceYears) || 0;
      const bExp = Number(b.experienceYears) || 0;

      if (sortBy === "rating") return bRating - aRating;
      if (sortBy === "price-asc") return aPrice - bPrice;
      if (sortBy === "price-desc") return bPrice - aPrice;
      if (sortBy === "experience") return bExp - aExp;
      return 0;
    });
  }, [photographersList, searchQuery, selectedOccasion, selectedState, selectedBudget, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedOccasion("");
    setSelectedState("");
    setSelectedBudget("");
  };

  const handleQuickInquire = (photographer: Photographer) => {
    setSelectedPhotographer(photographer);
    setIsBookingModalOpen(true);
  };

  const hasActiveFilters = Boolean(searchQuery || selectedOccasion || selectedState || selectedBudget);

  return (
    <div className="min-h-screen bg-[#040507] text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Page Title */}
        <div className="text-center sm:text-left space-y-2 border-b border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>North India & Pan-India Visual Artisans</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Find Top Photographers Across Punjab, Haryana, Rajasthan & Delhi NCR
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
            Discover verified wedding storytellers in Punjab, Haryana, Rajasthan, Himachal Pradesh, Chandigarh, and Delhi NCR. Filter by your state, occasion, and transparent budget in Rupees (₹).
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors space-y-4 shadow-xl relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, studio or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all"
              />
            </div>

            {/* State / Region Dropdown */}
            <div>
              <CustomSelect
                value={selectedState}
                onChange={setSelectedState}
                options={stateOptions}
                placeholder="All States & Regions"
              />
            </div>

            {/* Occasion Dropdown */}
            <div>
              <CustomSelect
                value={selectedOccasion}
                onChange={setSelectedOccasion}
                options={occasionOptions}
                placeholder="All Occasions & Ceremonies"
              />
            </div>

            {/* Budget Dropdown in INR (₹) */}
            <div>
              <CustomSelect
                value={selectedBudget}
                onChange={setSelectedBudget}
                options={budgetOptions}
                placeholder="Any Starting Budget (INR)"
              />
            </div>
          </div>

          {/* Quick State & Occasion Filter Chips */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
            {/* State Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-mono uppercase text-emerald-400 font-semibold shrink-0 mr-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> States:
              </span>
              {PRIMARY_REGIONS.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedState(selectedState === st ? "" : st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${selectedState === st
                    ? "bg-emerald-400 text-black font-semibold shadow-md shadow-emerald-400/20"
                    : "bg-white/[0.04] text-zinc-300 hover:text-white border border-white/10 hover:border-emerald-400/30"
                    }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Occasion Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-mono uppercase text-zinc-400 shrink-0 mr-1">
                Occasions:
              </span>
              {["Wedding", "Pre-Wedding", "Destination", "Traditional & Cultural", "Drone & Cinematic"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedOccasion(selectedOccasion === tag ? "" : tag)}
                    className={`px-3 py-0.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${selectedOccasion === tag
                      ? "bg-emerald-400 text-black font-semibold"
                      : "bg-white/[0.03] text-zinc-300 hover:text-white border border-white/10"
                      }`}
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Results Bar: Count + Sort + Clear Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-white">{filteredPhotographers.length}</strong> master visual artists
              {selectedState && <span> in <strong className="text-emerald-400">{selectedState}</strong></span>}
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-2.5 py-1 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="text-xs font-mono uppercase shrink-0">Sort By:</span>
            <div className="w-48 sm:w-52">
              <CustomSelect
                value={sortBy}
                onChange={(v) => setSortBy(v as any)}
                options={sortOptions}
                align="right"
                className="py-1.5 px-3 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Photographers Grid */}
        {loading && filteredPhotographers.length === 0 ? (
          <div className="py-24 text-center glass-panel rounded-2xl border border-white/10 p-8 space-y-4">
            <LogoLoader size="md" message="Discovering verified visual artisans..." />
          </div>
        ) : filteredPhotographers.length > 0 ? (
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
            <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">No Photographers Found</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              We couldn&apos;t find any photographers matching your current state or budget criteria. Try clearing specific filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-xl bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider hover:bg-emerald-300 transition-colors"
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
        <div className="min-h-screen bg-[#040507] flex items-center justify-center text-emerald-400 font-mono text-sm">
          Loading Directory...
        </div>
      }
    >
      <PhotographersDirectoryContent />
    </Suspense>
  );
}
