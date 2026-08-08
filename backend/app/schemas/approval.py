from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ApprovalCreate(BaseModel):
    transaction_id: str
    action: str
    amount: float
    risk_level: str
    reason: str


class ApprovalResponse(BaseModel):
    id: int
    transaction_id: str
    action: str
    amount: float
    risk_level: str
    reason: str
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewer_note: Optional[str] = None

    class Config:
        from_attributes = True


class ApprovalDecision(BaseModel):
    reviewer_note: Optional[str] = None