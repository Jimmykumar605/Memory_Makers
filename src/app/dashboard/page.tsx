"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LazyImage from "@/components/LazyImage";
import LogoLoader from "@/components/LogoLoader";
import {
  Camera,
  Calendar,
  IndianRupee,
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
  Loader2,
  ImageIcon,
  Lock,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Edit3,
  X,
  Tag,
} from "lucide-react";
import { OCCASIONS, PRIMARY_REGIONS, ALL_INDIAN_STATES } from "@/lib/data";

const DELIVERABLE_PRESET_OPTIONS = [
  "Master color-graded images",
  "Online cloud gallery",
  "Full HD Highlights Film",
  "4K Cinematic Teaser (1 min)",
  "Full Length Wedding Film",
  "Drone Aerial Cinematography",
  "Candid Photography",
  "Traditional Photography & Video",
  "Pre-Wedding Shoot Included",
  "Premium Hardcover Album (40 Pages)",
  "Raw Footage & All Unedited Photos",
  "Same-Day Edit / Instagram Reels",
  "Multiple Shooters (2 Photographers + 2 Cinematographers)",
  "Live YouTube / TV Streaming Setup",
];
import { PortfolioItem, Package, BookingInquiry, OccasionType, Photographer, PhotographerStatus } from "@/lib/types";
import { uploadImageToSupabase } from "@/lib/supabase/storage";
import { getStoredPhotographers, updatePhotographerStudio } from "@/lib/photographerStore";
import {
  fetchAllPhotographersFromSupabase,
  updatePhotographerStudioInSupabase,
  fetchInquiriesForPhotographerFromSupabase,
  updateInquiryStatusInSupabase,
} from "@/lib/supabase/service";
import { useAuth } from "@/lib/authContext";

