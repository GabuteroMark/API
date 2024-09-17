const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const Role = require('_helpers/role');
const orderService = require('./order.service'); // Updated to reflect orders service
const authorize = require('_middleware/authorize');


router.get('/', authorize([Role.Admin, Role.Manager]), getAll);   
router.get('/:id', authorize([Role.Admin, Role.Manager]), getById);
router.post('/', createOrder, create);
router.put('/:id', updateOrder, update);
router.delete('/:id', cancel);

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
        .then(order => res.json(order))
        .catch(next);
}

// Create a new order
function create(req, res, next) {
    orderService.create(req.body)
        .then(() => res.json({ message: 'Order Placed' }))
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
        productName: Joi.string().required(),
        productDesc: Joi.string().required(),
        quantity: Joi.number().integer().min(0).required(),
        price: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

// Validate update order request
function updateOrder(req, res, next) {
    const schema = Joi.object({
        productName: Joi.string().empty(''),
        productDesc: Joi.string().empty(''),
        quantity: Joi.number().integer().min(0).empty(''),
        price: Joi.number().empty('')
    });
    validateRequest(req, next, schema);
}