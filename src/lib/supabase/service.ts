import { supabase, isSupabaseConfigured } from "./client";
import { Photographer, PortfolioItem, Package, Review, BookingInquiry, PhotographerStatus, OccasionType, UserAccount } from "../types";

// DB Row interfaces matching schema.sql
interface ProfileRow {
  id: string;
  role: string;
  status: PhotographerStatus;
  name: string;
  business_name: string;
  slug: string;
  email?: string;
  phone?: string;
  applied_date?: string;
  avatar_url: string;
  cover_image_url: string;
  tagline: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  willing_to_travel: boolean;
  rating: number;
  reviews_count: number;
  experience_years: number;
  starting_price: number;
  currency: string;
  featured: boolean;
  verified: boolean;
  specialties: OccasionType[];
  gear_list: string[];
  social_links: {
    instagram?: string;
    website?: string;
    youtube?: string;
  };
  packages?: PackageRow[];
  portfolios?: PortfolioRow[];
  reviews?: ReviewRow[];
}

interface PortfolioRow {
  id: string;
  photographer_id: string;
  title: string;
  occasion: OccasionType;
  image_url: string;
  location?: string;
  camera_gear?: string;
  aspect_ratio?: "landscape" | "portrait" | "square";
  description?: string;
}

interface PackageRow {
  id: string;
  photographer_id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  deliverables: string[];
  is_popular?: boolean;
}

interface ReviewRow {
  id: string;
  photographer_id: string;
  client_name: string;
  client_avatar?: string;
  rating: number;
  occasion: OccasionType;
  comment: string;
  date: string;
}

// Map a Database Profile row with joined relations to application Photographer interface
function mapRowToPhotographer(row: ProfileRow): Photographer {
  return {
    id: row.id,
    name: row.name,
    businessName: row.business_name,
    slug: row.slug,
    email: row.email,
    phone: row.phone,
    status: row.status,
    appliedDate: row.applied_date,
    avatarUrl: row.avatar_url,
    coverImageUrl: row.cover_image_url,
    tagline: row.tagline,
    bio: row.bio,
    city: row.city,
    state: row.state,
    country: row.country || "India",
    willingToTravel: row.willing_to_travel,
    rating: row.rating !== undefined && row.rating !== null ? Number(row.rating) : 0.0,
    reviewsCount: Number(row.reviews_count) || 0,
    experienceYears: Number(row.experience_years) || 1,
    startingPrice: Number(row.starting_price) || 50000,
    currency: row.currency || "INR",
    featured: Boolean(row.featured),
    verified: Boolean(row.verified),
    specialties: row.specialties || ["Wedding"],
    gearList: row.gear_list || [],
    socialLinks: row.social_links || {},
    packages: (row.packages || []).map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: Number(pkg.price),
      duration: pkg.duration,
      description: pkg.description,
      deliverables: pkg.deliverables || [],
      isPopular: Boolean(pkg.is_popular),
    })),
    portfolio: (row.portfolios || []).map((item) => ({
      id: item.id,
      title: item.title,
      occasion: item.occasion,
      imageUrl: item.image_url,
      location: item.location,
      cameraGear: item.camera_gear,
      aspectRatio: item.aspect_ratio || "portrait",
      description: item.description,
    })),
    reviews: (row.reviews || []).map((rev) => ({
      id: rev.id,
      clientName: rev.client_name,
      clientAvatar: rev.client_avatar,
      rating: Number(rev.rating),
      occasion: rev.occasion,
      comment: rev.comment,
      date: rev.date,
    })),
  };
}

// 1. Fetch all photographers (approved + pending for admin)
export async function fetchAllPhotographersFromSupabase(): Promise<Photographer[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        packages (*),
        portfolios (*),
        reviews (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetchAllPhotographers error:", error.message);
      return null;
    }

    if (!data) return null;
    return (data as ProfileRow[]).map(mapRowToPhotographer);
  } catch (err) {
    console.warn("Supabase fetchAllPhotographers exception:", err);
    return null;
  }
}

// 2. Fetch single photographer by slug
export async function fetchPhotographerBySlugFromSupabase(slug: string): Promise<Photographer | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        packages (*),
        portfolios (*),
        reviews (*)
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;
    return mapRowToPhotographer(data as ProfileRow);
  } catch (err) {
    console.warn("Supabase fetchPhotographerBySlug exception:", err);
    return null;
  }
}

