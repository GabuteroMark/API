const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Role = require('_helpers/role');
const orderService = require('./order.service'); 
const validateRequest = require('_middleware/validate-request');
//const authorize = require('_middleware/authorize');
//const OrderItem = require('Model/OrderItem');



router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id',  updateOrderSchema, update);
router.put('/:id/cancel',cancelOrder);
router.get('/:id/status', trackOrderStatus);
router.put('/:id/process', processOrder);
router.put('/:id/ship', shipOrder);
router.put('/:id/deliver', deliverOrder);


router.post('/', createOrderSchema, create);


module.exports = router;

//getall
function getAllOrders(req, res, next) {
    orderService.getAllOrders()
        .then(orders => res.json(orders))
        .catch(next);
}

//get by id
function getOrderById(req, res, next) {
    orderService.getOrderById(req.params.id)
        .then(order => res.json(order))
        .catch(next);
}

// create order
function create(req, res, next) {
    orderService.create(req.body)
        .then(() => res.json({ message: 'Order Created' }))
        .catch(next);
}

function createOrderSchema(req, res, next) {
    const schema = Joi.object({
        customerId: Joi.number().integer().required(),
        productId: Joi.number().integer().required(),
        productName: Joi.string().required(),
        quantity: Joi.number().integer().required(),
        price: Joi.number().required(),
        totalAmount: Joi.number().required(),
        role: Joi.string().valid(Role.Admin, Role.User).required(),
        status: Joi.string().valid('pending', 'shipped', 'delivered', 'cancelled').optional()
    });

    validateRequest(req, next, schema);
}

//update order
function update(req, res, next) {
    orderService.update(req.params.id ,req.body)
        .then(() => res.json({ message: 'Order Updated' }))
        .catch(next);
}

function updateOrderSchema(req, res, next) {
    const schema = Joi.object({
        productName: Joi.string().empty(''),
        quantity: Joi.number().empty(''),
        price: Joi.number().empty(''),
        totalAmount: Joi.number().empty('')
    });
    validateRequest(req, next, schema);
}

//cancel order
function cancelOrder(req, res, next) {
    orderService.cancelOrder(req.params.id) 
        .then(() => res.json({ message: 'Order Cancelled' }))
        .catch(next);
}


//track order 
function trackOrderStatus(req, res, next) {
    const id = req.params.id;  
    orderService.getOrderStatus(id) 
        .then(status => res.json({ status }))  
        .catch(next); 
}

//process order
function processOrder(req, res, next) {
    const id = req.params.id;  
    orderService.processOrder(id)  
        .then(() => res.json({ message: 'Order processed successfully.' })) 
        .catch(next);  
}


//ship order
function shipOrder(req, res, next) {
    const id = req.params.id;  
    orderService.shipOrder(id)  
        .then(() => res.json({ message: 'Order shipped successfully.' })) 
        .catch(next);  
}


//deliver order
function deliverOrder(req, res, next) {
    const orderId = req.params.id;  
    orderService.deliverOrder(orderId)  
        .then(() => res.json({ message: 'Order delivered successfully.' })) 
        .catch(next);  
}

