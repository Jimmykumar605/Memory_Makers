"use client";

import { Photographer, Review, OccasionType } from "./types";
import { isSupabaseConfigured } from "./supabase/client";
import {
  fetchAllPhotographersFromSupabase,
  fetchPhotographerBySlugFromSupabase,
  submitReviewToSupabase,
  updatePhotographerStatusInSupabase,
  deletePhotographerFromSupabase,
  togglePhotographerVerifiedInSupabase,
  togglePhotographerFeaturedInSupabase,
  registerPhotographerInSupabase,
  updatePhotographerStudioInSupabase,
} from "./supabase/service";

const STORAGE_KEY = "memorymakers_photographers_v3";
let hasTriggeredSupabaseSync = false;

// Async function to pull latest dynamic photographers from Supabase PostgreSQL DB
export async function syncWithSupabase(): Promise<Photographer[]> {
  if (typeof window === "undefined" || !isSupabaseConfigured()) return [];
  try {
    const remote = await fetchAllPhotographersFromSupabase();
    if (remote && remote.length > 0) {
      savePhotographers(remote);
      return remote;
    }
  } catch (err) {
    console.warn("Could not sync photographers with Supabase:", err);
  }
  return [];
}

// Read from cache/localStorage with automatic Supabase DB sync
export function getStoredPhotographers(): Photographer[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    // Non-blocking background sync from Supabase DB on client mount
    if (isSupabaseConfigured() && !hasTriggeredSupabaseSync) {
      hasTriggeredSupabaseSync = true;
      syncWithSupabase();
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Write to localStorage & dispatch change event
export function savePhotographers(list: Photographer[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("mm_photographers_updated", { detail: list }));
  } catch (err) {
    console.error("Failed to save photographers to localStorage", err);
  }
}

// Filter approved photographers for public marketplace
export function getPublicPhotographers(): Photographer[] {
  const all = getStoredPhotographers();
  return all.filter((p) => p.status === "approved" || !p.status);
}

// Deterministic seed / initial helper for SSR hydration
export function getSeedPublicPhotographers(): Photographer[] {
  return [];
}

export function getSeedPhotographerBySlug(slug: string): Photographer | undefined {
  return undefined;
}

// Filter pending photographers awaiting Admin approval
export function getPendingPhotographers(): Photographer[] {
  const all = getStoredPhotographers();
  return all.filter((p) => p.status === "pending");
}

// Find photographer by slug
export function getPhotographerBySlug(slug: string): Photographer | undefined {
  const all = getStoredPhotographers();
  return all.find((p) => p.slug === slug);
}

// Admin Action: Approve Photographer in DB
export function approvePhotographer(id: string): Photographer | null {
  const all = getStoredPhotographers();
  let updatedItem: Photographer | null = null;
  const updated = all.map((p) => {
    if (p.id === id) {
      updatedItem = { ...p, status: "approved" as const, verified: true };
      return updatedItem;
    }
    return p;
  });
  savePhotographers(updated);

  // Sync approval to PostgreSQL DB
  if (isSupabaseConfigured()) {
    updatePhotographerStatusInSupabase(id, "approved").catch(console.warn);
  }

  return updatedItem;
}

// Admin Action: Reject Photographer in DB
export function rejectPhotographer(id: string, reason?: string): Photographer | null {
  const all = getStoredPhotographers();
  let updatedItem: Photographer | null = null;
  const updated = all.map((p) => {
    if (p.id === id) {
      updatedItem = { ...p, status: "rejected" as const };
      return updatedItem;
    }
    return p;
  });
  savePhotographers(updated);

  // Sync rejection to PostgreSQL DB
  if (isSupabaseConfigured()) {
    updatePhotographerStatusInSupabase(id, "rejected").catch(console.warn);
  }

  return updatedItem;
}

// Admin Action: Remove / Delete Photographer completely from DB
export function removePhotographer(id: string): boolean {
  const all = getStoredPhotographers();
  const updated = all.filter((p) => p.id !== id);
  savePhotographers(updated);

  // Sync deletion directly to PostgreSQL DB
  if (isSupabaseConfigured()) {
    deletePhotographerFromSupabase(id).catch(console.warn);
  }

  return updated.length < all.length;
}

// Admin Action: Toggle Verified Master badge in DB
export function toggleVerifiedMaster(id: string): boolean {
  const all = getStoredPhotographers();
  let newVerified = false;
  const updated = all.map((p) => {
    if (p.id === id) {
      newVerified = !p.verified;
      return { ...p, verified: newVerified };
    }
    return p;
  });
  savePhotographers(updated);

  // Sync to PostgreSQL DB
  if (isSupabaseConfigured()) {
    togglePhotographerVerifiedInSupabase(id, newVerified).catch(console.warn);
  }

  return newVerified;
}

// Admin Action: Toggle Featured status in DB
export function toggleFeaturedPhotographer(id: string): boolean {
  const all = getStoredPhotographers();
  let newFeatured = false;
  const updated = all.map((p) => {
    if (p.id === id) {
      newFeatured = !p.featured;
      return { ...p, featured: newFeatured };
    }
    return p;
  });
  savePhotographers(updated);

  // Sync to PostgreSQL DB
  if (isSupabaseConfigured()) {
    togglePhotographerFeaturedInSupabase(id, newFeatured).catch(console.warn);
  }

  return newFeatured;
}

// User Action: Submit Rating & Review for a Photographer
export function addPhotographerReview(
  photographerId: string,
  reviewInput: {
    clientName: string;
    rating: number;
    occasion: OccasionType;
    comment: string;
    clientAvatar?: string;
  }
): Review {
  const all = getStoredPhotographers();
  const now = new Date();
  const formattedDate = "Just now (" + now.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) + ")";

  const createdReview: Review = {
    id: "rev-" + Date.now(),
    clientName: reviewInput.clientName,
    clientAvatar:
      reviewInput.clientAvatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: reviewInput.rating,
    date: formattedDate,
    occasion: reviewInput.occasion,
    comment: reviewInput.comment,
  };

  const updated = all.map((p) => {
    if (p.id === photographerId) {
      const currentReviews = p.reviews || [];
      const newReviews = [createdReview, ...currentReviews];
      const newCount = newReviews.length;
      const sumRatings = newReviews.reduce((acc, r) => acc + r.rating, 0);
      const newAvg = Number((sumRatings / newCount).toFixed(2));

      return {
        ...p,
        reviews: newReviews,
        reviewsCount: newCount,
        rating: newAvg,
      };
    }
    return p;
  });

  savePhotographers(updated);

  // Sync review to PostgreSQL DB
  if (isSupabaseConfigured()) {
    submitReviewToSupabase(photographerId, reviewInput).catch(console.warn);
  }

  return createdReview;
}

