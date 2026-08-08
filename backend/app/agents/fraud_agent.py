def investigate_fraud(
    severity: str = "LOW",
    investigation_notes: str = "",
    transaction_amount: float = 0
):
    """
    Fraud Agent:
    Evaluates fraud investigation signals.
    """

    score = 0
    reasons = []

    severity = severity.upper()

    severity_scores = {
        "LOW": 10,
        "MEDIUM": 30,
        "HIGH": 60,
        "CRITICAL": 80
    }

    score += severity_scores.get(severity, 10)

    notes = investigation_notes.lower()

    fraud_indicators = [
        "unauthorized",
        "stolen",
        "account takeover",
        "scam",
        "suspicious"
    ]

    if any(indicator in notes for indicator in fraud_indicators):
        score += 20
        reasons.append(
            "Investigation notes contain fraud indicators"
        )

    if transaction_amount >= 100000:
        score += 20
        reasons.append(
            "Large-value transaction linked to fraud investigation"
        )

    score = min(score, 100)

    if score >= 70:
        level = "HIGH"
    elif score >= 30:
        level = "MEDIUM"
    else:
        level = "LOW"

    if not reasons:
        reasons.append(
            "No strong fraud indicators were identified"
        )

    return {
        "agent": "Fraud Agent",
        "score": score,
        "level": level,
        "reasons": reasons
    }