from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from datetime import datetime

from app.database.database import Base


class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    action = Column(
        String(100),
        nullable=False
    )

    entity_type = Column(
        String(100),
        nullable=False
    )

    entity_id = Column(
        String(100),
        nullable=False
    )

    decision = Column(
        String(50),
        nullable=False
    )

    reason = Column(
        Text,
        nullable=False
    )

    requires_human_approval = Column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )