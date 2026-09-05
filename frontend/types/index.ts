export type GoalType = "safe_deposit" | "better_return" | "need_liquidity";

export type LiquidityPreference = "high" | "balanced" | "can_lock_longer";

export interface UserRequirements {
  amount: number;
  timeHorizonMonths: number;
  goal: GoalType;
  liquidityPreference: LiquidityPreference;
}

export interface FormErrors {
  amount?: string;
  timeHorizonMonths?: string;
  goal?: string;
  liquidityPreference?: string;
}

export interface RecommendationItem {
  product_id: string;
  product_name: string;
  institution: string;
  tenure_months: number;
  annual_interest_rate: number;
  compounding_frequency: number;
  estimated_maturity_amount: number;
  estimated_interest_earned: number;
  score: number;
  reasons: string[];
  liquidity_level: string;
  conditions: string;
  is_direct_match: boolean;
  data_source?: string;
  last_updated?: string;
  calculation_explanation?: string;
}

export interface TenureOptimization {
  has_alternative: boolean;
  direction: "longer" | "shorter" | "none";
  requested_tenure: number;
  alternative_tenure: number;
  tenure_difference_months: number;
  baseline_maturity: number;
  alternative_maturity: number;
  additional_estimated_interest: number;
  baseline_rate: number;
  alternative_rate: number;
  alternative_product_name: string;
  alternative_institution: string;
  tradeoff: string;
  rationale: string;
}

export interface RecommendResponse {
  best_match: RecommendationItem | null;
  alternatives: RecommendationItem[];
  tenure_optimization: TenureOptimization | null;
  explanation: string[];
  disclaimer: string;
}
