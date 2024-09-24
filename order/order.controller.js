const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Role = require('_helpers/role');
const orderService = require('./order.service'); 
const authorize = require('_middleware/authorize');


// Administrator/Manager
router.get('/',authorize(['Admin', 'Manager']), getAllOrders);
router.get('/:id', authorize(['Admin', 'Manager']), getOrderById);
router.put('/:id',  authorize(['Admin', 'Manager']), updateOrderSchema, update);
router.put('/:id/cancel', authorize(['Customer', 'Admin', 'Manager']), cancelOrder);
router.put('/:id/process',  authorize(['Admin', 'Manager']), processOrder);
router.put('/:id/ship',  authorize(['Admin', 'Manager']), shipOrder);
router.put('/:id/deliver',  authorize(['Admin', 'Manager']), deliverOrder);

// Customer
router.post('/api/orders',  authorize(['Customer']), createOrderSchema, create);


module.exports = router;

// Retrieve all orders (Only Admins and Managers can access this)
function getAllOrders(req, res, next) {
    orderService.getAllOrders()
        .then(orders => res.json(orders))
        .catch(next);
}

function getOrderById(req, res, next) {
    orderService.getOrderById(req.params.id)
        .then(order => {
            if (!order) {
                return res.status(404).send({ message: 'Order not found' });
            }
            res.json(order);
        })
        .catch(next);
}

function create(req, res, next) {
    orderService.create(req.body)
        .then(() => res.json({ message: 'Order Created' }))
        .catch(next);
}

function createOrderSchema(req, res, next) {
    const schema = Joi.object({
        customerId: Joi.number().integer().required(),
        totalAmount: Joi.number().required(),
        role: Joi.string().valid(Role.Admin, Role.User, Role.Customer, Role.Manager).required(),
        status: Joi.string().valid('pending', 'shipped', 'delivered', 'cancelled').optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { customerId, totalAmount, status } = req.body;

    Order.create({
        customerId,
        totalAmount,
        status: status || 'pending', 
    })
    .then(order => res.status(201).json(order))
    .catch(err => {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Internal server error' });
    });
}

function update(req, res, next) {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const browserInfo = req.headers['user-agent'] || 'Unknown Browser';

    orderService.update(req.params.id, { 
       ...req.body, 
        ipAddress, 
        browserInfo 
    })
    .then(() => res.json({ message: 'Order Updated' }))
    .catch(next);
}

function updateOrderSchema(req, res, next) {
    const schema = Joi.object({
        customerId: Joi.number().integer().optional(),
        totalAmount: Joi.number().optional(),
        status: Joi.string().valid('pending', 'shipped', 'delivered', 'cancelled').optional()
    });
    validateRequest(req, next, schema);
}

function cancelOrder(req, res, next) {
    orderService.cancel(req.params.id)
        .then(() => res.json({ message: 'Order Cancelled' }))
        .catch(next);
}

function processOrder(req, res, next) {
    orderService.updateOrderStatus(req.params.id, 'processed')
        .then(() => res.json({ message: 'Order processed' }))
        .catch(next);
}

function shipOrder(req, res, next) {
    orderService.updateOrderStatus(req.params.id, 'shipped')
        .then(() => res.json({ message: 'Order shipped' }))
        .catch(next);
}

function deliverOrder(req, res, next) {
    orderService.updateOrderStatus(req.params.id, 'delivered')
        .then(() => res.json({ message: 'Order delivered' }))
        .catch(next);
}

