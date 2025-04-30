from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from ..models.user_model import UserCreate, FieldData
from ..utils.auth import encode_token, decode_token, outh2_scheme
from ..database import users_collection

router = APIRouter()

@router.post("/token")
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = users_collection.find_one({"username": form_data.username})
    if not user or form_data.password != user["password"]:
        raise HTTPException(status_code=400, detail='Incorrect username or password')
    token = encode_token({"username": user["username"], "email": user["email"]})
    return {"access_token": token}

@router.get("/users/profile")
def get_user_profile(my_user: Annotated[dict, Depends(decode_token)]):
    return my_user

@router.post("/register")
def register_user(user: UserCreate):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already taken")
    users_collection.insert_one(user.model_dump())
    return {"message": "User registered successfully"}

@router.get("/get-fields")
def get_fields(token: str = Depends(outh2_scheme)):
    user_data = decode_token(token)
    user = users_collection.find_one({"username": user_data["username"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.get("field_data", [])

@router.post("/add-field-data")
def add_field_data(field_data: FieldData, token: str = Depends(outh2_scheme)):
    user_data = decode_token(token)
    username = user_data["username"]
    user = users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    users_collection.update_one(
        {"username": username},
        {"$push": {"field_data": field_data.model_dump()}}
    )
    return {"message": "Field data added successfully"}
