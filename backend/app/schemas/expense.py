from datetime import date
from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    description: str | None = None
    date: date


class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    description: str | None = None
    date: date
    owner_id: int

    class Config:
        from_attributes = True