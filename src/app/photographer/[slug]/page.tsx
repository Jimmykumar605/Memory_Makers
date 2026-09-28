"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  MapPin,
  Plane,
  ShieldCheck,
  Calendar,
  Share2,
  Heart,
  Camera,
  Check,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { PHOTOGRAPHERS } from "@/lib/data";
import { PortfolioItem, Package } from "@/lib/types";
import BookingModal from "@/components/BookingModal";
import PhotoLightbox from "@/components/PhotoLightbox";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PhotographerProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const photographer = PHOTOGRAPHERS.find((p) => p.slug === slug);
  if (!photographer) {
    notFound();
  }

  const [activeTab, setActiveTab] = useState<"portfolio" | "packages" | "gear" | "reviews">("portfolio");
  const [portfolioOccasion, setPortfolioOccasion] = useState<string>("All");
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Filter photographer's portfolio
  const filteredPortfolio =
    portfolioOccasion === "All"
      ? photographer.portfolio
      : photographer.portfolio.filter((p) => p.occasion === portfolioOccasion);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 pb-20">
      {/* Top Back Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/photographers"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Artists Directory</span>
        </Link>
      </div>

      {/* Cover Image Banner */}
      <div className="relative w-full h-80 sm:h-96 mt-4 overflow-hidden">
        <Image
          src={photographer.coverImageUrl}
          alt={photographer.businessName}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-black/30" />
      </div>

      {/* Profile Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 relative z-10">
        <div className="glass-panel-gold rounded-3xl p-6 sm:p-8 border border-amber-400/30 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Identity details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl shrink-0">
                <Image
                  src={photographer.avatarUrl}
                  alt={photographer.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                    {photographer.businessName}
                  </h1>
                  {photographer.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Verified Master
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-300 font-medium">Lead Artist: {photographer.name}</p>
                <p className="text-xs text-zinc-400 italic max-w-xl">{photographer.tagline}</p>

                {/* Badges / Location / Rating */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {photographer.city}, {photographer.state}, {photographer.country}
                  </span>
                  {photographer.willingToTravel && (
                    <span className="flex items-center gap-1 text-amber-300/90">
                      <Plane className="w-3.5 h-3.5" />
                      Worldwide Travel Ready
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {photographer.rating} ({photographer.reviewsCount} reviews)
                  </span>
                  <span className="text-zinc-500">•</span>
                  <span>{photographer.experienceYears} Years Experience</span>
                </div>
              </div>
            </div>

            {/* CTAs & Socials */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 rounded-xl border transition-all ${
                    isLiked
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                      : "bg-white/[0.04] border-white/10 text-zinc-300 hover:text-white"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white transition-colors relative"
                  aria-label="Share profile"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedNotification && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-amber-400 text-black text-[10px] font-bold rounded shadow-lg whitespace-nowrap">
                      Link Copied!
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-semibold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Commission / Inquire Dates</span>
                </button>
              </div>

              {/* Price Callout */}
              <div className="text-left sm:text-right pt-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                  Starting Investment
                </span>
                <div className="text-xl font-bold text-white">
                  ${photographer.startingPrice.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-zinc-400">/ celebration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio statement */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">
              Artistic Philosophy
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-light">{photographer.bio}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-white/10 mt-10 overflow-x-auto pb-px">
          {[
            { id: "portfolio", label: `Portfolio (${photographer.portfolio.length})` },
            { id: "packages", label: `Packages & Pricing (${photographer.packages.length})` },
            { id: "gear", label: `Equipment Locker (${photographer.gearList.length})` },
            { id: "reviews", label: `Client Stories (${photographer.reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-amber-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              )}
            </button>
          ))}
        </div>

        {/* ===================================================================== */}
        {/* TAB 1: PORTFOLIO GALLERIES */}
        {/* ===================================================================== */}
        {activeTab === "portfolio" && (
          <div className="py-8 space-y-6">
            {/* Occasion Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-mono uppercase text-zinc-400 shrink-0">Filter:</span>
              {["All", ...Array.from(new Set(photographer.portfolio.map((p) => p.occasion)))].map(
                (occ) => (
                  <button
                    key={occ}
                    onClick={() => setPortfolioOccasion(occ)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      portfolioOccasion === occ
                        ? "bg-amber-400 text-black font-semibold"
                        : "bg-white/[0.04] text-zinc-300 hover:text-white border border-white/10"
                    }`}
                  >
                    {occ}
                  </button>
                )
              )}
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolio.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedPhoto(item);
                    setIsLightboxOpen(true);
                  }}
                  className="group relative h-96 rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-amber-400/50 cursor-pointer transition-all duration-300 shadow-xl"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {item.occasion}
                    </span>
                    <h4 className="text-base font-semibold text-white mt-1.5">{item.title}</h4>
                    {item.location && (
                      <p className="text-xs text-zinc-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        {item.location}
                      </p>
                    )}
                    {item.cameraGear && (
                      <p className="text-[11px] text-zinc-400 font-mono mt-1">
                        📷 {item.cameraGear}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: PACKAGES & PRICING */}
        {/* ===================================================================== */}
        {activeTab === "packages" && (
          <div className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {photographer.packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-6 sm:p-8 rounded-2xl glass-panel border flex flex-col justify-between relative ${
                  pkg.isPopular
                    ? "border-amber-400/50 bg-amber-500/[0.03] shadow-xl shadow-amber-500/10"
                    : "border-white/10"
                }`}
              >
                {pkg.isPopular && (
                  <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-semibold text-[10px] uppercase tracking-wider">
                    Most Popular Choice
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-white">{pkg.name}</h3>
                    <p className="text-xs font-mono text-amber-400 mt-1">{pkg.duration}</p>
                  </div>

                  <div className="py-3 border-y border-white/10">
                    <span className="text-3xl font-extrabold text-white">
                      ${pkg.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-400 ml-1.5 font-mono">USD</span>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{pkg.description}</p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-mono uppercase text-zinc-400 block">
                      Deliverables Included:
                    </span>
                    {pkg.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                      pkg.isPopular
                        ? "bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/20"
                        : "bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15"
                    }`}
                  >
                    Select & Reserve Dates
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: GEAR LOCKER */}
        {/* ===================================================================== */}
        {activeTab === "gear" && (
          <div className="py-8 max-w-4xl space-y-6">
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
                <Camera className="w-4 h-4" />
                <span>Verified Hardware & Optics</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">Camera Locker & Cinema Suite</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                We believe exceptional artistry requires uncompromising equipment reliability. Here is the exact flagship gear utilized during wedding shoots:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3">
                {photographer.gearList.map((gear, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3 text-sm text-zinc-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                    <span>{gear}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 4: REVIEWS & STORIES */}
        {/* ===================================================================== */}
        {activeTab === "reviews" && (
          <div className="py-8 max-w-4xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {photographer.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-2xl glass-panel border border-white/10 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500">{rev.date}</span>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded bg-white/[0.05] text-[10px] uppercase font-mono text-amber-300 border border-white/10">
                      {rev.occasion}
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed pt-1">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 text-xs font-semibold text-white">
                    — {rev.clientName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        photographer={photographer}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      {/* Photo Lightbox */}
      <PhotoLightbox
        item={selectedPhoto}
        items={photographer.portfolio}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onSelect={(item) => setSelectedPhoto(item)}
      />
    </div>
  );
}
