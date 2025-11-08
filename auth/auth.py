from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import jwt
import os

app = FastAPI()
# Read the secret from the environment variable for security best practice
SECRET = os.environ.get("JWT_SECRET", "default-streamlinepay-secret") 

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(req: LoginRequest):
    if req.email == "admin@streamlinepay.com" and req.password == "secure":
        token = jwt.encode({"email": req.email}, SECRET, algorithm="HS256")
        return {"token": token}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/health")
def health():
    return "Auth service is healthy"