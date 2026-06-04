from fastapi import APIRouter, Depends
from database.mongodb import get_database
from routes.auth import get_current_user_id

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
async def get_analytics_summary(user_id: str = Depends(get_current_user_id)):
    db = get_database()
    
    sint_cursor = db.symptoms.find({"userId": user_id})
    symptoms = [doc async for doc in sint_cursor]
    
    if not symptoms:
        return {
            "dangerIndex": 0,
            "recoveryIndex": 100,
            "lowCount": 0,
            "mediumCount": 0,
            "highCount": 0,
            "totalLogs": 0
        }
        
    danger_sum = sum(s["dangerValue"] for s in symptoms)
    recovery_sum = sum(s["recoveryValue"] for s in symptoms)
    
    danger_idx = round(danger_sum / len(symptoms))
    recovery_idx = round(recovery_sum / len(symptoms))
    
    low_count = sum(1 for s in symptoms if s["severity"] == "Low")
    med_count = sum(1 for s in symptoms if s["severity"] == "Medium")
    high_count = sum(1 for s in symptoms if s["severity"] == "High")
    
    return {
        "dangerIndex": danger_idx,
        "recoveryIndex": recovery_idx,
        "lowCount": low_count,
        "mediumCount": med_count,
        "highCount": high_count,
        "totalLogs": len(symptoms)
    }
