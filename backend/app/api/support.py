from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import requests

from app.database.database import get_db
from app.models.support_ticket import SupportTicket

from app.schemas.support_ticket import (
    SupportTicketCreate,
    SupportTicketUpdate,
    SupportTicketResponse,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/support",
    tags=["Customer Support"]
)


# =========================================================
# CREATE SUPPORT TICKET
# =========================================================

@router.post(
    "/tickets",
    response_model=SupportTicketResponse
)
def create_ticket(
    ticket: SupportTicketCreate,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(SupportTicket)
        .filter(
            SupportTicket.ticket_id == ticket.ticket_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Ticket ID already exists"
        )

    new_ticket = SupportTicket(
        ticket_id=ticket.ticket_id,
        customer_id=ticket.customer_id,
        subject=ticket.subject,
        description=ticket.description,
        priority=ticket.priority,
        status=ticket.status,
        transaction_id=ticket.transaction_id,
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket


# =========================================================
# GET ALL TICKETS
# =========================================================

@router.get(
    "/tickets",
    response_model=list[SupportTicketResponse]
)
def get_tickets(
    db: Session = Depends(get_db)
):

    return (
        db.query(SupportTicket)
        .order_by(SupportTicket.id.desc())
        .all()
    )


# =========================================================
# GET SINGLE TICKET
# =========================================================

@router.get(
    "/tickets/{ticket_id}",
    response_model=SupportTicketResponse
)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db)
):

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

    return ticket


# =========================================================
# UPDATE SUPPORT TICKET
# =========================================================

@router.put(
    "/tickets/{ticket_id}",
    response_model=SupportTicketResponse
)
def update_ticket(
    ticket_id: str,
    ticket_data: SupportTicketUpdate,
    db: Session = Depends(get_db)
):

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

    # Update only fields provided by the user

    if ticket_data.priority is not None:
        ticket.priority = ticket_data.priority

    if ticket_data.status is not None:
        ticket.status = ticket_data.status

    if ticket_data.description is not None:
        ticket.description = ticket_data.description

    if ticket_data.resolution is not None:
        ticket.resolution = ticket_data.resolution

    db.commit()
    db.refresh(ticket)

    return ticket


# =========================================================
# ANALYZE SUPPORT TICKET
# =========================================================

@router.post(
    "/tickets/{ticket_id}/analyze"
)
def analyze_support_ticket(
    ticket_id: str,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # 1. Find support ticket
    # -----------------------------------------------------

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


    # -----------------------------------------------------
    # 2. Check linked transaction
    # -----------------------------------------------------

    risk_result = None

    if ticket.transaction_id:

        try:

            response = requests.get(
                f"http://127.0.0.1:8000/risk/analyze/"
                f"{ticket.transaction_id}",
                timeout=5
            )

            if response.status_code == 200:

                risk_result = response.json()

        except requests.RequestException:

            risk_result = None


    # -----------------------------------------------------
    # 3. If transaction risk is available
    # -----------------------------------------------------

    if risk_result:

        risk_level = str(
            risk_result.get(
                "risk_level",
                ""
            )
        ).upper()

        risk_score = risk_result.get(
            "risk_score"
        )

        reasons = risk_result.get(
            "reasons",
            []
        )

        recommended_action = risk_result.get(
            "recommended_action"
        )


        # -------------------------------------------------
        # HIGH RISK
        # -------------------------------------------------

        if risk_level == "HIGH":

            decision = "ESCALATE"

            reason = (
                "The support ticket is linked to a "
                "HIGH-risk transaction. Human approval "
                "is required before taking a high-risk "
                "action."
            )

            requires_human_approval = True


        # -------------------------------------------------
        # MEDIUM RISK
        # -------------------------------------------------

        elif risk_level == "MEDIUM":

            decision = "REVIEW_TRANSACTION"

            reason = (
                "The support ticket is linked to a "
                "MEDIUM-risk transaction. Transaction "
                "review is recommended."
            )

            requires_human_approval = False


        # -------------------------------------------------
        # LOW RISK
        # -------------------------------------------------

        else:

            decision = "AUTO_RESOLVE"

            reason = (
                "The linked transaction has LOW risk. "
                "The support request can proceed without "
                "human approval."
            )

            requires_human_approval = False


        # -------------------------------------------------
        # Return analysis
        # -------------------------------------------------

        return {

            "ticket_id": ticket.ticket_id,

            "customer_id": ticket.customer_id,

            "transaction_id": ticket.transaction_id,

            "priority": ticket.priority,

            "status": ticket.status,

            "risk_score": risk_score,

            "risk_level": risk_level,

            "risk_reasons": reasons,

            "recommended_action":
                recommended_action,

            "decision": decision,

            "reason": reason,

            "requires_human_approval":
                requires_human_approval
        }


    # =====================================================
    # 4. No transaction risk available
    # =====================================================

    if ticket.priority.upper() == "HIGH":

        decision = "ESCALATE"

        reason = (
            "This is a HIGH-priority support ticket "
            "and requires human review."
        )

        requires_human_approval = True

    else:

        decision = "AUTO_RESOLVE"

        reason = (
            "No transaction risk information is "
            "available for this ticket."
        )

        requires_human_approval = False


    # -----------------------------------------------------
    # Return result
    # -----------------------------------------------------

    return {

        "ticket_id": ticket.ticket_id,

        "customer_id": ticket.customer_id,

        "transaction_id": ticket.transaction_id,

        "priority": ticket.priority,

        "status": ticket.status,

        "risk_score": None,

        "risk_level": None,

        "risk_reasons": [],

        "recommended_action": None,

        "decision": decision,

        "reason": reason,

        "requires_human_approval":
            requires_human_approval
    }