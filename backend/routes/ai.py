from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from database.mongodb import get_database
from routes.auth import get_current_user_id
from bson import ObjectId
from config import settings
import logging
import base64
import httpx

logger = logging.getLogger("healthbeast.ai")

router = APIRouter(prefix="/ai", tags=["ai"])

def generate_expert_fallback(message: str, user: dict, symptoms_list: list, meds_list: list, reports_list: list) -> str:
    msg = message.lower()
    
    # Extract user details
    name = user.get("name", "HealthBeast User")
    age = user.get("age", "N/A")
    weight = user.get("weight", "N/A")
    height = user.get("height", "N/A")
    activity = user.get("activityLevel", "Moderate")
    allergies = user.get("allergies", "")
    conditions = user.get("existingConditions", "")
    
    symptoms_str = ", ".join(symptoms_list) if symptoms_list else "None active"
    meds_str = ", ".join(meds_list) if meds_list else "None scheduled"
    reports_str = "; ".join(reports_list) if reports_list else "No reports uploaded"
    
    intro = (
        f"### 🩺 HealthBeast Clinical Guard (Local Engine Mode)\n\n"
        f"Hello **{name}**. I am running in local clinical mode to analyze your biometrics telemetry and provide clinical guidance.\n\n"
        f"**Active Telemetry Profile:**\n"
        f"- **Vitals Profile:** Age {age} | Weight {weight} kg | Height {height} cm | Activity: {activity}\n"
        f"- **Allergies & Conditions:** Allergies: {allergies or 'None logged'} | Conditions: {conditions or 'None logged'}\n"
        f"- **Current Symptoms:** {symptoms_str}\n"
        f"- **Active Medications:** {meds_str}\n\n"
    )
    
    body = ""
    
    # 1. Check for Greetings
    if any(k in msg for k in ["hello", "hi", "hey", "greetings", "introduce", "who are you", "help"]):
        body = (
            f"How can I assist your health and wellness goals today?\n\n"
            f"You can ask me questions about your logged symptoms, medication schedule, or wellness recommendations. For instance:\n"
            f"- *'How can I recover from my active symptoms?'*\n"
            f"- *'Tell me about my medication checklist.'*\n"
            f"- *'What diet should I follow?'*\n"
        )
    # 2. Check for Symptoms
    elif any(k in msg for k in ["symptom", "pain", "feel", "hurt", "ache", "sore", "headache", "dehydrat", "fatigue", "acidity", "insomnia"]):
        body = "#### 📋 Clinical Symptom Analysis & Recovery Advice:\n\n"
        if symptoms_list:
            body += f"You currently have active symptom telemetry logs: **{symptoms_str}**.\n\n"
            for sym in symptoms_list:
                sym_lower = sym.lower()
                if "dehydration" in sym_lower:
                    body += (
                        f"👉 **Dehydration Recommendations:**\n"
                        f"  - Increase water intake immediately (aim for an extra 500ml-1L today).\n"
                        f"  - Sip electrolyte-rich drinks like coconut water or isotonic fluids.\n"
                        f"  - Avoid caffeinated or sugary beverages which can exacerbate fluid loss.\n\n"
                    )
                elif "fatigue" in sym_lower:
                    body += (
                        f"👉 **Fatigue & Energy Recovery:**\n"
                        f"  - Ensure solid sleep hygiene (7-8 hours). Limit screens 1 hour before bed.\n"
                        f"  - Focus on nutrient-dense foods: spinach, complex carbs, and clean proteins.\n"
                        f"  - Limit quick refined sugars which trigger subsequent energy crashes.\n\n"
                    )
                elif "soreness" in sym_lower or "muscle" in sym_lower:
                    body += (
                        f"👉 **Muscle Recovery Protocols:**\n"
                        f"  - Support muscle protein synthesis with high-quality protein (Greek yogurt, lean meats, or plant-based protein).\n"
                        f"  - Ensure adequate magnesium intake to help muscles relax and prevent cramping.\n"
                        f"  - Active recovery (light stretching or walking) can boost circulation and clear metabolic waste.\n\n"
                    )
                elif "headache" in sym_lower or "migraine" in sym_lower:
                    body += (
                        f"👉 **Headache Management:**\n"
                        f"  - Primary trigger is often dehydration; start by slowly drinking a tall glass of water.\n"
                        f"  - Rest in a quiet, dark environment to soothe sensory networks.\n"
                        f"  - Gently massage temple pressure points or apply a cold compress to your forehead.\n\n"
                    )
                elif "acidity" in sym_lower:
                    body += (
                        f"👉 **Acidity & Digestive Support:**\n"
                        f"  - Avoid acid triggers: coffee, spicy foods, carbonation, and citrus fruits.\n"
                        f"  - Opt for alkaline foods such as oatmeal, bananas, and almond milk.\n"
                        f"  - Eat smaller, more frequent meals and avoid lying down for at least 2 hours post-meal.\n\n"
                    )
                elif "insomnia" in sym_lower:
                    body += (
                        f"👉 **Sleep Adherence Protocols:**\n"
                        f"  - Discontinue caffeine intake past 2:00 PM.\n"
                        f"  - Try a soothing herbal infusion like chamomile or lavender tea in the evening.\n"
                        f"  - Maintain a dark, cool sleeping space (65-68°F / 18-20°C) to optimize melatonin production.\n\n"
                    )
            body += "For any general symptom flare-ups, prioritize rest, tracking, and incremental hydration."
        else:
            body += (
                "You do not have any active symptoms logged in your dashboard today. Excellent baseline!\n\n"
                "If you are feeling unwell, please log a symptom from the *Symptom Hub* so I can customize your recovery protocols."
            )
            
    # 3. Check for Medications / Pills
    elif any(k in msg for k in ["medication", "meds", "pill", "drug", "tablet", "dosage", "schedule", "take"]):
        body = "#### 💊 Active Medication & Supplement Tracker:\n\n"
        if meds_list:
            body += f"You have the following scheduled medication/supplement checklist items:\n\n"
            for med in meds_list:
                body += f"- **{med}**\n"
            body += (
                "\n*Usage Guideline:* Be sure to check these off in your dashboard checklist daily. "
                "Do not skip doses unless advised by your healthcare provider. If you experience adverse reactions, consult your physician."
            )
        else:
            body += (
                "No medications or supplements are currently scheduled in your dashboard checklist.\n\n"
                "If you have daily supplements (e.g. Vitamin D3, Omega-3s) or prescriptions, you can add them in the medications page."
            )
            
    # 4. Check for Water / Hydration
    elif any(k in msg for k in ["water", "drink", "fluid", "hydrate", "hydration"]):
        body = (
            "#### 💧 Hydration & Fluid Balance:\n\n"
            "Hydration is key to cellular health, cognitive performance, and metabolic telemetry.\n\n"
            f"Based on your profile, your daily baseline goal is calculated automatically. Current symptoms (**{symptoms_str}**) "
            "and medication counts dictate your active hydration goal.\n\n"
            "**Optimal Fluid Strategy:**\n"
            "- Sip water consistently throughout the day rather than chugging large volumes at once.\n"
            "- Limit diuretics (like espresso or energy drinks) which can hasten electrolyte loss."
        )
        
    # 5. Check for Diet / Nutrition
    elif any(k in msg for k in ["diet", "food", "eat", "nutrition", "meal", "carb", "protein", "fat"]):
        body = "#### 🍏 Personal Diet & Nutrition Plan:\n\n"
        if symptoms_list:
            body += f"Correlating diet plans for your logged symptoms: **{symptoms_str}**.\n\n"
            body += "Recommended foods to include:\n"
            if any("dehydration" in s.lower() for s in symptoms_list):
                body += "- Isotonic foods: Coconut water, watermelon, oranges, celery.\n"
            if any("fatigue" in s.lower() for s in symptoms_list):
                body += "- Energizing nutrients: Spinach, quinoa, avocados, chia seeds, lean fish.\n"
            if any("soreness" in s.lower() for s in symptoms_list):
                body += "- Anti-inflammatory/Recovery: Tart cherry juice, wild salmon, Greek yogurt, walnuts.\n"
            if any("headache" in s.lower() for s in symptoms_list):
                body += "- Vascular support: Almonds (magnesium), ginger tea, hydration cucumbers.\n"
            if any("acidity" in s.lower() for s in symptoms_list):
                body += "- Soothing/Alkaline: Oatmeal, bananas, almond milk, fennel.\n"
            if any("insomnia" in s.lower() for s in symptoms_list):
                body += "- Tryptophan & Serotonin precursors: Kiwi, chamomile tea, pumpkin seeds.\n"
                
            body += "\nEnsure you avoid ultra-processed foods, refined seed oils, and excessive sugar."
        else:
            body += (
                "**General Longevity Diet Guidance:**\n"
                "- Prioritize whole, unprocessed foods.\n"
                "- Incorporate polyphenol-rich fruits (berries) and cruciferous leafy greens.\n"
                "- Keep healthy fats high (olive oil, avocados, raw nuts) to support brain health.\n"
                "- Ensure structured protein intake tailored to your active lifestyle."
            )
            
    # 6. Check for Reports / Labs
    elif any(k in msg for k in ["report", "lab", "blood", "vital", "test", "pdf"]):
        body = "#### 📄 Clinical Report Analysis:\n\n"
        if reports_list:
            body += f"You have the following clinical documents uploaded:\n\n"
            for rep in reports_list:
                body += f"- **{rep}**\n"
            body += "\nOur parsing helper extracts telemetry metrics from reports to update your global vitals checklist."
        else:
            body += (
                "No clinical reports or blood panels are uploaded in your database currently.\n\n"
                "You can drag and drop a PDF or image of your lab report in the Analytics hub, and I will parse it."
            )
    
    # 7. Default comprehensive health response
    else:
        body = (
            "#### 📊 Wellness Summary & Next Steps:\n\n"
            f"Based on your user profile and active telemetry logs, here is your health summary:\n"
            f"- **Active Issues:** {symptoms_str if symptoms_list else 'No current issues. All parameters normal.'}\n"
            f"- **Medication Schedule:** {meds_str}\n"
            f"- **Clinical Reports:** {reports_str}\n\n"
            "**Action Checklist:**\n"
            "1. Check off active medications as you take them.\n"
            "2. Track water logs to hit your dynamic daily target.\n"
            "3. Keep symptom logs updated so we can tailor dietary advice."
        )
        
    disclaimer = (
        "\n\n---\n"
        "*⚠️ **Medical Disclaimer:** HealthBeast AI provides wellness support and health telemetry tracking. "
        "It is not a substitute for professional clinical advice, diagnosis, or treatment. "
        "Always consult a qualified physician or healthcare provider regarding any medical condition or drug regimen.*"
    )
    
    return intro + body + disclaimer

