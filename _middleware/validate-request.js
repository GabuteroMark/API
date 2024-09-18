module.exports = validateRequest;

function validateRequest(req, next, schema) {
    const options = {
        abortEarly: false, 
        allowUnknown: true, 
        stripUnknown: true 
    };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        next(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    } else {
        req.body = value;
        next();
    }
}

module.exports = (req, res, next) => {
    if (req.user) {
        // Logs the user role, assuming req.user is set after authentication middleware
        console.log('User role:', req.user.role);
    } else {
        console.log('No user found in request');
    }
    
    next();
};

