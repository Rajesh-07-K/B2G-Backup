const mongoose = require('mongoose')

// ─── normalizeDoc: _id → id ───────────────────────────────────────────────────
// lean() returns plain JS objects that bypass toJSON transforms.
// This helper recursively converts _id → id so the frontend always gets { id: '...' }
function normalizeDoc(doc) {
  if (!doc) return doc
  if (Array.isArray(doc)) return doc.map(normalizeDoc)
  if (typeof doc !== 'object') return doc
  const out = { ...doc }
  if (out._id !== undefined) {
    out.id = out._id.toString()
    delete out._id
  }
  delete out.__v
  // Recurse into nested objects (e.g. populated fields)
  for (const key of Object.keys(out)) {
    if (out[key] && typeof out[key] === 'object' && !Array.isArray(out[key]) && !(out[key] instanceof Date)) {
      out[key] = normalizeDoc(out[key])
    } else if (Array.isArray(out[key])) {
      out[key] = out[key].map(v => (v && typeof v === 'object' ? normalizeDoc(v) : v))
    }
  }
  return out
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  }
}

// ─── Mongoose Models ──────────────────────────────────────────────────────────

// User
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true, trim: true },
  password_hash: { type: String },
  district: { type: String, default: '' },
  state: { type: String, default: '' },
  preferred_language: { type: String, default: 'en' },
  education_level: { type: String, default: '' },
  is_verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
})
// Note: unique:true already creates indexes; no extra .index() calls needed

// Skill
const skillSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill_name: { type: String, required: true, trim: true },
  category: { type: String, default: 'general' },
  proficiency: { type: String, default: 'beginner' },
  source: { type: String, default: 'manual' },
  created_at: { type: Date, default: Date.now },
})

// Role
const roleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  required_skills: { type: [String], default: [] },
})

// Roadmap
const roadmapSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target_role: { type: String, required: true },
  missing_skills: { type: [String], default: [] },
  weekly_plan: { type: mongoose.Schema.Types.Mixed, default: [] },
  availability_hours: { type: Number, default: 10 },
  preferred_language: { type: String, default: 'en' },
  readiness_percentage: { type: Number, default: 0 },
  status: { type: String, default: 'active', enum: ['active', 'completed', 'paused'] },
  created_at: { type: Date, default: Date.now },
})

// Quiz
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skill_category: { type: String, default: 'general' },
  difficulty: { type: String, default: 'beginner', enum: ['beginner', 'medium', 'advanced'] },
  questions: { type: mongoose.Schema.Types.Mixed, default: [] },
  question_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
})

// Quiz Result
const quizResultSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, default: 0 },
  total_questions: { type: Number, default: 0 },
  answers: { type: mongoose.Schema.Types.Mixed, default: [] },
  completed_at: { type: Date, default: Date.now },
})

// Opportunity
const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'other' },
  location_district: { type: String, default: '' },
  location_state: { type: String, default: '' },
  required_skills: { type: [String], default: [] },
  posted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'open', enum: ['open', 'closed', 'filled'] },
  created_at: { type: Date, default: Date.now },
})

// Application
const applicationSchema = new mongoose.Schema({
  opportunity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  proposal: { type: String, default: '' },
  status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'rejected'] },
  applied_at: { type: Date, default: Date.now },
})

// Community Project
const communityProjectSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  summary: { type: String, default: '' },
  steps: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  language_tag: { type: String, default: 'en' },
  screenshots: { type: [String], default: [] },
  status: { type: String, default: 'draft', enum: ['draft', 'published'] },
  created_at: { type: Date, default: Date.now },
})

// OTP
const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
})
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }) // auto-delete expired OTPs

