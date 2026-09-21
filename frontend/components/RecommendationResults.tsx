"use client";

import React, { useState } from "react";
import {
  Trophy,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Database,
  Calculator,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { RecommendResponse, RecommendationItem } from "@/types";

interface Props {
  data: RecommendResponse;
  depositAmount: number;
}

export const RecommendationResults: React.FC<Props> = ({
  data,
  depositAmount,
}) => {
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);

  const formatRupee = (val: number): string => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(val);
  };

  const { best_match, tenure_optimization, alternatives, explanation, disclaimer } = data;

  if (!best_match) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">
          No Matching Options Found
        </h3>
        <p className="text-sm text-slate-600 mt-2">
          {explanation[0] ||
            "No deposit options matched your exact deposit amount and criteria. Try adjusting your amount or tenure."}
        </p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedOptionId((prev) => (prev === id ? null : id));
  };

  return (
    <div id="recommendation-results" className="w-full max-w-3xl mx-auto mt-10 space-y-8 animate-in fade-in duration-500">
      {/* 1. Engine Overview Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-finopt-900 text-finopt-300 border border-finopt-700/60 mb-1">
              Deterministic Decision Engine
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Personalized Deposit Analysis
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Deposit Principal</span>
            <span className="text-lg font-extrabold text-white">
              ₹{formatRupee(depositAmount)}
            </span>
          </div>
        </div>

        <ul className="text-xs text-slate-300 space-y-1.5">
          {explanation.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. 🏆 BEST DIRECT MATCH (Strong Visual Hierarchy) */}
      <div className="bg-white rounded-2xl border-2 border-finopt-600 shadow-lg overflow-hidden relative">
        <div className="bg-gradient-to-r from-finopt-800 via-finopt-700 to-finopt-800 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-amber-400/20 rounded-md border border-amber-400/40">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider uppercase">
                Best Direct Match
              </span>
              <span className="hidden sm:inline-block text-2xs text-finopt-200 ml-2 font-normal">
                (Closest fit to your requested horizon)
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-bold bg-white/15 px-3 py-1 rounded-full border border-white/20">
              Score: {best_match.score} / 100
            </span>
            <span className="text-2xs text-finopt-200">
              Tenure {best_match.tenure_fit_score}/30 · Yield {best_match.yield_score}/35 ·
              Liquidity {best_match.liquidity_fit_score}/20 · Goal {best_match.goal_alignment_score}/15
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          {/* Header & Rate */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-bold text-finopt-700 uppercase tracking-wider bg-finopt-50 px-2.5 py-0.5 rounded border border-finopt-100 inline-block mb-1">
                {best_match.institution}
              </span>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                {best_match.product_name}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {best_match.conditions}
              </p>
            </div>

            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3.5 sm:p-0 rounded-xl shrink-0 border sm:border-0 border-slate-100">
              <span className="text-xs text-slate-500 block font-medium">Interest Rate</span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {best_match.annual_interest_rate.toFixed(2)}%
                <span className="text-xs font-medium text-slate-500 ml-1">p.a.</span>
              </span>
              <span className="text-2xs text-slate-400 block mt-0.5">
                Compounded {best_match.compounding_frequency === 4 ? "Quarterly" : best_match.compounding_frequency === 12 ? "Monthly" : "Annually"}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-xs text-slate-500 block">Requested Tenure</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {best_match.tenure_months} Months
              </span>
              <span className="text-2xs text-slate-400">
                {Number((best_match.tenure_months / 12).toFixed(1))} Years Horizon
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-xs text-slate-500 block">Estimated Interest</span>
              <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                +₹{formatRupee(best_match.estimated_interest_earned)}
              </span>
              <span className="text-2xs text-slate-400">Total Net Gain</span>
            </div>

            <div className="p-3.5 bg-finopt-50/70 rounded-xl border border-finopt-200 col-span-2 sm:col-span-1">
              <span className="text-xs text-finopt-800 font-semibold block">Estimated Maturity</span>
              <span className="text-xl font-black text-finopt-900 mt-0.5 block">
                ₹{formatRupee(best_match.estimated_maturity_amount)}
              </span>
              <span className="text-2xs text-finopt-700">Principal + Compounded Returns</span>
            </div>
          </div>

          {/* Why It Was Selected */}
          <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200/80 mb-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-finopt-600" />
              Why this was selected
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {best_match.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-finopt-600 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust & Explainability Metadata Box */}
          <div className="p-3.5 bg-slate-100/70 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
              <div className="flex items-center gap-1.5 text-2xs text-slate-500">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span>Source: <strong className="text-slate-700">{best_match.data_source || "Illustrative demo data for hackathon prototype"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-2xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Last updated: <strong className="text-slate-700">{best_match.last_updated || "2026-09-01"}</strong></span>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-0.5">
              <Calculator className="w-3.5 h-3.5 text-finopt-600 shrink-0 mt-0.5" />
              <p className="text-2xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Calculation Explanation: </strong>
                {best_match.calculation_explanation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 💡 CLOSE-RANGE TENURE OPTIMIZATION (Strong Visual Focal Point) ⭐ */}
      {tenure_optimization && tenure_optimization.has_alternative && (
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-100/40 rounded-2xl border-2 border-amber-400 shadow-md p-6 sm:p-7 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              <Sparkles className="w-4 h-4 text-amber-700" />
              FINOPT Key Differentiator: Close-Range Tenure Optimization
            </div>
            <span className="text-2xs font-semibold text-amber-800 hidden sm:inline-block">
              Quantified Trade-off
            </span>
          </div>

          <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {tenure_optimization.direction === "longer"
              ? `Extend tenure by +${tenure_optimization.tenure_difference_months} months for higher yield`
              : `Shorten tenure by -${tenure_optimization.tenure_difference_months} months to preserve liquidity`}
          </h4>

          <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
            {tenure_optimization.rationale}
          </p>

          {/* Visual Side-by-Side Comparison */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Baseline Option */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
                  Baseline (Requested)
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {tenure_optimization.requested_tenure} Months
                </span>
              </div>
              <div className="mt-2">
                <span className="text-xs text-slate-500 block">Rate: {tenure_optimization.baseline_rate.toFixed(2)}% p.a.</span>
                <span className="text-xl font-black text-slate-900 block mt-0.5">
                  ₹{formatRupee(tenure_optimization.baseline_maturity)}
                </span>
                <span className="text-2xs text-slate-400">Baseline Maturity</span>
              </div>
            </div>

            {/* Optimized Alternative Option */}
            <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-400 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  Optimized Alternative
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-300 text-amber-950">
                  {tenure_optimization.alternative_tenure} Months
                </span>
              </div>
              <div className="mt-2">
                <span className="text-xs text-amber-900 font-semibold block truncate">
                  {tenure_optimization.alternative_institution} ({tenure_optimization.alternative_rate.toFixed(2)}% p.a.)
                </span>
                <span className="text-xl font-black text-amber-950 block mt-0.5">
                  ₹{formatRupee(tenure_optimization.alternative_maturity)}
                </span>
                <span className="text-2xs font-bold text-amber-800">
                  {tenure_optimization.direction === "longer" ? (
                    <span className="text-emerald-700">+₹{formatRupee(tenure_optimization.additional_estimated_interest)} higher maturity</span>
                  ) : (
                    <span>₹{formatRupee(Math.abs(tenure_optimization.additional_estimated_interest))} lower maturity</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quantified Trade-off Highlight */}
          <div className="mt-4 p-4 bg-white rounded-xl border border-amber-300 text-xs sm:text-sm text-slate-800 flex items-start gap-3 shadow-2xs">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block sm:inline">Trade-off Decision Clarity: </span>
              <span className="text-slate-700 font-medium">{tenure_optimization.tradeoff}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. 📋 OTHER SUITABLE OPTIONS (With Explainability for Every Option) */}
      {alternatives.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Other Suitable Deposit Options
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Eligible alternatives ranked deterministically by your deposit criteria. Click any option for full transparency details.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {alternatives.length} options
            </span>
          </div>

          <div className="space-y-3">
            {alternatives.map((alt) => {
              const isExpanded = expandedOptionId === alt.product_id + alt.tenure_months;
              return (
                <div
                  key={alt.product_id + alt.tenure_months}
                  className="rounded-xl border border-slate-200 hover:border-slate-300 transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(alt.product_id + alt.tenure_months)}
                    className="w-full text-left p-4 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {alt.institution}
                        </span>
                        <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-slate-200 text-slate-700 shrink-0">
                          {alt.tenure_months}m
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block truncate mt-0.5">
                        {alt.product_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {alt.annual_interest_rate.toFixed(2)}% p.a.
                        </span>
                        <span className="text-xs font-extrabold text-emerald-700 block">
                          ₹{formatRupee(alt.estimated_maturity_amount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-2xs border border-slate-200">
                          {alt.score} pts
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expandable Transparency Details */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-100 space-y-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">
                          Why this was considered:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {alt.reasons.map((r, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-slate-600">
                              <span className="text-finopt-600 font-bold">•</span>
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-2xs text-slate-500 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Source: <strong className="text-slate-700">{alt.data_source || "Illustrative demo data for hackathon prototype"}</strong></span>
                          <span>Last updated: <strong className="text-slate-700">{alt.last_updated || "2026-09-01"}</strong></span>
                        </div>
                        <p className="pt-1 border-t border-slate-200/60 text-slate-600">
                          <strong className="text-slate-700">Calculation Explanation: </strong>
                          {alt.calculation_explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. PROMINENT PROTOTYPE DISCLAIMER */}
      <div className="p-4 sm:p-5 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Financial Safety &amp; Prototype Notice</span>
        </div>
        <p className="leading-relaxed">
          {disclaimer}
        </p>
        <p className="text-2xs text-amber-800 leading-relaxed">
          All financial institutions, products, and interest rates presented are illustrative demo data created solely for this hackathon decision-support prototype. Maturity figures are mathematical estimates and should not be construed as real-world banking offers or professional financial advice.
        </p>
      </div>
    </div>
  );
};
