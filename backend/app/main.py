from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.config.settings import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=get_settings().app_name,
    description="Document Analysis Backend Service",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health-check")
async def health_check():
    logger.info("Health check endpoint called")
    return {"status": "ok", "message": "Backend is running"}

@app.get("/api/test-error")
async def test_error():
    logger.error("Test error endpoint called")
    raise HTTPException(status_code=500, detail="Test error response")
