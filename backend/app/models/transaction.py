from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from app.database.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    transaction_id = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    customer_id = Column(
        String(100),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    payment_method = Column(
        String(50),
        nullable=False
    )

    status = Column(
        String(50),
        default="SUCCESS"
    )

    failure_reason = Column(
        String(255),
        nullable=True
    )

    dispute_status = Column(
        String(50),
        default="NONE"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )