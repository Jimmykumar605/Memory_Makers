"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Sparkles, Heart, ArrowRight, ShieldCheck, Mail, Lock, User } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"photographer" | "client">("photographer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isSupabaseConfigured()) {
        if (isSignUp) {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                business_name: businessName,
                role: role,
              },
            },
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
        }
      }

      // Route based on role
      if (role === "photographer") {
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

  const handleDemoLogin = (demoRole: "photographer" | "client") => {
    if (demoRole === "photographer") {
      router.push("/dashboard");
    } else {
      router.push("/photographers");
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-[1px] flex items-center justify-center shadow-lg shadow-amber-500/10">
              <div className="w-full h-full bg-[#0d0f17] rounded-[11px] flex items-center justify-center">
                <Camera className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <span className="font-serif tracking-widest text-xl font-bold text-white uppercase">
              MEMORY<span className="text-amber-400">MAKERS</span>
            </span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-white">
            {isSignUp ? "Join the Visual Artists Network" : "Welcome Back"}
          </h1>
          <p className="text-xs text-zinc-400">
            {isSignUp
              ? "Create your portfolio or commission master photographers"
              : "Sign in to manage your studio or booking inquiries"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel-gold rounded-3xl p-6 sm:p-8 border border-amber-400/30 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/10">
            <button
              type="button"
              onClick={() => setRole("photographer")}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                role === "photographer"
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
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
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jessica Sterling"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {role === "photographer" && (
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Business / Studio Name
                    </label>
                    <div className="relative">
                      <Camera className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Sterling Heritage Visuals"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-semibold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
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
              className="text-xs text-zinc-400 hover:text-amber-400 transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in here"
                : "Don't have an account yet? Create one here"}
            </button>
          </div>

          {/* Fast Demo Access */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block text-center">
              Quick One-Click Demo Mode
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("photographer")}
                className="py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-zinc-300 hover:text-white transition-colors"
              >
                📸 Demo Photographer Studio
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("client")}
                className="py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-zinc-300 hover:text-white transition-colors"
              >
                💍 Demo Client Explore
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
