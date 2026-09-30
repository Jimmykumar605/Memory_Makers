import { UserAccount } from "./types";

/**
 * serverUserStore has been deprecated in favor of direct Supabase PostgreSQL database operations.
 * All user credentials, password resets, and profile updates now happen directly in the Supabase Database.
 */

export function getServerUsers(): UserAccount[] {
  return [];
}

export function findServerUserByEmail(_email: string): UserAccount | undefined {
  return undefined;
}

export function saveServerUser(_user: UserAccount): void {
  // Deprecated: user accounts are stored directly in Supabase PostgreSQL
}

export function updateServerUserEmail(_oldEmail: string, _newEmail: string): boolean {
  // Deprecated: user emails are updated directly in Supabase PostgreSQL
  return true;
}

export function updateServerUserPassword(_email: string, _passwordHash: string): boolean {
  // Deprecated: user passwords are updated directly in Supabase PostgreSQL
  return true;
}
