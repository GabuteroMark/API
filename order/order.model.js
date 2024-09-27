const { DataTypes } = require('sequelize');
const db = require('_helpers/db');

module.exports = (sequelize) => {
    const Order = sequelize.define('Order', {
        customerId: {type: DataTypes.INTEGER, allowNull: false},
        totalAmount: {type: DataTypes.DECIMAL(10, 2), allowNull: false},
        status: {type: DataTypes.ENUM('pending', 'processed', 'shipped', 'delivered', 'cancelled'), allowNull: false, defaultValue: 'pending'},
        createdAt: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
        updatedAt: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    });
    
    return Order; 
};

//Order.associate = function(models) {
    //Order.hasMany(models.OrderItem, {
       // foreignKey: 'orderId',
        //as: 'items' // This alias will allow us to refer to the order's items as `order.items`
    //});
//};
