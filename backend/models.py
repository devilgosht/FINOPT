from typing import List, Optional
from pydantic import BaseModel, Field


# --- Entity Models (Ready for Future Database / PostgreSQL mapping) ---

class ProductTenure(BaseModel):
    id: str
    product_id: str
    tenure_months: int
    annual_interest_rate: float  # Percentage (e.g. 7.25 for 7.25%)
    compounding_frequency: int = 4  # 1=Annual, 2=Semi-annual, 4=Quarterly, 12=Monthly


class Product(BaseModel):
    id: str
    institution: str
    product_name: str
    category: str = "Fixed Deposit"
    minimum_amount: float
    maximum_amount: float
    liquidity_level: str  # "high", "balanced", "low"
    conditions: str
    source: str = "Illustrative demo data for hackathon prototype"
    last_updated: str = "2026-09-01"
    tenures: List[ProductTenure] = Field(default_factory=list)


# --- Calculation Models ---

class CalculationResult(BaseModel):
    principal: float
    annual_interest_rate: float
    tenure_months: int
    compounding_frequency: int
    estimated_maturity_amount: float
    estimated_interest_earned: float


# --- Recommendation & Optimization Models ---

class RecommendationItem(BaseModel):
    product_id: str
    product_name: str
    institution: str
    tenure_months: int
    annual_interest_rate: float
    compounding_frequency: int
    estimated_maturity_amount: float
    estimated_interest_earned: float
    score: float

    tenure_fit_score: float = 0.0
    yield_score: float = 0.0
    liquidity_fit_score: float = 0.0
    goal_alignment_score: float = 0.0

    reasons: List[str]
    liquidity_level: str
    conditions: str
    is_direct_match: bool = False
    data_source: str = "Illustrative demo data for hackathon prototype"
    last_updated: str = "2026-09-01"
    calculation_explanation: str = ""


class TenureOptimization(BaseModel):
    has_alternative: bool
    direction: str  # "longer", "shorter", "none"
    requested_tenure: int
    alternative_tenure: int
    tenure_difference_months: int
    baseline_maturity: float
    alternative_maturity: float
    additional_estimated_interest: float
    baseline_rate: float
    alternative_rate: float
    alternative_product_name: str
    alternative_institution: str
    tradeoff: str
    rationale: str


# --- Request & Response Models ---

class RecommendRequest(BaseModel):
    amount: float
    target_months: int
    goal: str  # "safe_deposit", "safe", "better_return", "need_liquidity"
    liquidity_preference: str  # "high", "balanced", "can_lock_longer"


class RecommendResponse(BaseModel):
    best_match: Optional[RecommendationItem] = None
    alternatives: List[RecommendationItem] = Field(default_factory=list)
    tenure_optimization: Optional[TenureOptimization] = None
    explanation: List[str] = Field(default_factory=list)
    disclaimer: str = (
        "FINOPT is a prototype for financial decision support. Product data shown is "
        "illustrative demo data for a hackathon prototype. Calculations are estimates "
        "and do not constitute financial advice."
    )
