import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database import Base, engine
from .models import User  # 确保表被创建
from .auth import get_current_user  # 仅为导入触发表
from . import stress  # 新增：路由模块
from .schemas import LoginIn, UserOut
from .auth import verify_password, create_access_token
from fastapi import Depends, Response, HTTPException, status
from sqlalchemy.orm import Session
from .database import get_db
from .models import User

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kairos API")

allow_origins = [o.strip() for o in os.getenv("ALLOW_ORIGINS", "http://localhost:5173").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

# ------- 仅登录/退出/我 -------
API_PREFIX = "/api"

@app.post(f"{API_PREFIX}/auth/login", response_model=UserOut)
def login(payload: LoginIn, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username.strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    token = create_access_token(subject=user.username)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )
    return user

@app.get(f"{API_PREFIX}/auth/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)):
    return current

@app.post(f"{API_PREFIX}/auth/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"ok": True}

# ------- 压力模块路由 -------
app.include_router(stress.router)
