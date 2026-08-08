from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.transaction import Transaction


router = APIRouter(
    prefix="/risk",
    tags=["Risk Analysis"]
)


@router.get("/analyze/{transaction_id}")
def analyze_transaction(
    transaction_id: str,
    db: Session = Depends(get_db)
):

    # =====================================================
    # 1. FIND TRANSACTION
    # =====================================================

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.transaction_id == transaction_id
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )


    # =====================================================
    # 2. INITIAL VALUES
    # =====================================================

    risk_score = 0
    reasons = []


    # =====================================================
    # 3. CHECK TRANSACTION AMOUNT
    # =====================================================

    if transaction.amount is not None:

        if transaction.amount >= 100000:

            risk_score += 40

            reasons.append(
                "Transaction amount is very high"
            )

        elif transaction.amount >= 50000:

            risk_score += 20

            reasons.append(
                "Transaction amount is high"
            )


    # =====================================================
    # 4. CHECK TRANSACTION STATUS
    # =====================================================

    if transaction.status:

        status = transaction.status.upper()

        if status in ["FAILED", "DECLINED"]:

            risk_score += 20

            reasons.append(
                "Transaction failed or was declined"
            )


    # =====================================================
    # 5. CHECK DISPUTE STATUS
    # =====================================================

    if transaction.dispute_status:

        dispute_status = (
            transaction.dispute_status.upper()
        )

        if dispute_status != "NONE":

            risk_score += 30

            reasons.append(
                "Transaction has an active dispute"
            )


    # =====================================================
    # 6. CHECK FAILURE REASON
    # =====================================================

    if transaction.failure_reason:

        risk_score += 10

        reasons.append(
            "Transaction has a failure reason"
        )


    # =====================================================
    # 7. LIMIT SCORE
    # =====================================================

    if risk_score > 100:
        risk_score = 100


    # =====================================================
    # 8. DETERMINE RISK LEVEL
    # =====================================================

    if risk_score >= 70:

        risk_level = "HIGH"

        recommended_action = (
            "Human approval required"
        )

    elif risk_score >= 30:

        risk_level = "MEDIUM"

        recommended_action = (
            "Review recommended"
        )

    else:

        risk_level = "LOW"

        recommended_action = (
            "No immediate action required"
        )


    # =====================================================
    # 9. DEFAULT REASON
    # =====================================================

    if not reasons:

        reasons.append(
            "No significant risk indicators found"
        )


    # =====================================================
    # 10. PRINT AUDIT INFORMATION
    # =====================================================

    print("=" * 50)
    print("RISK ANALYSIS")
    print("=" * 50)
    print(
        "Transaction ID :",
        transaction.transaction_id
    )
    print(
        "Risk Score     :",
        risk_score
    )
    print(
        "Risk Level     :",
        risk_level
    )
    print(
        "Reasons        :",
        reasons
    )
    print(
        "Recommended    :",
        recommended_action
    )
    print("=" * 50)


    # =====================================================
    # 11. RETURN RESULT
    # =====================================================

    return {
        "transaction_id":
            transaction.transaction_id,

        "amount":
            transaction.amount,

        "risk_score":
            risk_score,

        "risk_level":
            risk_level,

        "reasons":
            reasons,

        "recommended_action":
            recommended_action
    }