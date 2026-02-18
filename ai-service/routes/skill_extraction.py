import io
import re
import os
from typing import List, Dict
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from utils.skill_keywords import SKILL_CATEGORIES, categorize_skill

router = APIRouter()

# ─── Models ───────────────────────────────────────────────────────────────────
class ManualSkillRequest(BaseModel):
    text: str
    language: str = "en"

class SkillItem(BaseModel):
    name: str
    category: str
    proficiency: str = "intermediate"
    confidence: float = 1.0

class SkillExtractionResponse(BaseModel):
    skills: List[SkillItem]
    raw_text_length: int
    method: str

# ─── Core Extraction Logic ────────────────────────────────────────────────────
def extract_skills_from_text(text: str) -> List[Dict]:
    """
    Extract skills from text using keyword matching.
    Falls back gracefully if spaCy is not installed.
    """
    text_lower = text.lower()
    found_skills = []
    seen = set()

    for category, keywords in SKILL_CATEGORIES.items():
        for keyword in keywords:
            # Use word boundary matching
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, text_lower):
                if keyword not in seen:
                    seen.add(keyword)
                    # Estimate proficiency from context
                    proficiency = "intermediate"
                    context_window = 50
                    idx = text_lower.find(keyword)
                    if idx != -1:
                        context = text_lower[max(0, idx - context_window):idx + context_window]
                        if any(w in context for w in ["expert", "advanced", "senior", "lead", "5+ years", "6+ years"]):
                            proficiency = "advanced"
                        elif any(w in context for w in ["beginner", "learning", "basic", "familiar", "exposure"]):
                            proficiency = "beginner"

                    found_skills.append({
                        "name": keyword.title() if len(keyword) > 3 else keyword.upper(),
                        "category": category,
                        "proficiency": proficiency,
                        "confidence": 0.9
                    })

    return found_skills


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes using pdfminer."""
    try:
        from pdfminer.high_level import extract_text_to_fp
        from pdfminer.layout import LAParams

        output = io.StringIO()
        extract_text_to_fp(
            io.BytesIO(file_bytes),
            output,
            laparams=LAParams(),
            output_type='text',
            codec='utf-8'
        )
        return output.getvalue()
    except ImportError:
        raise HTTPException(status_code=500, detail="pdfminer not installed. Run: pip install pdfminer.six")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")


async def try_openai_extraction(text: str, language: str = "en") -> List[Dict]:
    """Use OpenAI GPT to extract skills if API key is available."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return []

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=api_key)

        prompt = f"""Extract all technical and soft skills from the following resume/text.
Return a JSON array of objects with fields: name, category (programming/framework/database/tool/soft_skill/concept), proficiency (beginner/intermediate/advanced).
Only return the JSON array, nothing else.

Text:
{text[:3000]}"""

        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1000
        )

        import json
        content = response.choices[0].message.content.strip()
        # Clean up markdown code blocks if present
        content = re.sub(r'```json\n?|\n?```', '', content).strip()
        skills = json.loads(content)
        return skills if isinstance(skills, list) else []
    except Exception as e:
        print(f"OpenAI extraction failed: {e}")
        return []


# ─── POST /extract-resume (PDF Upload) ───────────────────────────────────────
@router.post("/extract-resume", response_model=SkillExtractionResponse)
async def extract_skills_from_resume(resume: UploadFile = File(...)):
    """Extract skills from uploaded PDF resume."""
    if not resume.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await resume.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    # Extract text from PDF
    text = extract_text_from_pdf(file_bytes)

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    # Try OpenAI first, fall back to keyword matching
    skills = await try_openai_extraction(text)
    method = "openai"

    if not skills:
        skills = extract_skills_from_text(text)
        method = "keyword_matching"

    return SkillExtractionResponse(
        skills=[SkillItem(**s) for s in skills],
        raw_text_length=len(text),
        method=method
    )


# ─── POST /extract-skills-text (Manual Text) ─────────────────────────────────
@router.post("/extract-skills-text", response_model=SkillExtractionResponse)
async def extract_skills_from_text_input(request: ManualSkillRequest):
    """Extract skills from manually entered text (supports regional languages via translation)."""
    text = request.text

    # Translate to English if needed
    if request.language != "en":
        try:
            from deep_translator import GoogleTranslator
            text = GoogleTranslator(source=request.language, target='en').translate(text)
        except Exception:
            pass  # Use original text if translation fails

    # Try OpenAI first
    skills = await try_openai_extraction(text, request.language)
    method = "openai"

    if not skills:
        skills = extract_skills_from_text(text)
        method = "keyword_matching"

    return SkillExtractionResponse(
        skills=[SkillItem(**s) for s in skills],
        raw_text_length=len(text),
        method=method
    )
