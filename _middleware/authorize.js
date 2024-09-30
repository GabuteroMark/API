// middleware/authorize.js
const Role = require('_helpers/role');

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