// ─── Seed default roles ───────────────────────────────────────────────────────
const DEFAULT_ROLES = [
  { title: 'Web Developer', required_skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Git'] },
  { title: 'Data Analyst', required_skills: ['Python', 'SQL', 'Excel', 'Data Visualization', 'Statistics', 'Pandas'] },
  { title: 'Mobile App Developer', required_skills: ['React Native', 'JavaScript', 'Android', 'iOS', 'Git', 'REST APIs'] },
  { title: 'Digital Marketer', required_skills: ['SEO', 'Social Media', 'Google Analytics', 'Content Writing', 'Email Marketing'] },
  { title: 'Graphic Designer', required_skills: ['Figma', 'Photoshop', 'Illustrator', 'UI/UX', 'Typography', 'Color Theory'] },
  { title: 'Cloud Engineer', required_skills: ['AWS', 'Docker', 'Linux', 'Networking', 'Python', 'CI/CD'] },
  { title: 'Cybersecurity Analyst', required_skills: ['Networking', 'Linux', 'Python', 'Ethical Hacking', 'Firewalls', 'Cryptography'] },
  { title: 'Full Stack Developer', required_skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Git', 'MongoDB', 'AWS', 'Docker'] },
  { title: 'AI/ML Engineer', required_skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'Statistics', 'Deep Learning'] },
]

const seedRoles = async () => {
  const Role = mongoose.model('Role')
  const count = await Role.countDocuments()
  if (count === 0) {
    await Role.insertMany(DEFAULT_ROLES)
    console.log('✅ Default roles seeded')
  } else {
    // Ensure Full Stack Developer exists
    const fsExists = await Role.findOne({ title: 'Full Stack Developer' })
    if (!fsExists) {
      await Role.create(DEFAULT_ROLES.find(r => r.title === 'Full Stack Developer'))
      console.log('✅ Full Stack Developer role added to seeds')
    }
  }
}

const seedQuizzes = async () => {
  try {
    const Quiz = mongoose.model('Quiz')
    const count = await Quiz.countDocuments()
    if (count > 0) return
    const sampleQuizzes = [
      {
        title: 'Python Basics', skill_category: 'Python', difficulty: 'beginner', question_count: 5,
        questions: [
          { question: 'What is the output of print(2 ** 3)?', options: ['6', '8', '9', '5'], correct_answer: '8' },
          { question: 'Which keyword defines a function in Python?', options: ['func', 'define', 'def', 'function'], correct_answer: 'def' },
          { question: 'What data type is [1, 2, 3]?', options: ['tuple', 'list', 'dict', 'set'], correct_answer: 'list' },
          { question: 'How do you comment in Python?', options: ['//', '/* */', '#', '--'], correct_answer: '#' },
          { question: 'What does len("hello") return?', options: ['4', '5', '6', 'error'], correct_answer: '5' },
        ]
      },
      {
        title: 'React Fundamentals', skill_category: 'React', difficulty: 'beginner', question_count: 5,
        questions: [
          { question: 'What hook is used for state in React?', options: ['useEffect', 'useState', 'useRef', 'useContext'], correct_answer: 'useState' },
          { question: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'], correct_answer: 'JavaScript XML' },
          { question: 'Which hook runs after every render?', options: ['useState', 'useCallback', 'useEffect', 'useMemo'], correct_answer: 'useEffect' },
          { question: 'What is a React component?', options: ['A CSS class', 'A JS function returning JSX', 'An HTML tag', 'A database model'], correct_answer: 'A JS function returning JSX' },
          { question: 'How do you pass data to a child component?', options: ['State', 'Props', 'Context', 'Refs'], correct_answer: 'Props' },
        ]
      }
    ]
    await Quiz.insertMany(sampleQuizzes)
    console.log('🌱 Sample Quizzes seeded')
  } catch (err) { console.error('❌ Quiz seeding failed:', err.message) }
}

const seedOpportunities = async () => {
  try {
    const Opportunity = mongoose.model('Opportunity')
    const count = await Opportunity.countDocuments()
    if (count > 0) return
    await Opportunity.insertMany([
      { title: 'Build Inventory App for Kirana Store', description: 'Local grocery store needs a simple inventory management app to track stock and sales.', category: 'shop', location_district: 'Nashik', location_state: 'Maharashtra', required_skills: ['React', 'Node.js', 'MongoDB'], status: 'open' },
      { title: 'School Attendance System', description: 'Government school needs a digital attendance tracking system for 500 students.', category: 'school', location_district: 'Pune', location_state: 'Maharashtra', required_skills: ['Python', 'SQL', 'HTML'], status: 'open' },
      { title: 'Crop Price Alert App', description: 'Farmers need a mobile app to get daily crop price alerts from local mandis.', category: 'agriculture', location_district: 'Aurangabad', location_state: 'Maharashtra', required_skills: ['React Native', 'API Integration'], status: 'open' },
    ])
    console.log('🌱 Sample Opportunities seeded')
  } catch (err) { console.error('❌ Opportunity seeding failed:', err.message) }
}

// ─── Register Models ──────────────────────────────────────────────────────────
const User = mongoose.model('User', userSchema)
const Skill = mongoose.model('Skill', skillSchema)
const Role = mongoose.model('Role', roleSchema)
const Roadmap = mongoose.model('Roadmap', roadmapSchema)
const Quiz = mongoose.model('Quiz', quizSchema)
const QuizResult = mongoose.model('QuizResult', quizResultSchema)
const Opportunity = mongoose.model('Opportunity', opportunitySchema)
const Application = mongoose.model('Application', applicationSchema)
const CommunityProject = mongoose.model('CommunityProject', communityProjectSchema)
const OTP = mongoose.model('OTP', otpSchema)

module.exports = {
  connectDB, seedRoles, seedQuizzes, seedOpportunities, normalizeDoc,
  User, Skill, Role, Roadmap, Quiz, QuizResult,
  Opportunity, Application, CommunityProject, OTP
}


