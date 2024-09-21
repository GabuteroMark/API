const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'

    if (!token) return res.status(401).json({ message: 'Unauthorized: Token not found' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden: Invalid token' });

        req.user = user;  // Attach the user info from the token to req.user
        next();  // Continue to the next middleware
    });
}

module.exports = authenticateToken;