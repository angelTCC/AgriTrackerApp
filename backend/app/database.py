from pymongo import MongoClient

MONGO_URI = "mongodb+srv://baldwin:1234@cluster0.1lqjyfr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["users"]
users_collection = db["people"]
