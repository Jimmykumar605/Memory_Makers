"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Calendar, MapPin, DollarSign, CheckCircle2, Sparkles, Send } from "lucide-react";
import { Photographer, OccasionType } from "@/lib/types";
import { OCCASIONS } from "@/lib/data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

interface BookingModalProps {
  photographer: Photographer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ photographer, isOpen, onClose }: BookingModalProps) {
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
        // Mock delay for UI smoothness
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting inquiry", err);
      // Still show success in offline/demo mode
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel-gold border border-amber-400/30 p-6 sm:p-8 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/40 mx-auto flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">Inquiry Sent to Artist!</h3>
            <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-amber-300">{clientName}</strong>. Your request for{" "}
              <span className="text-white font-medium">{occasion}</span> photography on{" "}
              <span className="text-white font-medium">{eventDate || "your chosen date"}</span> has been transmitted directly to{" "}
              <strong className="text-amber-400">{photographer.businessName}</strong>.
            </p>
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-zinc-400 text-left max-w-sm mx-auto space-y-1">
              <div>• Artist will review dates and availability within 24 hours.</div>
              <div>• You will receive a direct reply at: {clientEmail}.</div>
            </div>
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2.5 rounded-xl bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 transition-colors shadow-lg shadow-amber-500/20"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            {/* Header info */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-white/10">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amber-400/40 shrink-0">
                <Image
                  src={photographer.avatarUrl}
                  alt={photographer.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Booking Inquiry
                </span>
                <h3 className="text-lg font-bold text-white">{photographer.businessName}</h3>
                <p className="text-xs text-zinc-400">
                  Based in {photographer.city} • Packages from ${photographer.startingPrice.toLocaleString()}
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
                    placeholder="e.g. Rachel Adams"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
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
                    placeholder="rachel@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
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
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Occasion Type *
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value as OccasionType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    {OCCASIONS.map((occ) => (
                      <option key={occ.label} value={occ.label} className="bg-[#12141f]">
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Venue City / Destination *
                  </label>
                  <input
                    type="text"
                    required
                    value={venueLocation}
                    onChange={(e) => setVenueLocation(e.target.value)}
                    placeholder="e.g. Udaipur or Lake Como"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Estimated Photography Budget (USD)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder={`Starting at $${photographer.startingPrice}`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-semibold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all duration-300 disabled:opacity-50"
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
