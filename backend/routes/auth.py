from fastapi import APIRouter, Depends, HTTPException, Header
from bson import ObjectId
from database.mongodb import get_database
from models.user import UserProfileUpdate, UserProfileResponse
from config import settings
import jwt

router = APIRouter(prefix="/auth", tags=["auth"])

async def get_current_user_id(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("userId")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token verification failed")

@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(user_id: str = Depends(get_current_user_id)):
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserProfileResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        onboarded=user.get("onboarded", False),
        age=user.get("age"),
        height=user.get("height"),
        weight=user.get("weight"),
        bloodGroup=user.get("bloodGroup"),
        activityLevel=user.get("activityLevel"),
        allergies=user.get("allergies"),
        existingConditions=user.get("existingConditions"),
    )

@router.post("/profile", response_model=UserProfileResponse)
async def update_profile(profile_data: UserProfileUpdate, user_id: str = Depends(get_current_user_id)):
    db = get_database()
    update_dict = {k: v for k, v in profile_data.model_dump(exclude_unset=True).items() if v is not None}
    
    if update_dict:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_dict}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return UserProfileResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        onboarded=user.get("onboarded", False),
        age=user.get("age"),
        height=user.get("height"),
        weight=user.get("weight"),
        bloodGroup=user.get("bloodGroup"),
        activityLevel=user.get("activityLevel"),
        allergies=user.get("allergies"),
        existingConditions=user.get("existingConditions"),
    )
