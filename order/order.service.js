const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Sequelize, Op } = require('sequelize');

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
};

async function createOrder(req, res) {
    try {
        const { customerId, totalAmount, status } = req.body;

        // Validate input
        if (!customerId || !totalAmount) {
            return res.status(400).send({ message: 'Customer ID and total amount are required' });
        }

        // Create the order
        const order = await Order.create({ customerId, totalAmount, status });
        return res.status(201).send(order);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error creating order' });
    }
}

// Get all orders
async function getAllOrders(req, res) {
    try {
        const orders = await Order.findAll();
        return res.status(200).send(orders);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error fetching orders' });
    }
}

// Get order by ID
async function getOrderById(req, res) {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).send({ message: 'Order not found' });
        }
        return res.status(200).send(order);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error fetching order' });
    }
}

// Update an order
async function updateOrder(req, res) {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).send({ message: 'Order not found' });
        }

        const { customerId, totalAmount, status } = req.body;

        // Update order details
        await order.update({ customerId, totalAmount, status });
        return res.status(200).send(order);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating order' });
    }
}

// Delete an order
async function deleteOrder(req, res) {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).send({ message: 'Order not found' });
        }

        // Delete the order
        await order.destroy();
        return res.status(204).send(); // No content to send back
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error deleting order' });
    }
}
