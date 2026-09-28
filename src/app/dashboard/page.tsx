"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Calendar,
  DollarSign,
  Package as PackageIcon,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  MapPin,
  Settings,
  Eye,
  UploadCloud,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { PHOTOGRAPHERS, OCCASIONS } from "@/lib/data";
import { PortfolioItem, Package, BookingInquiry, OccasionType } from "@/lib/types";

export default function PhotographerDashboardPage() {
  // Use first photographer as active profile in studio demo
  const initialPhotographer = PHOTOGRAPHERS[0];

  const [activeTab, setActiveTab] = useState<"profile" | "portfolio" | "packages" | "inquiries" | "gear">("profile");

  // Editable Profile State
  const [businessName, setBusinessName] = useState(initialPhotographer.businessName);
  const [artistName, setArtistName] = useState(initialPhotographer.name);
  const [tagline, setTagline] = useState(initialPhotographer.tagline);
  const [bio, setBio] = useState(initialPhotographer.bio);
  const [city, setCity] = useState(initialPhotographer.city);
  const [startingPrice, setStartingPrice] = useState(initialPhotographer.startingPrice);
  const [willingToTravel, setWillingToTravel] = useState(initialPhotographer.willingToTravel);
  const [specialties, setSpecialties] = useState<OccasionType[]>(initialPhotographer.specialties);

  // Portfolio items state
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initialPhotographer.portfolio);
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoOccasion, setNewPhotoOccasion] = useState<OccasionType>("Wedding");
  const [newPhotoLocation, setNewPhotoLocation] = useState("");
  const [newPhotoGear, setNewPhotoGear] = useState("");

  // Packages state
  const [packages, setPackages] = useState<Package[]>(initialPhotographer.packages);
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgPrice, setNewPkgPrice] = useState("");
  const [newPkgDuration, setNewPkgDuration] = useState("");
  const [newPkgDeliverables, setNewPkgDeliverables] = useState("");

  // Inquiries State
  const [inquiries, setInquiries] = useState<BookingInquiry[]>([
    {
      id: "inq-101",
      photographerId: initialPhotographer.id,
      clientName: "Ananya & Rohan Varma",
      clientEmail: "ananya.varma@example.com",
      clientPhone: "+91 98201 44552",
      occasion: "Wedding",
      eventDate: "2026-11-18",
      location: "Jagmandir Island Palace, Udaipur",
      budget: "4000",
      notes: "Looking for 3-day royal celebration coverage including Sangeet & Pheras. Want drone aerials included.",
      status: "pending",
      createdAt: "2026-09-20",
    },
    {
      id: "inq-102",
      photographerId: initialPhotographer.id,
      clientName: "Meera & Siddharth",
      clientEmail: "meera.s@example.com",
      clientPhone: "+91 97110 32190",
      occasion: "Pre-Wedding",
      eventDate: "2026-10-05",
      location: "Jaisalmer Fort Dunes",
      budget: "1000",
      notes: "Sunset pre-wedding shoot with ethnic and western outfits.",
      status: "accepted",
      createdAt: "2026-09-15",
    },
  ]);

  // Gear Locker state
  const [gearList, setGearList] = useState<string[]>(initialPhotographer.gearList);
  const [newGearItem, setNewGearItem] = useState("");

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Toggle Specialty
  const toggleSpecialty = (occ: OccasionType) => {
    if (specialties.includes(occ)) {
      setSpecialties(specialties.filter((s) => s !== occ));
    } else {
      setSpecialties([...specialties, occ]);
    }
  };

  // Add Portfolio Photo
  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle || !newPhotoUrl) return;

    const newItem: PortfolioItem = {
      id: `port-new-${Date.now()}`,
      title: newPhotoTitle,
      imageUrl: newPhotoUrl,
      occasion: newPhotoOccasion,
      location: newPhotoLocation || undefined,
      cameraGear: newPhotoGear || undefined,
    };

    setPortfolio([newItem, ...portfolio]);
    setNewPhotoTitle("");
    setNewPhotoUrl("");
    setNewPhotoLocation("");
    setNewPhotoGear("");
    triggerSaveToast();
  };

  // Delete Portfolio Photo
  const handleDeletePhoto = (id: string) => {
    setPortfolio(portfolio.filter((p) => p.id !== id));
  };

  // Add Package
  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName || !newPkgPrice) return;

    const newPkg: Package = {
      id: `pkg-${Date.now()}`,
      name: newPkgName,
      price: parseFloat(newPkgPrice),
      duration: newPkgDuration || "Full Day",
      description: "Custom tailored photography collection",
      deliverables: newPkgDeliverables
        ? newPkgDeliverables.split(",").map((s) => s.trim())
        : ["Master color-graded images", "Online cloud gallery"],
    };

    setPackages([...packages, newPkg]);
    setNewPkgName("");
    setNewPkgPrice("");
    setNewPkgDuration("");
    setNewPkgDeliverables("");
    triggerSaveToast();
  };

  // Add Gear
  const handleAddGear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGearItem) return;
    setGearList([...gearList, newGearItem]);
    setNewGearItem("");
    triggerSaveToast();
  };

  const triggerSaveToast = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdateInquiryStatus = (id: string, status: "accepted" | "declined") => {
    setInquiries(
      inquiries.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Toast Notification */}
        {saveSuccess && (
          <div className="fixed top-24 right-6 z-50 px-4 py-3 rounded-xl bg-amber-400 text-black font-semibold text-xs flex items-center gap-2 shadow-2xl animate-in slide-in-from-top-2">
            <Check className="w-4 h-4" />
            <span>Studio profile changes saved!</span>
          </div>
        )}

        {/* Studio Top Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-amber-400/40 shrink-0">
              <Image
                src={initialPhotographer.avatarUrl}
                alt={initialPhotographer.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {businessName || "My Photography Studio"}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[10px] font-mono border border-amber-400/30">
                  Creator Portal
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Logged in as <span className="text-zinc-200">{artistName}</span> • {city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/photographer/${initialPhotographer.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white transition-colors"
            >
              <span>View Public Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>
            <button
              onClick={triggerSaveToast}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
            >
              Save Profile
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              Client Inquiries
              <Calendar className="w-4 h-4 text-amber-400" />
            </span>
            <div className="text-2xl font-bold text-white">{inquiries.length} New Requests</div>
            <p className="text-[11px] text-zinc-400">1 pending approval</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              Portfolio Items
              <Camera className="w-4 h-4 text-amber-400" />
            </span>
            <div className="text-2xl font-bold text-white">{portfolio.length} Master Shots</div>
            <p className="text-[11px] text-zinc-400">Across 4 occasion albums</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              Active Packages
              <PackageIcon className="w-4 h-4 text-amber-400" />
            </span>
            <div className="text-2xl font-bold text-white">{packages.length} Offerings</div>
            <p className="text-[11px] text-zinc-400">From ${startingPrice} / event</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              Rating & Trust
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </span>
            <div className="text-2xl font-bold text-white">4.95 ★</div>
            <p className="text-[11px] text-zinc-400">Based on 78 verified couples</p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-px">
          {[
            { id: "profile", label: "Studio Info & Specialties" },
            { id: "portfolio", label: `Portfolio Photos (${portfolio.length})` },
            { id: "packages", label: `Pricing Packages (${packages.length})` },
            { id: "inquiries", label: `Client Inquiries (${inquiries.length})` },
            { id: "gear", label: `Gear Locker (${gearList.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-amber-400"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
              )}
            </button>
          ))}
        </div>

        {/* =================================================================== */}
        {/* TAB 1: STUDIO INFO & SPECIALTIES */}
        {/* =================================================================== */}
        {activeTab === "profile" && (
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6 max-w-4xl">
            <h2 className="text-lg font-serif font-bold text-white">Studio Profile & Contact Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Business / Studio Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Lead Photographer Name
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Editorial Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  City / Base Region
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Starting Investment ($ USD)
                </label>
                <input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2.5 cursor-pointer py-3 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={willingToTravel}
                    onChange={(e) => setWillingToTravel(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  <span>Willing to travel worldwide</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Artist Bio & Philosophy
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Specialties Picker */}
            <div className="pt-2">
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                Occasions & Photography Styles You Cater To
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((occ) => {
                  const isSelected = specialties.includes(occ.label);
                  return (
                    <button
                      key={occ.label}
                      type="button"
                      onClick={() => toggleSpecialty(occ.label)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-amber-400 text-black font-semibold shadow-md shadow-amber-400/20"
                          : "bg-white/[0.04] text-zinc-300 hover:text-white border border-white/10"
                      }`}
                    >
                      {occ.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={triggerSaveToast}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Save Studio Changes
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: PORTFOLIO PHOTOS MANAGER */}
        {/* =================================================================== */}
        {activeTab === "portfolio" && (
          <div className="space-y-8">
            {/* Add New Photo Form */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase">
                <UploadCloud className="w-4 h-4" />
                <span>Upload New Portfolio Shot</span>
              </div>

              <form onSubmit={handleAddPhoto} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    placeholder="e.g. Royal Twilight Vows"
                    className="w-full px-3 py-2 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    High-Res Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Occasion *
                  </label>
                  <select
                    value={newPhotoOccasion}
                    onChange={(e) => setNewPhotoOccasion(e.target.value as OccasionType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {OCCASIONS.map((occ) => (
                      <option key={occ.label} value={occ.label} className="bg-[#12141f]">
                        {occ.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Camera & Lens
                  </label>
                  <input
                    type="text"
                    value={newPhotoGear}
                    onChange={(e) => setNewPhotoGear(e.target.value)}
                    placeholder="Sony A1 • 85mm f/1.4"
                    className="w-full px-3 py-2 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add To Gallery</span>
                </button>
              </form>
            </div>

            {/* Existing Portfolio Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="group relative h-72 rounded-2xl overflow-hidden glass-panel border border-white/10 flex flex-col justify-end p-4 shadow-lg"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Top Delete Button */}
                  <button
                    onClick={() => handleDeletePhoto(item.id)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-rose-500 text-white transition-colors z-10"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="relative z-10 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {item.occasion}
                    </span>
                    <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                    {item.cameraGear && (
                      <p className="text-[10px] text-zinc-400 font-mono truncate">{item.cameraGear}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: PACKAGES & PRICING */}
        {/* =================================================================== */}
        {activeTab === "packages" && (
          <div className="space-y-8">
            {/* Add Package */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase">
                <Plus className="w-4 h-4" />
                <span>Create New Wedding or Occasion Package</span>
              </div>

              <form onSubmit={handleAddPackage} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPkgName}
                    onChange={(e) => setNewPkgName(e.target.value)}
                    placeholder="e.g. Royal Haldi & Sangeet"
                    className="w-full px-3 py-2 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPkgPrice}
                    onChange={(e) => setNewPkgPrice(e.target.value)}
                    placeholder="1200"
                    className="w-full px-3 py-2 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newPkgDuration}
                    onChange={(e) => setNewPkgDuration(e.target.value)}
                    placeholder="Full Day (8 Hours)"
                    className="w-full px-3 py-2 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Package</span>
                </button>
              </form>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-serif font-bold text-white">{pkg.name}</h3>
                    <p className="text-xs font-mono text-amber-400">{pkg.duration}</p>
                    <div className="text-2xl font-extrabold text-white pt-2">
                      ${pkg.price.toLocaleString()} <span className="text-xs font-mono text-zinc-400">USD</span>
                    </div>

                    <div className="pt-3 space-y-1.5 text-xs text-zinc-300">
                      {pkg.deliverables.map((del, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{del}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setPackages(packages.filter((p) => p.id !== pkg.id))}
                    className="w-full py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs transition-colors"
                  >
                    Remove Package
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: CLIENT INQUIRIES INBOX */}
        {/* =================================================================== */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-white">Incoming Client Commission Inquiries</h2>

            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-white">{inq.clientName}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                          inq.status === "accepted"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : inq.status === "declined"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-amber-400/10 text-amber-300 border-amber-400/30"
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300">
                      <span className="font-semibold text-amber-400">{inq.occasion}</span>
                      <span>📅 Date: {inq.eventDate}</span>
                      <span>📍 {inq.location}</span>
                      {inq.budget && <span>💰 Budget: ${inq.budget}</span>}
                    </div>

                    {inq.notes && (
                      <p className="text-xs text-zinc-400 italic bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                        &ldquo;{inq.notes}&rdquo;
                      </p>
                    )}

                    <div className="text-xs text-zinc-500 font-mono">
                      Email: {inq.clientEmail} • Phone: {inq.clientPhone}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {inq.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleUpdateInquiryStatus(inq.id, "accepted")}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider transition-colors"
                        >
                          Accept & Book
                        </button>
                        <button
                          onClick={() => handleUpdateInquiryStatus(inq.id, "declined")}
                          className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/[0.05] text-zinc-300 text-xs transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-400 font-mono">Responded</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: GEAR LOCKER */}
        {/* =================================================================== */}
        {activeTab === "gear" && (
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6 max-w-4xl">
            <h2 className="text-lg font-serif font-bold text-white">Camera Hardware & Lighting Locker</h2>
            <p className="text-xs text-zinc-400">
              Listing your flagship cameras, fast prime lenses, and cinema drones inspires confidence in high-end wedding clients.
            </p>

            <form onSubmit={handleAddGear} className="flex gap-2">
              <input
                type="text"
                value={newGearItem}
                onChange={(e) => setNewGearItem(e.target.value)}
                placeholder="e.g. Leica SL2, 50mm f/1.2 GM, Profoto B10X"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-wider"
              >
                Add Hardware
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {gearList.map((gear, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs text-zinc-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>{gear}</span>
                  </div>
                  <button
                    onClick={() => setGearList(gearList.filter((_, i) => i !== idx))}
                    className="text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
