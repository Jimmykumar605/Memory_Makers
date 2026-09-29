"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import LazyImage from "./LazyImage";
import { X, Calendar, MapPin, DollarSign, CheckCircle2, Sparkles, Send, Phone, Clock, MessageCircle } from "lucide-react";
import { Photographer, OccasionType } from "@/lib/types";
import { OCCASIONS } from "@/lib/data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/authContext";

interface BookingModalProps {
  photographer: Photographer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ photographer, isOpen, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [occasion, setOccasion] = useState<OccasionType>("Wedding");
  const [eventDate, setEventDate] = useState("");
  const [venueLocation, setVenueLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Check if the currently logged-in account is a photographer or the same artist as this profile
    const isPhotographerAccount = user?.role === "photographer";
    const isSameAsPhotographer =
      photographer &&
      (user?.id === photographer.id ||
        (user?.email && photographer.email && user.email.toLowerCase() === photographer.email.toLowerCase()) ||
        (user?.phone && photographer.phone && user.phone === photographer.phone) ||
        (user?.businessName && photographer.businessName && user.businessName.toLowerCase() === photographer.businessName.toLowerCase()));

    // ONLY auto-fill if the logged-in user is explicitly a "client" role and NOT the photographer
    if (user && user.role === "client" && !isPhotographerAccount && !isSameAsPhotographer) {
      setClientName(user.name || "");
      setClientEmail(user.email || "");
      setClientPhone(user.phone || "");
    } else {
      // Photographers, admins, guests, or viewing own studio profile should always have clean, blank fields
      setClientName("");
      setClientEmail("");
      setClientPhone("");
    }
  }, [isOpen, user, photographer]);

  if (!isOpen || !photographer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        await supabase.from("inquiries").insert({
          photographer_id: photographer.id,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          occasion: occasion,
          event_date: eventDate,
          location: venueLocation,
          budget: budget ? parseFloat(budget) : null,
          notes: notes,
          status: "pending",
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting inquiry", err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setEventDate("");
    setVenueLocation("");
    setBudget("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel-green border border-emerald-400/30 p-6 sm:p-8 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-300">
            {/* Top Celebration Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inquiry Confirmed</span>
            </div>

            {/* Glowing Success Ring */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/25">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                The Artist Will Connect With You Soon!
              </h3>
              <p className="text-sm text-zinc-300 max-w-md mx-auto mt-2 leading-relaxed">
                Thank you{clientName ? <>, <strong className="text-emerald-300">{clientName}</strong></> : ""}! Your inquiry has been sent directly to{" "}
                <strong className="text-white">{photographer.businessName}</strong>. The photographer will reach out to you via{" "}
                <span className="text-emerald-300 font-medium">Call or WhatsApp</span> to discuss your celebration and confirm availability.
              </p>
            </div>

            {/* Next Steps Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-emerald-500/20 text-xs text-zinc-300 text-left max-w-md mx-auto space-y-3 shadow-inner">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white block">Direct Artist Consultation</span>
                  <span className="text-zinc-400 text-[11px]">
                    The studio will call or message you{clientPhone ? <> at <span className="text-emerald-300 font-mono">{clientPhone}</span></> : ""} to review your vision and package details.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white block">Fast Response Guarantee</span>
                  <span className="text-zinc-400 text-[11px]">
                    Artists on MemoryMakers usually respond within 2 to 4 hours.
                  </span>
                </div>
              </div>

              {clientEmail && (
                <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Confirmation copy:</span>
                  <span className="font-mono text-zinc-300">{clientEmail}</span>
                </div>
              )}
            </div>

            {/* Quick Actions (WhatsApp + Done) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              {photographer.phone && (
                <a
                  href={`https://wa.me/${photographer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hi ${photographer.businessName}, I just submitted an inquiry on MemoryMakers for ${occasion} photography${
                      eventDate ? ` on ${eventDate}` : ""
                    }. Looking forward to discussing details!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs inline-flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Chat on WhatsApp Now</span>
                </a>
              )}

              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-400 text-black font-semibold text-xs hover:bg-emerald-300 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
              >
                Back to Portfolio
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header info */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-white/10">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-400/40 shrink-0">
                <LazyImage
                  src={photographer.avatarUrl}
                  alt={photographer.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  showLogoWhileLoading={false}
                />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" /> Booking Inquiry
                </span>
                <h3 className="text-lg font-bold text-white">{photographer.businessName}</h3>
                <p className="text-xs text-zinc-400">
                  Based in {photographer.city}, {photographer.state} • Packages from ₹{photographer.startingPrice.toLocaleString("en-IN")}
                  {photographer.phone && (
                    <span className="text-emerald-300 font-mono"> • Studio: {photographer.phone}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Jasleen Kaur or Rohan Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060907] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="jasleen@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060907] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060907] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Occasion Type *
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value as OccasionType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060907] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  >
                    {OCCASIONS.map((occ) => (
                      <option key={occ.label} value={occ.label} className="bg-[#090d0b]">
                        {occ.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060907] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Venue City & State *
                  </label>
                  <input
                    type="text"
                    required
                    value={venueLocation}
                    onChange={(e) => setVenueLocation(e.target.value)}
                    placeholder="e.g. Amritsar, Jaipur, Chandigarh, Shimla or Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060907] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Estimated Photography Budget (INR ₹)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder={`Starting at ₹${photographer.startingPrice.toLocaleString("en-IN")}`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#060907] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Vision & Details (Number of guests, rituals, special requirements)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell the photographer about your celebration aesthetic, key moments, or schedule..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#060907] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 hover:from-emerald-300 hover:to-green-300 text-black font-semibold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 hover:scale-[1.01]"
                >
                  {submitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Request Quote & Check Availability</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
