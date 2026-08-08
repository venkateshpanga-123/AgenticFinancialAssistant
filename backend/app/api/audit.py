from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.audit_log import AuditLog

router = APIRouter(
    prefix="/audit",
    tags=["Audit Trail"]
)


@router.get("/")
def get_audit_logs(
    db: Session = Depends(get_db)
):
    return (
        db.query(AuditLog)
        .order_by(AuditLog.id.desc())
        .all()
    )


@router.get("/{audit_id}")
def get_audit_log(
    audit_id: int,
    db: Session = Depends(get_db)
):
    audit = (
        db.query(AuditLog)
        .filter(AuditLog.id == audit_id)
        .first()
    )

    if not audit:
        raise HTTPException(
            status_code=404,
            detail="Audit record not found"
        )

    return audit
