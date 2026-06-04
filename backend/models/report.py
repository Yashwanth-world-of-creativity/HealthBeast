from pydantic import BaseModel
from typing import Optional

class ReportCreate(BaseModel):
    name: str
    size: str
    category: str
    extractedVitals: Optional[str] = None
    matchedSymptom: Optional[str] = None

class ReportResponse(BaseModel):
    id: str
    name: str
    size: str
    category: str
    extractedVitals: Optional[str] = None
    matchedSymptom: Optional[str] = None
    date: str
