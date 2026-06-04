from pydantic import BaseModel, Field
from typing import Optional

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    bloodGroup: Optional[str] = None
    activityLevel: Optional[str] = None
    allergies: Optional[str] = None
    existingConditions: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    onboarded: bool
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    bloodGroup: Optional[str] = None
    activityLevel: Optional[str] = None
    allergies: Optional[str] = None
    existingConditions: Optional[str] = None
