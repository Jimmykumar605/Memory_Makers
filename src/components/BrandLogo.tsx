"use client";

import Image from "next/image";

interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showGlow?: boolean;
}

const SIZE_MAP = {
  xs: { width: 24, height: 18, container: "w-6 h-6" },
  sm: { width: 34, height: 26, container: "w-9 h-9" },
  md: { width: 44, height: 33, container: "w-11 h-11" },
  lg: { width: 64, height: 48, container: "w-16 h-16" },
  xl: { width: 96, height: 72, container: "w-24 h-24" },
};

export default function BrandLogo({
  size = "sm",
  className = "",
  showGlow = false,
}: BrandLogoProps) {
  const { width, height, container } = SIZE_MAP[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${container} ${className}`}
    >
      {showGlow && (
        <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full pointer-events-none -z-10" />
      )}
      <Image
        src="/logo.png"
        alt="MemoryMakers Logo"
        width={width}
        height={height}
        priority
        className="object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