// 3. Submit a Rating & Review to Supabase
// Note: The Postgres trigger automatically recalculates profiles.rating and reviews_count!
export async function submitReviewToSupabase(
  photographerId: string,
  reviewInput: {
    clientName: string;
    rating: number;
    occasion: OccasionType;
    comment: string;
    clientAvatar?: string;
  }
): Promise<Review | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const newId = "rev-" + Date.now();
    const formattedDate = "Just now (" + new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }) + ")";

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        id: newId,
        photographer_id: photographerId,
        client_name: reviewInput.clientName.trim(),
        client_avatar:
          reviewInput.clientAvatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        rating: Math.max(1, Math.min(5, Math.round(reviewInput.rating))),
        occasion: reviewInput.occasion,
        comment: reviewInput.comment.trim(),
        date: formattedDate,
      })
      .select()
      .single();

    if (error) {
      console.warn("Supabase submitReview error:", error.message);
      return null;
    }

    return {
      id: data.id,
      clientName: data.client_name,
      clientAvatar: data.client_avatar,
      rating: data.rating,
      occasion: data.occasion,
      comment: data.comment,
      date: data.date,
    };
  } catch (err) {
    console.warn("Supabase submitReview exception:", err);
    return null;
  }
}

// 4. Update photographer status (Admin approval / rejection)
export async function updatePhotographerStatusInSupabase(
  id: string,
  status: PhotographerStatus
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    return !error;
  } catch {
    return false;
  }
}

// 5. Submit booking inquiry
export async function submitInquiryToSupabase(
  inquiry: Omit<BookingInquiry, "id" | "createdAt" | "status">
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from("inquiries").insert({
      id: "inq-" + Date.now(),
      photographer_id: inquiry.photographerId,
      client_name: inquiry.clientName,
      client_email: inquiry.clientEmail,
      client_phone: inquiry.clientPhone,
      occasion: inquiry.occasion,
      event_date: inquiry.eventDate,
      location: inquiry.location,
      budget: inquiry.budget || null,
      notes: inquiry.notes || null,
      status: "pending",
    });

    return !error;
  } catch {
    return false;
  }
}

// 6. Delete photographer from Supabase
export async function deletePhotographerFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// 7. Toggle photographer verified badge in Supabase
export async function togglePhotographerVerifiedInSupabase(id: string, verified: boolean): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from("profiles").update({ verified }).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// 8. Toggle photographer featured badge in Supabase
export async function togglePhotographerFeaturedInSupabase(id: string, featured: boolean): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from("profiles").update({ featured }).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// 9. Register new photographer in Supabase
export async function registerPhotographerInSupabase(p: Partial<Photographer>): Promise<Photographer | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const newId = p.id || "photo-" + Date.now();
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: newId,
        name: p.name,
        business_name: p.businessName,
        slug: p.slug,
        email: p.email,
        phone: p.phone,
        status: p.status || "approved",
        applied_date: p.appliedDate || "Just added",
        avatar_url: p.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        cover_image_url: p.coverImageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
        tagline: p.tagline || "",
        bio: p.bio || "",
        city: p.city || "New Delhi",
        state: p.state || "Delhi NCR",
        country: p.country || "India",
        willing_to_travel: p.willingToTravel ?? true,
        rating: p.rating ?? 0.0,
        reviews_count: p.reviewsCount || 0,
        experience_years: p.experienceYears || 2,
        starting_price: p.startingPrice || 50000,
        currency: p.currency || "INR",
        featured: p.featured ?? false,
        verified: p.verified ?? false,
        specialties: p.specialties || ["Wedding"],
        gear_list: p.gearList || [],
        social_links: p.socialLinks || {},
      })
      .select()
      .single();

    if (error || !data) return null;
    return mapRowToPhotographer(data as ProfileRow);
  } catch {
    return null;
  }
}

