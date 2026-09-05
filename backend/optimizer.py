"""
CLOSE-RANGE TENURE OPTIMIZATION ENGINE FOR FINOPT

FINOPT Core Differentiator:
Evaluates tenures in the vicinity of the user's requested horizon (e.g., +/- 3 to 6 months)
to identify quantified trade-offs:
- Longer tenure optimization: Quantifies incremental gain for locking capital slightly longer.
- Shorter tenure optimization: Quantifies liquidity preservation for exiting earlier with minimal return sacrifice.
"""

from typing import List, Optional
from models import RecommendationItem, TenureOptimization


def find_tenure_optimization(
    best_direct_match: Optional[RecommendationItem],
    all_options: List[RecommendationItem],
    target_months: int,
    goal: str,
    liquidity_preference: str,
) -> Optional[TenureOptimization]:
    """
    Identifies the best close-range tenure alternative and generates a quantified trade-off comparison.

    :param best_direct_match: The top option at or closest to the target tenure
    :param all_options: List of all eligible, ranked recommendation items
    :param target_months: Requested tenure in months
    :param goal: User's goal (e.g., 'need_liquidity', 'better_return', 'safe_deposit')
    :param liquidity_preference: User's preference (e.g., 'high', 'balanced', 'can_lock_longer')
    :return: TenureOptimization object or None if no meaningful alternative exists
    """
    if not best_direct_match or not all_options:
        return None

    norm_goal = goal.lower()
    norm_liq = liquidity_preference.lower()

    # Determine whether user leans toward liquidity preservation or yield optimization
    prefers_liquidity = (norm_goal == "need_liquidity" or norm_liq == "high")

    # Candidates: options with tenure different from requested target_months
    longer_candidates = [
        item for item in all_options
        if item.tenure_months > target_months and (item.tenure_months - target_months) <= 6
    ]

    shorter_candidates = [
        item for item in all_options
        if item.tenure_months < target_months and (target_months - item.tenure_months) <= 6
    ]

    # --- Scenario 1: User prioritizes liquidity -> Look for shorter alternative ---
    if prefers_liquidity and shorter_candidates:
        # Pick the best shorter candidate (highest score among shorter options)
        shorter_candidates.sort(key=lambda x: (x.score, x.annual_interest_rate), reverse=True)
        best_shorter = shorter_candidates[0]

        diff_months = target_months - best_shorter.tenure_months
        diff_interest = best_direct_match.estimated_maturity_amount - best_shorter.estimated_maturity_amount

        return TenureOptimization(
            has_alternative=True,
            direction="shorter",
            requested_tenure=target_months,
            alternative_tenure=best_shorter.tenure_months,
            tenure_difference_months=diff_months,
            baseline_maturity=best_direct_match.estimated_maturity_amount,
            alternative_maturity=best_shorter.estimated_maturity_amount,
            additional_estimated_interest=round(-diff_interest, 2),
            baseline_rate=best_direct_match.annual_interest_rate,
            alternative_rate=best_shorter.annual_interest_rate,
            alternative_product_name=best_shorter.product_name,
            alternative_institution=best_shorter.institution,
            tradeoff=(
                f"Shorten tenure by {diff_months} months (to {best_shorter.tenure_months}m) "
                f"to regain full liquidity earlier. Estimated yield difference is only "
                f"₹{diff_interest:,.0f} less than your requested {target_months}-month option."
            ),
            rationale=(
                f"Liquidity preservation: You regain access to your capital {diff_months} months sooner "
                f"while still securing a competitive {best_shorter.annual_interest_rate:.2f}% p.a. rate."
            ),
        )

    # --- Scenario 2: Standard or Return-driven -> Look for longer tenure optimization ---
    if longer_candidates:
        # Find candidate with highest additional maturity or highest rate step-up
        # Filter to candidates that offer a rate step-up or significant interest gain
        meaningful_longer = [
            c for c in longer_candidates
            if c.estimated_maturity_amount > best_direct_match.estimated_maturity_amount
        ]

        if meaningful_longer:
            # Sort by total score and extra interest
            meaningful_longer.sort(
                key=lambda x: (
                    x.score,
                    x.estimated_maturity_amount - best_direct_match.estimated_maturity_amount,
                ),
                reverse=True,
            )
            best_longer = meaningful_longer[0]

            extra_months = best_longer.tenure_months - target_months
            extra_interest = round(
                best_longer.estimated_maturity_amount - best_direct_match.estimated_maturity_amount,
                2,
            )

            return TenureOptimization(
                has_alternative=True,
                direction="longer",
                requested_tenure=target_months,
                alternative_tenure=best_longer.tenure_months,
                tenure_difference_months=extra_months,
                baseline_maturity=best_direct_match.estimated_maturity_amount,
                alternative_maturity=best_longer.estimated_maturity_amount,
                additional_estimated_interest=extra_interest,
                baseline_rate=best_direct_match.annual_interest_rate,
                alternative_rate=best_longer.annual_interest_rate,
                alternative_product_name=best_longer.product_name,
                alternative_institution=best_longer.institution,
                tradeoff=(
                    f"Keep money locked for {extra_months} additional months (total {best_longer.tenure_months}m) "
                    f"to earn an estimated +₹{extra_interest:,.0f} extra at maturity."
                ),
                rationale=(
                    f"Tenure optimization step-up: The rate steps up from {best_direct_match.annual_interest_rate:.2f}% "
                    f"to {best_longer.annual_interest_rate:.2f}% p.a., generating higher compound interest."
                ),
            )

    # --- Fallback to shorter if longer wasn't found ---
    if shorter_candidates:
        shorter_candidates.sort(key=lambda x: (x.score, x.annual_interest_rate), reverse=True)
        best_shorter = shorter_candidates[0]
        diff_months = target_months - best_shorter.tenure_months
        diff_interest = best_direct_match.estimated_maturity_amount - best_shorter.estimated_maturity_amount

        return TenureOptimization(
            has_alternative=True,
            direction="shorter",
            requested_tenure=target_months,
            alternative_tenure=best_shorter.tenure_months,
            tenure_difference_months=diff_months,
            baseline_maturity=best_direct_match.estimated_maturity_amount,
            alternative_maturity=best_shorter.estimated_maturity_amount,
            additional_estimated_interest=round(-diff_interest, 2),
            baseline_rate=best_direct_match.annual_interest_rate,
            alternative_rate=best_shorter.annual_interest_rate,
            alternative_product_name=best_shorter.product_name,
            alternative_institution=best_shorter.institution,
            tradeoff=(
                f"Shorten tenure by {diff_months} months to preserve liquidity. "
                f"Gives access to your funds {diff_months} months earlier."
            ),
            rationale="Preserves capital liquidity without long-term commitment.",
        )

    return None
