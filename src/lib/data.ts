import { Photographer, OccasionType } from "./types";

export const PRIMARY_REGIONS = [
  "Punjab",
  "Haryana",
  "Rajasthan",
  "Himachal Pradesh",
  "Chandigarh",
  "Delhi NCR",
] as const;

export const ALL_INDIAN_STATES = [
  "Punjab",
  "Haryana",
  "Rajasthan",
  "Himachal Pradesh",
  "Chandigarh",
  "Delhi NCR",
  "Goa",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Madhya Pradesh",
  "Odisha",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

export const OCCASIONS: { label: OccasionType; icon: string; description: string }[] = [
  {
    label: "Wedding",
    icon: "HeartHandshake",
    description: "Grand royal weddings, sacred Anand Karaj, Pheras & celebratory feasts",
  },
  {
    label: "Pre-Wedding",
    icon: "Compass",
    description: "Scenic escapes in Shimla pines, royal Jaipur forts & mustard fields",
  },
  {
    label: "Engagement",
    icon: "Sparkles",
    description: "Ring ceremony soirées, cocktail nights & family festivities",
  },
  {
    label: "Destination",
    icon: "Plane",
    description: "Palace celebrations in Udaipur, hill retreats in Manali & Kasauli",
  },
  {
    label: "Traditional & Cultural",
    icon: "Crown",
    description: "Vibrant Haldi, Sangeet, Mehendi, Jaggo & ethnic family heritage",
  },
  {
    label: "Maternity & Baby",
    icon: "Baby",
    description: "Gentle bump portraits & baby naming ceremonies",
  },
  {
    label: "Fashion & Editorial",
    icon: "Camera",
    description: "High-fashion bridal lehengas, sherwani lookbooks & couture styling",
  },
  {
    label: "Drone & Cinematic",
    icon: "Video",
    description: "4K cinematic wedding films, palace aerial sweeps & Baraat reels",
  },
  {
    label: "Corporate & Events",
    icon: "Briefcase",
    description: "Delhi NCR summits, corporate galas & executive headshots",
  },
];

// All photographers are now dynamic and fetched directly from Supabase PostgreSQL DB!
export const PHOTOGRAPHERS: Photographer[] = [];
