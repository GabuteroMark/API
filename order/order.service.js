const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const validateRequest = require('_middleware/validate-request');
const { Sequelize, Op } = require('sequelize');
 

module.exports = {
    
    getAllOrders,
    getOrderById,
    create,
    update,
   // findByIdAndUpdate,
    cancelOrder,
    processOrder,
    shipOrder,
    deliverOrder,
    trackOrderStatus,
    updateOrderStatus,
    
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

// updatee
async function update(orderId, updateData) { 
    try {
        const order = await db.Order.findByPk(orderId);
        if (!order) throw 'Order not found';

        // Define non-user fields
        const nonUserFields = ['ipAddress', 'browserInfo']; // Add any additional fields you want to exclude

        // Filter out non-user fields
        const filteredData = Object.keys(updateData)
            .filter(key => !nonUserFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});

        await order.update(filteredData);
        return order; // Ensure you return the updated order
    } catch (err) {
        throw err; // Pass the error to be handled by the controller
    }
}


//async function findByIdAndUpdate (id) {
    //const order = await db.Order.findByPk(id);
   // if (!order) throw 'Order ad found';
   // return order;
//}

//async function cancelOrder(req, res, next) {
   // try {
    //    const order = await db.Order.findByPk(req.params.orderId);
     //   if (!order) throw 'Order not found';

      //  if (order.status === 'cancelled') throw 'Order already cancelled';

        // Allow only if it's not processed or shipped
     //   await order.update({ status: 'cancelled' });
    //    res.json(order);
  //  } catch (err) {
  //      next(err);
  //  }
//}
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
async function trackOrderStatus(id) {
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