from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SupportTicketCreate(BaseModel):
    ticket_id: str
    customer_id: str
    subject: str
    description: str
    priority: str = "MEDIUM"
    status: str = "OPEN"
    transaction_id: Optional[str] = None


class SupportTicketUpdate(BaseModel):
    priority: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    resolution: Optional[str] = None


class SupportTicketResponse(BaseModel):
    id: int
    ticket_id: str
    customer_id: str
    subject: str
    description: str
    priority: str
    status: str
    transaction_id: Optional[str] = None
    resolution: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True