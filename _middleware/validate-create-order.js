const Joi = require('joi');

function validateCreateOrder(req, res, next) {
    const schema = Joi.object({
        customerId: Joi.number().integer().required(),
        totalAmount: Joi.number().greater(0).required(),
        status: Joi.string().valid('pending', 'shipped', 'delivered', 'cancelled').optional(),
        products: Joi.array().items(Joi.object({
            productId: Joi.number().integer().required(),
            quantity: Joi.number().integer().min(1).required()
        })).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ message: error.details[0].message });
    }

    next(); // Proceed to the next middleware or route handler
}

module.exports = validateCreateOrder;