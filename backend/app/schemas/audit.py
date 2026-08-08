from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditResponse(BaseModel):

    id: int

    transaction_id: str

    action: str

    amount: float

    risk_level: str

    decision: str

    reason: Optional[str] = None

    reviewer_note: Optional[str] = None

    created_at: datetime

    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True