class ChatRequest(BaseModel):
    message: str
    image: Optional[str] = None  # Base64 image data URL (if attached)

@router.post("/chat")
async def chat_with_assistant(request: ChatRequest, user_id: str = Depends(get_current_user_id)):
    db = get_database()
    
    # 1. Fetch user profile
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 2. Fetch logged symptoms
    symptoms_cursor = db.symptoms.find({"userId": user_id})
    symptoms = [f"{doc['name']} (Severity: {doc['severity']})" async for doc in symptoms_cursor]
    symptoms_str = ", ".join(symptoms) if symptoms else "None logged"
    
    # 3. Fetch medications
    meds_cursor = db.medications.find({"userId": user_id})
    meds = [f"{doc['name']} ({doc['dosage']} at {doc['time']})" async for doc in meds_cursor]
    meds_str = ", ".join(meds) if meds else "None logged"
    
    # 4. Fetch parsed report indicators
    reports_cursor = db.reports.find({"userId": user_id})
    reports = [f"{doc['name']} - Parsed: {doc.get('extractedVitals', 'None')}" async for doc in reports_cursor]
    reports_str = "; ".join(reports) if reports else "None uploaded"

    # Construct context
    user_name = user.get("name", "User")
    age = user.get("age", "Unknown")
    weight = user.get("weight", "Unknown")
    allergies = user.get("allergies", "None")
    conditions = user.get("existingConditions", "None")
    
    system_instruction = (
        f"You are HealthBeast AI, a clinical-grade health companion inspired by premium digital health apps.\n"
        f"The user's name is {user_name}.\n"
        f"User Details: Age {age}, Weight {weight} kg.\n"
        f"Allergies: {allergies}\n"
        f"Existing Medical Conditions: {conditions}\n"
        f"Currently Logged Symptoms: {symptoms_str}\n"
        f"Active Medications/Supplements checklist: {meds_str}\n"
        f"Uploaded Clinical Reports: {reports_str}\n\n"
        f"Respond to the user's prompt using this background. Keep the advice structured, clinically sound, "
        f"focused on wellness/longevity, and easy to understand. Never make up data. If you recommend supplements, "
        f"refer to their active list. Always include a standard medical disclaimer reminding them to consult their doctor."
    )

    # 5. Connect and call Gemini
    api_key = settings.GOOGLE_API_KEY
    if not api_key:
        logger.info("No GOOGLE_API_KEY found in settings. Falling back to HealthBeast local expert engine.")
        fallback_text = generate_expert_fallback(request.message, user, symptoms, meds, reports)
        return {"response": fallback_text}

    try:
        headers = {"Content-Type": "application/json"}
        if api_key.startswith("AQ."):
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
            headers["Authorization"] = f"Bearer {api_key}"
        else:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        
        parts = []
        if request.image:
            try:
                # Strip data:image/...;base64, prefix
                header, encoded = request.image.split(",", 1)
                mime_type = header.split(";")[0].split(":")[1]
                parts.append({
                    "inlineData": {
                        "mimeType": mime_type,
                        "data": encoded
                    }
                })
            except Exception as img_err:
                logger.error(f"Failed to parse attached image: {str(img_err)}")
                # We skip image if parsing fails rather than crashing
                
        parts.append({"text": request.message})
        
        payload = {
            "contents": [
                {
                    "parts": parts
                }
            ],
            "systemInstruction": {
                "parts": [
                    {"text": system_instruction}
                ]
            }
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code != 200:
                logger.error(f"Gemini API Error Response: {response.text}")
                raise Exception(f"HTTP {response.status_code}: {response.text}")
                
            data = response.json()
            try:
                reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"response": reply_text}
            except (KeyError, IndexError) as e:
                logger.error(f"Gemini parsed error on response data: {data}")
                raise Exception("Failed to retrieve generated content parts from Gemini API response.")

    except Exception as e:
        logger.error(f"Gemini API Error: {str(e)}. Falling back to HealthBeast local expert engine.")
        fallback_text = generate_expert_fallback(request.message, user, symptoms, meds, reports)
        return {"response": fallback_text}

