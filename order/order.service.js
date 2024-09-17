const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require('sequelize');

module.exports = {
    getAll,
    getById,
    createOrder,
    updateOrder,
    delete: cancel,
};


// Get all orders (available to Admins/Managers)
async function getAll() {
    return await db.Order.findAll({
        include: [
            {
                model: db.OrderItem, // Assuming there is an OrderItem model
                include: [{ model: db.Product }] // Assuming each order contains products
            },
            { model: db.User, as: 'customer' } // Assuming orders are linked to users/customers
        ]
    });
}

// Get a single order by ID (available to Admins/Managers)
async function getById(id) {
    const order = await db.Order.findByPk(id, {
        include: [
            {
                model: db.OrderItem,
                include: [{ model: db.Product }]
            },
            { model: db.User, as: 'customer' }
        ]
    });
    if (!order) throw 'Order not found';
    return order;
}

// Create a new order
async function createOrder(params) {
    // Assuming params contains necessary order details like customerId, totalAmount, etc.
    const order = new db.Order(params);

    // Save the order
    await order.save();

    // Optionally, create order items if provided in the params
    if (params.items && Array.isArray(params.items)) {
        for (let item of params.items) {
            const orderItem = new db.OrderItem({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            });
            await orderItem.save();
        }
    }

    return order;
}

// Update an order
async function updateOrder(id, params) {
    const order = await getOrder(id); // Function to get the order by ID
    const oldData = order.toJSON(); // Get current order data as a plain object
    const updatedFields = []; // Declare updatedFields array

    // Log any changes to the order
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            if (oldData[key] !== params[key]) {
                updatedFields.push('${key}: ${oldData[key]} -> ${params[key]}');
            }
        }
    }

    Object.assign(order, params);

    try {
        await order.save();

        // Log activity with updated fields
        const updateDetails = updatedFields.length > 0 
             updatedfields: {updatedFields.join(', ')}
             'No fields changed';

        await logActivity(order.id, 'update', params.ipAddress || 'Unknown IP', params.browserInfo || 'Unknown Browser', updateDetails);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Cancel an order
async function cancel(id) {
    const order = await getOrder(id);
    await order.destroy();
}

// Helper function to get an order by ID
async function getOrder(id) {
    const order = await db.Order.findByPk(id, {
        include: [
            { model: db.OrderItem, include: [db.Product] },
            { model: db.User, as: 'customer' }
        ]
    });
    if (!order) throw 'Order not found';
    return order;
}
