const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const Order = db.Order;
const validateRequest = require('_middleware/validate-request');
const { Sequelize, Op } = require('sequelize');
 

module.exports = {
    
    getAllOrders,
    getOrderById,
    create,
    update,

    cancelOrder,
    getOrderStatus,
    updateOrderStatus,
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
    if (!order) throw 'Order not found';
    if (order.status === 'cancelled') {
        throw new Error('Order is already cancelled');
    }
    return order;
}

//create
async function create(params) {
    
    const existingOrder = await db.Order.findOne({ where: { id: params.customerId } });
    
    if (existingOrder) {
        throw new Error(`Order with Id "${params.customerId}" is already placed.`);
    }


    const newOrder = await db.Order.create(params);


    return newOrder;
}

//update order
async function update(id, params) {
        const order = await db.Order.findByPk(id);
        if (!order) throw 'Order not found';

        if (order.status === 'cancelled') {
            throw new Error('Order is already cancelled');
        }
        
        Object.assign(order, params);
        await order.save();

        return order;
    }

    //cancel
async function cancelOrder(id) {
        const order = await db.Order.findByPk(id);  // Fetch order by ID
        if (!order) {
            throw new Error('Order not found');
        }
    
        // If the order is already canceled, throw an error
        if (order.status === 'cancelled') {
            throw new Error('Order is already cancelled');
        }
    
        // Allow cancellation only if the order has not been processed or shipped
        if (['processed', 'shipped', 'delivered'].includes(order.status)) {
            throw new Error('Order cannot be cancelled at this stage');
        }
    
        // Update the order's status to 'cancelled'
        order.status = 'cancelled';
        await order.save();
    
        return order;  // Return the updated order
    }
    async function getOrderStatus(id) {
        const order = await db.Order.findByPk(id, {
            attributes: ['status'] 
        });
        if (!order) throw new Error('Order not found');
        return order.status;  
    }


//status
async function updateOrderStatus(req, res, next) {
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


//process
async function processOrder(id) {
    const order = await db.Order.findByPk(id);
    if (!order) throw new Error('Order not found');

    if (order.status !== 'pending') {
        throw new Error('Order cannot be processed because it is not pending.');
    }

    order.status = 'processed';
    await order.save();  

    return order;  
}

//ship
async function shipOrder(orderId) {
    const order = await db.Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');

    if (order.status !== 'processed') {
        throw new Error('Order cannot be shipped because it is not processed.');
    }

    order.status = 'shipped';
    await order.save();  

    return order;  
}

//deliver
async function deliverOrder(id) {
    const order = await db.Order.findByPk(id);
    if (!order) throw new Error('Order not found');

    if (order.status !== 'shipped') {
        throw new Error('Order cannot be delivered because it is not shipped.');
    }

    order.status = 'delivered';
    await order.save(); 

    return order; 
}

