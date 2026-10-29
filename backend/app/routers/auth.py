import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.database import Session
from backend.app.database import get_db
from backend.app.models import User, ProgressTimeline
from backend.app.schemas import UserRegister, UserLogin, UserOut, TokenResponse, ApiResponse
from backend.app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=ApiResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    if req.confirmPassword and req.password != req.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    normalized_email = req.email.strip().lower()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email address already exists.")

    user_id = "usr_" + uuid.uuid4().hex[:10]
    pwd_hash = hash_password(req.password)

    new_user = User(
        id=user_id,
        name=req.name.strip(),
        email=normalized_email,
        password_hash=pwd_hash,
        is_onboarded=False
    )
    db.add(new_user)

    # Initial timeline event
    timeline = ProgressTimeline(
        id="ev_" + uuid.uuid4().hex[:10],
        user_id=user_id,
        type="account",
        title="Account Registered",
        description="Welcome to the Career Guidance Framework."
    )
    db.add(timeline)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"userId": new_user.id, "email": new_user.email, "name": new_user.name})

    user_out = UserOut(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        isOnboarded=new_user.is_onboarded,
        targetCareerId=new_user.target_career_id
    )

    return ApiResponse(
        success=True,
        data={"token": token, "user": user_out.model_dump()},
        message="Account registered successfully."
    )

@router.post("/login", response_model=ApiResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    normalized_email = req.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"userId": user.id, "email": user.email, "name": user.name})

    user_out = UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        isOnboarded=user.is_onboarded,
        targetCareerId=user.target_career_id
    )

    return ApiResponse(
        success=True,
        data={"token": token, "user": user_out.model_dump()},
        message="Login successful."
    )

@router.get("/me", response_model=ApiResponse)
def get_me(current_user: User = Depends(get_current_user)):
    user_out = UserOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        isOnboarded=current_user.is_onboarded,
        targetCareerId=current_user.target_career_id
    )
    user_dict = user_out.model_dump()
    return ApiResponse(
        success=True,
        data={**user_dict, "user": user_dict},
        message="Current user profile retrieved."
    )

@router.post("/change-password", response_model=ApiResponse)
def change_password(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_pwd = data.get("currentPassword", "")
    new_pwd = data.get("newPassword", "")

    if not verify_password(current_pwd, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if len(new_pwd) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")

    current_user.password_hash = hash_password(new_pwd)
    db.commit()
    return ApiResponse(success=True, message="Password changed successfully.")

@router.delete("/account", response_model=ApiResponse)
def delete_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    return ApiResponse(success=True, message="Account deleted successfully.")
