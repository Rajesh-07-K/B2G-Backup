const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.status(401).json({ error: 'Access token required' })

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid or expired token' })
        req.user = { id: decoded.id, email: decoded.email }
        next()
    })
}

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return next()

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err) req.user = { id: decoded.id, email: decoded.email }
        next()
    })
}

module.exports = { authenticateToken, optionalAuth }
