"use client";

import React, { useState } from "react";
import {
  Shield,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2,
  Zap,
} from "lucide-react";
import {
  UserRequirements,
  GoalType,
  LiquidityPreference,
  FormErrors,
  RecommendResponse,
} from "@/types";
import { RecommendationResults } from "./RecommendationResults";

const AMOUNT_PRESETS = [50000, 100000, 200000, 500000];
const TENURE_PRESETS = [6, 12, 18, 24, 36];

const GOAL_OPTIONS: { id: GoalType; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: "safe_deposit",
    title: "Safe deposit",
    desc: "Capital protection with assured, stable fixed returns",
    icon: <Shield className="w-5 h-5 text-emerald-600" />,
  },
  {
    id: "better_return",
    title: "Better return",
    desc: "Maximize annualized yield across reliable institutions",
    icon: <TrendingUp className="w-5 h-5 text-finopt-600" />,
  },
  {
    id: "need_liquidity",
    title: "Need liquidity",
    desc: "Shorter commitment or easier access if emergencies arise",
    icon: <Clock className="w-5 h-5 text-amber-600" />,
  },
];

const LIQUIDITY_OPTIONS: { id: LiquidityPreference; title: string; desc: string }[] = [
  {
    id: "high",
    title: "High liquidity",
    desc: "Prefer flexible exit, minimal lock-in friction",
  },
  {
    id: "balanced",
    title: "Balanced",
    desc: "Standard term deposit structure is comfortable",
  },
  {
    id: "can_lock_longer",
    title: "Can lock money longer",
    desc: "Willing to stretch tenure if returns are noticeably higher",
  },
];

