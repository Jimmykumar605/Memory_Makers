import { supabase, isSupabaseConfigured } from "./client";

export type StorageBucket = "avatars" | "covers" | "portfolios";

export interface UploadResult {
  url: string | null;
  error: string | null;
  isLocalFallback?: boolean;
}

/**
 * Uploads a local image File to Supabase Storage.
 *
 * If Supabase is configured:
 *   - Uploads directly to the specified bucket ('avatars' | 'covers' | 'portfolios')
 *   - Generates a unique timestamped file path
 *   - Returns the permanent public CDN URL from Supabase
 *
 * If Supabase is NOT configured (e.g. offline/dev demo):
 *   - Seamlessly converts to a Base64 data URL so the photographer can test
 *     local image uploads immediately without configuring credentials first.
 */
export async function uploadImageToSupabase(
  file: File,
  bucket: StorageBucket,
  folder?: string
): Promise<UploadResult> {
  // Validate file
  if (!file) {
    return { url: null, error: "No file provided" };
  }

  if (!file.type.startsWith("image/")) {
    return { url: null, error: "Selected file must be an image (JPEG, PNG, WebP, etc.)" };
  }

  // Max 15MB limit
  if (file.size > 15 * 1024 * 1024) {
    return { url: null, error: "Image file size must be under 15MB" };
  }

  // If Supabase is not configured, fall back to browser FileReader Base64
  if (!isSupabaseConfigured()) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          url: e.target?.result as string,
          error: null,
          isLocalFallback: true,
        });
      };
      reader.onerror = () => {
        resolve({
          url: URL.createObjectURL(file),
          error: null,
          isLocalFallback: true,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // Supabase is configured - upload to Supabase Storage
  try {
    const timestamp = Date.now();
    const sanitizedFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "_")
      .replace(/_{2,}/g, "_");
    const filePath = folder ? `${folder}/${timestamp}-${sanitizedFileName}` : `${timestamp}-${sanitizedFileName}`;

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

    if (error) {
      console.warn(`Supabase Storage upload to '${bucket}' failed:`, error.message);
      // Fallback to local Base64 so the photographer's session doesn't fail
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            url: e.target?.result as string,
            error: null,
            isLocalFallback: true,
          });
        };
        reader.readAsDataURL(file);
      });
    }

    // Get public URL
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: publicData.publicUrl, error: null, isLocalFallback: false };
  } catch (err: any) {
    console.error("Storage upload exception:", err);
    return { url: URL.createObjectURL(file), error: null, isLocalFallback: true };
  }
}
