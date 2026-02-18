# ─── Skill Keyword Database ───────────────────────────────────────────────────
# Used for NLP-based skill extraction from resumes and text

PROGRAMMING_LANGUAGES = [
    "python", "javascript", "java", "c++", "c#", "c", "typescript", "go", "rust",
    "kotlin", "swift", "php", "ruby", "scala", "r", "matlab", "dart", "perl",
    "haskell", "lua", "bash", "shell", "powershell", "sql", "html", "css"
]

FRAMEWORKS_LIBRARIES = [
    "react", "react.js", "reactjs", "angular", "vue", "vue.js", "next.js", "nextjs",
    "node.js", "nodejs", "express", "fastapi", "django", "flask", "spring", "laravel",
    "rails", "asp.net", "flutter", "react native", "tensorflow", "pytorch", "keras",
    "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn", "opencv", "nltk",
    "spacy", "hugging face", "langchain", "bootstrap", "tailwind", "tailwindcss",
    "jquery", "redux", "graphql", "rest api", "restful"
]

DATABASES = [
    "mysql", "postgresql", "postgres", "mongodb", "sqlite", "redis", "cassandra",
    "dynamodb", "firebase", "supabase", "oracle", "sql server", "elasticsearch",
    "neo4j", "influxdb"
]

CLOUD_DEVOPS = [
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "github actions", "ci/cd", "linux",
    "nginx", "apache", "heroku", "vercel", "netlify", "render", "railway"
]

TOOLS = [
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "figma",
    "postman", "swagger", "vs code", "intellij", "eclipse", "xcode", "android studio",
    "tableau", "power bi", "excel", "canva", "photoshop", "illustrator",
    "jupyter", "colab", "notion", "slack", "trello", "asana"
]

CS_CONCEPTS = [
    "data structures", "algorithms", "dsa", "oop", "object oriented", "design patterns",
    "system design", "microservices", "api design", "agile", "scrum", "tdd",
    "unit testing", "machine learning", "deep learning", "nlp", "computer vision",
    "data science", "data analysis", "statistics", "linear algebra", "calculus",
    "networking", "cybersecurity", "cryptography", "blockchain", "cloud computing"
]

SOFT_SKILLS = [
    "communication", "teamwork", "leadership", "problem solving", "critical thinking",
    "time management", "adaptability", "creativity", "collaboration", "presentation",
    "project management", "mentoring", "public speaking", "analytical thinking",
    "attention to detail", "multitasking", "decision making"
]

# Category mapping
SKILL_CATEGORIES = {
    "programming": PROGRAMMING_LANGUAGES,
    "framework": FRAMEWORKS_LIBRARIES,
    "database": DATABASES,
    "cloud_devops": CLOUD_DEVOPS,
    "tool": TOOLS,
    "concept": CS_CONCEPTS,
    "soft_skill": SOFT_SKILLS
}

def categorize_skill(skill_name: str) -> str:
    """Return the category of a skill based on keyword matching."""
    skill_lower = skill_name.lower()
    for category, keywords in SKILL_CATEGORIES.items():
        if any(kw in skill_lower or skill_lower in kw for kw in keywords):
            return category
    return "general"

def get_all_skills_flat() -> list:
    """Return all known skills as a flat list."""
    all_skills = []
    for skills in SKILL_CATEGORIES.values():
        all_skills.extend(skills)
    return list(set(all_skills))
