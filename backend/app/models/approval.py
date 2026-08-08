from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime

from app.database.database import Base


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)

    transaction_id = Column(
        String(100),
        nullable=False,
        index=True
    )

    action = Column(
        String(100),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    risk_level = Column(
        String(20),
        nullable=False
    )

    reason = Column(
        Text,
        nullable=False
    )

    status = Column(
        String(30),
        default="PENDING"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    reviewed_at = Column(
        DateTime,
        nullable=True
    )

    reviewer_note = Column(
        Text,
        nullable=True
    )