"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import LazyImage from "@/components/LazyImage";
import LogoLoader from "@/components/LogoLoader";
import { useParams } from "next/navigation";
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
  AlertTriangle,
  Phone,
  Globe,
  ExternalLink,
} from "lucide-react";
import { getPhotographerBySlug, getSeedPhotographerBySlug } from "@/lib/photographerStore";
import { fetchPhotographerBySlugFromSupabase } from "@/lib/supabase/service";
import { PortfolioItem, Package, Photographer } from "@/lib/types";
import BookingModal from "@/components/BookingModal";
import PhotoLightbox from "@/components/PhotoLightbox";
import ReviewModal from "@/components/ReviewModal";

function formatInstagramUrl(val?: string): string {
  if (!val) return "";
  const clean = val.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  const handle = clean.replace(/^@/, "");
  return `https://instagram.com/${handle}`;
}

function formatWebsiteUrl(val?: string): string {
  if (!val) return "";
  const clean = val.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  return `https://${clean}`;
}

function formatYouTubeUrl(val?: string): string {
  if (!val) return "";
  const clean = val.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  if (clean.startsWith("@")) return `https://youtube.com/${clean}`;
  return `https://${clean}`;
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function PhotographerProfilePage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const [mounted, setMounted] = useState(false);
  const [photographer, setPhotographer] = useState<Photographer | undefined>(() =>
    getSeedPhotographerBySlug(slug)
  );

  useEffect(() => {
    setMounted(true);
    setPhotographer(getPhotographerBySlug(slug));

    // Live query single photographer from Supabase PostgreSQL DB
    if (slug) {
      fetchPhotographerBySlugFromSupabase(slug).then((remote) => {
        if (remote) {
          setPhotographer(remote);
        }
      });
    }

    const handleUpdate = () => {
      setPhotographer(getPhotographerBySlug(slug));
    };
    window.addEventListener("mm_photographers_updated", handleUpdate);
    return () => window.removeEventListener("mm_photographers_updated", handleUpdate);
  }, [slug]);

  const [activeTab, setActiveTab] = useState<"portfolio" | "packages" | "gear" | "reviews">("portfolio");
  const [portfolioOccasion, setPortfolioOccasion] = useState<string>("All");
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewToast, setReviewToast] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!photographer) {
    if (!mounted) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
          <LogoLoader size="md" message="Locating artist profile..." />
        </div>
      );
    }

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <LogoLoader size="md" message="Locating artist profile..." />
        <h2 className="text-xl font-bold text-white mt-6">Photographer Profile Not Found</h2>
        <p className="text-zinc-400 text-sm mt-2 max-w-md">
          The requested visual artisan profile could not be found or has moved to a new studio URL.
        </p>
        <Link
          href="/photographers"
          className="mt-6 px-6 py-2.5 rounded-full bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider hover:bg-emerald-300 transition-colors"
        >
          Explore All Photographers
        </Link>
      </div>
    );
  }

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
    <div className="min-h-screen bg-[#040507] text-zinc-100 pb-20">
      {/* Top Back Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/photographers"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Artists Directory</span>
        </Link>
      </div>

      {/* Pending Approval Notice if applicant is not yet approved */}
      {photographer.status === "pending" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Pending Admin Approval
              </h4>
              <p className="text-[11px] text-zinc-300">
                This studio application is in the curation review queue. It is hidden from public discovery until approved by the Master Admin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Banner */}
      <div className="relative w-full h-80 sm:h-96 mt-4 overflow-hidden">
        <LazyImage
          src={photographer.coverImageUrl}
          alt={photographer.businessName}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          fallbackText={photographer.businessName}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040507] via-[#040507]/60 to-black/30 pointer-events-none" />
      </div>

      {/* Profile Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 relative z-10">
        <div className="glass-panel-green rounded-3xl p-6 sm:p-8 border border-emerald-400/30 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Identity details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xl shrink-0">
                <LazyImage
                  src={photographer.avatarUrl}
                  alt={photographer.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                  showLogoWhileLoading={false}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                    {photographer.businessName}
                  </h1>
                  {photographer.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Verified Master
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-300 font-medium">Lead Artist: {photographer.name}</p>
                <p className="text-xs text-zinc-400 italic max-w-xl">{photographer.tagline}</p>

                {/* Badges / Location / Rating */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {photographer.city}, {photographer.state}, {photographer.country}
                  </span>
                  {photographer.phone && (
                    <a
                      href={`tel:${photographer.phone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 font-mono text-xs font-semibold transition-all hover:scale-105"
                      title="Direct Studio Mobile / WhatsApp"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{photographer.phone}</span>
                    </a>
                  )}
                  {photographer.willingToTravel && (
                    <span className="flex items-center gap-1 text-emerald-300/90">
                      <Plane className="w-3.5 h-3.5" />
                      Worldwide Travel Ready
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("reviews");
                      setIsReviewModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 font-semibold transition-all group/star cursor-pointer"
                    title="Click to rate & review this artist"
                  >
                    <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 group-hover/star:scale-110 transition-transform" />
                    <span>{photographer.rating}</span>
                    <span className="text-zinc-400 font-normal">({photographer.reviewsCount} reviews)</span>
                    <span className="text-[10px] text-emerald-400 underline ml-0.5 font-mono">Rate</span>
                  </button>
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
                  className={`p-3 rounded-xl border transition-all ${isLiked
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
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-400 text-black text-[10px] font-bold rounded shadow-lg whitespace-nowrap">
                      Link Copied!
                    </span>
                  )}
                </button>
                {photographer.phone && (
                  <a
                    href={`https://wa.me/${photographer.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 transition-colors flex items-center justify-center shrink-0"
                    title="Direct WhatsApp with Artist"
                    aria-label="Direct WhatsApp with Artist"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </a>
                )}
                {/* {photographer.socialLinks?.instagram && (
                  <a
                    href={formatInstagramUrl(photographer.socialLinks.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-400 hover:text-pink-300 transition-all hover:scale-105 flex items-center justify-center shrink-0"
                    title="Official Instagram Profile"
                    aria-label="Official Instagram Profile"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {photographer.socialLinks?.youtube && (
                  <a
                    href={formatYouTubeUrl(photographer.socialLinks.youtube)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-all hover:scale-105 flex items-center justify-center shrink-0"
                    title="YouTube Channel / Portfolio"
                    aria-label="YouTube Channel / Portfolio"
                  >
                    <YouTubeIcon className="w-4 h-4" />
                  </a>
                )}
                {photographer.socialLinks?.website && (
                  <a
                    href={formatWebsiteUrl(photographer.socialLinks.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all hover:scale-105 flex items-center justify-center shrink-0"
                    title="Official Studio Website"
                    aria-label="Official Studio Website"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )} */}
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-semibold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
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
                  ₹{photographer.startingPrice.toLocaleString("en-IN")}{" "}
                  <span className="text-xs font-normal text-zinc-400">/ celebration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio statement & Direct Studio Contact & Social Portfolios */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2 font-semibold">
                Artistic Philosophy
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed font-light">{photographer.bio}</p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-start gap-6 shrink-0">
              {/* Direct Studio Contact */}
              {photographer.phone && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Direct Mobile</span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={`tel:${photographer.phone.replace(/\s+/g, "")}`}
                      className="text-sm font-mono font-bold text-white hover:text-emerald-300 transition-colors"
                    >
                      {photographer.phone}
                    </a>
                    <a
                      href={`https://wa.me/${photographer.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono inline-flex items-center gap-1 transition-colors"
                    >
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Online Portfolios & Social Channels */}
              {Boolean(
                photographer.socialLinks?.instagram ||
                photographer.socialLinks?.website ||
                photographer.socialLinks?.youtube
              ) && (
                  <div className="space-y-2 sm:border-l sm:border-white/10 sm:pl-6">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Official Portfolios</span>
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {photographer.socialLinks?.instagram && (
                        <a
                          href={formatInstagramUrl(photographer.socialLinks.instagram)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 hover:text-pink-200 text-xs font-medium inline-flex items-center gap-1.5 transition-all hover:scale-105 shadow-sm"
                          title="Open Instagram Profile"
                        >
                          <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                          <span>Instagram</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                      {photographer.socialLinks?.youtube && (
                        <a
                          href={formatYouTubeUrl(photographer.socialLinks.youtube)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-medium inline-flex items-center gap-1.5 transition-all hover:scale-105 shadow-sm"
                          title="Watch YouTube Channel & Showreel"
                        >
                          <YouTubeIcon className="w-3.5 h-3.5 text-red-400" />
                          <span>YouTube</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                      {photographer.socialLinks?.website && (
                        <a
                          href={formatWebsiteUrl(photographer.socialLinks.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-medium inline-flex items-center gap-1.5 transition-all hover:scale-105 shadow-sm"
                          title="Visit Official Website"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Website</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
            </div>
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
              className={`pb-4 px-3 text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === tab.id
                  ? "text-emerald-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
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
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${portfolioOccasion === occ
                        ? "bg-emerald-400 text-black font-semibold shadow-md shadow-emerald-400/20"
                        : "bg-white/[0.04] text-zinc-300 hover:text-white border border-white/10 hover:border-emerald-400/30"
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
                  className="group relative h-96 rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-emerald-400/50 cursor-pointer transition-all duration-300 shadow-xl"
                >
                  <LazyImage
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    fallbackText={item.occasion}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                      {item.occasion}
                    </span>
                    <h4 className="text-base font-semibold text-white mt-1.5">{item.title}</h4>
                    {item.location && (
                      <p className="text-xs text-zinc-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400" />
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
            {photographer.packages
              .filter((pkg, idx, self) => {
                const key = `${(pkg.name || "").toLowerCase().trim()}_${pkg.price}`;
                return self.findIndex((p) => p.id === pkg.id || `${(p.name || "").toLowerCase().trim()}_${p.price}` === key) === idx;
              })
              .map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-6 sm:p-8 rounded-2xl glass-panel border flex flex-col justify-between relative ${pkg.isPopular
                      ? "border-emerald-400/50 bg-emerald-500/[0.04] shadow-xl shadow-emerald-500/10"
                      : "border-white/10"
                    }`}
                >
                  {pkg.isPopular && (
                    <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 text-black font-semibold text-[10px] uppercase tracking-wider shadow-md shadow-emerald-500/20">
                      Most Popular Choice
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-white">{pkg.name}</h3>
                      <p className="text-xs font-mono text-emerald-400 mt-1">{pkg.duration}</p>
                    </div>

                    <div className="py-3 border-y border-white/10">
                      <span className="text-3xl font-extrabold text-white">
                        ₹{pkg.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-zinc-400 ml-1.5 font-mono">INR</span>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{pkg.description}</p>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <span className="text-xs font-mono uppercase text-zinc-400 block">
                        Deliverables Included:
                      </span>
                      {pkg.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={() => setIsBookingOpen(true)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${pkg.isPopular
                          ? "bg-emerald-400 hover:bg-emerald-300 text-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
                          : "bg-white/[0.06] hover:bg-emerald-500/15 hover:border-emerald-400/40 text-white border border-white/15"
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
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
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
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/30 flex items-center gap-3 text-sm text-zinc-200 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
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
            {/* Reviews Header with Rate CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-white/10">
              <div>
                <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <span>Client Stories & Verified Ratings</span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    ★ {photographer.rating} ({photographer.reviewsCount} reviews)
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Authentic experiences from couples and families across Punjab, Rajasthan, Haryana, Delhi NCR and beyond.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-300 hover:to-green-300 text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all shrink-0 hover:scale-105"
              >
                <Star className="w-3.5 h-3.5 fill-black" />
                <span>Rate & Review Artist</span>
              </button>
            </div>

            {/* Reviews List or Empty State */}
            {photographer.reviews.length === 0 ? (
              <div className="glass-panel p-10 rounded-2xl border border-white/10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6 fill-emerald-400/30 text-emerald-400" />
                </div>
                <h4 className="text-base font-semibold text-white">No Reviews Yet</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Be the first couple or family to share your experience and rate {photographer.businessName}!
                </p>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-5 py-2 rounded-xl bg-white/[0.04] hover:bg-emerald-400 hover:text-black border border-white/10 text-xs font-semibold text-white transition-all inline-flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Leave First Review</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {photographer.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 rounded-2xl glass-panel border border-white/10 space-y-3 flex flex-col justify-between hover:border-emerald-400/30 transition-colors shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-emerald-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-emerald-400" />
                          ))}
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500">{rev.date}</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-400/10 text-[10px] uppercase font-mono text-emerald-300 border border-emerald-400/30 font-medium">
                        {rev.occasion}
                      </span>
                      <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed pt-1">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">— {rev.clientName}</span>
                      <span className="text-[10px] font-mono text-emerald-400/80">✓ Verified Story</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        onSelect={setSelectedPhoto}
      />

      {/* Review Modal */}
      <ReviewModal
        photographer={photographer}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={(newRev) => {
          setReviewToast(`Thank you! Your ${newRev.rating}-star review has been published.`);
          setTimeout(() => setReviewToast(null), 4000);
        }}
      />

      {/* Review Success Toast */}
      {reviewToast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-3 rounded-xl border border-emerald-400/50 bg-emerald-500/20 text-emerald-300 backdrop-blur-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold">
            <Star className="w-4 h-4 fill-emerald-400 text-emerald-400 shrink-0" />
            <span>{reviewToast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
