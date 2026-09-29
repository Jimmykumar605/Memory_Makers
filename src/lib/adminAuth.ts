/**
 * Client-Side Admin Session Management
 * Note: All authentication credentials and role authorization are 100% dynamic
 * and validated against the database (Supabase / server user store).
 */

const ADMIN_SESSION_KEY = "memorymakers_admin_session_v1";

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // 1. Check dedicated admin session in localStorage
    const adminSession = localStorage.getItem(ADMIN_SESSION_KEY);
    if (adminSession) {
      const parsedAdmin = JSON.parse(adminSession);
      if (parsedAdmin?.isAuthenticated === true) {
        return true;
      }
    }

    // 2. Also check unified auth session for role === 'admin'
    const userSession = localStorage.getItem("memorymakers_active_session_v1");
    if (userSession) {
      const parsedUser = JSON.parse(userSession);
      if (parsedUser && parsedUser.role === "admin" && parsedUser.status === "active") {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export function setAdminSession(email: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({
        isAuthenticated: true,
        email: email,
        loginTime: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.error("Failed to set admin session", err);
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (err) {
    console.error("Failed to clear admin session", err);
  }
}
