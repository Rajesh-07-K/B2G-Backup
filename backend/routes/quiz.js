const router = require('express').Router()
const { Quiz, QuizResult, normalizeDoc } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')

// ── GET /api/quiz/list ────────────────────────────────────────────────────────
router.get('/list', async (req, res) => {
    try {
        const { category, difficulty } = req.query
        const filter = {}
        if (category) filter.skill_category = { $regex: category, $options: 'i' }
        if (difficulty) filter.difficulty = difficulty
        const quizzes = await Quiz.find(filter).select('-questions').sort({ created_at: -1 }).lean()
        res.json({ quizzes: normalizeDoc(quizzes) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── GET /api/quiz/user/my-results ─────────────────────────────────────────────
router.get('/user/my-results', authenticateToken, async (req, res) => {
    try {
        const results = await QuizResult.find({ user_id: req.user.id })
            .populate('quiz_id', 'title skill_category')
            .sort({ completed_at: -1 })
            .limit(20)
            .lean()
        res.json({ results: normalizeDoc(results) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── GET /api/quiz/:id ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).lean()
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' })
        // Strip correct_answer before sending to client
        const safeQuestions = (quiz.questions || []).map(q => ({
            id: q.id || q._id?.toString(), question: q.question, options: q.options
        }))
        const normalized = normalizeDoc(quiz)
        res.json({ quiz: { ...normalized, questions: safeQuestions } })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/quiz/submit ─────────────────────────────────────────────────────
router.post('/submit', authenticateToken, async (req, res) => {
    try {
        const { quiz_id, answers } = req.body
        if (!quiz_id || !answers) return res.status(400).json({ error: 'quiz_id and answers required' })

        const quiz = await Quiz.findById(quiz_id).lean()
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' })

        // Grade answers
        let score = 0
        const graded = (quiz.questions || []).map(q => {
            const userAnswer = answers.find(a => String(a.question_id) === String(q.id || q._id))
            const selected = userAnswer?.selected_option || null
            const correct = q.correct_answer
            const is_correct = selected === correct
            if (is_correct) score++
            return { question_id: q.id || q._id?.toString(), selected, correct, is_correct }
        })

        const total = quiz.questions.length
        const result = await QuizResult.create({
            user_id: req.user.id, quiz_id, score, total_questions: total, answers: graded
        })

        res.json({
            result: {
                id: result._id.toString(), score, total, percentage: Math.round((score / total) * 100),
                graded_answers: graded, completed_at: result.completed_at
            }
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/quiz/sync ───────────────────────────────────────────────────────
router.post('/sync', authenticateToken, async (req, res) => {
    try {
        const { offline_results } = req.body
        if (!offline_results?.length) return res.json({ synced_ids: [] })

        const synced = []
        for (const r of offline_results) {
            try {
                const result = await QuizResult.create({
                    user_id: req.user.id, quiz_id: r.quiz_id,
                    score: r.score || 0, total_questions: r.total_questions || 0,
                    answers: r.answers || [], completed_at: r.completed_at || new Date()
                })
                synced.push(result._id.toString())
            } catch { }
        }
        res.json({ synced_ids: synced, count: synced.length })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/quiz/seed ───────────────────────────────────────────────────────
router.post('/seed', async (req, res) => {
    try {
        const count = await Quiz.countDocuments()
        if (count > 0) return res.json({ message: 'Quizzes already seeded', count })

        const sampleQuizzes = [
            {
                title: 'Python Basics', skill_category: 'Python', difficulty: 'beginner', question_count: 5,
                questions: [
                    { id: '1', question: 'What is the output of print(2 ** 3)?', options: ['6', '8', '9', '5'], correct_answer: '8' },
                    { id: '2', question: 'Which keyword defines a function in Python?', options: ['func', 'define', 'def', 'function'], correct_answer: 'def' },
                    { id: '3', question: 'What data type is [1, 2, 3]?', options: ['tuple', 'list', 'dict', 'set'], correct_answer: 'list' },
                    { id: '4', question: 'How do you comment in Python?', options: ['//', '/* */', '#', '--'], correct_answer: '#' },
                    { id: '5', question: 'What does len("hello") return?', options: ['4', '5', '6', 'error'], correct_answer: '5' },
                ]
            },
            {
                title: 'JavaScript Essentials', skill_category: 'JavaScript', difficulty: 'beginner', question_count: 5,
                questions: [
                    { id: '1', question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'const', 'both let and const'], correct_answer: 'both let and const' },
                    { id: '2', question: 'What does === check?', options: ['Value only', 'Type only', 'Value and type', 'Reference'], correct_answer: 'Value and type' },
                    { id: '3', question: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correct_answer: 'push()' },
                    { id: '4', question: 'What is the output of typeof null?', options: ['null', 'undefined', 'object', 'string'], correct_answer: 'object' },
                    { id: '5', question: 'Arrow functions use which syntax?', options: ['->', '=>', '::', '->()'], correct_answer: '=>' },
                ]
            },
            {
                title: 'SQL Fundamentals', skill_category: 'SQL', difficulty: 'beginner', question_count: 5,
                questions: [
                    { id: '1', question: 'Which SQL command retrieves data?', options: ['INSERT', 'SELECT', 'UPDATE', 'DELETE'], correct_answer: 'SELECT' },
                    { id: '2', question: 'What does WHERE clause do?', options: ['Sorts results', 'Filters rows', 'Groups rows', 'Joins tables'], correct_answer: 'Filters rows' },
                    { id: '3', question: 'Which JOIN returns all rows from both tables?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], correct_answer: 'FULL OUTER JOIN' },
                    { id: '4', question: 'What does COUNT(*) return?', options: ['Sum of values', 'Number of rows', 'Average', 'Maximum value'], correct_answer: 'Number of rows' },
                    { id: '5', question: 'Which clause is used with aggregate functions?', options: ['WHERE', 'HAVING', 'ORDER BY', 'GROUP BY'], correct_answer: 'GROUP BY' },
                ]
            },
            {
                title: 'React Fundamentals', skill_category: 'React', difficulty: 'beginner', question_count: 5,
                questions: [
                    { id: '1', question: 'What hook is used for state in React?', options: ['useEffect', 'useState', 'useRef', 'useContext'], correct_answer: 'useState' },
                    { id: '2', question: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'], correct_answer: 'JavaScript XML' },
                    { id: '3', question: 'Which hook runs after every render?', options: ['useState', 'useCallback', 'useEffect', 'useMemo'], correct_answer: 'useEffect' },
                    { id: '4', question: 'What is a React component?', options: ['A CSS class', 'A JS function returning JSX', 'An HTML tag', 'A database model'], correct_answer: 'A JS function returning JSX' },
                    { id: '5', question: 'How do you pass data to a child component?', options: ['State', 'Props', 'Context', 'Refs'], correct_answer: 'Props' },
                ]
            },
            {
                title: 'Git & Version Control', skill_category: 'Git', difficulty: 'beginner', question_count: 5,
                questions: [
                    { id: '1', question: 'Which command initializes a new Git repo?', options: ['git start', 'git init', 'git new', 'git create'], correct_answer: 'git init' },
                    { id: '2', question: 'What does git commit do?', options: ['Uploads to GitHub', 'Saves a snapshot', 'Merges branches', 'Clones a repo'], correct_answer: 'Saves a snapshot' },
                    { id: '3', question: 'Which command stages all changes?', options: ['git push .', 'git add .', 'git commit -a', 'git stage all'], correct_answer: 'git add .' },
                    { id: '4', question: 'What is a branch in Git?', options: ['A remote server', 'A parallel version of code', 'A commit message', 'A file type'], correct_answer: 'A parallel version of code' },
                    { id: '5', question: 'How do you push to remote?', options: ['git upload', 'git send', 'git push', 'git deploy'], correct_answer: 'git push' },
                ]
            }
        ]

        await Quiz.insertMany(sampleQuizzes)
        res.json({ message: 'Quizzes seeded!', count: sampleQuizzes.length })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
