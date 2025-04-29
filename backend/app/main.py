from fastapi import FastAPI
from app.routes import auth

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # o solo tu IP si prefieres más seguridad
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])  # <- sin prefix="/auth"

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}