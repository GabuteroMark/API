const jwt = require('jsonwebtoken');
const db = require('_helpers/db');

module.exports = async function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer Token"

    if (token == null) {
        return res.status(401).json({ error: 'No token provided. Please authenticate.' }); // If no token, respond with unauthorized
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        const user = await db.User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'User not found. Please authenticate.' });
        }

        // Check if the token was issued before the last logout
        if (user.lastLogoutAt && decoded.iat * 1000 < new Date(user.lastLogoutAt).getTime()) {
            return res.status(403).json({ error: 'Token invalidated due to logout. Please login again.' });
        }

        req.user = user; // Attach user to the request object
        next(); // Continue to the next middleware/route handler
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token. Access denied.' });
    }
};