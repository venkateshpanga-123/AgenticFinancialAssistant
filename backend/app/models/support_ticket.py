from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from app.database.database import Base


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    ticket_id = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    customer_id = Column(
        String(100),
        nullable=False
    )

    subject = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    priority = Column(
        String(30),
        default="MEDIUM"
    )

    status = Column(
        String(30),
        default="OPEN"
    )

    transaction_id = Column(
        String(100),
        nullable=True
    )

    resolution = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )