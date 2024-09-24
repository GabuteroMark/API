module.exports = authorize;

function authorize(roles = []) {
    // roles param can be a single role string (e.g., 'Admin') or an array of roles (e.g., ['Admin', 'Manager'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' }); // No user object, so unauthorized
        }

        if (!roles.includes(req.user.role)) {
            // user's role is not authorized
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        // authorized
        next();
    };
}