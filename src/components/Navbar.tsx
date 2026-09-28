"use client";

import Link from "next/link";
import { useState } from "react";
import { Camera, Search, User, Menu, X, Sparkles, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/[0.08] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-[1px] flex items-center justify-center shadow-lg shadow-amber-500/10">
              <div className="w-full h-full bg-[#0d0f17] rounded-[11px] flex items-center justify-center group-hover:bg-[#121522] transition-colors">
                <Camera className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif tracking-widest text-lg font-bold text-white uppercase group-hover:text-amber-200 transition-colors">
                MEMORY<span className="text-amber-400">MAKERS</span>
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-mono -mt-1">
                Visual Artisans
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/photographers"
              className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-amber-400/80" />
              Find Photographers
            </Link>
            <Link
              href="/photographers?occasion=Wedding"
              className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors"
            >
              Weddings
            </Link>
            <Link
              href="/photographers?occasion=Pre-Wedding"
              className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors"
            >
              Pre-Wedding
            </Link>
            <Link
              href="/photographers?occasion=Destination"
              className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors"
            >
              Destination
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white px-3.5 py-2 rounded-lg border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.03] transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              Creator Studio
            </Link>
            <Link
              href="/login"
              className="relative inline-flex items-center justify-center p-[1px] overflow-hidden rounded-lg font-medium group transition-all"
            >
              <span className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 group-hover:from-amber-300 group-hover:to-amber-500 absolute"></span>
              <span className="relative px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 rounded-[7px] transition-all duration-200 group-hover:bg-amber-300 flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Join / Sign In
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/login"
              className="p-2 text-zinc-300 hover:text-white rounded-lg border border-white/10"
            >
              <User className="w-4 h-4 text-amber-400" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-white rounded-lg border border-white/10 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/photographers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-zinc-200 hover:text-amber-400 hover:bg-white/[0.05]"
          >
            Find Photographers
          </Link>
          <Link
            href="/photographers?occasion=Wedding"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-zinc-200 hover:text-amber-400 hover:bg-white/[0.05]"
          >
            Wedding Photography
          </Link>
          <Link
            href="/photographers?occasion=Pre-Wedding"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-zinc-200 hover:text-amber-400 hover:bg-white/[0.05]"
          >
            Pre-Wedding Shoots
          </Link>
          <Link
            href="/photographers?occasion=Destination"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-zinc-200 hover:text-amber-400 hover:bg-white/[0.05]"
          >
            Destination Weddings
          </Link>
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/15 text-sm font-medium text-zinc-200 hover:bg-white/[0.05]"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              Creator Studio
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold tracking-wide uppercase"
            >
              <Sparkles className="w-4 h-4" />
              Join Community / Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
