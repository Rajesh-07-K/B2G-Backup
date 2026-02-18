import { useEffect, useState } from 'react'
import { quizAPI } from '../services/api'
import { saveQuizResultOffline, saveQuizOffline, getQuizOffline, getAllQuizzesOffline, syncOfflineData } from '../services/offlineDB'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import toast from 'react-hot-toast'
import { BookOpen, CheckCircle, XCircle, Clock, Award, Wifi, WifiOff, RefreshCw, ChevronRight } from 'lucide-react'

function QuizPlayer({ quiz, onComplete }) {
    const isOnline = useOnlineStatus()
    const [current, setCurrent] = useState(0)
    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [result, setResult] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    const questions = quiz.questions || []
    const q = questions[current]

    const selectOption = (option) => {
        if (submitted) return
        setAnswers(prev => ({ ...prev, [q.id]: option }))
    }

    const handleSubmit = async () => {
        const answerList = questions.map(q => ({ question_id: q.id, selected_option: answers[q.id] || null }))
        setSubmitting(true)

        if (isOnline) {
            try {
                const res = await quizAPI.submit({ quiz_id: quiz.id, answers: answerList })
                setResult(res.data.result)
                setSubmitted(true)
                onComplete?.(res.data.result)
            } catch {
                toast.error('Submit failed, saving offline')
                await saveQuizResultOffline({ quiz_id: quiz.id, answers: answerList, score: 0, total_questions: questions.length })
                toast.success('Saved offline, will sync when online')
                setSubmitted(true)
            }
        } else {
            await saveQuizResultOffline({ quiz_id: quiz.id, answers: answerList, score: 0, total_questions: questions.length })
            toast.success('📴 Saved offline! Results will sync when you\'re online.')
            setSubmitted(true)
        }
        setSubmitting(false)
    }

    if (submitted && result) return (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1.5rem',
                background: result.percentage >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                border: `2px solid ${result.percentage >= 70 ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {result.percentage >= 70
                    ? <CheckCircle size={36} color="#34d399" />
                    : <XCircle size={36} color="#f87171" />}
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>
                {result.percentage >= 70 ? '🎉 Well Done!' : '📚 Keep Practicing!'}
            </h2>
            <div style={{
                fontSize: '3rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', margin: '1rem 0',
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>
                {result.score}/{result.total}
            </div>
            <p style={{ marginBottom: '2rem' }}>{result.percentage}% correct</p>

            {/* Answer Review */}
            <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                {(result.graded_answers || []).map((a, i) => {
                    const q = questions[i]
                    return (
                        <div key={i} style={{
                            padding: '0.75rem', borderRadius: '10px', marginBottom: '0.5rem',
                            background: a.is_correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            border: `1px solid ${a.is_correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                        }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>{q?.question}</div>
                            <div style={{ fontSize: '0.8rem', color: a.is_correct ? '#34d399' : '#f87171' }}>
                                {a.is_correct ? '✓' : '✗'} Your answer: {a.selected || 'Not answered'}
                                {!a.is_correct && <span style={{ color: '#34d399' }}> · Correct: {a.correct}</span>}
                            </div>
                        </div>
                    )
                })}
            </div>

            <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Take Another Quiz
            </button>
        </div>
    )

    if (submitted && !result) return (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <WifiOff size={48} color="#fbbf24" style={{ marginBottom: '1rem' }} />
            <h3>Saved Offline!</h3>
            <p style={{ marginTop: '0.5rem' }}>Your quiz result will sync when you're back online.</p>
        </div>
    )

    return (
        <div className="card">
            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Question {current + 1} of {questions.length}
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {questions.map((_, i) => (
                        <div key={i} style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: i === current ? 'var(--primary)' : answers[questions[i]?.id] ? 'var(--success)' : 'var(--bg-elevated)'
                        }} />
                    ))}
                </div>
            </div>
            <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
                <div className="progress-fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
            </div>

            {/* Question */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>{q?.question}</h3>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {(q?.options || []).map((opt, i) => (
                    <button key={i} className={`quiz-option ${answers[q.id] === opt ? 'selected' : ''}`}
                        onClick={() => selectOption(opt)}>
                        <span style={{
                            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: answers[q.id] === opt ? 'var(--primary)' : 'var(--bg-hover)',
                            color: answers[q.id] === opt ? 'white' : 'var(--text-muted)',
                            fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
                        }}>
                            {['A', 'B', 'C', 'D'][i]}
                        </span>
                        {opt}
                    </button>
                ))}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                {current > 0 && (
                    <button className="btn btn-secondary" onClick={() => setCurrent(c => c - 1)}>← Back</button>
                )}
                {current < questions.length - 1 ? (
                    <button className="btn btn-primary" style={{ marginLeft: 'auto' }}
                        onClick={() => setCurrent(c => c + 1)} disabled={!answers[q.id]}>
                        Next →
                    </button>
                ) : (
                    <button className="btn btn-primary" style={{ marginLeft: 'auto' }}
                        onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default function QuizPage() {
    const isOnline = useOnlineStatus()
    const [quizzes, setQuizzes] = useState([])
    const [activeQuiz, setActiveQuiz] = useState(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)

    useEffect(() => {
        const loadQuizzes = async () => {
            if (isOnline) {
                try {
                    const res = await quizAPI.list()
                    const list = res.data.quizzes
                    setQuizzes(list)
                    // Cache for offline
                    for (const q of list) {
                        try {
                            const full = await quizAPI.getById(q.id)
                            await saveQuizOffline(full.data.quiz)
                        } catch { }
                    }
                } catch {
                    const offline = await getAllQuizzesOffline()
                    setQuizzes(offline)
                }
            } else {
                const offline = await getAllQuizzesOffline()
                setQuizzes(offline)
                toast('📴 Offline mode — using cached quizzes', { icon: '📱' })
            }
            setLoading(false)
        }
        loadQuizzes()
    }, [isOnline])

    const startQuiz = async (quizId) => {
        try {
            let quiz
            if (isOnline) {
                const res = await quizAPI.getById(quizId)
                quiz = res.data.quiz
            } else {
                quiz = await getQuizOffline(quizId)
            }
            if (!quiz) return toast.error('Quiz not available offline')
            setActiveQuiz(quiz)
        } catch {
            toast.error('Failed to load quiz')
        }
    }

    const handleSync = async () => {
        setSyncing(true)
        const result = await syncOfflineData(quizAPI)
        if (result.synced > 0) toast.success(`Synced ${result.synced} quiz results!`)
        else toast('No pending results to sync')
        setSyncing(false)
    }

    if (activeQuiz) return (
        <div className="page">
            <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '700px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem' }}>{activeQuiz.title}</h2>
                        <span className="badge badge-primary" style={{ marginTop: '0.25rem' }}>{activeQuiz.skill_category}</span>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveQuiz(null)}>✕ Exit</button>
                </div>
                <QuizPlayer quiz={activeQuiz} onComplete={() => { }} />
            </div>
        </div>
    )

    return (
        <div className="page">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                            <BookOpen size={24} color="var(--primary-light)" style={{ display: 'inline', marginRight: 8 }} />
                            Skill Quizzes
                        </h1>
                        <p>Test your knowledge — works offline too!</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.4rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                            background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                            border: `1px solid ${isOnline ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                            color: isOnline ? '#34d399' : '#fbbf24'
                        }}>
                            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
                            {isOnline ? 'Online' : 'Offline'}
                        </div>
                        {isOnline && (
                            <button className="btn btn-secondary btn-sm" onClick={handleSync} disabled={syncing}>
                                <RefreshCw size={14} className={syncing ? 'spin' : ''} />
                                {syncing ? 'Syncing...' : 'Sync Results'}
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : quizzes.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                        <BookOpen size={60} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>No Quizzes Available</h3>
                        <p>Quizzes will appear here once added by the admin.</p>
                    </div>
                ) : (
                    <div className="grid-auto">
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: '12px',
                                        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                                    }}>
                                        {quiz.skill_category === 'Python' ? '🐍' : quiz.skill_category === 'JavaScript' ? '⚡' : '📝'}
                                    </div>
                                    <span className={`badge badge-${quiz.difficulty === 'beginner' ? 'success' : quiz.difficulty === 'medium' ? 'warning' : 'danger'}`}>
                                        {quiz.difficulty}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{quiz.title}</h3>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <span><BookOpen size={12} style={{ display: 'inline', marginRight: 3 }} />{quiz.question_count || '?'} questions</span>
                                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{quiz.skill_category}</span>
                                </div>
                                <button className="btn btn-primary btn-full btn-sm" onClick={() => startQuiz(quiz.id)}>
                                    Start Quiz <ChevronRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 0.8s linear infinite; }`}</style>
        </div>
    )
}
