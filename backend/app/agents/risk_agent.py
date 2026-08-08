def calculate_risk(
    amount: float,
    transaction_status: str = "SUCCESS",
    dispute_status: str = "NONE"
):
    """
    Risk Agent:
    Calculates payment risk using deterministic rules.
    """

    score = 0
    reasons = []

    # Amount risk
    if amount >= 100000:
        score += 45
        reasons.append("Very high transaction amount")

    elif amount >= 50000:
        score += 25
        reasons.append("High transaction amount")

    # Transaction status
    if transaction_status.upper() in ["FAILED", "DECLINED"]:
        score += 20
        reasons.append("Transaction failed or was declined")

    # Dispute
    if dispute_status.upper() not in ["NONE", "", "NO"]:
        score += 30
        reasons.append("Transaction has an active dispute")

    score = min(score, 100)

    if score >= 70:
        level = "HIGH"
    elif score >= 30:
        level = "MEDIUM"
    else:
        level = "LOW"

    if not reasons:
        reasons.append("No significant payment risk indicators found")

    return {
        "agent": "Risk Agent",
        "score": score,
        "level": level,
        "reasons": reasons
    }