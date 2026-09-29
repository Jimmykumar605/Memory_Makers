export type OccasionType =
  | "Wedding"
  | "Pre-Wedding"
  | "Engagement"
  | "Maternity & Baby"
  | "Fashion & Editorial"
  | "Destination"
  | "Traditional & Cultural"
  | "Corporate & Events"
  | "Portraits & Headshots"
  | "Drone & Cinematic";

export interface Package {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  deliverables: string[];
  isPopular?: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  occasion: OccasionType;
  imageUrl: string;
  location?: string;
  cameraGear?: string;
  aspectRatio?: "landscape" | "portrait" | "square";
  description?: string;
}

export interface Review {
  id: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  date: string;
  occasion: OccasionType;
  comment: string;
}

export type PhotographerStatus = "approved" | "pending" | "rejected" | "suspended";

export interface Photographer {
  id: string;
  name: string;
  businessName: string;
  slug: string;
  email?: string;
  phone?: string;
  status?: PhotographerStatus;
  appliedDate?: string;
  avatarUrl: string;
  coverImageUrl: string;
  tagline: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  willingToTravel: boolean;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  startingPrice: number;
  currency: string;
  featured?: boolean;
  verified?: boolean;
  specialties: OccasionType[];
  gearList: string[];
  packages: Package[];
  portfolio: PortfolioItem[];
  reviews: Review[];
  socialLinks: {
    instagram?: string;
    website?: string;
    youtube?: string;
  };
}

export interface BookingInquiry {
  id: string;
  photographerId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  occasion: OccasionType;
  eventDate: string;
  location: string;
  budget?: string;
  notes?: string;
  status: "pending" | "reviewed" | "accepted" | "declined";
  createdAt: string;
}

export type UserRole = "admin" | "photographer" | "client";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  city: string;
  state: string;
  joinedDate: string;
  status: "active" | "suspended" | "pending";
  passwordHash?: string;
  inquiriesCount?: number;
  reviewsCount?: number;
  photographerStatus?: PhotographerStatus;
  businessName?: string;
}

