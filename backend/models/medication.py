from pydantic import BaseModel

class MedicationCreate(BaseModel):
    name: str
    dosage: str
    time: str
    targetSymptom: str
    requiresConsultation: bool = False

class MedicationResponse(BaseModel):
    id: str
    name: str
    dosage: str
    time: str
    targetSymptom: str
    taken: bool
    requiresConsultation: bool
