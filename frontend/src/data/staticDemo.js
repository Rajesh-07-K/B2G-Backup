export const STATIC_FULLSTACK_ROADMAP = {
    id: 'static-fs-roadmap',
    target_role: 'Full Stack Developer',
    availability_hours: 15,
    readiness_percentage: 45,
    created_at: new Date().toISOString(),
    status: 'active',
    summary: 'A comprehensive path to becoming a professional Full Stack Engineer, covering both frontend aesthetics and robust backend architectures.',
    missing_skills: ['Advanced React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    weekly_plan: [
        {
            week: 1, focus_skill: 'Frontend Mastery & TypeScript', estimated_hours: 15,
            topics: ['TypeScript Fundamentals', 'Advanced React Hooks', 'State Management (Zustand/Redux)'],
            resources: [
                { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', type: 'docs' },
                { title: 'React Beta Docs', url: 'https://react.dev/', type: 'docs' }
            ],
            milestone: 'Convert a React project to TypeScript'
        },
        {
            week: 2, focus_skill: 'Backend with Node.js & Express', estimated_hours: 15,
            topics: ['RESTful API Design', 'Express Middleware', 'Authentication (JWT)', 'Error Handling'],
            resources: [
                { title: 'Node.js Guide', url: 'https://nodejs.org/en/docs/guides/', type: 'docs' },
                { title: 'Learn SQL Interactive', url: 'https://sqlzoo.net/', type: 'interactive' }
            ],
            milestone: 'Build a secure user authentication system'
        },
        {
            week: 3, focus_skill: 'Database Design & ORMs', estimated_hours: 15,
            topics: ['PostgreSQL Basics', 'Prisma or TypeORM', 'Migrations', 'Database Security'],
            resources: [
                { title: 'Prisma Documentation', url: 'https://www.prisma.io/docs/', type: 'docs' },
                { title: 'Postgres Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'tutorial' }
            ],
            milestone: 'Design and deploy a relational database schema'
        },
        {
            week: 4, focus_skill: 'DevOps, Deployment & Cloud', estimated_hours: 15,
            topics: ['Docker Containerization', 'CI/CD Pipelines', 'AWS S3 & EC2', 'Monitoring'],
            resources: [
                { title: 'Docker for Beginners', url: 'https://docker-curriculum.com/', type: 'course' },
                { title: 'Full Stack Open', url: 'https://fullstackopen.com/en/', type: 'course' }
            ],
            milestone: 'Deploy a containerized app to the cloud'
        }
    ]
};

export const STATIC_OPPORTUNITIES = [
    {
        id: 'opp-1',
        title: 'Full Stack Engineer - EdTech Startup',
        company: 'EduFlow Solutions',
        description: 'Lead the development of a real-time learning platform. Experience with React and Node.js required.',
        location_district: 'Remote',
        location_state: 'India',
        category: 'remote',
        required_skills: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
        status: 'open',
        salary: '₹12L - ₹18L LAKHS'
    },
    {
        id: 'opp-2',
        title: 'Junior Web Developer',
        company: 'GreenTech Agri',
        description: 'Build dashboards for agriculture monitoring systems using modern web technologies.',
        location_district: 'Pune',
        location_state: 'Maharashtra',
        category: 'agriculture',
        required_skills: ['JavaScript', 'HTML/CSS', 'Python'],
        status: 'open',
        salary: '₹5L - ₹8L LAKHS'
    },
    {
        id: 'opp-3',
        title: 'MERN Stack Developer',
        company: 'Digital Gram',
        description: 'Develop civic engagement tools for local panchayats and community centers.',
        location_district: 'Nashik',
        location_state: 'Maharashtra',
        category: 'community',
        required_skills: ['React', 'Node.js', 'Express', 'MongoDB'],
        status: 'open',
        salary: '₹8L - ₹12L LAKHS'
    }
];

export const STATIC_QUIZ_FULLSTACK = {
    id: 'quiz-fs',
    title: 'Full Stack Development Level 1',
    skill_category: 'Full Stack',
    difficulty: 'medium',
    question_count: 10,
    questions: [
        { id: 'q1', question: 'What does the term "MERN" stand for?', options: ['MongoDB, Express, React, Node', 'MySQL, Express, Ruby, Node', 'Microservices, Event, React, Node', 'MongoDB, Ember, React, Node'], correct: 'A' },
        { id: 'q2', question: 'Which HTTP method is used to update existing data?', options: ['GET', 'POST', 'PUT', 'DELETE'], correct: 'C' },
        { id: 'q3', question: 'In React, what hook is used to handle side effects?', options: ['useState', 'useContext', 'useEffect', 'useMemo'], correct: 'C' },
        { id: 'q4', question: 'Which of these is a NoSQL database?', options: ['PostgreSQL', 'MySQL', 'MongoDB', 'Oracle'], correct: 'C' },
        { id: 'q5', question: 'What is the purpose of middleware in Express?', options: ['Style components', 'Execute code between request and response', 'Connect to DB only', 'Render HTML'], correct: 'B' },
        { id: 'q6', question: 'What does CSS Flexbox primarily solve?', options: ['Database queries', 'Responsive layout alignment', 'Server-side rendering', 'Encryption'], correct: 'B' },
        { id: 'q7', question: 'Which command initializes a new Git repository?', options: ['git push', 'git commit', 'git init', 'git add'], correct: 'C' },
        { id: 'q8', question: 'What is a "virtual DOM" in React?', options: ['A direct copy of the HTML', 'A lightweight copy of the real DOM in memory', 'A backend server', 'A CSS framework'], correct: 'B' },
        { id: 'q9', question: 'What does JWT stand for?', options: ['Java Web Tool', 'JSON Web Token', 'Joint Web Task', 'Just Web Text'], correct: 'B' },
        { id: 'q10', question: 'Which port does the default Vite server run on?', options: ['3000', '5000', '5173', '8080'], correct: 'C' }
    ]
};
