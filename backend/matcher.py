"""
PRODUCT MATCHING ENGINE FOR FINOPT

Filters available products strictly based on deterministic eligibility rules:
1. Deposit amount falls within [minimum_amount, maximum_amount].
2. Product offers tenures relevant to the target horizon (exact or within close-range window).
"""

from typing import List, Tuple
from models import Product, ProductTenure


def find_eligible_tenure_pairs(
    products: List[Product],
    amount: float,
    target_months: int,
    tenure_window: int = 6,
) -> List[Tuple[Product, ProductTenure]]:
    """
    Filter the product catalog to return (Product, ProductTenure) pairs that satisfy
    deposit amount eligibility and fall within the requested tenure window.

    :param products: Full list of products
    :param amount: User's deposit amount
    :param target_months: Desired investment horizon in months
    :param tenure_window: Maximum difference in months to be considered relevant (default: +/- 6m)
    :return: List of eligible (Product, ProductTenure) tuples
    """
    eligible_pairs: List[Tuple[Product, ProductTenure]] = []

    for product in products:
        # Rule 1: Amount range eligibility check
        if amount < product.minimum_amount or amount > product.maximum_amount:
            continue

        # Rule 2: Tenure availability check
        for tenure in product.tenures:
            diff = abs(tenure.tenure_months - target_months)
            if diff <= tenure_window:
                eligible_pairs.append((product, tenure))

    return eligible_pairs
