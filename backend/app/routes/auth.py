from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated
from jose import jwt
from pydantic import BaseModel

from pymongo import MongoClient

MONGO_URI = "mongodb+srv://baldwin:1234@cluster0.1lqjyfr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["users"]  # your database name
users_collection = db["people"]  # your users collection

router = APIRouter()

outh2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def encode_token(payload: dict) -> str:
    token = jwt.encode(payload, "my-secret-key", algorithm="HS256")
    return token

def decode_token(token: Annotated[str, Depends(outh2_scheme)]) -> dict:
    data = jwt.decode(token, "my-secret-key", algorithms=["HS256"])
    user = users_collection.find_one({"username": data["username"]})    
    return user

@router.post("/token")
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = users_collection.find_one({"username": form_data.username})
    
    if not user or form_data.password != user["password"]:
        raise HTTPException(status_code=400, detail='Incorrect username or password')
    
    token = encode_token({"username": user["username"], "email": user["email"]})

    return { "access_token": token }

@router.get("/users/profile")
def get_user_profile(my_user: Annotated[dict, Depends(decode_token)]):
    return my_user



# Register Model (receive data from the frontend)
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

# Define the data model for field data
class FieldData(BaseModel):
    field_name: str
    crop_type: str
    area_size: float
    planting_date: str
    harvest_date: str


# Function to register a user
@router.post("/register")
def register_user(user: UserCreate):
    
    # Check if the username already exists
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    # Insert the new user into the database
    new_user = {
        "username": user.username,
        "email": user.email,
        "password": user.password  # Storing the password as plain text (not recommended in real apps)
    }
    users_collection.insert_one(new_user)
    return {"message": "User registered successfully"}

@router.get("/get-fields")
def get_fields(token: str = Depends(outh2_scheme)):
    user_data = decode_token(token)
    username = user_data["username"]

    user = users_collection.find_one({"username": username})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # If the user has no field data yet, return an empty list
    field_data = user.get("field_data", [])

    return field_data



# Add field data to the user's document in the "people" collection
@router.post("/add-field-data")
def add_field_data(field_data: FieldData, token: str = Depends(outh2_scheme)):
    user_data = decode_token(token)
    username = user_data["username"]
    
    # Find the user in the "people" collection by username
    user = users_collection.find_one({"username": username})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Add the field data to the user's "field_data" list
    field_data_dict = field_data.model_dump() 
    
    # Update the user document with the new field data
    users_collection.update_one(
        {"username": username}, 
        {"$push": {"field_data": field_data_dict}}
    )
    
    return {"message": "Field data added successfully"}
