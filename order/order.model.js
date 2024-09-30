const { DataTypes } = require('sequelize');
const db = require('_helpers/db');

module.exports = (sequelize) => {
    const Order = sequelize.define('Order', {
        customerId: {type: DataTypes.INTEGER, allowNull: false},
        productId: {type: DataTypes.INTEGER, allowNull: false},
        productName: { type: DataTypes.STRING, allowNull: false },
        quantity: {type: DataTypes.INTEGER, allowNull: false},
        price: {type: DataTypes.DECIMAL(10, 2), allowNull: false},
        totalAmount: {type: DataTypes.DECIMAL(10, 2), allowNull: false},
        status: {type: DataTypes.ENUM('pending', 'processed', 'shipped', 'delivered', 'cancelled'), allowNull: false, defaultValue: 'pending'},
        createdAt: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
        updatedAt: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    });
    
    return Order; 
};


