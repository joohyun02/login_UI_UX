from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import jwt, JWTError, ExpiredSignatureError
from datetime import datetime, timedelta
import sqlite3

security = HTTPBearer()

SECRET_KEY = "dev-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SignupRequest(BaseModel):
    id: str
    password: str
    name: str
    email: str

class LoginRequest(BaseModel):
    id: str
    password: str

def get_db():
    conn = sqlite3.connect("users.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/signup")
def signup(data: SignupRequest):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE id = ?", (data.id,))
    if cursor.fetchone():
        conn.close()
        return {"ok": False, "message": "중복된 아이디입니다."}

    cursor.execute(
        "INSERT INTO users (id, password, name, email) VALUES (?, ?, ?, ?)",
        (data.id, hash_password(data.password), data.name, data.email)
    )

    conn.commit()
    conn.close()
    return {"ok": True}

@app.post("/login")
def login(data: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE id = ?", (data.id,))
    user = cursor.fetchone()
    conn.close()

    if user and verify_password(data.password, user["password"]):
        token = create_access_token({"sub": user["id"]})
        return {
            "ok": True,
            "access_token": token,
            "token_type": "bearer",
            "name": user["name"],
        }

    return {"ok": False, "message": "아이디 또는 비밀번호가 틀렸습니다."}

@app.get("/me")
def read_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, name, email FROM users WHERE id = ?",
        (user_id,)
    )
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
    }
