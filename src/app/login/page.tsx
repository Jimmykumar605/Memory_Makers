"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Sparkles, Heart, ArrowRight, ShieldCheck, Mail, Lock, User, Loader2, LogOut, Clock, RefreshCw, Eye, EyeOff, Phone } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { PRIMARY_REGIONS, ALL_INDIAN_STATES } from "@/lib/data";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRole = searchParams.get("role");

  const { login, signup, user: activeUser, logout, refreshUser } = useAuth();

  const [isSignUp, setIsSignUp] = useState(queryRole === "photographer");
  const [role, setRole] = useState<"photographer" | "client">(
    queryRole === "client" ? "client" : "photographer"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("Punjab");
  const [city, setCity] = useState("Amritsar");
  const [startingPrice, setStartingPrice] = useState(55000);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pendingSubmission, setPendingSubmission] = useState<{
    businessName: string;
    city: string;
    state: string;
  } | null>(null);

  useEffect(() => {
    if (queryRole === "photographer") {
      setRole("photographer");
      setIsSignUp(true);
    }
  }, [queryRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        if (role === "photographer") {
          const trimmedPhone = phone.trim();
          if (!trimmedPhone) {
            setErrorMsg("Mobile number is compulsory for photographer registration.");
            setLoading(false);
            return;
          }
          const digits = trimmedPhone.replace(/\D/g, "");
          if (digits.length < 10) {
            setErrorMsg("Please enter a valid 10-digit mobile number for photographer verification.");
            setLoading(false);
            return;
          }
        }

        // Dynamic Signup via /api/auth/signup API connected to Supabase DB
        const res = await signup({
          name: fullName,
          email,
          password,
          role,
          phone: phone.trim(),
          state,
          city,
          businessName: role === "photographer" ? businessName : undefined,
          startingPrice: role === "photographer" ? Number(startingPrice) : undefined,
        });

        if (res.error) {
          setErrorMsg(res.error);
          return;
        }

        if (role === "photographer") {
          setPendingSubmission({
            businessName: businessName || `${fullName} Photography`,
            city,
            state,
          });
          return;
        }

        router.push("/photographers");
        return;
      }

      // Dynamic Login via /api/auth/login API connected to Supabase DB
      const res = await login(email, password, role);

      if (res.error) {
        setErrorMsg(res.error);
        return;
      }

      if (res.isPendingApproval) {
        setPendingSubmission({
          businessName: res.photographer?.businessName || "Your Studio",
          city: res.photographer?.city || city,
          state: res.photographer?.state || state,
        });
        return;
      }

      if (res.redirectTo) {
        router.push(res.redirectTo);
      } else if (res.user?.role === "admin") {
        router.push("/admin");
      } else if (res.user?.role === "photographer") {
        router.push("/dashboard");
      } else {
        router.push("/photographers");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040507] text-zinc-100 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Neon Green Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-emerald-500/15 via-green-500/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-emerald-600/10 blur-[130px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-green-400 to-teal-600 p-[1px] flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#050907] rounded-[11px] flex items-center justify-center">
                <Camera className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              </div>
            </div>
            <span className="font-serif tracking-widest text-xl font-bold text-white uppercase group-hover:text-emerald-300 transition-colors">
              MEMORY<span className="text-emerald-400">MAKERS</span>
            </span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-white">
            {isSignUp ? "Join as Visual Artist or Client" : "Welcome Back"}
          </h1>
          <p className="text-xs text-zinc-400">
            {isSignUp
              ? "Create your portfolio or commission master photographers"
              : "Sign in to manage your studio or booking inquiries"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel-green rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl backdrop-blur-xl space-y-5">
          {activeUser && !pendingSubmission ? (
            activeUser.role === "photographer" && (activeUser.status === "pending" || activeUser.photographerStatus === "pending") ? (
              <div className="text-center space-y-4 py-2 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                  <Clock className="w-7 h-7 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold inline-block">
                    Status: Pending Admin Approval
                  </span>
                  <h2 className="text-xl font-serif font-bold text-white">Application Under Review</h2>
                  <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
                    Your studio application for <span className="font-semibold text-amber-300">{activeUser.businessName || activeUser.name}</span> is currently undergoing administrator curation review.
                  </p>
                  <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-400 text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Studio Dashboard Access Locked</span>
                    </div>
                    <p>
                      Studio management features and marketplace discovery are locked until an Administrator approves your application. You will receive an official approval email once verified.
                    </p>
                  </div>
                </div>

                <div className="pt-3 space-y-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      await refreshUser();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check Approval Status</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out Current Account</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-2 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <User className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-semibold inline-block">
                    Active Session
                  </span>
                  <h2 className="text-xl font-serif font-bold text-white">Already Signed In</h2>
                  <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
                    You are currently signed in as <span className="font-semibold text-emerald-400">{activeUser.name}</span> ({activeUser.role === "photographer" ? "Photographer Studio" : activeUser.role === "admin" ? "Master Admin" : "Client"} • {activeUser.email}).
                  </p>
                  <p className="text-xs text-zinc-400">
                    To sign in to a different account or register a new one, you must log out of your current session first.
                  </p>
                </div>

                <div className="pt-3 space-y-2.5">
                  <Link
                    href={activeUser.role === "admin" ? "/admin" : activeUser.role === "photographer" ? "/dashboard" : "/photographers"}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.01]"
                  >
                    <span>Continue to {activeUser.role === "admin" ? "Admin Portal" : activeUser.role === "photographer" ? "Studio Dashboard" : "Browse Marketplace"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out Current Account</span>
                  </button>
                </div>
              </div>
            )
          ) : pendingSubmission ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold inline-block">
                  Status: Pending Admin Approval
                </span>
                <h2 className="text-xl font-serif font-bold text-white mt-2">
                  Application Successfully Submitted!
                </h2>
                <p className="text-xs text-zinc-300 mt-2 max-w-sm mx-auto leading-relaxed">
                  Thank you for applying to join MemoryMakers with{" "}
                  <span className="text-emerald-300 font-semibold">{pendingSubmission.businessName}</span> (
                  {pendingSubmission.city}, {pendingSubmission.state}).
                </p>
                <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-400 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>What happens next?</span>
                  </div>
                  <p>
                    To ensure the highest artistic quality across Punjab, Haryana, Rajasthan, Himachal, Chandigarh, and Delhi NCR, the Master Admin reviews every applicant&apos;s portfolio and equipment locker before publishing it live on the marketplace.
                  </p>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Creator Studio Workspace</span>
                </Link>

                <Link
                  href="/photographers"
                  className="block text-center text-xs text-zinc-400 hover:text-emerald-400 pt-1"
                >
                  Browse Public Photographers Directory
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Role Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/50 border border-white/10">
                <button
                  type="button"
                  onClick={() => setRole("photographer")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    role === "photographer"
                      ? "bg-gradient-to-r from-emerald-400 to-green-400 text-black shadow-md shadow-emerald-400/25"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Photographer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    role === "client"
                      ? "bg-gradient-to-r from-emerald-400 to-green-400 text-black shadow-md shadow-emerald-400/25"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Client / Couple</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {isSignUp && (
                  <>
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                        Your Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Jasleen Kaur or Harpreet Singh"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all"
                        />
                      </div>
                    </div>

                    {role === "photographer" && (
                      <>
                        <div>
                          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                            Business / Studio Name *
                          </label>
                          <div className="relative">
                            <Camera className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                            <input
                              type="text"
                              required
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              placeholder="e.g. Amritsar Cine Arts or Royal Heritage Visuals"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1 flex items-center justify-between">
                            <span>Mobile / WhatsApp Number *</span>
                            <span className="text-[10px] text-emerald-400 font-sans font-medium">Compulsory for Verification</span>
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all font-mono"
                            />
                          </div>
                        </div>

                        {/* Location inputs: State & City */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                              State (India)
                            </label>
                            <select
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                            >
                              {PRIMARY_REGIONS.map((r) => (
                                <option key={r} value={r}>
                                  {r} (Focus)
                                </option>
                              ))}
                              {ALL_INDIAN_STATES.filter((s) => !PRIMARY_REGIONS.includes(s as any)).map(
                                (s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                              City / Base
                            </label>
                            <input
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="e.g. Ludhiana"
                              className="w-full px-3 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                            Starting Package Rate (INR ₹)
                          </label>
                          <input
                            type="number"
                            required
                            value={startingPrice}
                            onChange={(e) => setStartingPrice(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-semibold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:shadow-emerald-500/40 hover:scale-[1.01]"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isSignUp ? "Create Account & Get Started" : "Sign In to Studio"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in here"
                : "Don't have an account yet? Create one here"}
            </button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#040507] flex items-center justify-center text-emerald-400 font-mono text-sm">
          Loading Authentication...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