export const RequirementForm: React.FC = () => {
  const [amount, setAmount] = useState<number>(100000);
  const [amountInput, setAmountInput] = useState<string>("100000");
  const [timeHorizon, setTimeHorizon] = useState<number>(12);
  const [goal, setGoal] = useState<GoalType>("safe_deposit");
  const [liquidity, setLiquidity] = useState<LiquidityPreference>("balanced");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [recommendationData, setRecommendationData] = useState<RecommendResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const formatRupee = (val: number): string => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Demo Scenario Auto-filler (Scenario: ₹1,00,000 / 12 months / Better return / Balanced)
  const handleLoadDemoScenario = () => {
    setAmount(100000);
    setAmountInput("100000");
    setTimeHorizon(12);
    setGoal("better_return");
    setLiquidity("balanced");
    setErrors({});
    setApiError(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    setAmountInput(rawVal);
    const num = parseInt(rawVal, 10);
    if (!isNaN(num)) {
      setAmount(num);
      if (errors.amount) {
        setErrors((prev) => ({ ...prev, amount: undefined }));
      }
    } else {
      setAmount(0);
    }
  };

  const handleAmountPreset = (val: number) => {
    setAmount(val);
    setAmountInput(val.toString());
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const handleTenureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setTimeHorizon(val);
      if (errors.timeHorizonMonths) {
        setErrors((prev) => ({ ...prev, timeHorizonMonths: undefined }));
      }
    } else {
      setTimeHorizon(0);
    }
  };

  const handleTenurePreset = (val: number) => {
    setTimeHorizon(val);
    if (errors.timeHorizonMonths) {
      setErrors((prev) => ({ ...prev, timeHorizonMonths: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!amount || amount < 1000) {
      newErrors.amount = "Please enter an amount of at least ₹1,000";
    } else if (amount > 100000000) {
      newErrors.amount = "Maximum allowed prototype amount is ₹10 Crore";
    }

    if (!timeHorizon || timeHorizon < 1) {
      newErrors.timeHorizonMonths = "Tenure must be at least 1 month";
    } else if (timeHorizon > 120) {
      newErrors.timeHorizonMonths = "Tenure cannot exceed 120 months (10 years)";
    }

    if (!goal) {
      newErrors.goal = "Please select a financial goal";
    }

    if (!liquidity) {
      newErrors.liquidityPreference = "Please select a liquidity preference";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setLoadingStage("Matching eligible products & tenures...");
    setApiError(null);

    const payload = {
      amount,
      target_months: timeHorizon,
      goal,
      liquidity_preference: liquidity,
    };

    try {
      // Brief simulated progress step for clear user perception of the calculation engine
      setTimeout(() => {
        setLoadingStage("Calculating compound maturity & ranking trade-offs...");
      }, 200);

      let res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok && res.status !== 400) {
        try {
          res = await fetch("http://127.0.0.1:8000/api/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch {
          // Fall through
        }
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Failed to connect to recommendation service." }));
        throw new Error(errorData.detail || "Error calculating recommendations.");
      }

      const result: RecommendResponse = await res.json();
      setRecommendationData(result);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById("recommendation-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err: any) {
      setApiError(
        err.message ||
          "Could not contact FINOPT backend. Please ensure the FastAPI server is running on port 8000."
      );
    } finally {
      setIsLoading(false);
      setLoadingStage("");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Form Header with "Try Demo" scenario button */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Tell us what you need
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Specify your investment requirements. We evaluate direct matches and tenure trade-offs.
            </p>
          </div>

          {/* Try Demo Scenario Button */}
          <button
            type="button"
            onClick={handleLoadDemoScenario}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
            title="Auto-fill: ₹1 Lakh, 12 Months, Better Return, Balanced Liquidity"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Try Demo Scenario</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-7">
          {/* 1. Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="amount-input"
                className="text-sm font-semibold text-slate-900"
              >
                1. Investment Amount (₹)
              </label>
              {amount > 0 && (
                <span className="text-xs font-semibold text-finopt-700 bg-finopt-50 px-2.5 py-0.5 rounded-full border border-finopt-100">
                  ₹{formatRupee(amount)}
                </span>
              )}
            </div>

            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold text-base">
                ₹
              </div>
              <input
                id="amount-input"
                type="text"
                inputMode="numeric"
                value={amountInput}
                onChange={handleAmountChange}
                placeholder="100000"
                className={`block w-full pl-9 pr-4 py-2.5 text-base rounded-lg border ${
                  errors.amount
                    ? "border-red-400 text-red-900 focus:border-red-500"
                    : "border-slate-300 text-slate-900 focus:border-finopt-500"
                } focus:ring-1 focus:ring-finopt-500 transition-colors font-medium`}
              />
            </div>

            {errors.amount && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.amount}
              </p>
            )}

            {/* Quick Amount Chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Quick set:</span>
              {AMOUNT_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleAmountPreset(preset)}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-all ${
                    amount === preset
                      ? "bg-finopt-50 border-finopt-500 text-finopt-700 font-semibold shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  ₹{formatRupee(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Time Horizon */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="tenure-input"
                className="text-sm font-semibold text-slate-900"
              >
                2. Desired Time Horizon (Months)
              </label>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {timeHorizon} {timeHorizon === 1 ? "month" : "months"} ({Number((timeHorizon / 12).toFixed(1))} yrs)
              </span>
            </div>

            <div className="relative rounded-lg shadow-sm">
              <input
                id="tenure-input"
                type="number"
                min="1"
                max="120"
                value={timeHorizon || ""}
                onChange={handleTenureChange}
                placeholder="12"
                className={`block w-full px-4 py-2.5 text-base rounded-lg border ${
                  errors.timeHorizonMonths
                    ? "border-red-400 text-red-900 focus:border-red-500"
                    : "border-slate-300 text-slate-900 focus:border-finopt-500"
                } focus:ring-1 focus:ring-finopt-500 transition-colors font-medium`}
              />
            </div>

            {errors.timeHorizonMonths && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.timeHorizonMonths}
              </p>
            )}

            {/* Quick Tenure Chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Preset horizons:</span>
              {TENURE_PRESETS.map((months) => (
                <button
                  type="button"
                  key={months}
                  onClick={() => handleTenurePreset(months)}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-all ${
                    timeHorizon === months
                      ? "bg-finopt-50 border-finopt-500 text-finopt-700 font-semibold shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {months}m {months >= 12 ? `(${months / 12}y)` : ""}
                </button>
              ))}
            </div>

            <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-finopt-600 shrink-0" />
              <span>
                <strong>FINOPT Feature:</strong> Evaluates adjacent tenures (e.g. {Math.max(1, timeHorizon - 3)}m, {timeHorizon + 3}m) to quantify if a small adjustment unlocks higher maturity.
              </span>
            </div>
          </div>

          {/* 3. Goal */}
          <div>
            <label className="text-sm font-semibold text-slate-900 block mb-2">
              3. Primary Financial Goal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup">
              {GOAL_OPTIONS.map((opt) => {
                const isSelected = goal === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => {
                      setGoal(opt.id);
                      if (errors.goal) setErrors((prev) => ({ ...prev, goal: undefined }));
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-finopt-600 bg-finopt-50/50 ring-1 ring-finopt-600 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="p-1.5 bg-white rounded-md border border-slate-100 shadow-2xs">
                        {opt.icon}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-finopt-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {opt.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.goal && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.goal}
              </p>
            )}
          </div>

          {/* 4. Liquidity Preference */}
          <div>
            <label className="text-sm font-semibold text-slate-900 block mb-2">
              4. Liquidity Preference
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup">
              {LIQUIDITY_OPTIONS.map((opt) => {
                const isSelected = liquidity === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => {
                      setLiquidity(opt.id);
                      if (errors.liquidityPreference) {
                        setErrors((prev) => ({ ...prev, liquidityPreference: undefined }));
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-finopt-600 bg-finopt-50/50 ring-1 ring-finopt-600 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-finopt-600 bg-finopt-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {opt.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.liquidityPreference && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.liquidityPreference}
              </p>
            )}
          </div>

          {/* Primary CTA with Clear Loading State */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-finopt-700 hover:bg-finopt-800 disabled:bg-finopt-400 text-white font-semibold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-finopt-100 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2.5">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{loadingStage || "Calculating best options..."}</span>
                </div>
              ) : (
                <>
                  <span>Find My Best Options</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {apiError && (
          <div className="p-4 bg-red-50 border-t border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Connection Notice:</span>
              <span>{apiError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Render Recommendation Results */}
      {recommendationData && (
        <RecommendationResults
          data={recommendationData}
          depositAmount={amount}
        />
      )}
    </div>
  );
};
