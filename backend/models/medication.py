from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Medication(BaseModel):
    id: Optional[str] = None
    userId: str
    name: str
    dosage: str
    time: str
    targetSymptom: str
    taken: bool = False
    requiresConsultation: bool = False
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class MedicationCreate(BaseModel):
    name: str
    dosage: str
    time: str
    targetSymptom: str
    requiresConsultation: bool = False
    notes: Optional[str] = None

class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    time: Optional[str] = None
    targetSymptom: Optional[str] = None
    taken: Optional[bool] = None
    requiresConsultation: Optional[bool] = None
    notes: Optional[str] = None

class MedicationResponse(BaseModel):
    id: str = Field(alias="_id")
    userId: str
    name: str
    dosage: str
    time: str
    targetSymptom: str
    taken: bool
    requiresConsultation: bool
    notes: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True
