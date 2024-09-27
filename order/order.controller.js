const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Role = require('_helpers/role');
const orderService = require('./order.service'); 
const validateRequest = require('_middleware/validate-request');
//const authorize = require('_middleware/authorize');
//const OrderItem = require('Model/OrderItem');


// Administrator/Manager
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id',  updateOrderSchema, update);
router.put('/:id/cancel',cancelOrder);
//router.get('/:id/status', getOrderStatus);
router.put('/:id/process', processOrder);
router.put('/:id/ship', shipOrder);
router.put('/:id/deliver', deliverOrder);

// Customer
router.post('/', createOrderSchema, create);


module.exports = router;

// Retrieve all orders (Only Admins and Managers can access this)
function getAllOrders(req, res, next) {
    orderService.getAllOrders()
        .then(orders => res.json(orders))
        .catch(next);
}

function getOrderById(req, res, next) {
    orderService.getOrderById(req.params.id)
        .then(order => res.json(order))
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
        role: Joi.string().valid(Role.Admin, Role.User).required(),
        status: Joi.string().valid('pending', 'shipped', 'delivered', 'cancelled').optional()
    });

    validateRequest(req, next, schema);
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

