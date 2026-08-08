from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.support_ticket import SupportTicket
from app.models.transaction import Transaction
from app.models.audit_log import AuditLog
from app.models.approval import Approval

from app.agents.support_agent import classify_ticket
from app.agents.risk_agent import calculate_risk
from app.agents.fraud_agent import investigate_fraud


router = APIRouter(
    prefix="/agent",
    tags=["AI Agent"]
)


@router.post("/process/{ticket_id}")
def process_ticket(
    ticket_id: str,
    db: Session = Depends(get_db)
):

    # =========================================================
    # 1. FIND SUPPORT TICKET
    # =========================================================

    ticket = (
        db.query(SupportTicket)
        .filter(
            SupportTicket.ticket_id == ticket_id
        )
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Support ticket not found"
        )


    # =========================================================
    # 2. FIND RELATED TRANSACTION
    # =========================================================

    transaction = None

    if ticket.transaction_id:

        transaction = (
            db.query(Transaction)
            .filter(
                Transaction.transaction_id
                == ticket.transaction_id
            )
            .first()
        )


    # =========================================================
    # 3. SUPPORT AGENT
    # =========================================================

    support_result = classify_ticket(
        subject=ticket.subject or "",
        description=ticket.description or "",
        priority=ticket.priority or "MEDIUM"
    )


    # =========================================================
    # 4. PAYMENT RISK AGENT
    # =========================================================

    transaction_amount = 0
    transaction_status = "UNKNOWN"
    dispute_status = "NONE"

    if transaction:

        transaction_amount = float(
            transaction.amount or 0
        )

        transaction_status = (
            transaction.status or "UNKNOWN"
        ).upper()

        dispute_status = (
            transaction.dispute_status or "NONE"
        ).upper()


    risk_result = calculate_risk(
        amount=transaction_amount,
        transaction_status=transaction_status,
        dispute_status=dispute_status
    )


    # =========================================================
    # 5. FRAUD AGENT
    # =========================================================

    fraud_result = investigate_fraud(
        severity=(
            "HIGH"
            if support_result["category"] == "FRAUD"
            else "LOW"
        ),
        investigation_notes=(
            f"{ticket.subject} "
            f"{ticket.description}"
        ),
        transaction_amount=transaction_amount
    )


    # =========================================================
    # 6. ORCHESTRATOR
    # =========================================================

    combined_score = max(
        risk_result["score"],
        fraud_result["score"]
    )

    # Increase risk if support agent identifies fraud
    if support_result["category"] == "FRAUD":
        combined_score += 15

    # Increase risk for payment disputes
    if support_result["category"] == "PAYMENT_DISPUTE":
        combined_score += 10

    combined_score = min(
        combined_score,
        100
    )


    # =========================================================
    # 7. FINAL RISK LEVEL
    # =========================================================

    if combined_score >= 70:

        risk_level = "HIGH"

    elif combined_score >= 30:

        risk_level = "MEDIUM"

    else:

        risk_level = "LOW"


    # =========================================================
    # 8. COMBINE REASONS
    # =========================================================

    reasons = []

    reasons.extend(
        risk_result["reasons"]
    )

    reasons.extend(
        fraud_result["reasons"]
    )

    reasons.append(
        f"Support Agent classified case as "
        f"{support_result['category']}"
    )


    # Remove duplicate reasons
    reasons = list(
        dict.fromkeys(reasons)
    )


    # =========================================================
    # 9. SELF-CHECK
    # =========================================================

    # Business rule:
    # High-risk actions MUST NOT execute automatically.

    self_check_passed = True

    if risk_level == "HIGH":

        requires_human_approval = True

    elif risk_level == "MEDIUM":

        requires_human_approval = True

    else:

        requires_human_approval = False


    # Extra protection:
    # Fraud cases always require human approval.

    if support_result["category"] == "FRAUD":

        requires_human_approval = True


    # Self-check ensures that the system never
    # autonomously executes a high-risk action.

    if (
        risk_level == "HIGH"
        and not requires_human_approval
    ):

        self_check_passed = False
        requires_human_approval = True

        reasons.append(
            "Self-check corrected the workflow "
            "because high-risk actions require "
            "human approval."
        )


    # =========================================================
    # 10. DETERMINE DECISION
    # =========================================================

    if requires_human_approval:

        decision = "WAITING_FOR_APPROVAL"

        recommended_action = (
            "Human approval required before "
            "performing the requested action."
        )

        explanation = (
            "The cooperating agents identified "
            "a case that requires human review. "
            "The system will not execute the "
            "high-risk action automatically."
        )

    else:

        decision = "AUTONOMOUS"

        recommended_action = (
            "Proceed with standard support workflow."
        )

        explanation = (
            "The cooperating agents found no "
            "significant risk indicators. "
            "The case can follow the standard "
            "automated workflow."
        )


    # =========================================================
    # 11. HUMAN APPROVAL
    # =========================================================

    approval_id = None
    approval_status = None

    if (
        requires_human_approval
        and transaction
    ):

        approval = (
            db.query(Approval)
            .filter(
                Approval.transaction_id
                == transaction.transaction_id,
                Approval.status == "PENDING"
            )
            .order_by(
                Approval.id.desc()
            )
            .first()
        )


        # Create approval request
        if not approval:

            approval = Approval(
                transaction_id=(
                    transaction.transaction_id
                ),
                action="REFUND",
                amount=transaction_amount,
                risk_level=risk_level,
                reason=(
                    explanation
                    + " "
                    + " ".join(reasons)
                ),
                status="PENDING"
            )

            db.add(approval)

            db.commit()

            db.refresh(approval)


        approval_id = approval.id
        approval_status = approval.status


        # =====================================================
        # APPROVAL STATUS
        # =====================================================

        if approval.status == "PENDING":

            decision = "WAITING_FOR_APPROVAL"

            recommended_action = (
                "Wait for human approval."
            )

        elif approval.status == "REJECTED":

            decision = "REJECTED"

            recommended_action = (
                "Do not perform the requested action."
            )

            explanation = (
                "The human reviewer rejected "
                "the requested action."
            )

        elif approval.status == "APPROVED":

            decision = "APPROVED"

            recommended_action = (
                "Proceed with the approved "
                "support workflow."
            )

            explanation = (
                "The human reviewer approved "
                "the requested action."
            )


    # =========================================================
    # 12. AUTONOMOUS ACTION
    # =========================================================

    action_executed = False

    # Demo only:
    # No real refund is performed.

    if (
        decision == "AUTONOMOUS"
        and transaction
    ):

        # In a real production system this would call
        # the payment provider.

        action_executed = False


    # =========================================================
    # 13. APPROVED DEMO ACTION
    # =========================================================

    if (
        approval_status == "APPROVED"
        and transaction
    ):

        # DEMO ONLY
        #
        # We only change local database state.
        # No real money is transferred.

        transaction.status = "REFUND_APPROVED"

        db.commit()

        action_executed = True


    # =========================================================
    # 14. AUDIT LOG
    # =========================================================

    audit_reason = (
        explanation
        + " "
        + " ".join(reasons)
    )

    audit = AuditLog(
        action="MULTI_AGENT_PROCESS_TICKET",
        entity_type="SUPPORT_TICKET",
        entity_id=ticket.ticket_id,
        decision=decision,
        reason=audit_reason,
        requires_human_approval=(
            requires_human_approval
        )
    )

    db.add(audit)

    db.commit()

    db.refresh(audit)


    # =========================================================
    # 15. FINAL RESPONSE
    # =========================================================

    return {

        "ticket_id":
            ticket.ticket_id,

        "customer_id":
            ticket.customer_id,

        "transaction_id":
            ticket.transaction_id,

        "ticket_priority":
            ticket.priority,

        "ticket_status":
            ticket.status,

        "transaction_found":
            transaction is not None,

        # -----------------------------
        # ORCHESTRATOR RESULT
        # -----------------------------

        "risk_score":
            combined_score,

        "risk_level":
            risk_level,

        "decision":
            decision,

        "recommended_action":
            recommended_action,

        "requires_human_approval":
            requires_human_approval,

        # -----------------------------
        # AGENT RESULTS
        # -----------------------------

        "agents": {

            "support_agent":
                support_result,

            "risk_agent":
                risk_result,

            "fraud_agent":
                fraud_result

        },

        # -----------------------------
        # SELF CHECK
        # -----------------------------

        "self_check": {

            "passed":
                self_check_passed,

            "message":
                "Business safety rules verified."
        },

        # -----------------------------
        # REASONS
        # -----------------------------

        "reasons":
            reasons,

        "explanation":
            explanation,

        # -----------------------------
        # APPROVAL
        # -----------------------------

        "approval_id":
            approval_id,

        "approval_status":
            approval_status,

        # -----------------------------
        # ACTION
        # -----------------------------

        "action_executed":
            action_executed,

        # -----------------------------
        # AUDIT
        # -----------------------------

        "audit_log_id":
            audit.id
    }