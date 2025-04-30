from jose import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from ..database import users_collection

outh2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def encode_token(payload: dict) -> str:
    return jwt.encode(payload, "my-secret-key", algorithm="HS256")

def decode_token(token: Annotated[str, Depends(outh2_scheme)]) -> dict:
    data = jwt.decode(token, "my-secret-key", algorithms=["HS256"])
    user = users_collection.find_one({"username": data["username"]})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user
