"""
DETERMINISTIC FINANCIAL CALCULATION ENGINE FOR FINOPT

Formula:
  Compound Interest Formula:
  A = P * (1 + r / n) ** (n * t)

  Where:
  P = Principal deposit amount
  r = Annual interest rate (as a decimal, e.g. 7.5% -> 0.075)
  n = Compounding frequency per year (1=Annual, 2=Semi-annual, 4=Quarterly, 12=Monthly)
  t = Tenure in years (tenure_months / 12)
  A = Estimated maturity amount
"""

from models import CalculationResult


def calculate_compound_interest(
    principal: float,
    annual_interest_rate: float,
    tenure_months: int,
    compounding_frequency: int = 4,
) -> CalculationResult:
    """
    Calculate estimated maturity amount and interest earned using deterministic compound interest.

    :param principal: Deposit amount in INR (must be > 0)
    :param annual_interest_rate: Annual interest rate in percentage (e.g., 7.25 for 7.25%, must be >= 0)
    :param tenure_months: Deposit tenure in months (must be >= 1)
    :param compounding_frequency: Times per year interest compounds (e.g., 4=quarterly, 12=monthly; must be >= 1)
    :return: CalculationResult with estimated maturity and earned interest
    """
    if principal <= 0:
        raise ValueError(f"Principal amount must be greater than 0, got {principal}")

    if annual_interest_rate < 0:
        raise ValueError(
            f"Annual interest rate cannot be negative, got {annual_interest_rate}"
        )

    if tenure_months < 1:
        raise ValueError(f"Tenure must be at least 1 month, got {tenure_months}")

    if compounding_frequency < 1:
        raise ValueError(
            f"Compounding frequency must be at least 1, got {compounding_frequency}"
        )

    # Convert percentage to decimal rate
    r = annual_interest_rate / 100.0
    n = compounding_frequency
    t = tenure_months / 12.0

    # Compound interest equation: A = P * (1 + r/n)**(n*t)
    maturity_amount = principal * ((1.0 + (r / n)) ** (n * t))
    estimated_maturity = round(maturity_amount, 2)
    estimated_interest = round(estimated_maturity - principal, 2)

    return CalculationResult(
        principal=round(principal, 2),
        annual_interest_rate=round(annual_interest_rate, 2),
        tenure_months=tenure_months,
        compounding_frequency=compounding_frequency,
        estimated_maturity_amount=estimated_maturity,
        estimated_interest_earned=estimated_interest,
    )
