from pydantic import BaseModel
from typing import Optional

class SymptomCreate(BaseModel):
    name: str
    severity: str  # "Low" | "Medium" | "High"
    dangerValue: int
    recoveryValue: int

class SymptomResponse(BaseModel):
    id: str
    name: str
    severity: str
    dangerValue: int
    recoveryValue: int
    date: str

class WaterLog(BaseModel):
    amount: int  # relative change in ml (e.g. 250) or absolute amount

class WaterResponse(BaseModel):
    waterIntake: int
    waterGoal: int
