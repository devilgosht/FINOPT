"""
RANKING ENGINE FOR FINOPT

Provides a 100% deterministic, transparent scoring mechanism:
1. Tenure Fit (0 - 30 pts): Rewards exact or very close tenure matches.
2. Yield / Return Competitiveness (0 - 35 pts): Scores annualized rate and estimated maturity.
3. Liquidity Fit (0 - 20 pts): Evaluates user liquidity preference against product terms.
4. Goal Alignment (0 - 15 pts): Evaluates alignment with 'safe_deposit', 'better_return', or 'need_liquidity'.

Generates structured, human-readable explanations for every recommendation.
"""

from typing import List, Tuple
from models import Product, ProductTenure, RecommendationItem
from calculator import calculate_compound_interest


def score_and_explain_option(
    product: Product,
    tenure: ProductTenure,
    amount: float,
    target_months: int,
    goal: str,
    liquidity_preference: str,
) -> RecommendationItem:
    """Score an eligible (product, tenure) option and generate plain-language reasons."""
    calc = calculate_compound_interest(
        principal=amount,
        annual_interest_rate=tenure.annual_interest_rate,
        tenure_months=tenure.tenure_months,
        compounding_frequency=tenure.compounding_frequency,
    )

    reasons: List[str] = []

    # 1. Tenure Fit (Max 30)
    month_diff = abs(tenure.tenure_months - target_months)
    is_direct_match = (month_diff == 0)
    if is_direct_match:
        tenure_score = 30.0
        reasons.append(f"Matches your exact requested {target_months}-month horizon.")
    else:
        tenure_score = max(5.0, 30.0 - (month_diff * 4.0))
        reasons.append(
            f"Close-range {tenure.tenure_months}-month tenure ({'+' if tenure.tenure_months > target_months else ''}{tenure.tenure_months - target_months}m from your target)."
        )

    # 2. Yield Competitiveness (Max 35)
    # 8.5% is treated as a high benchmark for retail FDs
    rate_score = min(35.0, (tenure.annual_interest_rate / 8.5) * 35.0)
    if tenure.annual_interest_rate >= 7.5:
        reasons.append(
            f"High-yield rate of {tenure.annual_interest_rate:.2f}% p.a. generating ₹{calc.estimated_interest_earned:,.0f} estimated interest."
        )
    else:
        reasons.append(
            f"Competitive return rate of {tenure.annual_interest_rate:.2f}% p.a. with {tenure.compounding_frequency}x annual compounding."
        )

    # 3. Liquidity Fit (Max 20)
    liquidity_score = 10.0
    norm_pref = liquidity_preference.lower()
    prod_liq = product.liquidity_level.lower()

    if norm_pref in ["high", "need_liquidity"]:
        if prod_liq == "high":
            liquidity_score = 20.0
            reasons.append("High liquidity with minimal premature withdrawal friction.")
        elif prod_liq == "balanced":
            liquidity_score = 12.0
            reasons.append("Standard liquidity with loan/premature withdrawal facility.")
        else:
            liquidity_score = 4.0
    elif norm_pref == "can_lock_longer":
        if prod_liq == "low":
            liquidity_score = 20.0
            reasons.append("Rewards disciplined lock-in with optimized tenure rates.")
        elif prod_liq == "balanced":
            liquidity_score = 17.0
            reasons.append("Balanced term structure matches extended holding preference.")
        else:
            liquidity_score = 12.0
    else:  # balanced
        if prod_liq == "balanced":
            liquidity_score = 20.0
            reasons.append("Fits your balanced liquidity and lock-in requirements.")
        elif prod_liq == "high":
            liquidity_score = 16.0
            reasons.append("Extra flexibility to access funds if your timeline changes.")
        else:
            liquidity_score = 10.0

    # 4. Goal Alignment (Max 15)
    goal_score = 10.0
    norm_goal = goal.lower()
    if norm_goal in ["safe_deposit", "safe"]:
        if prod_liq in ["balanced", "high"]:
            goal_score = 15.0
            reasons.append("Prioritizes capital preservation and predictable maturity.")
        else:
            goal_score = 9.0
    elif norm_goal == "better_return":
        if tenure.annual_interest_rate >= 7.3:
            goal_score = 15.0
            reasons.append("Directly advances your goal of maximizing overall return.")
        else:
            goal_score = 8.0
    elif norm_goal == "need_liquidity":
        if prod_liq == "high":
            goal_score = 15.0
            reasons.append("Ensures ready access to capital in line with your liquidity goal.")
        else:
            goal_score = 6.0

    # Total Score (Max 100)
    total_score = round(tenure_score + rate_score + liquidity_score + goal_score, 1)

    # Deposit eligibility confirmation reason
    reasons.append(f"Fully eligible for your ₹{amount:,.0f} deposit amount.")

    comp_name = (
        "Quarterly" if tenure.compounding_frequency == 4
        else ("Monthly" if tenure.compounding_frequency == 12
              else ("Semi-annually" if tenure.compounding_frequency == 2 else "Annually"))
    )
    calc_explanation = (
        f"Calculated via compound formula A = P × (1 + r/n)^(n×t): Principal P = ₹{amount:,.0f}, "
        f"Rate r = {tenure.annual_interest_rate:.2f}%, Compounding n = {tenure.compounding_frequency} ({comp_name}), "
        f"Tenure t = {tenure.tenure_months / 12:.2f} yrs ({tenure.tenure_months}m) → Est. Maturity ₹{calc.estimated_maturity_amount:,.0f}."
    )

    return RecommendationItem(
        product_id=product.id,
        product_name=product.product_name,
        institution=product.institution,
        tenure_months=tenure.tenure_months,
        annual_interest_rate=tenure.annual_interest_rate,
        compounding_frequency=tenure.compounding_frequency,
        estimated_maturity_amount=calc.estimated_maturity_amount,
        estimated_interest_earned=calc.estimated_interest_earned,
        score=total_score,

        tenure_fit_score=tenure_score,
        yield_score=rate_score,
        liquidity_fit_score=liquidity_score,
        goal_alignment_score=goal_score,

        reasons=reasons,
        liquidity_level=product.liquidity_level,
        conditions=product.conditions,
        is_direct_match=is_direct_match,
        data_source=product.source,
        last_updated=product.last_updated,
        calculation_explanation=calc_explanation,
    )


def rank_recommendations(
    eligible_pairs: List[Tuple[Product, ProductTenure]],
    amount: float,
    target_months: int,
    goal: str,
    liquidity_preference: str,
) -> List[RecommendationItem]:
    """Rank all eligible options deterministically using multi-factor explainable scoring."""
    scored_items: List[RecommendationItem] = []

    for product, tenure in eligible_pairs:
        item = score_and_explain_option(
            product=product,
            tenure=tenure,
            amount=amount,
            target_months=target_months,
            goal=goal,
            liquidity_preference=liquidity_preference,
        )
        scored_items.append(item)

    # Sort primarily by score descending, secondarily by estimated interest earned descending
    scored_items.sort(
        key=lambda x: (x.score, x.estimated_interest_earned),
        reverse=True,
    )

    return scored_items
