from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
import uuid

from app.database import get_async_db
from app.models.db_models import User
from app.utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token
)

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str

    class Config:
        from_attributes = True

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_async_db)) -> User:
    user_id = verify_token(token, expected_type="access")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    result = await db.execute(select(User).filter(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_async_db)):
    # Check if user exists
    result = await db.execute(select(User).filter((User.username == user_in.username) | (User.email == user_in.email)))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username or email already registered")
        
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(User).filter(User.username == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest, db: AsyncSession = Depends(get_async_db)):
    user_id = verify_token(request.refresh_token, expected_type="refresh")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Optional: ensure user still exists in DB
    result = await db.execute(select(User).filter(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
         raise HTTPException(status_code=404, detail="User not found")
         
    new_access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
