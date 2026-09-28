"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
} from "lucide-react";
import HeroSearch from "@/components/HeroSearch";
import PhotographerCard from "@/components/PhotographerCard";
import BookingModal from "@/components/BookingModal";
import PhotoLightbox from "@/components/PhotoLightbox";
import { PHOTOGRAPHERS, OCCASIONS } from "@/lib/data";
import { Photographer, PortfolioItem } from "@/lib/types";

export default function Home() {
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [featuredOccasion, setFeaturedOccasion] = useState<string>("All");

  // Collect all portfolio photos for the community showcase
  const allCommunityPhotos: PortfolioItem[] = PHOTOGRAPHERS.flatMap((p) => p.portfolio);

  const filteredPhotographers =
    featuredOccasion === "All"
      ? PHOTOGRAPHERS
      : PHOTOGRAPHERS.filter((p) =>
          p.specialties.some((s) => s.toLowerCase().includes(featuredOccasion.toLowerCase()))
        );

  const handleQuickInquire = (photographer: Photographer) => {
    setSelectedPhotographer(photographer);
    setIsBookingModalOpen(true);
  };

  const handleOpenPhoto = (item: PortfolioItem) => {
    setSelectedPhoto(item);
    setIsLightboxOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#08090d] text-zinc-100 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-amber-500/10 via-amber-700/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-amber-600/5 blur-[120px] pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-amber-400/30 text-xs font-semibold uppercase tracking-widest text-amber-300 shadow-lg shadow-amber-500/10 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>The Premier Global Photographers Collective</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold tracking-tight text-white leading-[1.15]">
            Where Sacred Moments Become{" "}
            <span className="gold-gradient-text block sm:inline font-serif italic">
              Timeless Heirlooms
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 font-light leading-relaxed">
            Discover verified master wedding, pre-wedding, and celebration visual artists.
            Explore authentic portfolios, transparent pricing, and commission your dream team seamlessly.
          </p>

          {/* Interactive Hero Search Form */}
          <div className="pt-6">
            <HeroSearch />
          </div>

          {/* Value Proposition Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Verified Portfolio Authenticity</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Pro Equipment & 4K Cinema Drones</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
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
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block mb-1">
              Curated Occasions
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Choose the Canvas for Your Story
            </h2>
          </div>
          <Link
            href="/photographers"
            className="text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors group"
          >
            <span>Explore all categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {OCCASIONS.slice(0, 6).map((occ, idx) => {
            // Find a relevant preview image from our seed data
            const matchingPhoto = allCommunityPhotos.find((p) => p.occasion === occ.label);
            const fallbackImage = PHOTOGRAPHERS[idx % PHOTOGRAPHERS.length]?.coverImageUrl;

            return (
              <Link
                key={occ.label}
                href={`/photographers?occasion=${encodeURIComponent(occ.label)}`}
                className="group relative h-72 rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-amber-400/50 transition-all duration-500 shadow-xl"
              >
                <Image
                  src={matchingPhoto?.imageUrl || fallbackImage}
                  alt={occ.label}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-transparent" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                      {occ.label}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                    {occ.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-amber-400/90">
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block mb-1">
              Hand-Selected Masters
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Featured Visual Artisans
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Top-rated creators renowned for exceptional craftsmanship and award-winning wedding portfolios.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {["All", "Wedding", "Pre-Wedding", "Destination", "Traditional"].map((filter) => (
              <button
                key={filter}
                onClick={() => setFeaturedOccasion(filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  featuredOccasion === filter
                    ? "bg-amber-400 text-black font-semibold shadow-md shadow-amber-400/20"
                    : "bg-white/[0.04] text-zinc-300 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {filter === "All" ? "All Specialties" : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Photographers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPhotographers.map((photographer) => (
            <PhotographerCard
              key={photographer.id}
              photographer={photographer}
              onQuickInquire={handleQuickInquire}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/photographers"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-sm font-semibold text-white transition-all group"
          >
            <span>Browse All Available Artists & Studios</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-400" />
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* COMMUNITY SHOWCASE GALLERY (Masonry Preview) */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block mb-2">
            The Living Gallery
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white">
            Moments Immortalized
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3 font-light">
            Real weddings, unscripted tears, grand palaces, and golden sunsets captured across the world.
            Click any portrait to inspect technical details and gear.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allCommunityPhotos.slice(0, 8).map((photo) => (
            <div
              key={photo.id}
              onClick={() => handleOpenPhoto(photo)}
              className="group relative h-80 rounded-xl overflow-hidden cursor-pointer glass-panel border border-white/10 hover:border-amber-400/50 transition-all duration-300"
            >
              <Image
                src={photo.imageUrl}
                alt={photo.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

              <div className="absolute bottom-3 left-3 right-3 flex flex-col justify-end text-left">
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400">
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
      {/* TWO PATHS: FOR CLIENTS VS FOR PHOTOGRAPHERS */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: For Couples & Clients */}
          <div className="p-8 sm:p-10 rounded-2xl glass-panel border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                For Couples & Event Planners
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Find Your Visionary Photographer
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Take the guesswork out of wedding planning. Filter by specific ceremonies (Mehendi, Sangeet, Haldi, Reception), compare itemized packages, and speak directly with the lead artist.
              </p>

              <ul className="space-y-2.5 text-xs text-zinc-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Verified credentials, real camera equipment, and client reviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Itemized package deliverables with zero hidden booking commissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Direct WhatsApp & calendar availability check within 24 hours</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/photographers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
              >
                <span>Find Your Artist Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: For Photographers */}
          <div className="p-8 sm:p-10 rounded-2xl glass-panel-gold border border-amber-400/30 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
                For Professional Photographers & Studios
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Build Your Elite Artist Presence
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Stop relying on social media algorithms. Create your magazine-worthy portfolio, showcase your camera locker, configure custom wedding packages, and receive high-ticket client inquiries.
              </p>

              <ul className="space-y-2.5 text-xs text-zinc-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Showcase categorized galleries by occasion with full EXIF data</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Manage client inquiries, wedding dates, and custom proposals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Fast, high-resolution storage powered by Supabase</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Join As Photographer</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 hover:border-amber-400/40 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/[0.05] transition-all"
              >
                <span>Creator Studio</span>
              </Link>
            </div>
          </div>
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
