from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import settings
from database.mongodb import connect_to_mongo, close_mongo_connection
from routes import auth, health, report, ai, analytics

import time
import logging

# Configure basic logging format to WARNING to clean up terminal noise
logging.basicConfig(
    level=logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("healthbeast.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    try:
        await connect_to_mongo()
    except Exception as db_err:
        logger.error(f"Lifespan startup error: Failed to connect to MongoDB: {str(db_err)}")
    yield
    # Shutdown: Close Connection
    await close_mongo_connection()

app = FastAPI(
    title="HealthBeast AI API Service",
    description="Python FastAPI backend orchestrating telemetry DB CRUD operations and Gemini LLM models",
    version="1.0.0",
    lifespan=lifespan
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    method = request.method
    path = request.url.path
    
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"<-- FAIL {method} {path} | Error: {str(e)} | Latency: {process_time:.2f}ms")
        raise e


# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under v1 prefix
app.include_router(auth.router, prefix="/api/v1")
app.include_router(health.router, prefix="/api/v1")
app.include_router(report.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")

@app.get("/healthz", tags=["system"])
async def system_health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True, log_level="warning")

