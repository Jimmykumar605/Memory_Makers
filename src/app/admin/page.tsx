"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Filter,
  Eye,
  Camera,
  MapPin,
  IndianRupee,
  Star,
  ExternalLink,
  Lock,
  Mail,
  KeyRound,
  LogOut,
  RefreshCw,
  Sparkles,
  Users,
  AlertTriangle,
  Check,
  Plus,
  ArrowRight,
  UserCheck,
  UserX,
} from "lucide-react";
import { Photographer, UserAccount } from "@/lib/types";
import {
  getStoredPhotographers,
  getPendingPhotographers,
  getPublicPhotographers,
  approvePhotographer,
  rejectPhotographer,
  removePhotographer,
  toggleVerifiedMaster,
  toggleFeaturedPhotographer,
  resetPhotographersStore,
  registerNewPhotographer,
  syncWithSupabase,
} from "@/lib/photographerStore";
import {
  isAdminAuthenticated,
  setAdminSession,
  clearAdminSession,
} from "@/lib/adminAuth";
import { useAuth } from "@/lib/authContext";
import {
  getStoredUsers,
  toggleUserStatus,
  removeUser,
  syncUsersWithSupabase,
} from "@/lib/userStore";
import {
  fetchAllPhotographersFromSupabase,
  fetchUsersFromSupabase,
  verifyAdminFromSupabase,
} from "@/lib/supabase/service";
import LazyImage from "@/components/LazyImage";
import { PRIMARY_REGIONS, ALL_INDIAN_STATES } from "@/lib/data";

