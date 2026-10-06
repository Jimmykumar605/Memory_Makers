"use client";

import { useState } from "react";
import { Star, X, Sparkles, CheckCircle2 } from "lucide-react";
import { Photographer, OccasionType, Review } from "@/lib/types";
import { addPhotographerReview } from "@/lib/photographerStore";
import { submitReviewToSupabase } from "@/lib/supabase/service";
import { OCCASIONS } from "@/lib/data";
import CustomSelect from "@/components/CustomSelect";

interface ReviewModalProps {
  photographer: Photographer;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: (review: Review) => void;
}

export default function ReviewModal({
  photographer,
  isOpen,
  onClose,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [clientName, setClientName] = useState("");
  const [occasion, setOccasion] = useState<OccasionType>("Wedding");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const activeRating = hoverRating || rating;

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5:
        return "Exceptional Masterpiece (5.0 / 5.0)";
      case 4:
        return "Great Visual Storytelling (4.0 / 5.0)";
      case 3:
        return "Good & Satisfactory (3.0 / 5.0)";
      case 2:
        return "Fair / Room for Improvement (2.0 / 5.0)";
      case 1:
        return "Disappointing (1.0 / 5.0)";
      default:
        return "Select a star rating";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !comment.trim() || rating < 1) return;

    setSubmitting(true);

    try {
      // 1. Submit dynamically to Supabase PostgreSQL DB!
      const remoteReview = await submitReviewToSupabase(photographer.id, {
        clientName,
        rating,
        occasion,
        comment,
      });

      // 2. Update local state / cache
      const created = addPhotographerReview(photographer.id, {
        clientName,
        rating,
        occasion,
        comment,
      });

      setIsSuccess(true);
      if (onReviewSubmitted) {
        onReviewSubmitted(remoteReview || created);
      }
      setTimeout(() => {
        setIsSuccess(false);
        setClientName("");
        setComment("");
        setRating(5);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel-green p-6 sm:p-8 rounded-3xl border border-emerald-400/40 shadow-2xl backdrop-blur-2xl">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
          aria-label="Close review modal"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">Review & Rating Published!</h3>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto">
              Thank you for sharing your experience with{" "}
              <span className="text-emerald-300 font-semibold">{photographer.businessName}</span>. Your feedback helps couples discover genuine master artisans.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] uppercase tracking-widest font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Client Story</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                Rate & Review {photographer.businessName}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Share your authentic wedding or shoot experience to guide couples and families.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Selection */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Your Overall Rating *
                </label>

                {/* Stars Row */}
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isLit = starVal <= activeRating;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-zinc-600 hover:scale-125 transition-transform duration-150 focus:outline-none"
                        aria-label={`Rate ${starVal} stars`}
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isLit
                              ? "fill-emerald-400 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                              : "text-zinc-600 hover:text-zinc-400"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-mono text-emerald-300 font-medium h-4">
                  {getRatingLabel(activeRating)}
                </div>
              </div>

              {/* Client Name & Occasion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Your Name / Couple Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Simran & Harpreet"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Occasion / Ceremony *
                  </label>
                  <CustomSelect
                    value={occasion}
                    onChange={(val) => setOccasion(val as OccasionType)}
                    options={OCCASIONS.map((occ) => ({
                      value: occ.label,
                      label: occ.label,
                      description: occ.description,
                    }))}
                    className="py-2 text-xs"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Your Review & Experience *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about photo quality, punctuality, candid emotions captured, communication, and overall experience..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b09] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 resize-none leading-relaxed"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || !clientName.trim() || !comment.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 hover:from-emerald-300 hover:to-green-300 text-black font-semibold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:shadow-emerald-500/40 hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitting ? (
                  <span>Publishing Story...</span>
                ) : (
                  <>
                    <Star className="w-3.5 h-3.5 fill-black" />
                    <span>Submit Verified Rating & Story</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
