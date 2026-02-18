import os
import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# ─── Models ───────────────────────────────────────────────────────────────────
class InterviewQuestion(BaseModel):
    question: str
    category: str  # technical, behavioral, situational
    difficulty: str  # easy, medium, hard

class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    role: str
    preferred_language: str = "en"

class EvaluationResponse(BaseModel):
    score: int  # 0-10
    clarity: int
    structure: int
    technical_depth: int
    feedback: str
    improved_answer: str
    tips: List[str]

class GetQuestionsRequest(BaseModel):
    role: str
    difficulty: str = "medium"
    count: int = 5

# ─── Static Question Bank ─────────────────────────────────────────────────────
QUESTION_BANK = {
    "Software Engineer": {
        "technical": [
            "Explain the difference between a stack and a queue.",
            "What is object-oriented programming? Explain its four pillars.",
            "What is the time complexity of binary search?",
            "Explain what REST API means and its key principles.",
            "What is the difference between SQL and NoSQL databases?",
            "How does Git branching work? Explain merge vs rebase.",
            "What is a deadlock in operating systems?",
            "Explain the concept of recursion with an example."
        ],
        "behavioral": [
            "Tell me about a time you solved a difficult technical problem.",
            "How do you handle tight deadlines?",
            "Describe a situation where you had to learn a new technology quickly.",
            "How do you approach debugging a complex issue?"
        ]
    },
    "Data Analyst": {
        "technical": [
            "What is the difference between mean, median, and mode?",
            "Explain what a JOIN is in SQL and its types.",
            "What is data normalization?",
            "How would you handle missing data in a dataset?",
            "What is the difference between correlation and causation?"
        ],
        "behavioral": [
            "Describe a time you found a key insight from data.",
            "How do you present complex data to non-technical stakeholders?"
        ]
    },
    "Web Developer": {
        "technical": [
            "What is the difference between HTML, CSS, and JavaScript?",
            "Explain the CSS box model.",
            "What is responsive design?",
            "What is the difference between GET and POST requests?",
            "Explain what an API is and how you've used one."
        ],
        "behavioral": [
            "How do you ensure your code is maintainable?",
            "Describe a challenging UI/UX problem you solved."
        ]
    },
    "default": {
        "technical": [
            "What are your strongest technical skills?",
            "Describe a project you're most proud of.",
            "How do you stay updated with technology trends?"
        ],
        "behavioral": [
            "Tell me about yourself.",
            "Why do you want this role?",
            "Where do you see yourself in 5 years?",
            "What is your greatest strength and weakness?"
        ]
    }
}

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "mr": "Marathi", "ta": "Tamil",
    "te": "Telugu", "kn": "Kannada", "gu": "Gujarati", "bn": "Bengali"
}


def get_questions_for_role(role: str, count: int = 5) -> List[dict]:
    """Get interview questions for a given role."""
    bank = QUESTION_BANK.get(role, QUESTION_BANK["default"])
    questions = []

    for category, qs in bank.items():
        for q in qs:
            questions.append({
                "question": q,
                "category": category,
                "difficulty": "medium"
            })

    import random
    random.shuffle(questions)
    return questions[:count]


def evaluate_answer_fallback(question: str, answer: str) -> dict:
    """Simple rule-based evaluation when GPT is not available."""
    word_count = len(answer.split())
    has_example = any(w in answer.lower() for w in ["example", "for instance", "such as", "like", "when i"])
    has_structure = any(w in answer.lower() for w in ["first", "second", "finally", "also", "however", "because"])

    clarity = min(10, max(3, word_count // 10))
    structure = 7 if has_structure else 4
    technical_depth = 7 if has_example else 4
    score = (clarity + structure + technical_depth) // 3

    return {
        "score": score,
        "clarity": clarity,
        "structure": structure,
        "technical_depth": technical_depth,
        "feedback": f"Your answer has {word_count} words. {'Good use of examples!' if has_example else 'Try to add specific examples.'} {'Good structure!' if has_structure else 'Try to organize your answer with clear points.'}",
        "improved_answer": f"A strong answer to '{question}' should include: a clear definition, a real-world example, and a conclusion.",
        "tips": [
            "Use the STAR method: Situation, Task, Action, Result",
            "Keep answers between 1-3 minutes when spoken",
            "Always include a specific example from your experience",
            "End with what you learned or the outcome"
        ]
    }


# ─── POST /interview/questions ────────────────────────────────────────────────
@router.post("/interview/questions")
async def get_interview_questions(request: GetQuestionsRequest):
    """Get interview questions for a specific role."""
    questions = get_questions_for_role(request.role, request.count)
    return {
        "role": request.role,
        "questions": questions,
        "total": len(questions)
    }


# ─── POST /interview/evaluate ─────────────────────────────────────────────────
@router.post("/interview/evaluate", response_model=EvaluationResponse)
async def evaluate_interview_answer(request: EvaluateAnswerRequest):
    """Evaluate an interview answer using GPT or fallback logic."""
    if not request.answer.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty")

    api_key = os.getenv("OPENAI_API_KEY")

    if api_key:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=api_key)

            lang_name = LANGUAGE_NAMES.get(request.preferred_language, "English")

            prompt = f"""You are an expert interview coach. Evaluate this interview answer for a {request.role} position.

Question: {request.question}
Answer: {request.answer}

Respond in {lang_name}. Return a JSON object:
{{
  "score": <0-10>,
  "clarity": <0-10>,
  "structure": <0-10>,
  "technical_depth": <0-10>,
  "feedback": "<detailed feedback in {lang_name}>",
  "improved_answer": "<a better version of the answer>",
  "tips": ["tip1", "tip2", "tip3"]
}}

Only return JSON."""

            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=800
            )

            content = response.choices[0].message.content.strip()
            import re
            content = re.sub(r'```json\n?|\n?```', '', content).strip()
            result = json.loads(content)
            return EvaluationResponse(**result)

        except Exception as e:
            print(f"GPT evaluation failed: {e}")

    # Fallback
    result = evaluate_answer_fallback(request.question, request.answer)
    return EvaluationResponse(**result)