// 9b. Update photographer studio profile in Supabase
export async function updatePhotographerStudioInSupabase(
  id: string,
  updates: Partial<Photographer>
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const profileUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) profileUpdates.name = updates.name;
    if (updates.businessName !== undefined) profileUpdates.business_name = updates.businessName;
    if (updates.tagline !== undefined) profileUpdates.tagline = updates.tagline;
    if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
    if (updates.city !== undefined) profileUpdates.city = updates.city;
    if (updates.state !== undefined) profileUpdates.state = updates.state;
    if (updates.startingPrice !== undefined) profileUpdates.starting_price = updates.startingPrice;
    if (updates.willingToTravel !== undefined) profileUpdates.willing_to_travel = updates.willingToTravel;
    if (updates.specialties !== undefined) profileUpdates.specialties = updates.specialties;
    if (updates.avatarUrl !== undefined) profileUpdates.avatar_url = updates.avatarUrl;
    if (updates.coverImageUrl !== undefined) profileUpdates.cover_image_url = updates.coverImageUrl;
    if (updates.gearList !== undefined) profileUpdates.gear_list = updates.gearList;

    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await supabase.from("profiles").update(profileUpdates).eq("id", id);
      if (error) {
        console.warn("Failed to update profile in Supabase:", error.message);
      }
    }

    // Sync portfolio items to public.portfolios if provided
    if (updates.portfolio !== undefined) {
      await supabase.from("portfolios").delete().eq("photographer_id", id);
      if (updates.portfolio.length > 0) {
        const portRows = updates.portfolio.map((item, idx) => ({
          id: item.id && !item.id.startsWith("port-new-") ? item.id : `port-${Date.now()}-${idx}`,
          photographer_id: id,
          title: item.title,
          occasion: item.occasion,
          image_url: item.imageUrl,
          location: item.location || null,
          camera_gear: item.cameraGear || null,
          aspect_ratio: item.aspectRatio || "portrait",
        }));
        const { error: portError } = await supabase.from("portfolios").insert(portRows);
        if (portError) {
          console.warn("Failed to sync portfolios in Supabase:", portError.message);
        }
      }
    }

    // Sync packages to public.packages if provided
    if (updates.packages !== undefined) {
      await supabase.from("packages").delete().eq("photographer_id", id);
      if (updates.packages.length > 0) {
        const pkgRows = updates.packages.map((pkg, idx) => ({
          id: pkg.id && !pkg.id.startsWith("pkg-") ? pkg.id : `pkg-${Date.now()}-${idx}`,
          photographer_id: id,
          name: pkg.name,
          price: pkg.price,
          duration: pkg.duration,
          description: pkg.description || "Custom tailored wedding collection",
          deliverables: pkg.deliverables || [],
          is_popular: pkg.isPopular ?? false,
        }));
        const { error: pkgError } = await supabase.from("packages").insert(pkgRows);
        if (pkgError) {
          console.warn("Failed to sync packages in Supabase:", pkgError.message);
        }
      }
    }

    return true;
  } catch (err) {
    console.warn("updatePhotographerStudioInSupabase exception:", err);
    return false;
  }
}



// ==============================================================================
// USERS & ADMIN DB QUERIES
// ==============================================================================
interface UserRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "photographer" | "client";
  status: "active" | "suspended";
  city: string;
  state: string;
  password_hash?: string;
  inquiries_count?: number;
  reviews_count?: number;
  joined_date: string;
}

function mapRowToUser(row: UserRow): UserAccount {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    status: row.status,
    city: row.city,
    state: row.state,
    passwordHash: row.password_hash,
    joinedDate: row.joined_date,
    inquiriesCount: row.inquiries_count ?? 0,
    reviewsCount: row.reviews_count ?? 0,
  };
}

// 10. Fetch all registered users from Supabase DB
export async function fetchUsersFromSupabase(): Promise<UserAccount[] | null> {
  if (!isSupabaseConfigured()) return null;

  // 1. Try get_all_users RPC (bypasses RLS)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_all_users");
    if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
      return (rpcData as UserRow[]).map(mapRowToUser);
    }
  } catch {
    // Fallback to table select
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return null;
    return (data as UserRow[]).map(mapRowToUser);
  } catch {
    return null;
  }
}

// 11. Delete a user account from Supabase DB
export async function deleteUserFromSupabase(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from("users").delete().eq("id", userId);
    return !error;
  } catch {
    return false;
  }
}

export async function toggleUserStatusInSupabase(
  userId: string,
  newStatus: "active" | "suspended" | "pending"
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from("users")
      .update({ status: newStatus })
      .eq("id", userId);

    return !error;
  } catch {
    return false;
  }
}

// 13. Verify if an email belongs to the Master Admin in Supabase DB
export async function verifyAdminFromSupabase(email: string): Promise<UserAccount | null> {
  if (!isSupabaseConfigured()) return null;
  const user = await fetchUserByEmailFromSupabase(email);
  if (user && user.role === "admin" && user.status === "active") {
    return user;
  }
  return null;
}

