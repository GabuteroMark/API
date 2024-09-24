const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require('sequelize');
 

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    cancelOrder,
    getOrderStatus,
    processOrder,
    shipOrder,
    deliverOrder,
};

async function getAllOrders(req, res, next) {
    try {
        const orders = await db.Order.findAll(); // Assuming db is your database object
        res.json(orders);
    } catch (err) {
        next(err); // Pass the error to the errorHandler
    }
}

async function getOrderById(req, res, next) {
    try {
        const order = await db.Order.findByPk(req.params.orderId);
        if (!order) throw 'Order not found';
        res.json(order);
    } catch (err) {
        next(err);
    }
}

async function createOrder(req, res, next) {
    try {
        const { customerId, totalAmount, items } = req.body; // Expecting customer ID and items to be in the request body
        const newOrder = await db.Order.create({ customerId, totalAmount });
        
        // Assuming items need to be saved as well, and `OrderItem` is associated with `Order`
        if (items && items.length > 0) {
            await OrderItem.bulkCreate(items.map(item => ({
                orderId: newOrder.id,
                ...item // Assuming each item has the necessary fields
            })));
        }

        res.status(201).json(newOrder);
    } catch (err) {
        next(err);
    }
}

async function updateOrder(req, res, next) {
    try {
        const order = await db.Order.findByPk(req.params.orderId);
        if (!order) throw 'Order not found';

        // Only allow updating specific fields like status or shipping info
        await order.update(req.body);
        res.json(order);
    } catch (err) {
        next(err);
    }
}

async function cancelOrder(req, res, next) {
    try {
        const order = await db.Order.findByPk(req.params.orderId);
        if (!order) throw 'Order not found';

        if (order.status === 'cancelled') throw 'Order already cancelled';

        // Allow only if it's not processed or shipped
        await order.update({ status: 'cancelled' });
        res.json(order);
    } catch (err) {
        next(err);
    }
}

async function getOrderStatus(req, res, next) {
    try {
        const order = await db.Order.findByPk(req.params.orderId, {
            attributes: ['status'] // Only return status
        });
        if (!order) throw 'Order not found';
        res.json({ status: order.status });
    } catch (err) {
        next(err);
    }
}

async function processOrder(req, res, next) {
    try {
        const order = await db.Order.findByPk(req.params.orderId);
        if (!order) throw 'Order not found';

        if (order.status !== 'pending') throw 'Order cannot be processed';

        await order.update({ status: 'processed' });
        res.json(order);
    } catch (err) {
        next(err);
    }
}

async function shipOrder(req, res, next) {
    try {
        const order = await db.Order.findByPk(req.params.orderId);
        if (!order) throw 'Order not found';

        if (order.status !== 'processed') throw 'Order cannot be shipped';

        await order.update({ status: 'shipped' });
        res.json(order);
    } catch (err) {
        next(err);
    }
}

async function deliverOrder(req, res, next) {
    try {
        const order = await db.Order.findByPk(req.params.orderId);
        if (!order) throw 'Order not found';

        if (order.status !== 'shipped') throw 'Order cannot be delivered';

        await order.update({ status: 'delivered' });
        res.json(order);
    } catch (err) {
        next(err);
    }
}