// User Action: New Photographer Registration
export function registerNewPhotographer(applicant: Partial<Photographer>): Photographer {
  const all = getStoredPhotographers();

  const id = applicant.id || "photo-" + Date.now();
  const rawSlug = (applicant.businessName || applicant.name || "studio")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = rawSlug;
  let counter = 1;
  while (all.some((p) => p.slug === slug)) {
    slug = `${rawSlug}-${counter++}`;
  }

  const newPhotographer: Photographer = {
    id,
    name: applicant.name || "New Artisan",
    businessName: applicant.businessName || "Independent Studio",
    slug,
    email: applicant.email || "creator@example.com",
    phone: applicant.phone || "+91 98000 00000",
    gender: applicant.gender || "male",
    status: "pending",
    appliedDate: "Just now (" + new Date().toLocaleDateString("en-IN") + ")",
    avatarUrl:
      applicant.avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    coverImageUrl:
      applicant.coverImageUrl ||
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    tagline: applicant.tagline || `Artisan Visual Storytelling • ${applicant.city || "Punjab"}`,
    bio:
      applicant.bio ||
      `Passionate wedding and celebration visual artist based in ${applicant.city || "Amritsar"}, ${
        applicant.state || "Punjab"
      }.`,
    city: applicant.city || "Amritsar",
    state: applicant.state || "Punjab",
    country: "India",
    willingToTravel: applicant.willingToTravel ?? true,
    rating: 0.0,
    reviewsCount: 0,
    experienceYears: applicant.experienceYears || 3,
    startingPrice: applicant.startingPrice || 45000,
    currency: "INR",
    featured: false,
    verified: false,
    specialties: applicant.specialties || ["Wedding", "Pre-Wedding"],
    gearList: applicant.gearList || ["Sony Alpha A7 IV", "24-70mm f/2.8 GM"],
    packages: applicant.packages || [],
    portfolio: applicant.portfolio || [],
    reviews: [],
    socialLinks: applicant.socialLinks || {},
  };

  const updated = [newPhotographer, ...all];
  savePhotographers(updated);

  // Sync new photographer directly to PostgreSQL DB
  if (isSupabaseConfigured()) {
    registerPhotographerInSupabase(newPhotographer).catch(console.warn);
  }

  return newPhotographer;
}

// Update studio profile data in local store (and optionally Supabase)
export function updatePhotographerStudio(
  id: string,
  updates: Partial<Photographer>,
  syncSupabase: boolean = false
): Photographer | null {
  const all = getStoredPhotographers();
  let updatedItem: Photographer | null = null;
  const updated = all.map((p) => {
    if (p.id === id) {
      updatedItem = { ...p, ...updates };
      return updatedItem;
    }
    return p;
  });
  savePhotographers(updated);

  if (syncSupabase && isSupabaseConfigured()) {
    updatePhotographerStudioInSupabase(id, updates).catch(console.warn);
  }

  return updatedItem;
}

// Reset / refresh photographers store from Supabase
export function resetPhotographersStore(): void {
  syncWithSupabase();
}
