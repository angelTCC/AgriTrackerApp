from pydantic import BaseModel

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