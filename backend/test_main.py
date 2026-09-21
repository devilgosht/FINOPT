import pytest

from fastapi.testclient import TestClient

from main import app
from calculator import calculate_compound_interest
from data import get_all_products
from matcher import find_eligible_tenure_pairs
from ranker import rank_recommendations
from optimizer import find_tenure_optimization


client = TestClient(app)


# --- 1. Health & Product Catalog Tests ---

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "FINOPT API"}


def test_get_products_list():
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 8  # 10 demo products
    first_prod = data[0]
    assert "product_name" in first_prod
    assert "institution" in first_prod
    assert "tenures" in first_prod
    assert len(first_prod["tenures"]) > 0


# --- 2. Calculation Accuracy Tests ---

def test_calculation_quarterly_compounding():
    # 1,00,000 at 7.0% p.a. for 12 months (1 year), compounded quarterly (n=4)
    # A = 100000 * (1 + 0.07/4)**(4 * 1) = 100000 * (1.0175)**4 = 107185.90
    calc = calculate_compound_interest(
        principal=100000.0,
        annual_interest_rate=7.0,
        tenure_months=12,
        compounding_frequency=4,
    )
    assert calc.principal == 100000.0
    assert calc.estimated_maturity_amount == 107185.90
    assert calc.estimated_interest_earned == 7185.90


def test_calculation_different_rates_and_tenures():
    # 50,000 at 8.0% p.a. for 6 months, compounded quarterly
    # A = 50000 * (1 + 0.08/4)**2 = 52020.0
    calc = calculate_compound_interest(
        principal=50000.0,
        annual_interest_rate=8.0,
        tenure_months=6,
        compounding_frequency=4,
    )
    assert calc.estimated_maturity_amount == 52020.0
    assert calc.estimated_interest_earned == 2020.0


def test_calculation_monthly_compounding():
    # 10,000 at 6.0% p.a. for 12 months, compounded monthly
    calc = calculate_compound_interest(
        principal=10000.0,
        annual_interest_rate=6.0,
        tenure_months=12,
        compounding_frequency=12,
    )
    assert calc.estimated_maturity_amount == 10616.78


def test_calculation_invalid_inputs():
    with pytest.raises(ValueError, match="Principal amount must be greater than 0"):
        calculate_compound_interest(-100, 7.0, 12, 4)

    with pytest.raises(ValueError, match="Annual interest rate cannot be negative"):
        calculate_compound_interest(1000, -5.0, 12, 4)

    with pytest.raises(ValueError, match="Tenure must be at least 1 month"):
        calculate_compound_interest(1000, 7.0, 0, 4)

    with pytest.raises(ValueError, match="Compounding frequency must be at least 1"):
        calculate_compound_interest(1000, 7.0, 12, 0)


# --- 3. Product Eligibility & Matching Tests ---

def test_product_eligibility_by_amount():
    all_prods = get_all_products()

    # Zenith requires min 1,00,000. If user enters 5,000, Zenith should NOT be matched.
    pairs_low = find_eligible_tenure_pairs(
        all_prods,
        amount=5000,
        target_months=12,
    )
    zenith_matched = any(
        p.institution.startswith("Zenith") for p, _ in pairs_low
    )
    assert not zenith_matched

    # When amount is 1,00,000, Zenith SHOULD be matched.
    pairs_high = find_eligible_tenure_pairs(
        all_prods,
        amount=100000,
        target_months=12,
    )
    zenith_matched_high = any(
        p.institution.startswith("Zenith") for p, _ in pairs_high
    )
    assert zenith_matched_high


def test_product_eligibility_by_tenure_window():
    all_prods = get_all_products()

    # When target is 12 months with window=6, tenures between 6m and 18m should match
    pairs = find_eligible_tenure_pairs(
        all_prods,
        amount=50000,
        target_months=12,
        tenure_window=6,
    )

    for _, tenure in pairs:
        assert 6 <= tenure.tenure_months <= 18


# --- 4. Ranking & Determinism Tests ---

def test_ranking_deterministic_and_structured_reasons():
    all_prods = get_all_products()

    pairs = find_eligible_tenure_pairs(
        all_prods,
        amount=100000,
        target_months=12,
    )

    ranked = rank_recommendations(
        eligible_pairs=pairs,
        amount=100000,
        target_months=12,
        goal="better_return",
        liquidity_preference="balanced",
    )

    assert len(ranked) > 0

    top = ranked[0]

    assert top.score > 0
    assert len(top.reasons) >= 3

    # Scores must be sorted descending
    for i in range(len(ranked) - 1):
        assert ranked[i].score >= ranked[i + 1].score


# --- 5. Close-Range Tenure Optimization Tests ---

def test_longer_tenure_optimization_for_return_goal():
    all_prods = get_all_products()

    pairs = find_eligible_tenure_pairs(
        all_prods,
        amount=100000,
        target_months=12,
    )

    ranked = rank_recommendations(
        eligible_pairs=pairs,
        amount=100000,
        target_months=12,
        goal="better_return",
        liquidity_preference="can_lock_longer",
    )

    best_direct = next(
        r for r in ranked
        if r.tenure_months == 12
    )

    opt = find_tenure_optimization(
        best_direct_match=best_direct,
        all_options=ranked,
        target_months=12,
        goal="better_return",
        liquidity_preference="can_lock_longer",
    )

    assert opt is not None
    assert opt.has_alternative is True
    assert opt.direction == "longer"
    assert opt.alternative_tenure > 12
    assert opt.additional_estimated_interest > 0
    assert "additional months" in opt.tradeoff.lower()


