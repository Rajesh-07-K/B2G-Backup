# 🚀 B2G – Bridge to Growth
### AI-Powered Career Platform for Rural India

An offline-capable PWA that bridges the skill gap for rural youth through AI-driven roadmaps, hyper-local opportunities, and community knowledge sharing.

---

## 📁 Project Structure

```
B2G/
├── frontend/          # React PWA (Vite + Tailwind CSS)
├── backend/           # Node.js + Express REST API
├── ai-service/        # Python FastAPI – NLP + GPT AI Layer
└── README.md
```

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React.js, Vite, Tailwind CSS, PWA   |
| Backend     | Node.js, Express, JWT, PostgreSQL   |
| AI Service  | Python, FastAPI, OpenAI, spaCy      |
| Offline     | Service Workers, IndexedDB          |

---

## ⚡ Quick Start

### 1. AI Service (Python FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Backend (Node.js)
```bash
cd backend
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

### 3. Frontend (React PWA)
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Environment Variables

### Backend `.env`
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/b2g_db
JWT_SECRET=your_jwt_secret_here
AI_SERVICE_URL=http://localhost:8000
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE=+1234567890
```

### AI Service `.env`
```
OPENAI_API_KEY=your_openai_key_here
```

---

## 🧩 Core Modules

1. **Authentication** – Phone OTP + JWT
2. **Skill Extraction** – NLP-based from resume/manual entry
3. **Skill Gap Analysis** – Role vs User skills comparison
4. **AI Roadmap Generator** – GPT-powered week-by-week plan
5. **Offline Quiz Engine** – IndexedDB-backed quiz system
6. **AI Interview Coach** – GPT evaluation with regional feedback
7. **Hyper-Local Opportunities** – Community tech needs marketplace
8. **Community Knowledge Loop** – Project upload & tutorial bank

---

## 📶 Offline Support

- Service Workers cache HTML, CSS, JS, and learning content
- IndexedDB stores roadmaps, quizzes, and progress
- Auto-sync when back online

---

## 🎯 Impact

> "First tech professional per district" — empowering rural India through AI
