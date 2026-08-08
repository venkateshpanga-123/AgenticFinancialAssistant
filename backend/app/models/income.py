from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    date = Column(Date, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship(
        "User",
        back_populates="incomes"
    )