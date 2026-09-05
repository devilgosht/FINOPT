from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    Product,
    RecommendRequest,
    RecommendResponse,
    RecommendationItem,
)
from data import get_all_products
from matcher import find_eligible_tenure_pairs
from ranker import rank_recommendations
from optimizer import find_tenure_optimization

app = FastAPI(
    title="FINOPT Recommendation API",
    description="Deterministic decision-support engine for Fixed/Term Deposits",
    version="0.2.0",
)

# Enable CORS for Next.js frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    """Health check endpoint to verify backend status."""
    return {"status": "ok", "service": "FINOPT API"}


@app.get("/api/products", response_model=List[Product])
def list_products():
    """Return all illustrative demo FD products with available tenures and conditions."""
    return get_all_products()


@app.post("/api/recommend", response_model=RecommendResponse)
def get_recommendations(req: RecommendRequest):
    """
    Deterministic recommendation engine:
    1. Validates user requirements.
    2. Filters eligible products by deposit amount and close-range tenure window.
    3. Ranks options using transparent multi-factor scoring.
    4. Identifies Best Direct Match and Best Close-Range Alternative with quantified trade-offs.
    """
    # Validation
    if req.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Investment amount must be greater than 0.",
        )

    if req.target_months < 1:
        raise HTTPException(
            status_code=400,
            detail="Time horizon must be at least 1 month.",
        )

    all_products = get_all_products()

    # Step 1: Matching
    eligible_pairs = find_eligible_tenure_pairs(
        products=all_products,
        amount=req.amount,
        target_months=req.target_months,
        tenure_window=6,
    )

    if not eligible_pairs:
        return RecommendResponse(
            best_match=None,
            alternatives=[],
            tenure_optimization=None,
            explanation=[
                f"No products found matching deposit amount ₹{req.amount:,.0f} "
                f"near {req.target_months} months. Try adjusting your amount or tenure."
            ],
        )

    # Step 2: Transparent Ranking
    ranked_options = rank_recommendations(
        eligible_pairs=eligible_pairs,
        amount=req.amount,
        target_months=req.target_months,
        goal=req.goal,
        liquidity_preference=req.liquidity_preference,
    )

    # Separate exact / direct match from alternatives
    direct_matches = [opt for opt in ranked_options if opt.is_direct_match]
    best_direct = direct_matches[0] if direct_matches else ranked_options[0]

    # Other suitable options (excluding the best direct match from top position)
    other_alternatives = [
        opt for opt in ranked_options
        if not (opt.product_id == best_direct.product_id and opt.tenure_months == best_direct.tenure_months)
    ]

    # Step 3: Close-Range Tenure Optimization
    tenure_opt = find_tenure_optimization(
        best_direct_match=best_direct,
        all_options=ranked_options,
        target_months=req.target_months,
        goal=req.goal,
        liquidity_preference=req.liquidity_preference,
    )

    # Generate overarching explanations
    overall_explanations = [
        f"Evaluated {len(ranked_options)} eligible deposit options across {len(set(p.product_id for p in ranked_options))} institutions.",
        f"Prioritized for '{req.goal.replace('_', ' ')}' with '{req.liquidity_preference.replace('_', ' ')}' liquidity preference.",
    ]

    if best_direct.is_direct_match:
        overall_explanations.append(
            f"Top direct match found at exactly {req.target_months} months with {best_direct.institution}."
        )
    else:
        overall_explanations.append(
            f"Nearest direct tenure available is {best_direct.tenure_months} months with {best_direct.institution}."
        )

    return RecommendResponse(
        best_match=best_direct,
        alternatives=other_alternatives[:5],  # top 5 alternatives
        tenure_optimization=tenure_opt,
        explanation=overall_explanations,
    )
