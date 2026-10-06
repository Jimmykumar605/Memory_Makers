"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Camera, MapPin, ExternalLink, AlertCircle } from "lucide-react";
import { PortfolioItem } from "@/lib/types";

interface PhotoLightboxProps {
  item: PortfolioItem | null;
  items: PortfolioItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: PortfolioItem) => void;
}

export default function PhotoLightbox({
  item,
  items,
  isOpen,
  onClose,
  onSelect,
}: PhotoLightboxProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset loading/error state when current photo changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [item?.id, item?.imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !item) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, item, items]);

  if (!isOpen || !item) return null;

  const currentIndex = items.findIndex((i) => i.id === item.id);

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      onSelect(items[currentIndex + 1]);
    } else {
      onSelect(items[0]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelect(items[currentIndex - 1]);
    } else {
      onSelect(items[items.length - 1]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200 p-3 sm:p-6 photo-overlay-content"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 z-50 flex items-center justify-between pointer-events-none">
        {/* Left: Counter & Occasion */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono text-zinc-300">
            {currentIndex >= 0 ? `${currentIndex + 1} / ${items.length}` : "Photo"}
          </span>
          {item.occasion && (
            <span className="px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              {item.occasion}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {item.imageUrl && (
            <a
              href={item.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-black/70 hover:bg-emerald-400/20 border border-white/10 hover:border-emerald-400/40 text-zinc-300 hover:text-emerald-300 transition-colors"
              title="Open full resolution in new tab"
              aria-label="Open full resolution"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/70 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/40 text-white hover:text-rose-300 transition-colors"
            aria-label="Close lightbox"
            title="Close [Esc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prev button */}
      {items.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-3.5 rounded-full bg-black/70 hover:bg-emerald-400/20 text-white hover:text-emerald-300 border border-white/10 hover:border-emerald-400/40 transition-all shadow-xl hover:scale-105 active:scale-95"
          aria-label="Previous photo"
          title="Previous photo [←]"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {items.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-3.5 rounded-full bg-black/70 hover:bg-emerald-400/20 text-white hover:text-emerald-300 border border-white/10 hover:border-emerald-400/40 transition-all shadow-xl hover:scale-105 active:scale-95"
          aria-label="Next photo"
          title="Next photo [→]"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Center Image Container */}
      <div
        className="relative max-w-6xl max-h-[85vh] w-full h-[78vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/[0.06]">
          {/* Loading Indicator */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none bg-black/60 backdrop-blur-sm">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 rounded-2xl bg-emerald-500/20 blur-md animate-pulse" />
                <div className="relative w-12 h-12 rounded-2xl bg-[#070b09] border border-emerald-400/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Camera className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <span className="mt-3 text-xs font-mono tracking-wider text-emerald-400/80 uppercase">
                Loading Visual...
              </span>
            </div>
          )}

          {/* Fallback if Image Fails */}
          {hasError ? (
            <div className="flex flex-col items-center justify-center text-center p-8 max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-emerald-500/30 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-base font-semibold text-white">Visual Preview</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {item.title || "Uploaded Portfolio Image"}
              </p>
              {item.imageUrl && (
                <a
                  href={item.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-400/15 hover:bg-emerald-400/25 border border-emerald-400/30 text-emerald-300 text-xs font-mono inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Full Resolution</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <Image
              src={item.imageUrl}
              alt={item.title || "Portfolio visual"}
              fill
              sizes="100vw"
              className={`object-contain transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              priority
              unoptimized
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          )}
        </div>

        {/* Caption & Metadata Bar */}
        <div className="mt-3 w-full max-w-3xl px-5 py-3 rounded-2xl bg-[#080d0a]/90 backdrop-blur-xl border border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-300 shadow-2xl">
          <div>
            <h4 className="font-semibold text-white text-sm">{item.title}</h4>
            {item.description && (
              <p className="text-zinc-400 text-xs mt-0.5 max-w-md">{item.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3.5 flex-wrap">
            {item.location && (
              <span className="flex items-center gap-1 text-zinc-400 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {item.location}
              </span>
            )}
            {item.cameraGear && (
              <span className="flex items-center gap-1 text-zinc-400 font-mono text-[11px] bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                {item.cameraGear}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
