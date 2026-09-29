"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { Camera } from "lucide-react";

interface LazyImageProps extends Omit<ImageProps, "onLoad" | "onError" | "src"> {
  src?: string | null;
  fallbackText?: string;
  showLogoWhileLoading?: boolean;
}

export default function LazyImage({
  src,
  alt = "Visual Showcase",
  className = "",
  fallbackText,
  showLogoWhileLoading = true,
  ...props
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // If no src is provided, immediately display graceful fallback without triggering Next.js Image error
  if (!src || (typeof src === "string" && !src.trim())) {
    return (
      <div className={`relative w-full h-full min-h-[100px] overflow-hidden bg-[#070b09] flex flex-col items-center justify-center text-zinc-500 p-4 text-center ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-2">
          <Camera className="w-5 h-5 text-emerald-400/60" />
        </div>
        <span className="text-[11px] font-mono text-zinc-400 truncate max-w-full">
          {alt || fallbackText || "Visual Showcase"}
        </span>
        <span className="text-[10px] text-zinc-600 font-mono">MemoryMakers Showcase</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#070b09]">
      {/* While loading: Show the MemoryMakers Camera Logo Icon with soft emerald pulse */}
      {isLoading && showLogoWhileLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070b09] z-10 animate-fade-in pointer-events-none">
          {/* Subtle glowing ring with camera icon */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-12 h-12 rounded-xl bg-emerald-500/15 blur-sm animate-pulse" />
            <div className="relative w-9 h-9 rounded-xl bg-white/[0.05] border border-emerald-400/30 flex items-center justify-center shadow-sm shadow-emerald-500/10">
              <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
          </div>
          {fallbackText && (
            <span className="mt-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              {fallbackText}
            </span>
          )}
          {/* Subtle bottom shimmer */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent animate-shimmer" />
          </div>
        </div>
      )}

      {/* Fallback if image fails to load */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070b09] text-zinc-500 p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-2">
            <Camera className="w-5 h-5 text-emerald-400/60" />
          </div>
          <span className="text-[11px] font-mono text-zinc-400 truncate max-w-full">
            {alt || "Visual Showcase"}
          </span>
          <span className="text-[10px] text-zinc-600 font-mono">MemoryMakers Portfolio</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          loading={props.priority ? undefined : "lazy"}
          unoptimized={props.unoptimized ?? (typeof src === "string" && (!src.startsWith("/") && !src.includes("images.unsplash.com")))}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`transition-all duration-700 ease-out ${
            isLoading ? "opacity-0 scale-[1.03] blur-sm" : "opacity-100 scale-100 blur-0"
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
