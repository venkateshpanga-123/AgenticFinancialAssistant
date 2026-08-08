from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.transaction import Transaction
from app.models.approval import Approval

from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
)

from app.api.risky import analyze_transaction


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


# =========================================================
# CREATE TRANSACTION
# =========================================================

@router.post(
    "/",
    response_model=TransactionResponse
)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Check duplicate transaction ID
    # -----------------------------------------------------

    existing = (
        db.query(Transaction)
        .filter(
            Transaction.transaction_id
            == transaction.transaction_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Transaction ID already exists"
        )

    # -----------------------------------------------------
    # Create transaction
    # -----------------------------------------------------

    new_transaction = Transaction(
        transaction_id=transaction.transaction_id,
        customer_id=transaction.customer_id,
        amount=transaction.amount,
        payment_method=transaction.payment_method,
        status=transaction.status,
        failure_reason=transaction.failure_reason,
        dispute_status=transaction.dispute_status,
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    # -----------------------------------------------------
    # RUN RISK ANALYSIS
    # -----------------------------------------------------

    risk_result = None

    try:

        risk_result = analyze_transaction(
            transaction.transaction_id,
            db
        )

        print("=" * 50)
        print("RISK ANALYSIS")
        print("=" * 50)
        print(
            "Transaction ID :",
            transaction.transaction_id
        )
        print(
            "Risk Score     :",
            risk_result.get("risk_score")
        )
        print(
            "Risk Level     :",
            risk_result.get("risk_level")
        )
        print(
            "Reasons        :",
            risk_result.get("reasons")
        )
        print(
            "Recommended    :",
            risk_result.get(
                "recommended_action"
            )
        )
        print("=" * 50)

    except Exception as e:

        print(
            "Risk analysis failed:",
            e
        )

    # -----------------------------------------------------
    # AUTOMATIC HUMAN APPROVAL
    # -----------------------------------------------------

    if risk_result:

        risk_level = (
            risk_result
            .get("risk_level", "LOW")
            .upper()
        )

        if risk_level == "HIGH":

            # Check whether approval already exists
            existing_approval = (
                db.query(Approval)
                .filter(
                    Approval.transaction_id
                    == transaction.transaction_id
                )
                .first()
            )

            if not existing_approval:

                new_approval = Approval(

                    transaction_id=
                        transaction.transaction_id,

                    action=
                        "HIGH_RISK_TRANSACTION",

                    amount=
                        transaction.amount,

                    risk_level=
                        risk_level,

                    reason=
                        "; ".join(
                            risk_result.get(
                                "reasons",
                                []
                            )
                        ),

                    status=
                        "PENDING"
                )

                db.add(new_approval)
                db.commit()
                db.refresh(new_approval)

                print("=" * 50)
                print("HUMAN APPROVAL CREATED")
                print("=" * 50)
                print(
                    "Transaction :",
                    transaction.transaction_id
                )
                print(
                    "Approval ID :",
                    new_approval.id
                )
                print(
                    "Risk Level  :",
                    risk_level
                )
                print(
                    "Status      :",
                    new_approval.status
                )
                print("=" * 50)

    # -----------------------------------------------------
    # RETURN TRANSACTION
    # -----------------------------------------------------

    return new_transaction


# =========================================================
# GET ALL TRANSACTIONS
# =========================================================

@router.get(
    "/",
    response_model=list[TransactionResponse]
)
def get_transactions(
    db: Session = Depends(get_db)
):

    return (
        db.query(Transaction)
        .order_by(Transaction.id.desc())
        .all()
    )


# =========================================================
# GET SINGLE TRANSACTION
# =========================================================

@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse
)
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db)
):

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.transaction_id
            == transaction_id
        )
        .first()
    )

    if not transaction:

        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return transaction