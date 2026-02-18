import os
import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# ─── Models ───────────────────────────────────────────────────────────────────
class RoadmapRequest(BaseModel):
    target_role: str
    missing_skills: List[str]
    availability_hours: int = 10
    preferred_language: str = "en"

class WeekPlan(BaseModel):
    week: int
    focus_skill: str
    topics: List[str]
    resources: List[dict]
    milestone: str
    estimated_hours: int

class RoadmapResponse(BaseModel):
    target_role: str
    total_weeks: int
    weekly_plan: List[dict]
    summary: str
    tips: List[str]

# ─── Language Labels ──────────────────────────────────────────────────────────
LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "mr": "Marathi", "ta": "Tamil",
    "te": "Telugu", "kn": "Kannada", "gu": "Gujarati", "bn": "Bengali",
    "pa": "Punjabi", "ml": "Malayalam"
}

# ─── Free Resource Templates ──────────────────────────────────────────────────
FREE_RESOURCES = {
    "Python": [
        {"title": "Python.org Official Docs", "url": "https://docs.python.org/3/tutorial/", "type": "docs"},
        {"title": "freeCodeCamp Python", "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/", "type": "course"},
        {"title": "CS50P – Python", "url": "https://cs50.harvard.edu/python/", "type": "course"}
    ],
    "JavaScript": [
        {"title": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "type": "docs"},
        {"title": "The Odin Project", "url": "https://www.theodinproject.com/", "type": "course"},
        {"title": "JavaScript.info", "url": "https://javascript.info/", "type": "tutorial"}
    ],
    "SQL": [
        {"title": "SQLZoo", "url": "https://sqlzoo.net/", "type": "interactive"},
        {"title": "Mode SQL Tutorial", "url": "https://mode.com/sql-tutorial/", "type": "tutorial"},
        {"title": "W3Schools SQL", "url": "https://www.w3schools.com/sql/", "type": "tutorial"}
    ],
    "Git": [
        {"title": "Git Official Docs", "url": "https://git-scm.com/doc", "type": "docs"},
        {"title": "Learn Git Branching", "url": "https://learngitbranching.js.org/", "type": "interactive"},
        {"title": "GitHub Skills", "url": "https://skills.github.com/", "type": "course"}
    ],
    "DSA": [
        {"title": "GeeksForGeeks DSA", "url": "https://www.geeksforgeeks.org/data-structures/", "type": "tutorial"},
        {"title": "LeetCode", "url": "https://leetcode.com/", "type": "practice"},
        {"title": "Visualgo", "url": "https://visualgo.net/", "type": "interactive"}
    ],
    "Machine Learning": [
        {"title": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course", "type": "course"},
        {"title": "fast.ai", "url": "https://www.fast.ai/", "type": "course"},
        {"title": "Kaggle Learn", "url": "https://www.kaggle.com/learn", "type": "course"}
    ],
    "default": [
        {"title": "freeCodeCamp", "url": "https://www.freecodecamp.org/", "type": "course"},
        {"title": "Khan Academy", "url": "https://www.khanacademy.org/computing", "type": "course"},
        {"title": "YouTube", "url": "https://www.youtube.com/", "type": "video"}
    ]
}

def get_resources_for_skill(skill: str) -> List[dict]:
    """Get free learning resources for a skill."""
    for key in FREE_RESOURCES:
        if key.lower() in skill.lower() or skill.lower() in key.lower():
            return FREE_RESOURCES[key]
    return FREE_RESOURCES["default"]


def generate_roadmap_fallback(
    target_role: str,
    missing_skills: List[str],
    availability_hours: int
) -> dict:
    """
    Generate a structured roadmap without GPT (fallback mode).
    Groups skills into weeks based on availability.
    """
    hours_per_skill = 20  # Estimated hours to learn each skill
    skills_per_week = max(1, availability_hours // hours_per_skill)
    weekly_plan = []

    for i, skill in enumerate(missing_skills):
        week_num = (i // skills_per_week) + 1
        resources = get_resources_for_skill(skill)

        weekly_plan.append({
            "week": week_num,
            "focus_skill": skill,
            "topics": [
                f"Introduction to {skill}",
                f"Core concepts of {skill}",
                f"Hands-on practice with {skill}",
                f"Build a mini project using {skill}"
            ],
            "resources": resources[:2],
            "milestone": f"Complete 2 practice exercises in {skill}",
            "estimated_hours": min(availability_hours, hours_per_skill)
        })

    return {
        "target_role": target_role,
        "total_weeks": weekly_plan[-1]["week"] if weekly_plan else 0,
        "weekly_plan": weekly_plan,
        "summary": f"Your personalized roadmap to become a {target_role}. Focus on {len(missing_skills)} skills over {weekly_plan[-1]['week'] if weekly_plan else 0} weeks.",
        "tips": [
            "Practice daily, even 30 minutes helps",
            "Build projects to reinforce learning",
            "Join online communities for support",
            "Track your progress weekly"
        ]
    }


async def generate_roadmap_with_gpt(
    target_role: str,
    missing_skills: List[str],
    availability_hours: int,
    preferred_language: str
) -> dict:
    """Generate roadmap using OpenAI GPT."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {}

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=api_key)

        lang_name = LANGUAGE_NAMES.get(preferred_language, "English")
        skills_str = ", ".join(missing_skills)

        prompt = f"""Create a detailed week-by-week learning roadmap for someone who wants to become a {target_role}.
They need to learn: {skills_str}
They can study {availability_hours} hours per week.
Respond in {lang_name}.

Return a JSON object with this exact structure:
{{
  "total_weeks": <number>,
  "weekly_plan": [
    {{
      "week": 1,
      "focus_skill": "<skill name>",
      "topics": ["topic1", "topic2", "topic3"],
      "resources": [
        {{"title": "<resource name>", "url": "<url>", "type": "course/video/docs"}}
      ],
      "milestone": "<what to achieve by end of week>",
      "estimated_hours": <number>
    }}
  ],
  "summary": "<overall roadmap summary>",
  "tips": ["tip1", "tip2", "tip3"]
}}

Only return the JSON, no markdown."""

        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2500
        )

        content = response.choices[0].message.content.strip()
        import re
        content = re.sub(r'```json\n?|\n?```', '', content).strip()
        data = json.loads(content)
        data["target_role"] = target_role
        return data
    except Exception as e:
        print(f"GPT roadmap generation failed: {e}")
        return {}


# ─── POST /generate ──────────────────────────────────────────────────────────
@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest):
    """Generate AI-powered week-by-week learning roadmap."""
    if not request.missing_skills:
        raise HTTPException(status_code=400, detail="No missing skills provided")

    # Try GPT first
    roadmap = await generate_roadmap_with_gpt(
        request.target_role,
        request.missing_skills,
        request.availability_hours,
        request.preferred_language
    )

    # Fallback to rule-based generation
    if not roadmap or not roadmap.get("weekly_plan"):
        roadmap = generate_roadmap_fallback(
            request.target_role,
            request.missing_skills,
            request.availability_hours
        )

    return RoadmapResponse(**roadmap)
