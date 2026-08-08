from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.auth.hashing import hash_password, verify_password


def create_user(
    db: Session,
    name: str,
    email: str,
    password: str
):
    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise ValueError(
            "An account with this email already exists"
        )

    user = User(
        name=name,
        email=email,
        password=hash_password(password)
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()

        raise ValueError(
            "An account with this email already exists"
        )

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str
):
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.password
    ):
        return None

    return user