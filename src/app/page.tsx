"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import LazyImage from "@/components/LazyImage";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Camera,
  Star,
  Heart,
  Calendar,
  Compass,
  CheckCircle,
  Users,
  Video,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import HeroSearch from "@/components/HeroSearch";
import PhotographerCard from "@/components/PhotographerCard";
import BookingModal from "@/components/BookingModal";
import PhotoLightbox from "@/components/PhotoLightbox";
import { OCCASIONS } from "@/lib/data";
import { Photographer, PortfolioItem } from "@/lib/types";
import { getPublicPhotographers, getSeedPublicPhotographers, savePhotographers } from "@/lib/photographerStore";
import { fetchAllPhotographersFromSupabase } from "@/lib/supabase/service";

const OCCASION_CURATED_COVERS: Record<string, string> = {
  Wedding: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  "Pre-Wedding": "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
  Engagement: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
  Destination: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80",
  "Traditional & Cultural": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
  "Maternity & Baby": "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=1200&q=80",
  "Fashion & Editorial": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
  "Drone & Cinematic": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
  "Corporate & Events": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
};

export default function Home() {
  const [photographersList, setPhotographersList] = useState<Photographer[]>(getSeedPublicPhotographers);

  useEffect(() => {
    setPhotographersList(getPublicPhotographers());

    // Live query straight from Supabase PostgreSQL DB
    fetchAllPhotographersFromSupabase().then((remote) => {
      if (remote && remote.length > 0) {
        savePhotographers(remote);
        setPhotographersList(remote.filter((p) => p.status === "approved" || !p.status));
      }
    });

    const handleUpdate = () => {
      setPhotographersList(getPublicPhotographers());
    };
    window.addEventListener("mm_photographers_updated", handleUpdate);
    return () => window.removeEventListener("mm_photographers_updated", handleUpdate);
  }, []);

  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [featuredOccasion, setFeaturedOccasion] = useState<string>("All");

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Collect all portfolio photos for the community showcase from approved artists
  const allCommunityPhotos: PortfolioItem[] = photographersList.flatMap((p) => p.portfolio || []);

  const filteredPhotographers =
    featuredOccasion === "All"
      ? photographersList
      : photographersList.filter((p) =>
          p.specialties.some((s) => s.toLowerCase().includes(featuredOccasion.toLowerCase()))
        );

  const filterScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (filterScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = filterScrollRef.current;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [photographersList]);

  const scrollFilters = (direction: "left" | "right") => {
    if (filterScrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      filterScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 320);
    }
  };

  const filterCategories = [
    { label: "All", displayName: "All Specialties", icon: Sparkles },
    { label: "Wedding", displayName: "Wedding", icon: Heart },
    { label: "Pre-Wedding", displayName: "Pre-Wedding", icon: Camera },
    { label: "Destination", displayName: "Destination", icon: Compass },
    { label: "Traditional & Cultural", displayName: "Traditional & Cultural", icon: Star },
    { label: "Engagement", displayName: "Engagement", icon: Sparkles },
    { label: "Maternity & Baby", displayName: "Maternity & Baby", icon: Users },
    { label: "Fashion & Editorial", displayName: "Fashion & Editorial", icon: Camera },
    { label: "Drone & Cinematic", displayName: "Drone & Cinematic", icon: Video },
    { label: "Corporate & Events", displayName: "Corporate & Events", icon: Calendar },
  ];

  const getCategoryCount = (catLabel: string) => {
    if (catLabel === "All") return photographersList.length;
    return photographersList.filter((p) =>
      p.specialties.some((s) => s.toLowerCase().includes(catLabel.toLowerCase()))
    ).length;
  };

  const handleQuickInquire = (photographer: Photographer) => {
    setSelectedPhotographer(photographer);
    setIsBookingModalOpen(true);
  };

  const handleOpenPhoto = (item: PortfolioItem) => {
    setSelectedPhoto(item);
    setIsLightboxOpen(true);
  };

  const faqs = [
    {
      q: "How does MemoryMakers work for couples and families?",
      a: "MemoryMakers allows you to directly discover and hire top wedding and celebration visual artists across India without middleman agency commissions. Filter by state (Punjab, Haryana, Rajasthan, Himachal Pradesh, Chandigarh, Delhi NCR), ceremony type, and transparent budgets in INR (₹). You can inspect complete portfolios with camera hardware specs, check itemized deliverables, and submit direct commission requests.",
    },
    {
      q: "Which states and cities are currently covered?",
      a: "We actively specialize in Punjab (Amritsar, Ludhiana, Jalandhar), Haryana (Gurugram, Karnal, Panipat), Rajasthan (Jaipur, Udaipur, Jodhpur), Himachal Pradesh (Shimla, Manali, Dharamshala), Chandigarh (Tricity), and Delhi NCR (Delhi, Noida, Gurgaon). Additionally, photographers from any other Indian state can create their profiles, and our artists are fully equipped for destination weddings across India.",
    },
    {
      q: "Are the package prices in Indian Rupees (₹ INR) all-inclusive?",
      a: "Yes! All package prices are listed in Indian Rupees (INR) with explicit itemized deliverables (number of edited stills, drone 4K reels, handcrafted wedding albums, and turnaround times). There are zero hidden agency booking charges.",
    },
    {
      q: "How can professional photographers join the platform?",
      a: "Photographers can click 'JOIN AS PHOTOGRAPHER', create their account, and access their personal Creator Studio Dashboard. From the studio, you can set your home state, upload high-res portfolio shots by occasion, configure custom wedding packages in Rupees, manage incoming booking inquiries, and list your camera gear.",
    },
    {
      q: "Can I commission a photographer for destination shoots outside their home state?",
      a: "Absolutely! Most verified masters on MemoryMakers have a 'Worldwide / Pan-India Travel Ready' badge. Whether you are hosting a palace wedding in Udaipur or a pine forest elopement in Manali, you can submit an inquiry with your destination venue.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#040507] text-zinc-100 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-to-b from-emerald-500/15 via-green-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[550px] h-[550px] bg-emerald-500/10 blur-[130px] pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-emerald-400/40 text-xs font-semibold uppercase tracking-widest text-emerald-300 shadow-lg shadow-emerald-500/15 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>The Premier Global Photographers Collective</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold tracking-tight text-white leading-[1.15]">
            Where Sacred Moments Become{" "}
            <span className="green-gradient-text block sm:inline font-serif italic">
              Timeless Heirlooms
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 font-light leading-relaxed">
            Discover verified master wedding, pre-wedding, and celebration visual artists across Punjab, Haryana, Rajasthan, Himachal Pradesh, Chandigarh, and Delhi NCR. Transparent INR pricing & zero middleman markups.
          </p>

          {/* Interactive Hero Search Form */}
          <div className="pt-6">
            <HeroSearch />
          </div>

          {/* Value Proposition Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Portfolio Authenticity</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Pro Equipment & 4K Cinema Drones</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>Direct Quote Requests & Zero Markups</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* OCCASIONS EXPLORATION GRID */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
              Curated Occasions
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Choose the Canvas for Your Story
            </h2>
          </div>
          <Link
            href="/photographers"
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors group"
          >
            <span>Explore all categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {OCCASIONS.slice(0, 6).map((occ, idx) => {
            const matchingPhoto = allCommunityPhotos.find((p) => p.occasion === occ.label);
            const fallbackImage =
              photographersList[idx % (photographersList.length || 1)]?.coverImageUrl ||
              OCCASION_CURATED_COVERS[occ.label] ||
              "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80";

            return (
              <Link
                key={occ.label}
                href={`/photographers?occasion=${encodeURIComponent(occ.label)}`}
                className="group relative h-72 rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-emerald-400/50 transition-all duration-500 shadow-xl"
              >
                <LazyImage
                  src={matchingPhoto?.imageUrl || fallbackImage}
                  alt={occ.label}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  fallbackText={occ.label}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040605] via-[#040605]/60 to-transparent pointer-events-none" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {occ.label}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400 group-hover:text-black transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                    {occ.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-emerald-400/90">
                    <span>View Artists</span>
                    <span>•</span>
                    <span>Browse Albums</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURED PHOTOGRAPHERS SPOTLIGHT */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        {/* Header row: Title + Meta */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-2 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Hand-Selected Masters
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Featured Visual Artisans
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Top-rated creators renowned for exceptional craftsmanship in Punjab, Rajasthan, Haryana, Himachal & Delhi NCR.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono text-zinc-400">
              Showing <strong className="text-emerald-300 font-semibold">{filteredPhotographers.length}</strong> of {photographersList.length} artists
            </span>
            <Link
              href="/photographers"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dedicated Modern Specialty Filter Bar (Arrows safely beside the track, never overlapping) */}
        <div className="flex items-center gap-2.5 mb-10">
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollFilters("left")}
            disabled={!canScrollLeft}
            className={`shrink-0 w-9 h-9 rounded-xl bg-[#090e0b] border border-white/10 flex items-center justify-center shadow-md transition-all cursor-pointer ${
              canScrollLeft
                ? "text-zinc-200 hover:text-emerald-300 hover:border-emerald-400/50 hover:bg-[#0f1712] hover:scale-105 active:scale-95"
                : "text-zinc-600 opacity-40 cursor-not-allowed border-white/5"
            }`}
            aria-label="Scroll filters left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Filter Pills Container */}
          <div
            ref={filterScrollRef}
            onScroll={checkScroll}
            className="flex-1 flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {filterCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = featuredOccasion === category.label;
              const count = getCategoryCount(category.label);

              return (
                <button
                  key={category.label}
                  onClick={() => setFeaturedOccasion(category.label)}
                  className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-400 to-green-400 text-black font-semibold shadow-lg shadow-emerald-500/20 scale-[1.02]"
                      : "bg-[#090e0b] hover:bg-[#0f1712] text-zinc-300 hover:text-white border border-white/10 hover:border-emerald-400/40"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-colors ${
                      isSelected ? "text-black" : "text-emerald-400 group-hover:scale-110"
                    }`}
                  />
                  <span>{category.displayName}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md transition-colors ${
                      isSelected
                        ? "bg-black/20 text-black font-bold"
                        : "bg-white/[0.06] text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollFilters("right")}
            disabled={!canScrollRight}
            className={`shrink-0 w-9 h-9 rounded-xl bg-[#090e0b] border border-white/10 flex items-center justify-center shadow-md transition-all cursor-pointer ${
              canScrollRight
                ? "text-zinc-200 hover:text-emerald-300 hover:border-emerald-400/50 hover:bg-[#0f1712] hover:scale-105 active:scale-95"
                : "text-zinc-600 opacity-40 cursor-not-allowed border-white/5"
            }`}
            aria-label="Scroll filters right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
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
          <div className="py-16 text-center rounded-3xl glass-panel border border-white/10 p-8 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">No Artists Found in this Specialty</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              We couldn&apos;t find featured creators for &ldquo;{featuredOccasion}&rdquo; right now.
            </p>
            <button
              onClick={() => setFeaturedOccasion("All")}
              className="mt-5 px-5 py-2 rounded-xl bg-emerald-400 text-black text-xs font-semibold hover:bg-emerald-300 transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Reset to All Specialties
            </button>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/photographers"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/[0.05] hover:bg-emerald-500/10 border border-white/15 hover:border-emerald-400/40 text-sm font-semibold text-white transition-all group"
          >
            <span>Browse All Available Artists & Studios</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-emerald-400" />
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* COMMUNITY SHOWCASE GALLERY (Masonry Preview) */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-2">
            The Living Gallery
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white">
            Moments Immortalized
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3 font-light">
            Real weddings, Anand Karaj rituals, grand palaces, and deodar forest pre-weddings captured across India.
            Click any portrait to inspect technical details and gear.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allCommunityPhotos.slice(0, 8).map((photo) => (
            <div
              key={photo.id}
              onClick={() => handleOpenPhoto(photo)}
              className="group relative h-80 rounded-xl overflow-hidden cursor-pointer glass-panel border border-white/10 hover:border-emerald-400/50 transition-all duration-300"
            >
              <LazyImage
                src={photo.imageUrl}
                alt={photo.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                fallbackText={photo.occasion}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="absolute bottom-3 left-3 right-3 flex flex-col justify-end text-left">
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-semibold">
                  {photo.occasion}
                </span>
                <h4 className="text-sm font-semibold text-white truncate">{photo.title}</h4>
                {photo.location && (
                  <p className="text-[11px] text-zinc-300 truncate mt-0.5">{photo.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* HOW IT WORKS (Two Paths: Clients vs Photographers) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-2 font-semibold">
            Simple & Transparent
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white">
            How MemoryMakers Works
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3 font-light">
            Connecting couples and clients directly with India&apos;s most talented visual artisans without middleman commission markups.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: For Couples & Clients */}
          <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                For Couples & Families
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Find Your Dream Photographer
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Skip confusing agency directories. Search and hire directly in 3 seamless steps:
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Filter by State & Occasion</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Choose Punjab, Haryana, Rajasthan, Himachal, Chandigarh, or Delhi NCR and your exact ceremony type.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Inspect Verified Portfolios & Gear</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Examine full-res photo galleries, camera hardware locker, transparent INR package pricing, and real couple reviews.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Direct Quote Request & Booking</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Submit your dates and venue. The lead photographer contacts you directly within 24 hours with zero commission markups.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/photographers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-300 hover:to-green-300 text-black font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20 hover:scale-105"
              >
                <span>Find Your Artist Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: For Photographers */}
          <div className="p-8 sm:p-10 rounded-3xl glass-panel-green border border-emerald-400/30 relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-semibold">
                For Photographers & Studios
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Showcase Your Creative Studio
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Take control of your wedding photography business with professional creator tools:
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Sign Up & Select Your State</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Choose your primary Indian state and cities you cater to, with willing to travel flexibility.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Publish Galleries, Packages & Gear</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Categorize your shoots by occasions (Anand Karaj, Haldi, Sangeet, Pre-Wedding) and set your custom Rupee packages.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Receive & Manage Inquiries</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Get direct commission requests in your studio inbox, review client budgets, and confirm bookings directly.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 flex items-center gap-3">
              <Link
                href="/login?role=photographer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 text-black font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 hover:scale-105 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Join As Photographer</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/20 hover:border-emerald-400/50 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-500/[0.08] transition-all"
              >
                <span>Creator Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FAQ SECTION */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/[0.06] scroll-mt-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-2 border border-emerald-400/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-400 mt-2 font-light">
            Everything you need to know about discovering, commissioning, or listing as a photographer.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl glass-panel border border-white/10 overflow-hidden transition-all duration-300 hover:border-emerald-400/30"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 text-emerald-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-emerald-400 text-black border-emerald-400" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/[0.06] pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking Inquiry Modal */}
      <BookingModal
        photographer={selectedPhotographer}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* Photo Lightbox */}
      <PhotoLightbox
        item={selectedPhoto}
        items={allCommunityPhotos}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onSelect={(item) => setSelectedPhoto(item)}
      />
    </div>
  );
}
