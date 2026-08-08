from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.database import get_db
from app.models.approval import Approval
from app.models.audit_log import AuditLog
from app.schemas.approval import (
    ApprovalCreate,
    ApprovalResponse,
    ApprovalDecision,
)

router = APIRouter(
    prefix="/approvals",
    tags=["Human Approval"]
)


# =========================================================
# CREATE APPROVAL
# =========================================================

@router.post("/", response_model=ApprovalResponse)
def create_approval(
    approval: ApprovalCreate,
    db: Session = Depends(get_db)
):

    new_approval = Approval(
        transaction_id=approval.transaction_id,
        action=approval.action,
        amount=approval.amount,
        risk_level=approval.risk_level,
        reason=approval.reason,
        status="PENDING"
    )

    db.add(new_approval)
    db.commit()
    db.refresh(new_approval)

    return new_approval


# =========================================================
# GET ALL APPROVALS
# =========================================================

@router.get("/", response_model=list[ApprovalResponse])
def get_approvals(
    db: Session = Depends(get_db)
):

    return (
        db.query(Approval)
        .order_by(Approval.id.desc())
        .all()
    )


# =========================================================
# GET SINGLE APPROVAL
# =========================================================

@router.get("/{approval_id}", response_model=ApprovalResponse)
def get_approval(
    approval_id: int,
    db: Session = Depends(get_db)
):

    approval = (
        db.query(Approval)
        .filter(Approval.id == approval_id)
        .first()
    )

    if not approval:
        raise HTTPException(
            status_code=404,
            detail="Approval request not found"
        )

    return approval


# =========================================================
# APPROVE
# =========================================================

@router.put(
    "/{approval_id}/approve",
    response_model=ApprovalResponse
)
def approve_request(
    approval_id: int,
    decision: ApprovalDecision,
    db: Session = Depends(get_db)
):

    approval = (
        db.query(Approval)
        .filter(Approval.id == approval_id)
        .first()
    )

    if not approval:
        raise HTTPException(
            status_code=404,
            detail="Approval request not found"
        )

    if approval.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Approval request has already been reviewed"
        )

    # Update approval
    approval.status = "APPROVED"
    approval.reviewed_at = datetime.utcnow()
    approval.reviewer_note = decision.reviewer_note

    # Create audit record
    audit = AuditLog(
        action="HUMAN_APPROVAL",
        entity_type="APPROVAL",
        entity_id=str(approval.id),
        decision="APPROVED",
        reason=(
            decision.reviewer_note
            or "Approval request approved by human reviewer"
        ),
        requires_human_approval=True
    )

    db.add(audit)

    db.commit()
    db.refresh(approval)

    return approval


# =========================================================
# REJECT
# =========================================================

@router.put(
    "/{approval_id}/reject",
    response_model=ApprovalResponse
)
def reject_request(
    approval_id: int,
    decision: ApprovalDecision,
    db: Session = Depends(get_db)
):

    approval = (
        db.query(Approval)
        .filter(Approval.id == approval_id)
        .first()
    )

    if not approval:
        raise HTTPException(
            status_code=404,
            detail="Approval request not found"
        )

    if approval.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Approval request has already been reviewed"
        )

    # Update approval
    approval.status = "REJECTED"
    approval.reviewed_at = datetime.utcnow()
    approval.reviewer_note = decision.reviewer_note

    # Create audit record
    audit = AuditLog(
        action="HUMAN_APPROVAL",
        entity_type="APPROVAL",
        entity_id=str(approval.id),
        decision="REJECTED",
        reason=(
            decision.reviewer_note
            or "Approval request rejected by human reviewer"
        ),
        requires_human_approval=True
    )

    db.add(audit)

    db.commit()
    db.refresh(approval)

    return approval
