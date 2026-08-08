from datetime import date
from pydantic import BaseModel


class IncomeCreate(BaseModel):
    source: str
    amount: float
    description: str | None = None
    date: date


class IncomeResponse(BaseModel):
    id: int
    source: str
    amount: float
    description: str | None = None
    date: date
    owner_id: int

    class Config:
        from_attributes = True