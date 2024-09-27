const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const validateRequest = require('_middleware/validate-request');
const { Sequelize, Op } = require('sequelize');
 

module.exports = {
    
    getAllOrders,
    getOrderById,
    create,
    //updateOrder,
    cancelOrder,
    getOrderStatus,
    processOrder,
    shipOrder,
    deliverOrder,
};

async function getAllOrders(req, res, next) {
    return await db.Order.findAll();
}

async function getOrderById(customerId) {
    return await getOrder(customerId);
}

async function getOrder(customerId) {
    const order = await db.Order.findByPk(customerId);
    if (!order) throw 'Order ad found';
    return order;
}

async function create(params) {
    // Check if the order with the same customerId already exists
    const existingOrder = await db.Order.findOne({ where: { customerId: params.customerId } });
    
    if (existingOrder) {
        throw new Error(`Order with customerId "${params.customerId}" is already placed.`);
    }

    // If no existing order, create a new order
    const newOrder = await db.Order.create(params);

    // Optionally, return the new order
    return newOrder;
}

async function update(customerId, params) {
    const user = await getOrder(customerId);
    const oldData = user.toJSON(); // Get current user data as a plain object
    const updatedFields = []; // Declare updatedFields array

    const usernameChanged = params.username && user.username !== params.username;
    if (usernameChanged && await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    if (params.password) {
        params.passwordHash = await bcrypt.hash(params.password, 10);
    }

    // Check which fields have changed, excluding `ipAddress` and `browserInfo` from comparison
    for (const key in params) {
        if (params.hasOwnProperty(key) && !nonUserFields.includes(key)) {
            if (oldData[key] !== params[key]) {
                updatedFields.push(`${key}: ${oldData[key]} -> ${params[key]}`);
            }
        }
    }

    Object.assign(user, params);

    try {

        await user.save();

        // Log activity with updated fields
        const updateDetails = updatedFields.length > 0 
            ? `Updated fields: ${updatedFields.join(', ')}` 
            : 'No fields changed';

        await logActivity(user.id, 'update', params.ipAddress || 'Unknown IP', params.browserInfo || 'Unknown Browser', updateDetails);
    } catch (error) {
        console.error('Error logging activity:', error);
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

