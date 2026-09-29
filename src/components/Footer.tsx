import Link from "next/link";
import { Camera, Heart, Mail, MapPin, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#030405] border-t border-white/[0.07] pt-16 pb-12 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 p-[1px] flex items-center justify-center shadow-md shadow-emerald-500/10">
                <div className="w-full h-full bg-[#050907] rounded-[11px] flex items-center justify-center">
                  <Camera className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <span className="font-serif tracking-widest text-lg font-bold text-white uppercase group-hover:text-emerald-300 transition-colors">
                MEMORY<span className="text-emerald-400">MAKERS</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              The premier global network of elite wedding, editorial, and event visual artists. Connecting discerning couples and clients with visionary photographers who turn fleeting moments into timeless heirlooms.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-400/40 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-400/40 transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="mailto:concierge@memorymakers.art"
                className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-400/40 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Occasions Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-200 mb-4 font-mono">
              Occasions & Styles
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/photographers?occasion=Wedding" className="hover:text-emerald-400 transition-colors">
                  Royal & Palace Weddings
                </Link>
              </li>
              <li>
                <Link href="/photographers?occasion=Pre-Wedding" className="hover:text-emerald-400 transition-colors">
                  Pre-Wedding Escapes
                </Link>
              </li>
              <li>
                <Link href="/photographers?occasion=Destination" className="hover:text-emerald-400 transition-colors">
                  Destination Ceremonies
                </Link>
              </li>
              <li>
                <Link href="/photographers?occasion=Traditional%20%26%20Cultural" className="hover:text-emerald-400 transition-colors">
                  Haldi & Sangeet Rituals
                </Link>
              </li>
              <li>
                <Link href="/photographers?occasion=Maternity%20%26%20Baby" className="hover:text-emerald-400 transition-colors">
                  Maternity & New Life
                </Link>
              </li>
              <li>
                <Link href="/photographers?occasion=Drone%20%26%20Cinematic" className="hover:text-emerald-400 transition-colors">
                  Cinematic 4K Drone Films
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-200 mb-4 font-mono">
              Key Focus States
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/photographers?state=Punjab" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400/80" /> Punjab (Amritsar, Ludhiana)
                </Link>
              </li>
              <li>
                <Link href="/photographers?state=Rajasthan" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400/80" /> Rajasthan (Jaipur, Udaipur)
                </Link>
              </li>
              <li>
                <Link href="/photographers?state=Delhi%20NCR" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400/80" /> Delhi NCR (Delhi, Gurgaon)
                </Link>
              </li>
              <li>
                <Link href="/photographers?state=Chandigarh" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400/80" /> Chandigarh (Tricity)
                </Link>
              </li>
              <li>
                <Link href="/photographers?state=Haryana" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400/80" /> Haryana (Gurugram, Karnal)
                </Link>
              </li>
              <li>
                <Link href="/photographers?state=Himachal%20Pradesh" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400/80" /> Himachal (Shimla, Manali)
                </Link>
              </li>
            </ul>
          </div>

          {/* For Creators & Community */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-200 mb-4 font-mono">
              For Photographers
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Create Artist Profile
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Creator Studio Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Upload Portfolio Galleries
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Manage Client Inquiries
                </Link>
              </li>
              <li>
                <span className="inline-block mt-2 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                  Supabase Powered
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} MemoryMakers Inc. All rights reserved. Crafted for visual storytellers.</p>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Made with passion for immortalizing moments</span>
            <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
