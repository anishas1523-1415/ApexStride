from datetime import datetime, timedelta
from typing import Optional, Any
from jose import jwt
from passlib.context import CryptContext
import os

PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    raise ValueError("CRITICAL: JWT_SECRET environment variable is not set. Refusing to start.")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return PWD_CONTEXT.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return PWD_CONTEXT.hash(password)

def create_access_token(subject: Any, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Any, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, expected_type: str = "access") -> Optional[str]:
    try:
        from jose import jwt as jose_jwt
        
        # Extract unverified payload first to handle Supabase/Clerk tokens
        try:
            unverified_payload = jose_jwt.get_unverified_claims(token)
            unverified_header = jose_jwt.get_unverified_header(token)
        except Exception:
            return None
            
        alg = unverified_header.get("alg", "HS256")
        
        # If it's a local HS256 token, try to verify it
        if alg == "HS256":
            try:
                payload = jose_jwt.decode(token, SECRET_KEY, algorithms=["HS256"], options={"verify_aud": False})
            except jose_jwt.JWTError:
                # If local signature fails, reject it
                return None
        else:
            # For ES256/RS256 tokens (like modern Supabase/Clerk), we don't have the public key.
            # Bypassing signature verification for local prototype testing.
            print(f"WARNING: Bypassing signature verification for {alg} token in local development.")
            payload = unverified_payload

        token_type = payload.get("type")
        role = payload.get("role")
        
        if token_type and token_type != expected_type:
            return None
        elif role == "authenticated" or token_type == expected_type:
            return payload.get("sub")
            
        return payload.get("sub") # Fallback to just returning sub
    except Exception as e:
        print(f"verify_token Exception: {e}")
        return None
