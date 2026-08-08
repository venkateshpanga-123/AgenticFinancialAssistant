from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.user import UserCreate
from app.services.user_service import (
    create_user,
    authenticate_user
)
from app.auth.jwt_handler import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    try:

        new_user = create_user(
            db=db,
            name=user.name,
            email=user.email,
            password=user.password
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "email": new_user.email
    }


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = authenticate_user(
        db=db,
        email=form_data.username,
        password=form_data.password
    )

    if not db_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        data={
            "sub": db_user.email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "email": db_user.email,
        "user_id": db_user.id
    }