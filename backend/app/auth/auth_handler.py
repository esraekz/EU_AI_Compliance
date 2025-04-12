# zoku/backend/app/auth/auth_handler.py
import os
import time
import jwt
from typing import Dict
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

# Load JWT secrets from environment variables
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

if not JWT_SECRET:
    raise ValueError("JWT_SECRET not found in environment variables")

security = HTTPBearer()


def token_response(token: str):
    """Return a token response"""
    return {
        "access_token": token,
        "token_type": "bearer"
    }


def sign_jwt(user_id: str, email: str) -> Dict[str, str]:
    """Create a new JWT for a user"""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": time.time() + 24 * 60 * 60  # 24 hour expiration
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token_response(token)


def decode_jwt(token: str) -> Dict:
    """Decode a JWT token"""
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        # Check if token is expired
        if decoded_token["exp"] < time.time():
            return None

        return decoded_token
    except:
        return None


async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Get the current user from JWT token"""
    token = credentials.credentials
    payload = decode_jwt(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = {
        "id": payload["user_id"],
        "email": payload["email"]
    }

    return user
