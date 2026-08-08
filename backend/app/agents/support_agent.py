def classify_ticket(subject: str, description: str, priority: str = "MEDIUM"):
    """
    Support Agent:
    Understands the customer request and classifies the operational category.
    """

    text = f"{subject} {description}".lower()

    fraud_keywords = [
        "fraud",
        "unauthorized",
        "stolen",
        "scam",
        "account takeover",
        "not my transaction"
    ]

    refund_keywords = [
        "refund",
        "chargeback",
        "dispute",
        "money back"
    ]

    if any(keyword in text for keyword in fraud_keywords):
        category = "FRAUD"
        final_priority = "HIGH"

    elif any(keyword in text for keyword in refund_keywords):
        category = "PAYMENT_DISPUTE"
        final_priority = "HIGH"

    else:
        category = "GENERAL_SUPPORT"
        final_priority = priority.upper()

    return {
        "agent": "Support Agent",
        "category": category,
        "priority": final_priority,
        "reason": f"Ticket classified as {category} based on customer message."
    }