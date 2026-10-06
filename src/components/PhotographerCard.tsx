"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Star, MapPin, CheckCircle, ArrowRight, ShieldCheck, Heart, Briefcase } from "lucide-react";
import LazyImage from "@/components/LazyImage";
import { Photographer } from "@/lib/types";

interface PhotographerCardProps {
  photographer: Photographer;
  onQuickInquire?: (photographer: Photographer) => void;
}

export default function PhotographerCard({ photographer, onQuickInquire }: PhotographerCardProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // Combine cover and first 2 portfolio images for preview tabs
  const previewImages = [
    photographer.coverImageUrl,
    ...((photographer.portfolio || []).slice(0, 2).map((p) => p.imageUrl)),
  ];

  return (
    <div className="group relative rounded-2xl glass-panel border border-white/[0.08] hover:border-emerald-400/50 transition-all duration-500 overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-emerald-500/15">
      {/* Top Image Preview Carousel */}
      <div className="relative w-full h-64 overflow-hidden bg-black/50 photo-overlay-content">
        <LazyImage
          src={previewImages[activeImageIdx] || photographer.coverImageUrl}
          alt={photographer.businessName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          fallbackText={photographer.businessName}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040605] via-black/30 to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          {photographer.verified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-emerald-400/40 text-[11px] font-semibold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Master
            </span>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsSaved(!isSaved);
            }}
            className="pointer-events-auto p-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white hover:text-rose-400 transition-colors"
            aria-label="Save to wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-all ${isSaved ? "fill-rose-500 text-rose-500 scale-110" : "text-white"
                }`}
            />
          </button>
        </div>

        {/* Preview Image Dots */}
        {previewImages.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
            {previewImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveImageIdx(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIdx === idx ? "w-6 bg-emerald-400" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                aria-label={`Preview photo ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Photographer Avatar & Identity Header */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-400/40 shrink-0">
                <LazyImage
                  src={photographer.avatarUrl}
                  alt={photographer.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  showLogoWhileLoading={false}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                    {photographer.businessName}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 truncate">by {photographer.name}</p>
              </div>
            </div>

            {/* Experience Badge */}
            <div
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-mono font-medium shadow-sm"
              title={`${photographer.experienceYears ?? 1} Years of Experience`}
            >
              <Briefcase className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{photographer.experienceYears ?? 1} {(photographer.experienceYears ?? 1) === 1 ? "Yr" : "Yrs"} Exp</span>
            </div>
          </div>

          {/* Location and Rating info */}
          <div className="flex items-center justify-between text-xs text-zinc-400 mt-3 pt-3 border-t border-white/[0.06]">
            <span className="flex items-center gap-1 truncate font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
              {photographer.city}, {photographer.state}
            </span>
            <span className="flex items-center gap-1 font-medium text-emerald-300">
              <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              {photographer.rating.toFixed(2)}{" "}
              <span className="text-zinc-500 font-normal">({photographer.reviewsCount})</span>
            </span>
          </div>

          {/* Specialties Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {photographer.specialties.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300"
              >
                {spec}
              </span>
            ))}
            {photographer.specialties.length > 3 && (
              <span className="px-1.5 py-0.5 text-[11px] text-zinc-500">
                +{photographer.specialties.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
              Starting from
            </span>
            <span className="text-base font-bold text-white tracking-tight">
              ₹{photographer.startingPrice.toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-zinc-400">/ event</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onQuickInquire && (
              <button
                type="button"
                onClick={() => onQuickInquire(photographer)}
                className="px-3 py-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 border border-emerald-400/40 hover:border-emerald-400/80 rounded-lg hover:bg-emerald-400/10 transition-all"
              >
                Inquire
              </button>
            )}
            <Link
              href={`/photographer/${photographer.slug}`}
              className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold bg-white/[0.08] hover:bg-emerald-400 hover:text-black text-white rounded-lg transition-all duration-300"
            >
              Portfolio
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
