from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TransactionCreate(BaseModel):
    transaction_id: str
    customer_id: str
    amount: float
    payment_method: str
    status: str
    failure_reason: Optional[str] = None
    dispute_status: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    transaction_id: str
    customer_id: str
    amount: float
    payment_method: str
    status: str
    failure_reason: Optional[str] = None
    dispute_status: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True