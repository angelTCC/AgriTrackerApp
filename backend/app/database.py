from pymongo import MongoClient
from dotenv import load_dotenv
import os
load_dotenv(dotenv_path=".env.secret")

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["users"]
users_collection = db["people"]