export default function PhotographerDashboardPage() {
  const router = useRouter();
  const { user, logout, refreshUser, updateUserSession, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/photographers");
      return;
    }

    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (user.role === "client") {
      router.replace("/photographers");
      return;
    }
  }, [user, authLoading, router]);

  const [activeTab, setActiveTab] = useState<"profile" | "portfolio" | "packages" | "inquiries" | "gear">("profile");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Dynamic photographer identity state
  const [activePhotographerId, setActivePhotographerId] = useState<string>("");
  const [photographerSlug, setPhotographerSlug] = useState<string>("");
  const [studioStatus, setStudioStatus] = useState<PhotographerStatus>("approved");

  // Editable Profile State
  const [businessName, setBusinessName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("Punjab");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<string>("male");
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [youtube, setYoutube] = useState("");
  const [startingPrice, setStartingPrice] = useState(0);
  const [willingToTravel, setWillingToTravel] = useState(true);
  const [specialties, setSpecialties] = useState<OccasionType[]>(["Wedding"]);

  // Visual Branding Images (Local File Upload -> Supabase Storage)
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  // Studio Ratings & Reviews
  const [studioRating, setStudioRating] = useState(0.0);
  const [studioReviewsCount, setStudioReviewsCount] = useState(0);

  // Portfolio items state & Local File Upload
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [newPhotoOccasion, setNewPhotoOccasion] = useState<OccasionType>("Wedding");
  const [newPhotoLocation, setNewPhotoLocation] = useState("");
  const [newPhotoGear, setNewPhotoGear] = useState("");
  const [newPhotoAspectRatio, setNewPhotoAspectRatio] = useState<"portrait" | "landscape" | "square">("portrait");

  // Packages state
  const [packages, setPackages] = useState<Package[]>([]);
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgPrice, setNewPkgPrice] = useState("");
  const [newPkgDuration, setNewPkgDuration] = useState("");
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([
    "Master color-graded images",
    "Online cloud gallery",
    "Full HD Highlights Film",
  ]);
  const [customDeliverableInput, setCustomDeliverableInput] = useState("");
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  // Inquiries State in INR (₹)
  const [inquiries, setInquiries] = useState<BookingInquiry[]>([]);

  // Gear Locker state
  const [gearList, setGearList] = useState<string[]>([]);
  const [newGearItem, setNewGearItem] = useState("");

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState("Studio profile changes saved!");

  function applyProfile(p: Partial<Photographer> & { id: string }) {
    setActivePhotographerId(p.id);
    if (typeof window !== "undefined" && p.id) {
      localStorage.setItem("mm_active_photographer_id", p.id);
    }
    setStudioStatus(p.status || "approved");
    setPhotographerSlug(p.slug || "");
    setBusinessName(p.businessName || "");
    setArtistName(p.name || "");
    setTagline(p.tagline || "");
    setBio(p.bio || "");
    setCity(p.city || "");
    setStateRegion(p.state || "Punjab");
    setPhone(p.phone || "");
    setEmail(p.email || "");
    setGender(p.gender || "male");
    setExperienceYears(p.experienceYears || 3);
    setInstagram(p.socialLinks?.instagram || "");
    setWebsite(p.socialLinks?.website || "");
    setYoutube(p.socialLinks?.youtube || "");
    setStartingPrice(p.startingPrice || 0);
    setWillingToTravel(p.willingToTravel ?? true);
    setSpecialties(p.specialties || ["Wedding"]);
    setAvatarUrl(p.avatarUrl || "");
    setCoverImageUrl(p.coverImageUrl || "");
    setPortfolio(p.portfolio || []);
    // Deduplicate packages by id and name when loading profile
    const seenPkgs = new Set<string>();
    const uniquePkgs = (p.packages || []).filter((pkg) => {
      if (!pkg) return false;
      const key = `${(pkg.name || "").toLowerCase().trim()}_${pkg.price}`;
      if (pkg.id && seenPkgs.has(pkg.id)) return false;
      if (seenPkgs.has(key)) return false;
      if (pkg.id) seenPkgs.add(pkg.id);
      seenPkgs.add(key);
      return true;
    });
    setPackages(uniquePkgs);
    setGearList(p.gearList || []);
    setStudioRating(p.rating ?? 0.0);
    setStudioReviewsCount(p.reviewsCount || 0);

    // Load real dynamic inquiries for this studio from Supabase DB
    fetchInquiriesForPhotographerFromSupabase(p.id).then((inqs) => {
      setInquiries(inqs || []);
    });
  }

  // Load dynamic photographer profile on mount
  useEffect(() => {
    let isMounted = true;

    async function loadStudioProfile() {
      if (authLoading) return;
      if (!user) {
        if (isMounted) setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      try {
        // Query live from Supabase PostgreSQL
        const remote = await fetchAllPhotographersFromSupabase();
        if (!isMounted) return;

        if (remote && remote.length > 0) {
          let matched: Photographer | undefined = undefined;

          // 1. Try matching logged in user's email
          if (user?.email) {
            matched = remote.find((p) => p.email?.toLowerCase() === user.email.toLowerCase());
          }
          // 2. Try matching user ID
          if (!matched && user?.id) {
            matched = remote.find((p) => p.id === user.id || p.id === `photo-${user.id}`);
          }
          // 3. Try matching user's full name
          if (!matched && user?.name) {
            matched = remote.find((p) => p.name.toLowerCase() === user.name.toLowerCase());
          }

          if (matched) {
            applyProfile(matched);
            return;
          }

          // If logged in as photographer role but not yet found in remote list
          if (user?.role === "photographer") {
            const stored = getStoredPhotographers();
            const localMatch = stored.find(
              (p) => user.email && p.email?.toLowerCase() === user.email.toLowerCase()
            );
            if (localMatch) {
              applyProfile(localMatch);
              return;
            }

            // Fresh photographer session
            applyProfile({
              id: user.id.startsWith("photo-") ? user.id : `photo-${user.id}`,
              name: user.name,
              businessName: user.name + " Studio",
              slug: user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              email: user.email,
              phone: user.phone || "",
              status: user?.status === "pending" || user?.photographerStatus === "pending" ? "pending" : "approved",
              appliedDate: "Recent",
              city: user.city || "Amritsar",
              state: user.state || "Punjab",
              country: "India",
              willingToTravel: true,
              rating: 0.0,
              reviewsCount: 0,
              experienceYears: 1,
              startingPrice: 50000,
              currency: "INR",
              featured: false,
              verified: false,
              specialties: ["Wedding"],
              gearList: [],
              packages: [],
              portfolio: [],
              reviews: [],
            });
            return;
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic studio profile from Supabase:", err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    }

    loadStudioProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const triggerSaveToast = (msg?: string) => {
    if (msg) setToastMessage(msg);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Upload Local Profile Avatar to Supabase
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const result = await uploadImageToSupabase(file, "avatars", "artists");
    if (result.url) {
      setAvatarUrl(result.url);
      triggerSaveToast("Profile avatar uploaded successfully!");
      if (activePhotographerId) {
        updatePhotographerStudio(activePhotographerId, { avatarUrl: result.url });
        updatePhotographerStudioInSupabase(activePhotographerId, { avatarUrl: result.url });
      }
    }
    setAvatarUploading(false);
  };

  // Upload Local Cover Background to Supabase
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    const result = await uploadImageToSupabase(file, "covers", "banners");
    if (result.url) {
      setCoverImageUrl(result.url);
      triggerSaveToast("Cover background banner uploaded successfully!");
      if (activePhotographerId) {
        updatePhotographerStudio(activePhotographerId, { coverImageUrl: result.url });
        updatePhotographerStudioInSupabase(activePhotographerId, { coverImageUrl: result.url });
      }
    }
    setCoverUploading(false);
  };

  // Upload Local Portfolio Work Photo to Supabase
  const handlePortfolioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const result = await uploadImageToSupabase(file, "portfolios", "work");
    if (result.url) {
      setNewPhotoUrl(result.url);
      setNewPhotoPreview(result.url);
    }
    setPhotoUploading(false);
  };

  // Toggle Specialty
  const toggleSpecialty = (occ: OccasionType) => {
    if (specialties.includes(occ)) {
      setSpecialties(specialties.filter((s) => s !== occ));
    } else {
      setSpecialties([...specialties, occ]);
    }
  };

  // Add Portfolio Photo
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle || !newPhotoUrl) return;

    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: newPhotoTitle,
      imageUrl: newPhotoUrl,
      occasion: newPhotoOccasion,
      location: newPhotoLocation || undefined,
      cameraGear: newPhotoGear || undefined,
      aspectRatio: newPhotoAspectRatio,
    };

    const updatedPortfolio = [newItem, ...portfolio];
    setPortfolio(updatedPortfolio);
    setNewPhotoTitle("");
    setNewPhotoUrl("");
    setNewPhotoPreview(null);
    setNewPhotoLocation("");
    setNewPhotoGear("");
    triggerSaveToast("New work added to portfolio gallery!");

    if (activePhotographerId) {
      updatePhotographerStudio(activePhotographerId, { portfolio: updatedPortfolio });
      await updatePhotographerStudioInSupabase(activePhotographerId, { portfolio: updatedPortfolio });
    }
  };

  // Delete Portfolio Photo
  const handleDeletePhoto = async (id: string) => {
    const updatedPortfolio = portfolio.filter((p) => p.id !== id);
    setPortfolio(updatedPortfolio);
    triggerSaveToast("Photo removed from gallery.");

    if (activePhotographerId) {
      updatePhotographerStudio(activePhotographerId, { portfolio: updatedPortfolio });
      await updatePhotographerStudioInSupabase(activePhotographerId, { portfolio: updatedPortfolio });
    }
  };

  // Add or Update Package
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingPackage || !newPkgName.trim() || !newPkgPrice) return;

    const trimmedName = newPkgName.trim();
    // Guard against duplicate package names (excluding the one currently being edited)
    const isDuplicate = packages.some(
      (pkg) => pkg.id !== editingPackageId && pkg.name.toLowerCase().trim() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      triggerSaveToast("A package with this title already exists. Please choose a unique name.");
      return;
    }

    if (selectedDeliverables.length === 0) {
      triggerSaveToast("Please select or type at least one package offer / deliverable.");
      return;
    }

    setIsSubmittingPackage(true);
    try {
      let updatedPackages: Package[];

      if (editingPackageId) {
        // Update existing package in place
        updatedPackages = packages.map((pkg) =>
          pkg.id === editingPackageId
            ? {
                ...pkg,
                name: trimmedName,
                price: parseFloat(newPkgPrice),
                duration: newPkgDuration.trim() || "Full Day",
                deliverables: [...selectedDeliverables],
              }
            : pkg
        );
        triggerSaveToast("Package details and offers updated!");
      } else {
        // Create new package
        const newPkg: Package = {
          id: `pkg-${Date.now()}`,
          name: trimmedName,
          price: parseFloat(newPkgPrice),
          duration: newPkgDuration.trim() || "Full Day",
          description: "Custom tailored wedding collection",
          deliverables: [...selectedDeliverables],
        };
        updatedPackages = [...packages, newPkg];
        triggerSaveToast("New package published!");
      }

      setPackages(updatedPackages);
      // Reset form
      setEditingPackageId(null);
      setNewPkgName("");
      setNewPkgPrice("");
      setNewPkgDuration("");
      setSelectedDeliverables([
        "Master color-graded images",
        "Online cloud gallery",
        "Full HD Highlights Film",
      ]);
      setCustomDeliverableInput("");

      if (activePhotographerId) {
        updatePhotographerStudio(activePhotographerId, { packages: updatedPackages }, false);
        await updatePhotographerStudioInSupabase(activePhotographerId, { packages: updatedPackages });
      }
    } finally {
      setIsSubmittingPackage(false);
    }
  };

  const handleStartEditPackage = (pkg: Package) => {
    setEditingPackageId(pkg.id);
    setNewPkgName(pkg.name);
    setNewPkgPrice(pkg.price.toString());
    setNewPkgDuration(pkg.duration);
    setSelectedDeliverables(pkg.deliverables && pkg.deliverables.length > 0 ? [...pkg.deliverables] : []);
    setCustomDeliverableInput("");
    const el = document.getElementById("package-builder-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleCancelEditPackage = () => {
    setEditingPackageId(null);
    setNewPkgName("");
    setNewPkgPrice("");
    setNewPkgDuration("");
    setSelectedDeliverables([
      "Master color-graded images",
      "Online cloud gallery",
      "Full HD Highlights Film",
    ]);
    setCustomDeliverableInput("");
  };

  const handleToggleDeliverable = (item: string) => {
    if (selectedDeliverables.includes(item)) {
      setSelectedDeliverables(selectedDeliverables.filter((d) => d !== item));
    } else {
      setSelectedDeliverables([...selectedDeliverables, item]);
    }
  };

  const handleAddCustomDeliverable = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const trimmed = customDeliverableInput.trim();
    if (!trimmed) return;
    if (!selectedDeliverables.includes(trimmed)) {
      setSelectedDeliverables([...selectedDeliverables, trimmed]);
    }
    setCustomDeliverableInput("");
  };

  const handleRemoveDeliverable = (itemToRemove: string) => {
    setSelectedDeliverables(selectedDeliverables.filter((d) => d !== itemToRemove));
  };

  // Delete Package
  const handleDeletePackage = async (id: string) => {
    if (editingPackageId === id) {
      handleCancelEditPackage();
    }
    const updatedPackages = packages.filter((p) => p.id !== id);
    setPackages(updatedPackages);
    triggerSaveToast("Package removed.");

    if (activePhotographerId) {
      updatePhotographerStudio(activePhotographerId, { packages: updatedPackages }, false);
      await updatePhotographerStudioInSupabase(activePhotographerId, { packages: updatedPackages });
    }
  };

  // Add Gear
  const handleAddGear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGearItem.trim()) return;
    const updatedGear = [...gearList, newGearItem.trim()];
    setGearList(updatedGear);
    setNewGearItem("");
    triggerSaveToast("Hardware item added to gear locker!");

    if (activePhotographerId) {
      updatePhotographerStudio(activePhotographerId, { gearList: updatedGear });
      await updatePhotographerStudioInSupabase(activePhotographerId, { gearList: updatedGear });
    }
  };

  // Delete Gear
  const handleDeleteGear = async (idx: number) => {
    const updatedGear = gearList.filter((_, i) => i !== idx);
    setGearList(updatedGear);
    triggerSaveToast("Hardware item removed.");

    if (activePhotographerId) {
      updatePhotographerStudio(activePhotographerId, { gearList: updatedGear });
      await updatePhotographerStudioInSupabase(activePhotographerId, { gearList: updatedGear });
    }
  };

  // Full Studio Profile Save (Local & Supabase DB)
  const handleSaveProfile = async () => {
    if (!activePhotographerId) return;

    // Email is read-only and permanent
    const permanentEmail = user?.email || email;

    const updates = {
      name: artistName,
      businessName,
      tagline,
      bio,
      city,
      state: stateRegion,
      phone: phone.trim(),
      email: permanentEmail,
      gender,
      experienceYears: Number(experienceYears) || 0,
      startingPrice,
      willingToTravel,
      specialties,
      avatarUrl,
      coverImageUrl,
      portfolio,
      packages,
      gearList,
      socialLinks: {
        instagram: instagram.trim(),
        website: website.trim(),
        youtube: youtube.trim(),
      },
    };

    updatePhotographerStudio(activePhotographerId, updates);
    await updatePhotographerStudioInSupabase(activePhotographerId, updates);
    triggerSaveToast("Studio profile changes saved successfully!");
  };

  const handleUpdateInquiryStatus = async (id: string, status: "accepted" | "declined") => {
    setInquiries(
      inquiries.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
    await updateInquiryStatusInSupabase(id, status);
  };

  if (authLoading || isLoadingProfile || !user || user.role !== "photographer") {
    return (
      <div className="min-h-screen bg-[#040507] text-zinc-100 py-20 px-4 flex flex-col items-center justify-center">
        <LogoLoader size="lg" message="Authenticating studio workspace..." />
      </div>
    );
  }

  // =========================================================================
  // VIEW: PENDING ADMIN APPROVAL (DASHBOARD LOCKED)
  // =========================================================================
  if (studioStatus === "pending") {
    return (
      <div className="min-h-screen bg-[#040507] text-zinc-100 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Amber Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-amber-500/15 via-amber-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />

        <div className="w-full max-w-lg space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold inline-block">
              Status: Pending Admin Approval
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Studio Application Under Review
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
              Your creator studio application for <span className="font-semibold text-amber-300">{businessName || artistName || "Your Studio"}</span> has been registered and is currently in the Master Administrator curation review queue.
            </p>
          </div>

          {/* Locked Features Alert Box */}
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 text-left space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider font-mono">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Studio Workspace Access Locked</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              To maintain the highest artistic standards across MemoryMakers, studio management tools (portfolio uploads, pricing packages, gear locker, and client inquiries) remain locked until an Administrator formally verifies and approves your studio profile.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-3 border-t border-white/10 text-zinc-400">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Registered Studio</span>
                <span className="text-white font-semibold truncate block">{businessName || "Pending Studio"}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Base Location</span>
                <span className="text-white font-semibold truncate block">{city || "Punjab"}, {stateRegion || "India"}</span>
              </div>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-left text-xs text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>What happens next?</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Once the Master Administrator reviews your credentials and approves your studio, an official approval email will be sent to <span className="text-zinc-200 font-mono">{user?.email || "your registered email"}</span>. Your dashboard will automatically unlock upon approval.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={async () => {
                await refreshUser();
                const remote = await fetchAllPhotographersFromSupabase();
                const matched = remote?.find((p) => p.email?.toLowerCase() === user?.email?.toLowerCase());
                if (matched?.status === "approved") {
                  applyProfile(matched);
                  setToastMessage("🎉 Congratulations! Your studio has been approved!");
                  setSaveSuccess(true);
                } else {
                  setToastMessage("Your application is still under review by the Administrator.");
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Check Approval Status</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/photographers"
                className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300 text-center transition-all block"
              >
                Browse Directory
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout("/photographers");
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: REJECTED OR SUSPENDED
  // =========================================================================
  if (studioStatus === "rejected" || studioStatus === "suspended") {
    return (
      <div className="min-h-screen bg-[#040507] text-zinc-100 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-rose-500/30 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Studio Account {studioStatus === "rejected" ? "Declined" : "Suspended"}</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            This studio account has been {studioStatus === "rejected" ? "declined" : "suspended"} by the Master Administrator. Please contact concierge@memorymakers.art for further assistance.
          </p>
          <button
            type="button"
            onClick={async () => {
              await logout("/photographers");
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold cursor-pointer"
          >
            Log Out Current Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040507] text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Toast Notification */}
        {saveSuccess && (
          <div className="fixed top-24 right-6 z-50 px-4 py-3 rounded-xl bg-emerald-400 text-black font-semibold text-xs flex items-center gap-2 shadow-2xl animate-in slide-in-from-top-2">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Studio Top Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-emerald-400/40 shrink-0 bg-zinc-900">
              <LazyImage
                src={avatarUrl}
                alt={artistName || "Studio Avatar"}
                fill
                sizes="64px"
                className="object-cover"
                showLogoWhileLoading={false}
                fallbackText={artistName || "Studio"}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {businessName || artistName || "My Photography Studio"}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 text-[10px] font-mono border border-emerald-400/30">
                  Creator Portal
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Logged in as <span className="text-zinc-200">{artistName || user?.name || "Visual Artisan"}</span>
                {city ? ` • ${city}, ${stateRegion}` : ` • ${stateRegion}`}
                {experienceYears ? ` • ${experienceYears} Yrs Exp` : ""}
                {gender ? ` • ${gender.charAt(0).toUpperCase() + gender.slice(1)}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {photographerSlug && (
              <Link
                href={`/photographer/${photographerSlug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-emerald-400/40 text-xs font-semibold text-slate-800 dark:text-white transition-colors shadow-sm"
              >
                <span>View Public Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </Link>
            )}
            <button
              onClick={handleSaveProfile}
              className="px-5 py-2 rounded-xl bg-emerald-500 dark:bg-emerald-400 hover:bg-emerald-600 dark:hover:bg-emerald-300 text-white dark:text-black font-semibold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 cursor-pointer"
            >
              Save Profile
            </button>
            <button
              type="button"
              onClick={() => logout("/photographers")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Sign out of creator studio"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              Client Inquiries
              <Calendar className="w-4 h-4 text-emerald-400" />
            </span>
            <div className="text-2xl font-bold text-white">{inquiries.length} Requests</div>
            <p className="text-[11px] text-zinc-400">
              {inquiries.filter((i) => i.status === "pending").length} pending response
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              Portfolio Items
              <Camera className="w-4 h-4 text-emerald-400" />
            </span>
            <div className="text-2xl font-bold text-white">{portfolio.length} Master Shots</div>
            <p className="text-[11px] text-zinc-400">
              {portfolio.length > 0
                ? `Across ${new Set(portfolio.map((p) => p.occasion)).size} occasion categories`
                : "No photos uploaded yet"}
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              Active Packages
              <PackageIcon className="w-4 h-4 text-emerald-400" />
            </span>
            <div className="text-2xl font-bold text-white">{packages.length} Offerings</div>
            <p className="text-[11px] text-zinc-400">
              {startingPrice > 0
                ? `From ₹${startingPrice.toLocaleString("en-IN")} / event`
                : "Starting price not set"}
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              Rating & Trust
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </span>
            <div className="text-2xl font-bold text-white">
              {studioRating > 0 ? `${studioRating.toFixed(2)} ★` : "0.00 ★"}
            </div>
            <p className="text-[11px] text-zinc-400">
              {studioReviewsCount > 0
                ? `Based on ${studioReviewsCount} verified reviews`
                : "Verified visual artisan"}
            </p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-px">
          {[
            { id: "profile", label: "Studio Info & State" },
            { id: "portfolio", label: `Portfolio Photos (${portfolio.length})` },
            { id: "packages", label: `Pricing Packages (${packages.length})` },
            { id: "inquiries", label: `Client Inquiries (${inquiries.length})` },
            { id: "gear", label: `Gear Locker (${gearList.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all relative whitespace-nowrap ${activeTab === tab.id
                  ? "text-emerald-400"
                  : "text-zinc-400 hover:text-white"
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
            </button>
          ))}
        </div>

        {/* =================================================================== */}
        {/* TAB 1: STUDIO INFO & SPECIALTIES */}
        {/* =================================================================== */}
        {activeTab === "profile" && (
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6 max-w-4xl">
            <h2 className="text-lg font-serif font-bold text-white">Studio Profile & Location Settings</h2>

            {/* Visual Branding: Avatar & Background Cover Uploaders */}
            <div className="dashboard-upload-box p-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-emerald-500/20 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Visual Branding & Local Image Uploads
                </span>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  Direct to Supabase Storage
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* 1. Profile Avatar Uploader */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase text-zinc-600 dark:text-zinc-300">
                    Profile Avatar / Headshot
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-400/50 shrink-0 bg-slate-100 dark:bg-zinc-900 group shadow-md">
                      <LazyImage
                        src={avatarUrl}
                        alt="Avatar Preview"
                        fill
                        sizes="80px"
                        className="object-cover"
                        showLogoWhileLoading={false}
                        fallbackText={artistName || "Avatar"}
                      />
                      {avatarUploading && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-emerald-400 text-[10px] font-mono">
                          <Loader2 className="w-5 h-5 animate-spin mb-1" />
                          <span>Uploading</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <label className="dashboard-upload-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.06] hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-400 dark:hover:text-black border border-slate-200 dark:border-white/10 hover:border-emerald-500 text-xs font-semibold text-slate-800 dark:text-white transition-all cursor-pointer shadow-sm">
                        <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Choose Local Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          disabled={avatarUploading}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Square format recommended (JPEG, PNG, WebP).
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Cover Banner Uploader */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase text-zinc-600 dark:text-zinc-300">
                    Studio Cover / Background Banner
                  </label>
                  <div className="dashboard-upload-dropzone relative h-24 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-white/15 bg-slate-100/80 dark:bg-zinc-900 group shadow-inner flex items-center justify-center">
                    {coverImageUrl ? (
                      <>
                        <LazyImage
                          src={coverImageUrl}
                          alt="Cover Preview"
                          fill
                          sizes="300px"
                          className="object-cover"
                          showLogoWhileLoading={false}
                          fallbackText="Banner"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 dark:bg-black/40 group-hover:bg-slate-900/50 dark:group-hover:bg-black/60 transition-colors flex items-center justify-center">
                          <label className="dashboard-upload-btn inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-black/70 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-400 dark:hover:text-black border border-slate-200 dark:border-white/20 hover:border-emerald-500 text-xs font-semibold text-slate-800 dark:text-white transition-all cursor-pointer shadow-lg backdrop-blur-md">
                            {coverUploading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500 dark:text-emerald-400" />
                                <span>Uploading Banner...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Change Cover Banner</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverFileChange}
                              disabled={coverUploading}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="dashboard-upload-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-400 dark:hover:text-black border border-slate-200 dark:border-white/15 hover:border-emerald-500 text-xs font-semibold text-slate-800 dark:text-white transition-all cursor-pointer shadow-sm">
                        {coverUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500 dark:text-emerald-400" />
                            <span>Uploading Banner...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Upload Cover Banner</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileChange}
                          disabled={coverUploading}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Widescreen 16:9 cinematic shot for hero background.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Business / Studio Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Singh Cine Arts"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
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
                  placeholder="e.g. Harpreet Singh"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Editorial Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Sacred Anand Karaj Stories • Royal Punjabi Weddings"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Photographer Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-mono cursor-pointer"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={experienceYears || ""}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 5"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Contact Mobile / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-mono"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase text-zinc-400">
                    Official Studio Email
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-zinc-500" /> Read Only
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    readOnly
                    disabled
                    tabIndex={-1}
                    placeholder="studio@example.com"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-sm text-zinc-400 font-mono cursor-not-allowed select-none opacity-80 focus:outline-none"
                    title="Account email address cannot be changed"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Login ID and registered email are permanent and cannot be modified.
                </p>
              </div>
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
                  placeholder="e.g. Amritsar, Jaipur, Chandigarh"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                />
              </div>

              {/* State / Region Selector (Supports all Indian States) */}
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  State / Union Territory *
                </label>
                <select
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 cursor-pointer"
                >
                  <optgroup label="🌟 Featured Key States" className="bg-[#090d0b] text-emerald-400 font-semibold">
                    {PRIMARY_REGIONS.map((reg) => (
                      <option key={reg} value={reg} className="bg-[#090d0b] text-white">
                        {reg}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🇮🇳 Other Indian States" className="bg-[#090d0b] text-zinc-400">
                    {ALL_INDIAN_STATES.filter((s) => !PRIMARY_REGIONS.includes(s as any)).map((st) => (
                      <option key={st} value={st} className="bg-[#090d0b] text-white">
                        {st}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Starting Investment (INR ₹)
                </label>
                <input
                  type="number"
                  value={startingPrice || ""}
                  onChange={(e) => setStartingPrice(parseFloat(e.target.value) || 0)}
                  placeholder="50000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                />
              </div>
            </div>

            <div className="py-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={willingToTravel}
                  onChange={(e) => setWillingToTravel(e.target.checked)}
                  className="w-4 h-4 accent-emerald-400 rounded"
                />
                <span>Willing to travel across India & destination locations</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Artist Bio & Philosophy
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell couples about your visual style, emotional storytelling approach, and years of experience..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 resize-none"
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected
                          ? "bg-emerald-400 text-black font-semibold shadow-md shadow-emerald-400/25"
                          : "bg-white/[0.04] text-zinc-300 hover:text-white border border-white/10 hover:border-emerald-400/30"
                        }`}
                    >
                      {occ.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Links & Online Portfolios */}
            <div className="pt-2 border-t border-white/10">
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-3 font-semibold">
                Social Links & Online Portfolios
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Instagram Handle / URL
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/studio"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Studio Website
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://studio.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    YouTube Channel
                  </label>
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/@studio"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer hover:scale-105"
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
            {/* Add New Photo Form with Local File Upload */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase font-semibold">
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload High-Res Work From Local Storage</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  Uploads directly to Supabase Storage
                </span>
              </div>

              <form onSubmit={handleAddPhoto} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {/* Left: Local File Drag/Browse Box */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-mono uppercase text-zinc-300 mb-2">
                      Local Image File *
                    </label>

                    {newPhotoPreview ? (
                      <div className="relative aspect-[3/4] max-h-56 rounded-xl overflow-hidden border border-emerald-400/40 bg-zinc-900 group shadow-lg">
                        <LazyImage
                          src={newPhotoPreview}
                          alt="New Photo Preview"
                          fill
                          sizes="240px"
                          className="object-cover"
                          showLogoWhileLoading={false}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                          <label className="px-3.5 py-1.5 rounded-lg bg-emerald-400 text-black text-xs font-bold cursor-pointer hover:bg-emerald-300 transition-colors shadow-md">
                            Change File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePortfolioFileChange}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[10px] text-zinc-300 mt-2">✓ Uploaded to Supabase</span>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/20 hover:border-emerald-400/60 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer text-center group">
                        {photoUploading ? (
                          <div className="py-4 space-y-2">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                            <span className="text-xs font-mono text-emerald-300 block">Uploading to Supabase...</span>
                          </div>
                        ) : (
                          <div className="py-2 space-y-2">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-semibold text-white block">
                              Click to Browse Local File
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              Select from your computer (JPEG, PNG, WebP)
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePortfolioFileChange}
                          disabled={photoUploading}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Right: Details & Meta */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                          Photo Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={newPhotoTitle}
                          onChange={(e) => setNewPhotoTitle(e.target.value)}
                          placeholder="e.g. Sacred Anand Karaj Laavan"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                          Occasion Category *
                        </label>
                        <select
                          value={newPhotoOccasion}
                          onChange={(e) => setNewPhotoOccasion(e.target.value as OccasionType)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
                        >
                          {OCCASIONS.map((occ) => (
                            <option key={occ.label} value={occ.label} className="bg-[#090d0b]">
                              {occ.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                          Location (City, State)
                        </label>
                        <input
                          type="text"
                          value={newPhotoLocation}
                          onChange={(e) => setNewPhotoLocation(e.target.value)}
                          placeholder="e.g. Amritsar, Punjab"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                          Camera & Lens Specs
                        </label>
                        <input
                          type="text"
                          value={newPhotoGear}
                          onChange={(e) => setNewPhotoGear(e.target.value)}
                          placeholder="e.g. Sony A1 • 85mm f/1.4 GM"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    {/* Aspect Ratio Framing */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                        Framing / Aspect Ratio
                      </label>
                      <div className="flex gap-2">
                        {(["portrait", "landscape", "square"] as const).map((ratio) => (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => setNewPhotoAspectRatio(ratio)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${newPhotoAspectRatio === ratio
                                ? "bg-emerald-400 text-black font-semibold shadow-md shadow-emerald-400/20"
                                : "bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10"
                              }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400">
                        {newPhotoUrl ? "✓ Image uploaded & ready to add" : "Select a local photo file to upload"}
                      </span>
                      <button
                        type="submit"
                        disabled={!newPhotoUrl || photoUploading}
                        className="py-2.5 px-6 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:hover:scale-100 text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add To Portfolio Gallery</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Existing Portfolio Grid */}
            {portfolio.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Portfolio Gallery is Empty</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Upload your signature high-resolution photos above. Showcase your best wedding ceremonies, emotional portraits, and pre-wedding captures to attract prospective clients.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="group relative h-72 rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-emerald-400/40 flex flex-col justify-end p-4 shadow-lg transition-all"
                  >
                    <LazyImage
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      fallbackText={item.occasion}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                    {/* Top Delete Button */}
                    <button
                      onClick={() => handleDeletePhoto(item.id)}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-rose-500 text-white transition-colors z-10"
                      aria-label="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="relative z-10 space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
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
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: PACKAGES & PRICING */}
        {/* =================================================================== */}
        {activeTab === "packages" && (
          <div className="space-y-8">
            {/* Add / Edit Package Form */}
            <div id="package-builder-form" className="glass-panel p-6 sm:p-7 rounded-2xl border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase">
                  {editingPackageId ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span>Editing Package: <strong className="text-white font-bold">{newPkgName || "Package"}</strong></span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create New Wedding or Celebration Package</span>
                    </>
                  )}
                </div>
                {editingPackageId && (
                  <button
                    type="button"
                    onClick={handleCancelEditPackage}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Editing</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSavePackage} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPkgName}
                      onChange={(e) => setNewPkgName(e.target.value)}
                      placeholder="e.g. Royal Anand Karaj 2-Day Signature"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Price (INR ₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newPkgPrice}
                      onChange={(e) => setNewPkgPrice(e.target.value)}
                      placeholder="75000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Duration / Coverage
                    </label>
                    <input
                      type="text"
                      value={newPkgDuration}
                      onChange={(e) => setNewPkgDuration(e.target.value)}
                      placeholder="e.g. Full Single Day (10 Hours) or 3 Days"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Deliverables / Package Offers Selection & Custom Input */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Included Offers & Deliverables ({selectedDeliverables.length} Selected)</span>
                      </label>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Choose what you provide to customers. Click presets to toggle or enter custom inclusions manually.
                      </p>
                    </div>
                  </div>

                  {/* 1. Quick Select Options / Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">
                      Popular Inclusions (Click to Toggle):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {DELIVERABLE_PRESET_OPTIONS.map((opt) => {
                        const isSelected = selectedDeliverables.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleToggleDeliverable(opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? "bg-emerald-400 text-black font-semibold shadow-md shadow-emerald-400/25 border border-emerald-300"
                                : "bg-white/[0.04] text-zinc-300 hover:text-white border border-white/10 hover:border-emerald-400/40"
                            }`}
                          >
                            <span className="text-xs">{isSelected ? "✓" : "+"}</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Manual Custom Offer Entry */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">
                      Or Enter Custom Deliverable Manually:
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customDeliverableInput}
                        onChange={(e) => setCustomDeliverableInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomDeliverable();
                          }
                        }}
                        placeholder="e.g. 2 Photographers + 1 Drone Operator, or 200 Printed 4x6 Fine Prints"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomDeliverable()}
                        disabled={!customDeliverableInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-emerald-400 hover:text-black text-xs font-semibold text-zinc-200 transition-all border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                      >
                        + Add Offer
                      </button>
                    </div>
                  </div>

                  {/* 3. Selected Inclusions Chips */}
                  {selectedDeliverables.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">
                        Current Package Offers ({selectedDeliverables.length}):
                      </span>
                      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-black/40 border border-white/5">
                        {selectedDeliverables.map((del, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{del}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDeliverable(del)}
                              className="text-emerald-400/60 hover:text-rose-400 p-0.5 rounded transition-colors ml-0.5 cursor-pointer"
                              title="Remove Offer"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                  {editingPackageId && (
                    <button
                      type="button"
                      onClick={handleCancelEditPackage}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.04] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmittingPackage}
                    className={`py-2.5 px-6 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all ${
                      isSubmittingPackage ? "opacity-60 cursor-not-allowed" : "hover:scale-105 cursor-pointer"
                    }`}
                  >
                    {isSubmittingPackage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : editingPackageId ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Package Changes</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Publish Package</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Packages Grid */}
            {packages.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <PackageIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">No Packages Created Yet</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Define transparent photography & cinematography packages using the form above. Clients love clear deliverables, pricing, and event coverage durations.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-6 rounded-2xl glass-panel border flex flex-col justify-between space-y-4 transition-all ${
                      editingPackageId === pkg.id
                        ? "border-emerald-400 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/50"
                        : "border-white/10 hover:border-emerald-400/30"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-serif font-bold text-white">{pkg.name}</h3>
                        {editingPackageId === pkg.id && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[10px] font-mono font-bold uppercase shrink-0">
                            Editing
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-emerald-400">{pkg.duration}</p>
                      <div className="text-2xl font-extrabold text-white pt-2">
                        ₹{pkg.price.toLocaleString("en-IN")}{" "}
                        <span className="text-xs font-mono text-zinc-400">INR</span>
                      </div>

                      <div className="pt-3 space-y-1.5 text-xs text-zinc-300">
                        {pkg.deliverables && pkg.deliverables.length > 0 ? (
                          pkg.deliverables.map((del, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{del}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 italic">No specific inclusions defined.</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEditPackage(pkg)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Offers</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="py-2 px-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                        title="Remove Package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: CLIENT INQUIRIES INBOX */}
        {/* =================================================================== */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-white">Incoming Client Commission Inquiries</h2>

            {inquiries.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">No Client Inquiries Yet</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    When couples and clients discover your studio on MemoryMakers and send booking commission requests, they will appear here with dates, venue details, budgets, and direct contact info.
                  </p>
                </div>
                {photographerSlug && (
                  <Link
                    href={`/photographer/${photographerSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <span>Preview Your Public Booking Profile</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ) : (
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
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${inq.status === "accepted"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : inq.status === "declined"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                : "bg-emerald-400/10 text-emerald-300 border-emerald-400/30"
                            }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300">
                        <span className="font-semibold text-emerald-400">{inq.occasion}</span>
                        <span>📅 Date: {inq.eventDate}</span>
                        <span>📍 {inq.location}</span>
                        {inq.budget && (
                          <span>💰 Budget: ₹{parseFloat(inq.budget).toLocaleString("en-IN")}</span>
                        )}
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
                            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs uppercase tracking-wider transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
                          >
                            Accept & Book
                          </button>
                          <button
                            onClick={() => handleUpdateInquiryStatus(inq.id, "declined")}
                            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/[0.05] text-zinc-300 text-xs transition-colors cursor-pointer"
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
            )}
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
                placeholder="e.g. Sony Alpha A1, FE 85mm f/1.4 GM, DJI Mavic 3 Cine"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Add Hardware
              </button>
            </form>

            {gearList.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                <Camera className="w-8 h-8 text-zinc-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  No hardware listed yet. Add your cameras, flagship prime lenses, and cinema drones above to build trust with clients.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {gearList.map((gear, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/30 flex items-center justify-between text-xs text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>{gear}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteGear(idx)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      aria-label="Remove gear"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
