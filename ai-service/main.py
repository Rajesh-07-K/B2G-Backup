import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from routes.skill_extraction import router as skill_router
from routes.roadmap import router as roadmap_router
from routes.interview_coach import router as interview_router

app = FastAPI(
    title="B2G AI Service",
    description="AI-powered skill extraction, roadmap generation, and interview coaching",
    version="1.0.0"
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(skill_router, prefix="/skills", tags=["Skill Extraction"])
app.include_router(roadmap_router, prefix="/roadmap", tags=["Roadmap Generation"])
app.include_router(interview_router, prefix="/interview", tags=["Interview Coach"])

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "OK",
        "service": "B2G AI Service",
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
