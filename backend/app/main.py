# Import FastAPI main class
from fastapi import FastAPI

# Import the authentication router from your app
from app.routes import auth

# Import CORS middleware to handle cross-origin requests
from fastapi.middleware.cors import CORSMiddleware

# Create an instance of the FastAPI application
app = FastAPI()

# Add middleware to allow Cross-Origin Resource Sharing (CORS)
# This allows your API to be accessed from any frontend (like React Native or web)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any domain
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Allow all HTTP methods: GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Allow all headers in requests
)

# Include the auth router under the path /auth
# All routes defined in auth.router will now be prefixed with /auth
app.include_router(auth.router, prefix="/auth", tags=["auth"])

# Define a basic root endpoint
@app.get("/")
def read_root():
    return {"message": "Hello, World!"}  # This will respond when accessing the base URL (e.g., http://localhost:8000/)
