const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const Role = require('_helpers/role');
const orderService = require('./order.service'); 
const authorize = require('_middleware/authorize');
//const Order = require('./OrderItem');
//const OrderItem = require('./order.model');
//const validateCreateOrder = require('_middleware/validate-create-order');
const authenticateToken = require('_middleware/authenticateToken');
//const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });


// Administrator/Manager
router.get('/api/orders', authenticateToken, authorize(['Admin', 'Manager']), orderService.getAllOrders);
router.get('/api/orders/:orderId', authenticateToken, authorize(['Admin', 'Manager']), orderService.getOrderById);
router.put('/api/orders/:orderId', authenticateToken, authorize(['Admin', 'Manager']), orderService.updateOrder);
router.put('/api/orders/:orderId/cancel', authenticateToken, authorize(['Customer', 'Admin', 'Manager']), orderService.cancelOrder);
router.get('/api/orders/:orderId/status', authenticateToken, authorize(['Customer']), orderService.getOrderStatus);
router.put('/api/orders/:orderId/process', authenticateToken, authorize(['Admin', 'Manager']), orderService.processOrder);
router.put('/api/orders/:orderId/ship', authenticateToken, authorize(['Admin', 'Manager']), orderService.shipOrder);
router.put('/api/orders/:orderId/deliver', authenticateToken, authorize(['Admin', 'Manager']), orderService.deliverOrder);

// Customer
router.post('/api/orders', authenticateToken, authorize(['Customer']), orderService.createOrder);
router.get('/api/orders/:orderId/status', orderService.getOrderStatus);

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

// Create a new order
function createOrder(req, res, next) {
    orderService.createOrder(req.body)
        .then(order => res.status(201).json(order)) // Respond with the created order
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

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { customerId, totalAmount, status } = req.body;

    Order.create({
        customerId,
        totalAmount,
        status: status || 'pending', // Default to 'pending' if not provided
    })
    .then(order => res.status(201).json(order))
    .catch(err => {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Internal server error' });
    });
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

