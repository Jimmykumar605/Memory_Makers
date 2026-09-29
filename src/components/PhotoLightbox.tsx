"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Camera, MapPin, Tag } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 p-4 sm:p-8">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-emerald-400/20 text-white hover:text-emerald-300 transition-colors"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      {items.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-emerald-400/20 text-white hover:text-emerald-300 border border-white/10 hover:border-emerald-400/40 transition-colors"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {items.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-emerald-400/20 text-white hover:text-emerald-300 border border-white/10 hover:border-emerald-400/40 transition-colors"
          aria-label="Next photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Center Image Container */}
      <div className="relative max-w-5xl max-h-[80vh] w-full h-[75vh] flex flex-col items-center justify-center">
        <div className="relative w-full h-full">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Caption & EXIF metadata bar */}
        <div className="mt-4 w-full max-w-2xl px-5 py-3 rounded-xl bg-black/80 backdrop-blur-md border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-300">
          <div>
            <h4 className="font-semibold text-white text-sm">{item.title}</h4>
            {item.description && <p className="text-zinc-400 text-xs mt-0.5">{item.description}</p>}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 font-medium">
              {item.occasion}
            </span>
            {item.location && (
              <span className="flex items-center gap-1 text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {item.location}
              </span>
            )}
            {item.cameraGear && (
              <span className="flex items-center gap-1 text-zinc-400 font-mono text-[11px]">
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
