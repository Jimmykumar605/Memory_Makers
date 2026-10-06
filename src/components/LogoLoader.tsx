"use client";

import BrandLogo from "@/components/BrandLogo";

interface LogoLoaderProps {
  message?: string;
  submessage?: string;
  size?: "sm" | "md" | "lg" | "fullscreen";
  className?: string;
}

export default function LogoLoader({
  message = "Loading visual artisans...",
  submessage = "MemoryMakers Collective",
  size = "md",
  className = "",
}: LogoLoaderProps) {
  if (size === "fullscreen") {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#040605]/95 backdrop-blur-xl ${className}`}>
        {/* Ambient radial glow */}
        <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-pulse" />

        <div className="relative flex flex-col items-center">
          {/* Animated concentric pulse rings */}
          <div className="relative flex items-center justify-center">
            {/* Outer expanding ping ring */}
            <div className="absolute w-28 h-28 rounded-2xl border border-emerald-400/30 animate-ping opacity-40 duration-1000" />
            
            {/* Middle pulsing glow */}
            <div className="absolute w-24 h-24 rounded-2xl bg-emerald-500/20 blur-md animate-pulse" />

            {/* Rotating gradient ring */}
            <div className="relative flex items-center justify-center animate-pulse">
              <BrandLogo size="lg" showGlow />
            </div>
          </div>

          {/* Brand & Loading Info */}
          <div className="mt-8 text-center space-y-2">
            <h3 className="font-serif tracking-widest text-lg font-bold text-white uppercase">
              MEMORY<span className="text-emerald-400">MAKERS</span>
            </h3>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400/90 animate-pulse">
              {message}
            </p>
            {submessage && (
              <p className="text-[11px] text-zinc-500 font-mono tracking-wider">
                {submessage}
              </p>
            )}
          </div>

          {/* Minimalist emerald loading progress bar */}
          <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 rounded-full animate-progress-indeterminate" />
          </div>
        </div>
      </div>
    );
  }

  // Medium / Component size (used for cards, modals, skeletons)
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  return (
    <div className={`flex flex-col items-center justify-center py-10 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Soft glow */}
        <div className={`absolute rounded-2xl bg-emerald-500/20 blur-md animate-pulse ${
          isLarge ? "w-16 h-16" : isSmall ? "w-8 h-8" : "w-12 h-12"
        }`} />

        {/* Logo Container */}
        <div className="relative flex items-center justify-center animate-pulse">
          <BrandLogo size={isLarge ? "md" : isSmall ? "xs" : "sm"} showGlow />
        </div>
      </div>

      {message && (
        <p className={`mt-3 font-mono text-zinc-400 tracking-wider animate-pulse ${
          isSmall ? "text-[10px]" : "text-xs"
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}