// 14. Fetch the designated single master admin from Supabase DB
export async function fetchMasterAdminFromSupabase(): Promise<UserAccount | null> {
  if (!isSupabaseConfigured()) return null;

  // 1. Try get_all_users RPC
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_all_users");
    if (!rpcError && Array.isArray(rpcData)) {
      const admin = rpcData.find((u: any) => u.role === "admin");
      if (admin) return mapRowToUser(admin as UserRow);
    }
  } catch {
    // Fallback to table query
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "admin")
      .maybeSingle();

    if (error || !data) return null;
    return mapRowToUser(data as UserRow);
  } catch {
    return null;
  }
}

// 15. Fetch user by email from Supabase DB
export async function fetchUserByEmailFromSupabase(email: string): Promise<UserAccount | null> {
  if (!isSupabaseConfigured()) return null;
  const normEmail = email.trim().toLowerCase();

  // 1. Try get_user_by_email RPC (bypasses RLS)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_user_by_email", {
      p_email: normEmail,
    });
    if (!rpcError && rpcData) {
      return mapRowToUser(rpcData as UserRow);
    }
  } catch {
    // Fallback to table query
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", normEmail)
      .maybeSingle();

    if (error || !data) return null;
    return mapRowToUser(data as UserRow);
  } catch {
    return null;
  }
}

// 16. Create or register user account in Supabase DB
export async function createUserInSupabase(user: Partial<UserAccount>): Promise<UserAccount | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const id = user.id || "usr-" + Date.now();
    const now = new Date();
    const joined = now.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    const email = (user.email || "").trim().toLowerCase();

    // 1. Try PostgreSQL stored procedure if created in DB
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("create_or_update_user", {
        p_id: id,
        p_name: user.name || "New Member",
        p_email: email,
        p_phone: user.phone || "",
        p_role: user.role || "client",
        p_status: user.status || "active",
        p_city: user.city || "New Delhi",
        p_state: user.state || "Delhi NCR",
        p_joined_date: user.joinedDate || joined,
        p_password_hash: user.passwordHash || "",
      });

      if (!rpcError && rpcData) {
        return mapRowToUser(rpcData as UserRow);
      }
    } catch {
      // Fallback to table query
    }

    // 2. Direct table upsert
    const baseRow: Record<string, any> = {
      id,
      name: user.name || "New Member",
      email,
      phone: user.phone || null,
      role: user.role || "client",
      status: user.status || "active",
      city: user.city || "New Delhi",
      state: user.state || "Delhi NCR",
      joined_date: user.joinedDate || joined,
      inquiries_count: user.inquiriesCount || 0,
      reviews_count: user.reviewsCount || 0,
    };

    if (user.passwordHash) {
      baseRow.password_hash = user.passwordHash;
    }

    const { data, error } = await supabase
      .from("users")
      .upsert(baseRow, { onConflict: "email" })
      .select()
      .single();

    if (error) {
      // If column password_hash does not exist yet, retry without it
      if (error.code === "42703" && baseRow.password_hash) {
        delete baseRow.password_hash;
        const retry = await supabase
          .from("users")
          .upsert(baseRow, { onConflict: "email" })
          .select()
          .single();
        if (retry.data) return mapRowToUser(retry.data as UserRow);
      }
      console.warn("createUserInSupabase warning:", error.message);
      return null;
    }

    if (!data) return null;
    return mapRowToUser(data as UserRow);
  } catch (err) {
    console.warn("createUserInSupabase exception:", err);
    return null;
  }
}

// 17. Fetch inquiries for a specific photographer
export async function fetchInquiriesForPhotographerFromSupabase(
  photographerId: string
): Promise<BookingInquiry[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .eq("photographer_id", photographerId)
      .order("created_at", { ascending: false });

    if (error || !data) return null;
    return data.map((row: any) => ({
      id: row.id,
      photographerId: row.photographer_id,
      clientName: row.client_name,
      clientEmail: row.client_email,
      clientPhone: row.client_phone,
      occasion: row.occasion,
      eventDate: row.event_date,
      location: row.location,
      budget: row.budget ? String(row.budget) : "",
      notes: row.notes || "",
      status: (row.status as any) || "pending",
      createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN") : "Recent",
    }));
  } catch {
    return null;
  }
}

// 18. Update booking inquiry status in Supabase
export async function updateInquiryStatusInSupabase(
  inquiryId: string,
  status: "pending" | "reviewed" | "accepted" | "declined"
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", inquiryId);
    return !error;
  } catch {
    return false;
  }
}


