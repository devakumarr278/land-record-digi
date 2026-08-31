import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes.processing import router as processing_router

load_dotenv()

app = FastAPI(
    title="BHOOMI AI — Document Processing Microservice",
    description="Multilingual OCR, Image Enhancement, Classification & Entity Extraction for Tamil Nadu Land Records (SIH 2026)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5000,http://localhost:3000,http://localhost:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if os.getenv("ENVIRONMENT") == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(processing_router, prefix="/api/v1", tags=["Document Processing"])


@app.get("/health", tags=["System Health"], summary="Health check endpoint")
async def health_check():
    """Service health check endpoint"""
    return {
        "status": "healthy",
        "service": "BHOOMI AI Document Processing Service",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
