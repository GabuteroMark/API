// middleware/authorize.js
const Role = require('_helpers/role');
const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []) {

    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        jwt({ secret, algorithms: ['HS256'] }),

        async (req, res, next) => {
            const account = await db.Account.findByPk(req.user.id);
            if (!account || (roles.length && !roles.includes (account.role))) {
            return res.status(401).json({ message: 'Unauthorized' });
            }

            req.user.role = account.role;
            const refreshTokens = await account.getRefreshTokens();
            req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
            next();
        }
    ]
}
    

module.exports = function (roles) {
    return (req, res, next) => {
        // Check if the logged-in user's role is authorized
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // If the user is a 'User' role, they can only access their own data
        if (req.user.role === Role.User) {
            const loggedInUserId = req.user.id;      // ID of the logged-in user
            const requestedUserId = parseInt(req.params.id, 10);  // ID being requested in the route

            // Ensure that the user can only access their own data
            if (loggedInUserId !== requestedUserId) {
                return res.status(403).json({ message: 'Unauthorized to access this data' });
            }
        }

        // If authorized, proceed to the next middleware
        next();
    };
}