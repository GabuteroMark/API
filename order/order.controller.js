const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const Role = require('_helpers/role');
const orderService = require('./order.service'); // Assuming this service contains your CRUD logic
const authorize = require('_middleware/authorize');

// Routes
router.get('/', authorize([Role.Admin, Role.Manager]), getAll);   
router.get('/:id', authorize([Role.Admin, Role.Manager]), getById);
router.post('/', authorize([Role.Customer]), createOrder, create); // Assuming only customer can create orders
router.put('/:id', authorize([Role.Customer]), updateOrder, update);  // Assuming only customer can update orders
router.delete('/:id', authorize([Role.Customer]), cancel); // Assuming only customer can cancel orders

module.exports = router;

// Retrieve all orders (Only Admins and Managers can access this)
function getAll(req, res, next) {
    orderService.getAll()
        .then(orders => res.json(orders))
        .catch(next);
}

// Retrieve a specific order by ID (Only Admins and Managers can access this)
function getById(req, res, next) {
    orderService.getById(req.params.id)
        .then(order => {
            if (!order) return res.status(404).send({ message: 'Order not found' });
            res.json(order);
        })
        .catch(next);
}

// Create a new order
function create(req, res, next) {
    orderService.create(req.body)
        .then(() => res.status(201).json({ message: 'Order Placed' }))
        .catch(next);
}

// Update an existing order
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

// Cancel an order
function cancel(req, res, next) {
    orderService.cancel(req.params.id)
        .then(() => res.json({ message: 'Order Cancelled' }))
        .catch(next);
}

// Validate create order request
function createOrder(req, res, next) {
    const schema = Joi.object({
        customerId: Joi.number().integer().required(),
        totalAmount: Joi.number().required(),
        status: Joi.string().valid('pending', 'shipped', 'delivered', 'cancelled').optional() // optional, defaults to 'pending'
    });
    validateRequest(req, next, schema);
}

// Validate update order request
function updateOrder(req, res, next) {
    const schema = Joi.object({
        customerId: Joi.number().integer().optional(),
        totalAmount: Joi.number().optional(),
        status: Joi.string().valid('pending', 'shipped', 'delivered', 'cancelled').optional()
    });
    validateRequest(req, next, schema);
}

