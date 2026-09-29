import { UserAccount } from "./types";
import { isSupabaseConfigured } from "./supabase/client";
import {
  fetchUsersFromSupabase,
  deleteUserFromSupabase,
  toggleUserStatusInSupabase,
} from "./supabase/service";

const USERS_STORAGE_KEY = "memorymakers_users_v2";
let hasTriggeredUsersSupabaseSync = false;

/**
 * Async function to pull latest users from Supabase PostgreSQL DB
 */
export async function syncUsersWithSupabase(): Promise<UserAccount[]> {
  if (typeof window === "undefined" || !isSupabaseConfigured()) return [];
  try {
    const remote = await fetchUsersFromSupabase();
    if (remote && remote.length > 0) {
      saveUsers(remote);
      return remote;
    }
  } catch (err) {
    console.warn("Could not sync users with Supabase:", err);
  }
  return [];
}

/**
 * Retrieve all registered users and clients
 */
export function getStoredUsers(): UserAccount[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    // Non-blocking background sync from Supabase DB on client mount
    if (isSupabaseConfigured() && !hasTriggeredUsersSupabaseSync) {
      hasTriggeredUsersSupabaseSync = true;
      syncUsersWithSupabase();
    }

    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save user list to local storage and broadcast change
 */
export function saveUsers(users: UserAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event("mm_users_updated"));
  } catch (err) {
    console.error("Failed to save users store:", err);
  }
}

/**
 * Toggle user account status (active <-> suspended)
 * Note: Master Admin is protected and cannot be suspended.
 */
export function toggleUserStatus(id: string): UserAccount | null {
  const current = getStoredUsers();
  const index = current.findIndex((u) => u.id === id);
  if (index === -1) return null;

  // Master Admin cannot be suspended
  if (current[index].role === "admin") {
    return null;
  }

  const updatedUser: UserAccount = {
    ...current[index],
    status: current[index].status === "active" ? "suspended" : "active",
  };

  current[index] = updatedUser;
  saveUsers(current);

  // Sync update directly to Supabase PostgreSQL DB
  if (isSupabaseConfigured()) {
    toggleUserStatusInSupabase(id, updatedUser.status).catch(console.warn);
  }

  return updatedUser;
}

/**
 * Permanently remove user account
 * Note: Master Admin is protected and cannot be deleted.
 */
export function removeUser(id: string): boolean {
  const current = getStoredUsers();
  const user = current.find((u) => u.id === id);

  if (!user || user.role === "admin") {
    return false; // Cannot remove master admin or non-existent user
  }

  const filtered = current.filter((u) => u.id !== id);
  saveUsers(filtered);

  // Sync delete directly to Supabase PostgreSQL DB
  if (isSupabaseConfigured()) {
    deleteUserFromSupabase(id).catch(console.warn);
  }

  return true;
}

/**
 * Register a new user account (e.g. from sign up)
 */
export function addNewUser(user: Omit<UserAccount, "id" | "joinedDate">): UserAccount {
  const current = getStoredUsers();
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const newUser: UserAccount = {
    ...user,
    id: `user-client-${Date.now()}`,
    joinedDate: formattedDate,
    status: user.status || "active",
    inquiriesCount: 0,
    reviewsCount: 0,
  };

  current.push(newUser);
  saveUsers(current);
  return newUser;
}
