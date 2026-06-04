from fastapi import APIRouter, Depends, HTTPException
from database.mongodb import get_database
from models.health import SymptomCreate, SymptomResponse, WaterLog, WaterResponse
from models.medication import MedicationCreate, MedicationResponse
from routes.auth import get_current_user_id
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter(prefix="/health", tags=["health"])

# SYMPTOMS
@router.get("/symptoms", response_model=List[SymptomResponse])
async def get_symptoms(user_id: str = Depends(get_current_user_id)):
    db = get_database()
    cursor = db.symptoms.find({"userId": user_id})
    symptoms = []
    async for doc in cursor:
        symptoms.append(SymptomResponse(
            id=str(doc["_id"]),
            name=doc["name"],
            severity=doc["severity"],
            dangerValue=doc["dangerValue"],
            recoveryValue=doc["recoveryValue"],
            date=doc["date"]
        ))
    return symptoms

@router.post("/symptoms", response_model=SymptomResponse)
async def log_symptom(symptom: SymptomCreate, user_id: str = Depends(get_current_user_id)):
    db = get_database()
    date_str = datetime.now().strftime("%b %d")
    
    doc = symptom.model_dump()
    doc["userId"] = user_id
    doc["date"] = date_str
    
    result = await db.symptoms.insert_one(doc)
    
    return SymptomResponse(
        id=str(result.inserted_id),
        name=symptom.name,
        severity=symptom.severity,
        dangerValue=symptom.dangerValue,
        recoveryValue=symptom.recoveryValue,
        date=date_str
    )

@router.delete("/symptoms/{symptom_id}")
async def delete_symptom(symptom_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_database()
    result = await db.symptoms.delete_one({"_id": ObjectId(symptom_id), "userId": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Symptom log not found")
    return {"message": "Symptom log removed successfully"}

# MEDICATIONS
@router.get("/medications", response_model=List[MedicationResponse])
async def get_medications(user_id: str = Depends(get_current_user_id)):
    db = get_database()
    cursor = db.medications.find({"userId": user_id})
    meds = []
    async for doc in cursor:
        meds.append(MedicationResponse(
            id=str(doc["_id"]),
            name=doc["name"],
            dosage=doc["dosage"],
            time=doc["time"],
            targetSymptom=doc["targetSymptom"],
            taken=doc.get("taken", False),
            requiresConsultation=doc.get("requiresConsultation", False)
        ))
    return meds

@router.post("/medications", response_model=MedicationResponse)
async def add_medication(med: MedicationCreate, user_id: str = Depends(get_current_user_id)):
    db = get_database()
    doc = med.model_dump()
    doc["userId"] = user_id
    doc["taken"] = False
    
    result = await db.medications.insert_one(doc)
    
    return MedicationResponse(
        id=str(result.inserted_id),
        name=med.name,
        dosage=med.dosage,
        time=med.time,
        targetSymptom=med.targetSymptom,
        taken=False,
        requiresConsultation=med.requiresConsultation
    )

@router.put("/medications/{med_id}/toggle", response_model=MedicationResponse)
async def toggle_medication(med_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_database()
    doc = await db.medications.find_one({"_id": ObjectId(med_id), "userId": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    new_taken = not doc.get("taken", False)
    await db.medications.update_one(
        {"_id": ObjectId(med_id)},
        {"$set": {"taken": new_taken}}
    )
    
    return MedicationResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        dosage=doc["dosage"],
        time=doc["time"],
        targetSymptom=doc["targetSymptom"],
        taken=new_taken,
        requiresConsultation=doc.get("requiresConsultation", False)
    )

@router.delete("/medications/{med_id}")
async def delete_medication(med_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_database()
    result = await db.medications.delete_one({"_id": ObjectId(med_id), "userId": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")
    return {"message": "Medication removed successfully"}

# WATER INTAKE
@router.get("/water", response_model=WaterResponse)
async def get_water(user_id: str = Depends(get_current_user_id)):
    db = get_database()
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    record = await db.water_intake.find_one({"userId": user_id, "date": today_str})
    water_intake = record["amount"] if record else 0
    
    base_goal = 2000
    symptoms_count = await db.symptoms.count_documents({"userId": user_id})
    meds_count = await db.medications.count_documents({"userId": user_id})
    water_goal = base_goal + (symptoms_count * 200) + (meds_count * 150)
    
    return WaterResponse(waterIntake=water_intake, waterGoal=water_goal)

@router.post("/water", response_model=WaterResponse)
async def log_water(log: WaterLog, user_id: str = Depends(get_current_user_id)):
    db = get_database()
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    record = await db.water_intake.find_one({"userId": user_id, "date": today_str})
    
    if log.amount == 0:
        current_amount = 0
    else:
        current_amount = record["amount"] if record else 0
        current_amount = max(0, current_amount + log.amount)
        
    await db.water_intake.update_one(
        {"userId": user_id, "date": today_str},
        {"$set": {"amount": current_amount}},
        upsert=True
    )
    
    base_goal = 2000
    symptoms_count = await db.symptoms.count_documents({"userId": user_id})
    meds_count = await db.medications.count_documents({"userId": user_id})
    water_goal = base_goal + (symptoms_count * 200) + (meds_count * 150)
    
    return WaterResponse(waterIntake=current_amount, waterGoal=water_goal)