def test_shorter_tenure_optimization_for_liquidity_goal():
    all_prods = get_all_products()

    pairs = find_eligible_tenure_pairs(
        all_prods,
        amount=100000,
        target_months=12,
    )

    ranked = rank_recommendations(
        eligible_pairs=pairs,
        amount=100000,
        target_months=12,
        goal="need_liquidity",
        liquidity_preference="high",
    )

    best_direct = next(
        r for r in ranked
        if r.tenure_months == 12
    )

    opt = find_tenure_optimization(
        best_direct_match=best_direct,
        all_options=ranked,
        target_months=12,
        goal="need_liquidity",
        liquidity_preference="high",
    )

    assert opt is not None
    assert opt.has_alternative is True
    assert opt.direction == "shorter"
    assert opt.alternative_tenure < 12
    assert "liquidity" in opt.tradeoff.lower()


# --- 6. Edge Cases & API Endpoint Tests ---

def test_api_recommend_valid():
    payload = {
        "amount": 100000,
        "target_months": 12,
        "goal": "safe_deposit",
        "liquidity_preference": "balanced",
    }

    response = client.post("/api/recommend", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert "best_match" in data
    assert data["best_match"] is not None
    assert data["best_match"]["tenure_months"] == 12
    assert "tenure_optimization" in data
    assert "disclaimer" in data
    assert "illustrative demo data" in data["disclaimer"].lower()


def test_api_recommend_invalid_amount():
    payload = {
        "amount": -5000,
        "target_months": 12,
        "goal": "safe",
        "liquidity_preference": "balanced",
    }

    response = client.post("/api/recommend", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"][-1] == "amount"


def test_api_recommend_invalid_tenure():
    payload = {
        "amount": 50000,
        "target_months": 0,
        "goal": "safe",
        "liquidity_preference": "balanced",
    }

    response = client.post("/api/recommend", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"][-1] == "target_months"


def test_api_recommend_no_eligible_products():
    # An absurdly high amount that exceeds all maximum deposit caps
    payload = {
        "amount": 999999999999.0,
        "target_months": 12,
        "goal": "safe",
        "liquidity_preference": "balanced",
    }

    response = client.post("/api/recommend", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["best_match"] is None
    assert len(data["explanation"]) > 0
    assert "No products found" in data["explanation"][0]


# --- 7. End-to-End Matrix Tests (Phase 3 Requirements) ---

@pytest.mark.parametrize(
    "amount,target_months",
    [
        (50000, 6),
        (100000, 12),
        (200000, 18),
        (500000, 24),
    ],
)
def test_e2e_various_amounts_and_tenures(amount, target_months):
    """Test required amount and tenure pairs produce valid recommendations and math."""

    payload = {
        "amount": amount,
        "target_months": target_months,
        "goal": "better_return",
        "liquidity_preference": "balanced",
    }

    response = client.post("/api/recommend", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["best_match"] is not None
    assert data["best_match"]["estimated_maturity_amount"] > amount
    assert data["best_match"]["estimated_interest_earned"] > 0

    # Verify trust fields
    assert "data_source" in data["best_match"]
    assert "last_updated" in data["best_match"]
    assert "calculation_explanation" in data["best_match"]
    assert "A = P" in data["best_match"]["calculation_explanation"]


@pytest.mark.parametrize(
    "goal",
    [
        "safe_deposit",
        "better_return",
        "need_liquidity",
    ],
)
def test_e2e_all_three_goals(goal):
    """Test all 3 goals are accepted and produce scored results."""

    payload = {
        "amount": 100000,
        "target_months": 12,
        "goal": goal,
        "liquidity_preference": "balanced",
    }

    response = client.post("/api/recommend", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["best_match"] is not None


@pytest.mark.parametrize(
    "liquidity_pref",
    [
        "high",
        "balanced",
        "can_lock_longer",
    ],
)
def test_e2e_all_liquidity_preferences(liquidity_pref):
    """Test all 3 liquidity preferences are accepted and produce valid recommendations."""

    payload = {
        "amount": 100000,
        "target_months": 12,
        "goal": "safe_deposit",
        "liquidity_preference": liquidity_pref,
    }

    response = client.post("/api/recommend", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["best_match"] is not None


def test_e2e_recommendations_vary_based_on_user_intent():
    """Verify recommendations actually change based on user requirements."""

    # Intent A: Maximum yield with extended lock-in preference
    payload_yield = {
        "amount": 100000,
        "target_months": 12,
        "goal": "better_return",
        "liquidity_preference": "can_lock_longer",
    }

    res_yield = client.post(
        "/api/recommend",
        json=payload_yield,
    ).json()

    # Intent B: Emergency liquidity preference with high liquidity goal
    payload_liquidity = {
        "amount": 100000,
        "target_months": 12,
        "goal": "need_liquidity",
        "liquidity_preference": "high",
    }

    res_liquidity = client.post(
        "/api/recommend",
        json=payload_liquidity,
    ).json()

    # The scores, reasons, or chosen product should reflect the differing priorities
    assert res_yield["best_match"] is not None
    assert res_liquidity["best_match"] is not None

    # Compare reasons or tenure optimization direction
    # Return goal should optimize towards longer tenure;
    # liquidity goal towards shorter or high-liquidity
    if res_yield.get("tenure_optimization"):
        assert res_yield["tenure_optimization"]["direction"] == "longer"

    if res_liquidity.get("tenure_optimization"):
        assert res_liquidity["tenure_optimization"]["direction"] == "shorter"