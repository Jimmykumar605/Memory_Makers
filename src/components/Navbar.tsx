"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Camera,
  Search,
  User,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Clock,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, role, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.location.hash) {
        window.history.pushState(null, "", "/");
      }
    }
    setMobileMenuOpen(false);
  };

  const handleSectionClick = (e: React.MouseEvent, sectionId: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const elem = document.getElementById(sectionId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `/#${sectionId}`);
      }
    } else {
      router.push(`/#${sectionId}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/[0.08] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 group shrink-0"
          >
            <BrandLogo size="md" showGlow />
            <div className="flex flex-col">
              <span className="font-serif tracking-widest text-lg font-bold text-white uppercase group-hover:text-emerald-300 transition-colors">
                MEMORY<span className="text-emerald-400">MAKERS</span>
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-mono -mt-1">
                Visual Artisans
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/photographers"
              className="text-xs lg:text-sm font-semibold uppercase tracking-wider text-zinc-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-emerald-400/80" />
              Find Photographers
            </Link>
            <Link
              href="/#how-it-works"
              onClick={(e) => handleSectionClick(e, "how-it-works")}
              className="text-xs lg:text-sm font-semibold uppercase tracking-wider text-zinc-300 hover:text-emerald-400 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#faq"
              onClick={(e) => handleSectionClick(e, "faq")}
              className="text-xs lg:text-sm font-semibold uppercase tracking-wider text-zinc-300 hover:text-emerald-400 transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* Vertical Divider */}
            <span className="h-5 w-px bg-white/15" aria-hidden="true" />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {role === "admin" && (
                  <Link
                    href="/admin"
                    className="px-3.5 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-amber-400/20 transition-all shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Master Admin</span>
                  </Link>
                )}

                {role === "photographer" && (
                  user?.status === "pending" || user?.photographerStatus === "pending" ? (
                    <Link
                      href="/dashboard"
                      className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/20 transition-all shadow-sm"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pending Approval</span>
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all shadow-sm"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Studio Dashboard</span>
                    </Link>
                  )
                )}

                {role === "client" && (
                  <div className="px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-mono">
                    <span>{user.name}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => logout("/photographers")}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/30 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-rose-700 dark:hover:text-rose-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Sign out of account"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 group-hover:text-rose-500" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                {/* Sign In Button */}
                <Link
                  href="/login?mode=signin"
                  className="px-5 py-2.5 rounded-full border border-white/20 hover:border-emerald-400/60 hover:bg-white/[0.04] text-xs font-semibold uppercase tracking-wider text-zinc-100 hover:text-emerald-300 transition-all duration-200"
                >
                  Sign In
                </Link>

                {/* Join As Photographer Button */}
                <Link
                  href="/login?role=photographer"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 hover:from-emerald-300 hover:to-green-300 text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-200 shrink-0"
                >
                  Join As Photographer
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Link
              href={isAuthenticated ? (role === "admin" ? "/admin" : role === "photographer" ? "/dashboard" : "/photographers") : "/login"}
              className="p-2 text-zinc-300 hover:text-white rounded-lg border border-white/10"
              aria-label="Account"
            >
              <User className="w-4 h-4 text-emerald-400" />
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
            className="block px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wider text-zinc-200 hover:text-emerald-400 hover:bg-emerald-500/[0.05]"
          >
            Find Photographers
          </Link>
          <Link
            href="/#how-it-works"
            onClick={(e) => handleSectionClick(e, "how-it-works")}
            className="block px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wider text-zinc-200 hover:text-emerald-400 hover:bg-emerald-500/[0.05]"
          >
            How It Works
          </Link>
          <Link
            href="/#faq"
            onClick={(e) => handleSectionClick(e, "faq")}
            className="block px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wider text-zinc-200 hover:text-emerald-400 hover:bg-emerald-500/[0.05]"
          >
            FAQ
          </Link>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5 text-xs font-mono text-zinc-400">
                  Signed in as <span className="text-white font-semibold">{user.name}</span> ({user.role})
                </div>
                {role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl bg-amber-400/20 text-amber-300 text-xs font-bold font-mono"
                  >
                    Master Admin Portal
                  </Link>
                )}
                {role === "photographer" && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-center py-2.5 rounded-xl text-xs font-bold ${user?.status === "pending" || user?.photographerStatus === "pending"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300"
                      }`}
                  >
                    {user?.status === "pending" || user?.photographerStatus === "pending"
                      ? "Pending Approval"
                      : "Studio Workspace"}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout("/photographers");
                  }}
                  className="w-full flex items-center justify-center py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-500/20 shadow-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login?mode=signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-full border border-white/20 text-xs font-semibold uppercase tracking-wider text-white hover:border-emerald-400"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?role=photographer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 text-black text-xs font-bold uppercase tracking-wider shadow-md shadow-emerald-500/20"
                >
                  Join As Photographer
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
