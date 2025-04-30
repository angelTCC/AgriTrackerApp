# Import FastAPI components and tools for authentication and request handling
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

# Import Pydantic models for user and field data
from ..models.user_model import UserCreate, FieldData

# Import helper functions and dependencies for token handling and authentication
from ..utils.auth import encode_token, decode_token, outh2_scheme

# Import the MongoDB users collection
from ..database import users_collection

# Create a router object to define routes in this module
router = APIRouter()


# -----------------------------------------------------------------------
# Login endpoint to obtain a token
@router.post("/token")
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    # Find the user in the database by username
    user = users_collection.find_one({"username": form_data.username})

    # If user doesn't exist or password doesn't match, raise an error
    if not user or form_data.password != user["password"]:
        raise HTTPException(status_code=400, detail='Incorrect username or password')

    # If login is valid, generate a JWT token
    token = encode_token({"username": user["username"], "email": user["email"]})

    # Return the token
    return {"access_token": token}

# -----------------------------------------------------------------------
# Endpoint to get the authenticated user's profile
@router.get("/users/profile")
def get_user_profile(my_user: Annotated[dict, Depends(decode_token)]):
    # This returns the user document extracted from the JWT token
    return my_user

# -----------------------------------------------------------------------
# Register endpoint to create a new user
@router.post("/register")
def register_user(user: UserCreate):
    # Check if the username already exists in the database
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    # Insert the new user into the collection (as a dictionary)
    users_collection.insert_one(user.model_dump())

    return {"message": "User registered successfully"}

# -----------------------------------------------------------------------
# Endpoint to get all field data associated with the logged-in user
@router.get("/get-fields")
def get_fields(token: str = Depends(outh2_scheme)):
    # Decode the token to get user info
    user_data = decode_token(token)

    # Look up the user in the database
    user = users_collection.find_one({"username": user_data["username"]})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return the user's field data or an empty list if none exists
    return user.get("field_data", [])

# -----------------------------------------------------------------------
# Endpoint to add new field data to the user's document
@router.post("/add-field-data")
def add_field_data(field_data: FieldData, token: str = Depends(outh2_scheme)):
    # Decode token to get username
    user_data = decode_token(token)
    username = user_data["username"]

    # Find user in the database
    user = users_collection.find_one({"username": username})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Add the new field data (converted to dictionary) into the user's document
    users_collection.update_one(
        {"username": username},
        {"$push": {"field_data": field_data.model_dump()}}
    )

    return {"message": "Field data added successfully"}