export default function AdminPortalPage() {
  const { user, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Login form state
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Admin dashboard state
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "all" | "users" | "add" | "emails">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [inspectEmail, setInspectEmail] = useState<any | null>(null);

  // Users management state
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("All");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("All");
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [syncingDB, setSyncingDB] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Just now");

  // Notification toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Delete confirmation modal state
  const [photographerToDelete, setPhotographerToDelete] = useState<Photographer | null>(null);

  // Inspect applicant modal state
  const [inspectApplicant, setInspectApplicant] = useState<Photographer | null>(null);

  // New photographer direct add state
  const [newArtistName, setNewArtistName] = useState("");
  const [newStudioName, setNewStudioName] = useState("");
  const [newArtistEmail, setNewArtistEmail] = useState("");
  const [newArtistPhone, setNewArtistPhone] = useState("");
  const [newArtistState, setNewArtistState] = useState("Punjab");
  const [newArtistCity, setNewArtistCity] = useState("Amritsar");
  const [newStartingPrice, setNewStartingPrice] = useState(65000);
  const [newArtistTagline, setNewArtistTagline] = useState("");

  // Check authentication on mount & load dynamic Supabase DB records
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAdminAuthenticated() || (user && user.role === "admin");
      setIsAuthenticated(Boolean(authStatus));
      setAuthLoading(false);
      return Boolean(authStatus);
    };

    const isAuthed = checkAuth();
    if (isAuthed) {
      loadPhotographers();
      loadUsers();
      loadSentEmails();
    }

    const handlePhotographersUpdate = () => {
      loadPhotographers();
    };

    const handleUsersUpdate = () => {
      loadUsers();
    };

    const handleAuthChange = () => {
      const isStillAuthed = checkAuth();
      if (!isStillAuthed) {
        setEmailInput("");
        setPasswordInput("");
      } else {
        loadPhotographers();
        loadUsers();
      }
    };

    window.addEventListener("mm_auth_changed", handleAuthChange);
    window.addEventListener("mm_photographers_updated", handlePhotographersUpdate);
    window.addEventListener("mm_users_updated", handleUsersUpdate);
    return () => {
      window.removeEventListener("mm_auth_changed", handleAuthChange);
      window.removeEventListener("mm_photographers_updated", handlePhotographersUpdate);
      window.removeEventListener("mm_users_updated", handleUsersUpdate);
    };
  }, [user]);

  const loadPhotographers = async () => {
    const list = getStoredPhotographers();
    if (list && list.length > 0) setPhotographers(list);
    try {
      const remote = await fetchAllPhotographersFromSupabase();
      if (remote && remote.length > 0) {
        setPhotographers(remote);
      }
    } catch (err) {
      console.warn("Could not sync remote photographers:", err);
    }
  };

  const loadUsers = async () => {
    const list = getStoredUsers();
    if (list && list.length > 0) setUsers(list);
    try {
      const remote = await fetchUsersFromSupabase();
      if (remote && remote.length > 0) {
        setUsers(remote);
      }
    } catch (err) {
      console.warn("Could not sync remote users:", err);
    }
  };

  const handleSyncAllDB = async () => {
    setSyncingDB(true);
    try {
      await Promise.all([syncWithSupabase(), syncUsersWithSupabase()]);
      await Promise.all([loadPhotographers(), loadUsers()]);
      const now = new Date();
      setLastSyncedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      showToast("Synchronized dynamic photographers & users from Supabase DB!", "success");
    } catch {
      showToast("Supabase sync completed.", "info");
    } finally {
      setSyncingDB(false);
    }
  };

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput, adminOnly: true }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setLoginError(data.error || "Invalid credentials. Please verify your admin email and security key.");
        return;
      }

      if (data.user?.role !== "admin") {
        setLoginError("Access Denied: Only administrator accounts can access the Admin Portal.");
        return;
      }

      setAdminSession(data.user.email);
      if (typeof window !== "undefined") {
        localStorage.setItem("memorymakers_active_session_v1", JSON.stringify(data.user));
        window.dispatchEvent(new Event("mm_auth_changed"));
      }
      setIsAuthenticated(true);
      loadPhotographers();
      loadUsers();
      showToast("Master Admin session authenticated successfully!", "success");
    } catch (err: any) {
      setLoginError(err.message || "An authentication error occurred.");
    }
  };

  // Handle User Status Toggle
  const handleToggleUserStatus = (user: UserAccount) => {
    if (user.role === "admin") {
      showToast("Master Administrator account cannot be suspended.", "error");
      return;
    }
    const updated = toggleUserStatus(user.id);
    if (updated) {
      loadUsers();
      showToast(
        `User ${user.name} is now ${updated.status === "active" ? "Activated" : "Suspended"}.`,
        "info"
      );
    }
  };

  // Handle User Account Deletion
  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    if (userToDelete.role === "admin") {
      showToast("Master Administrator account cannot be deleted.", "error");
      setUserToDelete(null);
      return;
    }
    const success = removeUser(userToDelete.id);
    if (success) {
      loadUsers();
      showToast(`Permanently removed user account ${userToDelete.name} (${userToDelete.email}).`, "error");
    }
    setUserToDelete(null);
  };

  // Handle Logout
  const handleLogout = async () => {
    clearAdminSession();
    await logout();
    setIsAuthenticated(false);
    setEmailInput("");
    setPasswordInput("");
    showToast("Admin session ended.", "info");
  };

  const loadSentEmails = async () => {
    try {
      const res = await fetch("/api/admin/emails");
      const data = await res.json();
      if (data?.emails) {
        setSentEmails(data.emails);
      }
    } catch {
      // ignore
    }
  };

  // Handle Approve with DB sync and Official Email Notification dispatch
  const handleApprove = async (id: string, name: string) => {
    try {
      showToast(`Approving ${name} and sending official verification email...`, "info");

      const res = await fetch("/api/admin/photographers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photographerId: id }),
      });
      const data = await res.json();

      approvePhotographer(id);
      loadPhotographers();
      loadUsers();
      loadSentEmails();

      if (data.emailSent) {
        showToast(
          `Approved ${name}! Profile is LIVE & official approval email sent to ${data.recipient || "photographer"}.`,
          "success"
        );
      } else {
        showToast(
          `Approved ${name}! Profile is now LIVE on MemoryMakers directory.`,
          "success"
        );
      }

      if (inspectApplicant?.id === id) {
        setInspectApplicant(null);
      }
    } catch (err: any) {
      approvePhotographer(id);
      loadPhotographers();
      showToast(`Approved ${name}! Profile is now LIVE on MemoryMakers.`, "success");
    }
  };

  // Handle Reject
  const handleReject = (id: string, name: string) => {
    const updated = rejectPhotographer(id);
    if (updated) {
      loadPhotographers();
      showToast(`Declined application for ${name}.`, "info");
      if (inspectApplicant?.id === id) {
        setInspectApplicant(null);
      }
    }
  };

  // Handle Remove / Delete
  const confirmDelete = () => {
    if (!photographerToDelete) return;
    const success = removePhotographer(photographerToDelete.id);
    if (success) {
      loadPhotographers();
      showToast(`Removed ${photographerToDelete.businessName} from the project.`, "error");
    }
    setPhotographerToDelete(null);
  };

  // Handle Toggle Verified
  const handleToggleVerified = (id: string, name: string) => {
    const isNowVerified = toggleVerifiedMaster(id);
    loadPhotographers();
    showToast(
      `${name} is now ${isNowVerified ? "marked as Verified Master" : "unverified"}.`,
      "info"
    );
  };

  // Handle Toggle Featured
  const handleToggleFeatured = (id: string, name: string) => {
    const isNowFeatured = toggleFeaturedPhotographer(id);
    loadPhotographers();
    showToast(
      `${name} is now ${isNowFeatured ? "featured on the homepage" : "removed from featured"}.`,
      "info"
    );
  };

  // Handle Direct Add Photographer by Admin
  const handleDirectAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtistName || !newStudioName) return;

    const created = registerNewPhotographer({
      name: newArtistName,
      businessName: newStudioName,
      email: newArtistEmail || `${newArtistName.toLowerCase().replace(/\s+/g, "")}@example.com`,
      phone: newArtistPhone || "+91 98000 00000",
      state: newArtistState,
      city: newArtistCity,
      startingPrice: Number(newStartingPrice) || 50000,
      tagline: newArtistTagline || `Fine Art Wedding Storyteller in ${newArtistCity}, ${newArtistState}`,
    });

    // Auto-approve since admin created it
    approvePhotographer(created.id);
    loadPhotographers();

    showToast(`Added and approved ${newStudioName}! Profile is now live.`, "success");

    // Reset fields
    setNewArtistName("");
    setNewStudioName("");
    setNewArtistEmail("");
    setNewArtistPhone("");
    setNewArtistTagline("");
    setActiveTab("all");
  };

  // Pending queue
  const pendingList = photographers.filter((p) => p.status === "pending");
  const approvedList = photographers.filter((p) => p.status === "approved" || !p.status);

  // Filtered all photographers
  const filteredAll = photographers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.state.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = selectedState === "All" || p.state.toLowerCase() === selectedState.toLowerCase();

    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "approved"
          ? p.status === "approved" || !p.status
          : p.status === statusFilter;

    return matchesSearch && matchesState && matchesStatus;
  });

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearchQuery)) ||
      u.city.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.state.toLowerCase().includes(userSearchQuery.toLowerCase());

    const matchesRole =
      userRoleFilter === "All" ? true : u.role.toLowerCase() === userRoleFilter.toLowerCase();

    const matchesStatus =
      userStatusFilter === "All" ? true : u.status.toLowerCase() === userStatusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#040605] flex items-center justify-center text-emerald-400 font-mono text-sm">
        Verifying Security Credentials...
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: ADMIN LOGIN SCREEN (Only accessible with exact admin credentials)
  // =========================================================================
  if (!isAuthenticated) {
    if (user && user.role !== "admin") {
      return (
        <div className="min-h-screen bg-[#040605] text-zinc-100 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-amber-500/15 via-amber-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />

          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xl shadow-amber-500/20">
                <LogOut className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 font-semibold block">
                  Active Session Detected
                </span>
                <h1 className="text-2xl font-serif font-bold text-white mt-1">
                  Log Out Required
                </h1>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  You are currently signed in as <span className="font-semibold text-emerald-400">{user.name}</span> ({user.role === "photographer" ? "Photographer Studio" : "Client Account"} • {user.email}).
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  You must log out of your current account before accessing or signing in to the Master Admin Portal.
                </p>
              </div>
            </div>

            <div className="glass-panel-green rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl backdrop-blur-xl space-y-3">
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  clearAdminSession();
                  setIsAuthenticated(false);
                  setEmailInput("");
                  setPasswordInput("");
                }}
                className="w-full py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out Current Account</span>
              </button>
              <Link
                href={user.role === "photographer" ? "/dashboard" : "/photographers"}
                className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-300 text-xs font-semibold text-center transition-all block"
              >
                <span>Return to {user.role === "photographer" ? "Studio Dashboard" : "Browse Photographers"}</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#040605] text-zinc-100 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-emerald-500/15 via-emerald-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />

        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-400 to-teal-500 p-[1.5px] shadow-xl shadow-emerald-500/30">
              <div className="w-full h-full bg-[#050907] rounded-[13px] flex items-center justify-center">
                <ShieldAlert className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-400 font-semibold block">
                Restricted Access Portal
              </span>
              <h1 className="text-2xl font-serif font-bold text-white mt-1">
                MemoryMakers Master Admin
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Sign in with authorized administrator credentials to manage and curate photographer accounts.
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="glass-panel-green rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl backdrop-blur-xl space-y-5">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Master Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter administrator email"
                    autoComplete="off"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Security Passkey
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter security passkey"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 hover:text-emerald-400"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-semibold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:shadow-emerald-500/40 hover:scale-[1.01] cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Admin Portal</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED MASTER ADMIN PORTAL
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#040605] text-zinc-100 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold ${toastMessage.type === "success"
              ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
              : toastMessage.type === "error"
                ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                : "bg-blue-500/20 border-blue-500/50 text-blue-300"
              }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toastMessage.type === "error" ? (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Executive Command & Operations Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[#07130e] via-[#090f0c] to-[#040705] p-6 lg:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
          {/* Ambient decorative lighting */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Identity, Title, and Operational Status */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  System Operational
                </span>

                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 font-medium">
                  Supabase DB Connected
                </span>

                {pendingList.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("pending")}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-all cursor-pointer animate-pulse"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>{pendingList.length} Action{pendingList.length > 1 ? "s" : ""} Required</span>
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-zinc-800/60 text-zinc-400 border border-white/5 font-medium">
                    Queue Clear
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
                  <span>Marketplace Operations Center</span>
                  <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Master Admin
                  </span>
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 flex flex-wrap items-center gap-2 font-mono">
                  <span>Signed in: <strong className="text-zinc-200 font-semibold">{user?.email || "Master Administrator"}</strong></span>
                  <span className="text-zinc-600">•</span>
                  <span>Full Curation Clearance</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-emerald-400/90">Last sync: {lastSyncedTime}</span>
                </p>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Interactive Live Supabase Sync Button */}
              <button
                type="button"
                onClick={handleSyncAllDB}
                disabled={syncingDB}
                className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-400/50 text-xs font-semibold text-emerald-300 hover:text-white transition-all shadow-lg shadow-emerald-500/5 cursor-pointer disabled:opacity-50"
                title="Synchronize live records with remote Supabase database"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 transition-transform ${syncingDB ? "animate-spin" : "group-hover:rotate-180 duration-500"}`} />
                <span>{syncingDB ? "Syncing Database..." : "Sync Supabase DB"}</span>
              </button>

              {/* View Public Marketplace */}
              <Link
                href="/photographers"
                target="_blank"
                className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-sm"
              >
                <span>View Public Marketplace</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Pending Approvals (High Priority) */}
          <div
            onClick={() => setActiveTab("pending")}
            className={`p-5 rounded-2xl border cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-xl ${
              activeTab === "pending"
                ? "bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/15 ring-1 ring-amber-400/40"
                : pendingList.length > 0
                  ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-400"
                  : "glass-panel border-white/10 hover:border-amber-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                {pendingList.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                Pending Approvals
              </span>
              <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-white">{pendingList.length}</span>
              <span className="text-xs text-amber-300/80 font-mono">
                {pendingList.length === 1 ? "1 request awaiting" : `${pendingList.length} requests awaiting`}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
              <span>New accounts awaiting review</span>
              <span className="text-amber-400 font-mono font-medium">Review Queue →</span>
            </div>
          </div>

          {/* Card 2: Active Live Photographers */}
          <div
            onClick={() => setActiveTab("all")}
            className={`p-5 rounded-2xl border cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-xl ${
              activeTab === "all"
                ? "bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-400/40"
                : "glass-panel border-white/10 hover:border-emerald-500/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Live Photographers
              </span>
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-white">{approvedList.length}</span>
              <span className="text-xs text-zinc-400 font-mono">live on site</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Verified masters & active studios</span>
              <span className="text-emerald-400 font-mono font-medium">Manage →</span>
            </div>
          </div>

          {/* Card 3: Registered Users & Clients */}
          <div
            onClick={() => setActiveTab("users")}
            className={`p-5 rounded-2xl border cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-xl ${
              activeTab === "users"
                ? "bg-sky-500/15 border-sky-400 shadow-lg shadow-sky-500/15 ring-1 ring-sky-400/40"
                : "glass-panel border-white/10 hover:border-sky-500/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
                Users & Clients
              </span>
              <span className="p-2 rounded-lg bg-sky-500/10 text-sky-300">
                <UserCheck className="w-4 h-4 text-sky-400" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-white">{users.length}</span>
              <span className="text-xs text-zinc-400 font-mono">in Supabase DB</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Clients, photographers & admin</span>
              <span className="text-sky-400 font-mono font-medium">Directory →</span>
            </div>
          </div>

          {/* Card 4: Total Portfolio Assets */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
                Portfolio Assets
              </span>
              <span className="p-2 rounded-lg bg-purple-500/10 text-purple-300">
                <Camera className="w-4 h-4 text-purple-400" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-white">
                {photographers.reduce((acc, p) => acc + (p.portfolio?.length || 0), 0)}
              </span>
              <span className="text-xs text-zinc-400 font-mono">master photos</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
              <span>High-resolution wedding shots</span>
              <span className="text-zinc-500 font-mono">Asset Index</span>
            </div>
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "pending"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20 font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span>Pending Approvals</span>
              {pendingList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black text-amber-400 font-bold shadow-inner">
                  {pendingList.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-emerald-400 to-green-400 text-black shadow-md shadow-emerald-500/20 font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Photographers ({photographers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "users"
                  ? "bg-gradient-to-r from-sky-400 to-blue-500 text-black shadow-md shadow-sky-500/20 font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Registered Users ({users.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("add")}
              className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "add"
                  ? "bg-gradient-to-r from-emerald-400 to-green-400 text-black shadow-md shadow-emerald-500/20 font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Direct Onboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("emails");
                loadSentEmails();
              }}
              className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "emails"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20 font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Sent Emails ({sentEmails.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleSyncAllDB}
              disabled={syncingDB}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 hover:text-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              title="Quick sync database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingDB ? "animate-spin text-emerald-400" : ""}`} />
              <span>{syncingDB ? "Syncing..." : "Sync DB"}</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: PENDING APPROVALS QUEUE */}
        {/* =================================================================== */}
        {activeTab === "pending" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <span>Photographer Application Requests</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Needs Admin Action
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  These creators submitted an account request. Once approved by you, their studio will appear on the public marketplace.
                </p>
              </div>
            </div>

            {pendingList.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">All Caught Up!</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  There are no pending photographer applications at this moment. When a photographer signs up at{" "}
                  <code className="text-emerald-300 font-mono">/login?role=photographer</code>, their application will appear here for your review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingList.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="glass-panel-green p-6 rounded-3xl border border-amber-500/30 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6"
                  >
                    {/* Top Status Banner */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">
                          Awaiting Admin Approval
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {applicant.appliedDate || "Recently Submitted"}
                      </span>
                    </div>

                    {/* Applicant Profile Details */}
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-400/50 shrink-0">
                        <LazyImage
                          src={applicant.avatarUrl}
                          alt={applicant.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                          showLogoWhileLoading={false}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">
                          {applicant.businessName}
                        </h3>
                        <p className="text-xs text-emerald-400 font-medium">Lead: {applicant.name}</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            {applicant.city}, {applicant.state}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-zinc-300">
                            Starting ₹{applicant.startingPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio & Specialties */}
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-300 line-clamp-2 italic">
                        &quot;{applicant.bio}&quot;
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {applicant.specialties?.map((spec) => (
                          <span
                            key={spec}
                            className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] text-zinc-300"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Gear locker snippet */}
                    {applicant.gearList && applicant.gearList.length > 0 && (
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80 block">
                          Verified Gear Equipment:
                        </span>
                        <p className="text-xs text-zinc-300 truncate font-mono">
                          {applicant.gearList.join(" • ")}
                        </p>
                      </div>
                    )}

                    {/* Contact details */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/5">
                      <div className="truncate">
                        <span className="text-zinc-500">Email:</span> {applicant.email || "N/A"}
                      </div>
                      <div className="truncate">
                        <span className="text-zinc-500">Phone:</span> {applicant.phone || "N/A"}
                      </div>
                    </div>

                    {/* Decision Action Buttons */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setInspectApplicant(applicant)}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Inspect Full Profile</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReject(applicant.id, applicant.businessName)}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 hover:text-rose-200 transition-all flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(applicant.id, applicant.businessName)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-300 hover:to-green-300 text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: ALL PHOTOGRAPHERS DIRECTORY (Full Data Management & Removal) */}
        {/* =================================================================== */}
        {activeTab === "all" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-emerald-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by artist, studio, city..."
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* State & Status Filters */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#070b09] border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-emerald-400 font-mono"
                >
                  <option value="All">All Indian States</option>
                  {PRIMARY_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r} (Focus)
                    </option>
                  ))}
                  {ALL_INDIAN_STATES.filter((s) => !PRIMARY_REGIONS.includes(s as any)).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#070b09] border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-emerald-400 font-mono"
                >
                  <option value="All">All Statuses</option>
                  <option value="approved">Approved & Live</option>
                  <option value="pending">Pending Approval</option>
                  <option value="rejected">Declined</option>
                </select>
              </div>
            </div>

            {/* Photographers Table */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      <th className="py-4 px-6">Studio & Lead Artist</th>
                      <th className="py-4 px-4">Location</th>
                      <th className="py-4 px-4">Starting Rate</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Master Badges</th>
                      <th className="py-4 px-6 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-xs">
                    {filteredAll.map((p) => {
                      const isApproved = p.status === "approved" || !p.status;
                      const isPending = p.status === "pending";

                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Studio Info */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-emerald-400/40 shrink-0">
                                <LazyImage
                                  src={p.avatarUrl}
                                  alt={p.name}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                  showLogoWhileLoading={false}
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{p.businessName}</h4>
                                <p className="text-[11px] text-zinc-400">{p.name}</p>
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {p.email || `${p.slug}@memorymakers.in`}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-4 px-4 font-mono text-zinc-300">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>
                                {p.city}, {p.state}
                              </span>
                            </div>
                          </td>

                          {/* Starting Rate */}
                          <td className="py-4 px-4 font-mono font-semibold text-white">
                            ₹{p.startingPrice.toLocaleString("en-IN")}
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Live / Approved
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                Pending Review
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-400/40">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                Declined
                              </span>
                            )}
                          </td>

                          {/* Badges Toggles */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {/* Toggle Verified */}
                              <button
                                type="button"
                                onClick={() => handleToggleVerified(p.id, p.businessName)}
                                className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase border transition-all ${p.verified
                                  ? "bg-emerald-400/20 border-emerald-400/50 text-emerald-300"
                                  : "bg-white/[0.03] border-white/10 text-zinc-500 hover:text-zinc-300"
                                  }`}
                                title="Toggle Verified Master badge"
                              >
                                {p.verified ? "✓ Verified" : "+ Verify"}
                              </button>

                              {/* Toggle Featured */}
                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(p.id, p.businessName)}
                                className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase border transition-all ${p.featured
                                  ? "bg-teal-400/20 border-teal-400/50 text-teal-300"
                                  : "bg-white/[0.03] border-white/10 text-zinc-500 hover:text-zinc-300"
                                  }`}
                                title="Toggle Homepage Spotlight"
                              >
                                {p.featured ? "★ Featured" : "Feature"}
                              </button>
                            </div>
                          </td>

                          {/* Admin Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* If pending, show quick approve */}
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(p.id, p.businessName)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-400 text-black font-semibold text-[11px] hover:bg-emerald-300 transition-colors"
                                >
                                  Approve
                                </button>
                              )}

                              {/* View live public profile */}
                              <Link
                                href={`/photographer/${p.slug}`}
                                target="_blank"
                                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors"
                                title="View public profile"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              {/* Remove Photographer */}
                              <button
                                type="button"
                                onClick={() => setPhotographerToDelete(p)}
                                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-200 transition-colors"
                                title="Remove photographer from project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: REGISTERED USERS & CLIENTS (Supabase DB Users Management) */}
        {/* =================================================================== */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header & Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-sky-400" />
                  <span>All Registered Users & Accounts</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage accounts stored in Supabase PostgreSQL <code className="text-sky-300 font-mono">public.users</code> table. Review engagement, suspend malicious actors, or permanently remove accounts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs font-mono text-sky-300">
                  {filteredUsers.length} of {users.length} Users
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search user by name, email, phone, city, or state..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Role Filter */}
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-[#090e0c] border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-sky-400 font-mono"
                >
                  <option value="All">All Roles</option>
                  <option value="client">Clients & Couples</option>
                  <option value="photographer">Photographers</option>
                  <option value="admin">Master Administrator</option>
                </select>

                {/* Status Filter */}
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-[#090e0c] border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-sky-400 font-mono"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-white/[0.02]">
                      <th className="py-3.5 px-6">User / Account</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Contact Phone</th>
                      <th className="py-3.5 px-4">Inquiries / Reviews</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Joined</th>
                      <th className="py-3.5 px-6 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-xs">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-zinc-500 font-mono">
                          No users matching search filters in Supabase DB.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isAdmin = u.role === "admin";
                        const isSuspended = u.status === "suspended";

                        return (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                            {/* User Info */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                                    isAdmin
                                      ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                                      : u.role === "photographer"
                                      ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/40"
                                      : "bg-sky-400/20 text-sky-300 border-sky-400/40"
                                  }`}
                                >
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-white">{u.name}</h4>
                                    {isAdmin && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                        Single Master
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] font-mono text-zinc-400">{u.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Role Badge */}
                            <td className="py-4 px-4 font-mono">
                              {isAdmin ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Administrator</span>
                                </span>
                              ) : u.role === "photographer" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">
                                  <Camera className="w-3 h-3" />
                                  <span>Artisan Creator</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-sky-400/10 text-sky-300 border border-sky-400/30">
                                  <Users className="w-3 h-3" />
                                  <span>Client / Couple</span>
                                </span>
                              )}
                            </td>

                            {/* Location */}
                            <td className="py-4 px-4 font-mono text-zinc-300">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                <span>
                                  {u.city}, {u.state}
                                </span>
                              </div>
                            </td>

                            {/* Contact Phone */}
                            <td className="py-4 px-4 font-mono text-zinc-400 text-[11px]">
                              {u.phone || "—"}
                            </td>

                            {/* Inquiries / Reviews */}
                            <td className="py-4 px-4 font-mono">
                              <span className="text-white font-semibold">{u.inquiriesCount ?? 0}</span>
                              <span className="text-zinc-500 text-[10px]"> inq</span>
                              <span className="text-zinc-600 mx-1">•</span>
                              <span className="text-white font-semibold">{u.reviewsCount ?? 0}</span>
                              <span className="text-zinc-500 text-[10px]"> rev</span>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                                  isSuspended
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isSuspended ? "bg-rose-400" : "bg-emerald-400"
                                  }`}
                                />
                                <span className="capitalize">{u.status}</span>
                              </span>
                            </td>

                            {/* Joined Date */}
                            <td className="py-4 px-4 font-mono text-[11px] text-zinc-400">
                              {u.joinedDate || "Recent"}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-right">
                              {isAdmin ? (
                                <span className="text-[10px] font-mono text-amber-400/80 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                                  Master Protected
                                </span>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  {/* Toggle Suspend / Active */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserStatus(u)}
                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                                      isSuspended
                                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                        : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    }`}
                                    title={isSuspended ? "Reactivate user account" : "Suspend user account"}
                                  >
                                    {isSuspended ? "Reactivate" : "Suspend"}
                                  </button>

                                  {/* Delete User */}
                                  <button
                                    type="button"
                                    onClick={() => setUserToDelete(u)}
                                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-200 transition-colors"
                                    title="Permanently remove user"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: DIRECT ONBOARD NEW ARTISAN (Admin Direct Creator Creation) */}
        {/* =================================================================== */}
        {activeTab === "add" && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Directly Onboard & Approve Visual Artisan</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                As the Master Admin, you can manually register and auto-approve a master photographer into the directory.
              </p>
            </div>

            <form onSubmit={handleDirectAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Lead Photographer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newArtistName}
                    onChange={(e) => setNewArtistName(e.target.value)}
                    placeholder="e.g. Gurpreet Sandhu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Business / Studio Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudioName}
                    onChange={(e) => setNewStudioName(e.target.value)}
                    placeholder="e.g. Sandhu Cine Studios"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    State (India) *
                  </label>
                  <select
                    value={newArtistState}
                    onChange={(e) => setNewArtistState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  >
                    {PRIMARY_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r} (Focus Region)
                      </option>
                    ))}
                    {ALL_INDIAN_STATES.filter((s) => !PRIMARY_REGIONS.includes(s as any)).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    City / Base *
                  </label>
                  <input
                    type="text"
                    required
                    value={newArtistCity}
                    onChange={(e) => setNewArtistCity(e.target.value)}
                    placeholder="e.g. Ludhiana or Jaipur"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={newArtistEmail}
                    onChange={(e) => setNewArtistEmail(e.target.value)}
                    placeholder="contact@studio.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Starting Rate (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newStartingPrice}
                    onChange={(e) => setNewStartingPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Tagline / Aesthetic Specialty
                </label>
                <input
                  type="text"
                  value={newArtistTagline}
                  onChange={(e) => setNewArtistTagline(e.target.value)}
                  placeholder="e.g. Royal Anand Karaj & Fort Pre-Weddings"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-300 hover:to-green-300 text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Onboard & Make Live
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: SENT APPROVAL EMAILS AUDIT LOG */}
        {/* =================================================================== */}
        {activeTab === "emails" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <span>Dispatched Approval Emails</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {sentEmails.length} Dispatched
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Official verification emails dispatched to photographers when approved by the Master Administrator.
                </p>
              </div>

              <button
                type="button"
                onClick={loadSentEmails}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Refresh Log</span>
              </button>
            </div>

            {sentEmails.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">No Emails Dispatched Yet</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  When you click &quot;Approve Account&quot; on any pending photographer application, the official branded welcome and verification email is generated, dispatched, and logged here with an instant HTML preview.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentEmails.map((item: any) => (
                  <div
                    key={item.id}
                    className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                          {item.status === "delivered" ? "SMTP DELIVERED" : "DISPATCHED"}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {item.businessName} ({item.photographerName})
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-300 font-mono">
                        Recipient: <span className="text-emerald-400">{item.recipient}</span> • Subject: {item.subject}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Dispatched: {new Date(item.sentAt).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectEmail(item)}
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Email HTML</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* MODAL 1: INSPECT APPLICANT FULL PROFILE */}
      {/* =================================================================== */}
      {inspectApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-400/40 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                  Application Review
                </span>
                <h3 className="text-xl font-bold text-white">{inspectApplicant.businessName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectApplicant(null)}
                className="p-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Applicant Bio & Details */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 font-mono">
                <div>
                  <span className="text-zinc-500">Applicant:</span> {inspectApplicant.name}
                </div>
                <div>
                  <span className="text-zinc-500">Location:</span> {inspectApplicant.city},{" "}
                  {inspectApplicant.state}
                </div>
                <div>
                  <span className="text-zinc-500">Email:</span> {inspectApplicant.email || "N/A"}
                </div>
                <div>
                  <span className="text-zinc-500">Starting Price:</span> ₹
                  {inspectApplicant.startingPrice.toLocaleString("en-IN")}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1">Artist Bio</h4>
                <p className="text-zinc-300 leading-relaxed">{inspectApplicant.bio}</p>
              </div>

              {/* Sample Portfolio Images */}
              {inspectApplicant.portfolio && inspectApplicant.portfolio.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-2">Sample Portfolio Submissions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {inspectApplicant.portfolio.map((item) => (
                      <div
                        key={item.id}
                        className="relative h-44 rounded-xl overflow-hidden border border-white/10"
                      >
                        <LazyImage
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="300px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <span className="absolute bottom-2 left-2 text-[10px] text-white font-semibold">
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleReject(inspectApplicant.id, inspectApplicant.businessName)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold"
              >
                Decline Request
              </button>
              <button
                type="button"
                onClick={() => handleApprove(inspectApplicant.id, inspectApplicant.businessName)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-400 text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/25"
              >
                Approve & Publish Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: CONFIRM DELETE / REMOVAL FROM PROJECT */}
      {/* =================================================================== */}
      {photographerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-rose-500/40 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Remove Photographer?</h3>
              <p className="text-xs text-zinc-300 mt-2">
                Are you sure you want to permanently remove{" "}
                <span className="text-white font-bold">{photographerToDelete.businessName}</span> from
                MemoryMakers?
              </p>
              <p className="text-[11px] text-rose-400/90 mt-1 font-mono">
                This will immediately remove their portfolio, packages, and profile from public discovery.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPhotographerToDelete(null)}
                className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-500/20"
              >
                Yes, Remove Photographer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: CONFIRM DELETE USER ACCOUNT */}
      {/* =================================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-rose-500/40 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Permanently Remove User?</h3>
              <p className="text-xs text-zinc-300 mt-2">
                Are you sure you want to permanently delete{" "}
                <span className="text-white font-bold">{userToDelete.name}</span> ({userToDelete.email}) from
                Supabase PostgreSQL?
              </p>
              <p className="text-[11px] text-rose-400/90 mt-1 font-mono">
                This action is irreversible and deletes their account record from public.users.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-500/20"
              >
                Yes, Delete User Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: PREVIEW DISPATCHED EMAIL */}
      {/* =================================================================== */}
      {inspectEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-400/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                  Official Email Dispatch Preview
                </span>
                <h3 className="text-base font-bold text-white mt-1">{inspectEmail.subject}</h3>
                <p className="text-xs text-zinc-400 font-mono">Recipient: {inspectEmail.recipient}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectEmail(null)}
                className="p-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/60 p-4 max-h-[60vh] overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: inspectEmail.previewHtml || "" }} />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectEmail(null)}
                className="px-5 py-2 rounded-xl bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

