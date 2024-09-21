module.exports = authorize;

function authorize(roles = []) {
    // roles param can be a single role string (e.g., 'Admin') or an array of roles (e.g., ['Admin', 'Manager'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: No user information found' });
        }

        // Check if user's role is authorized
        if (roles.length && !roles.includes(req.user.role)) {
            console.log(`Role ${req.user.role} not authorized to access this resource.`);
            return res.status(403).json({ message: 'Forbidden: Access is denied for this role' });
        }

        // Authorization success
        next();
    };
}