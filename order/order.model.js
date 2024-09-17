const { DataTypes } = require('sequelize');
const db = require('_helpers/db');

module.exports = model;

function model(sequelize) {
    const attributes = {
        // For Order
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        customerId: { type: DataTypes.INTEGER, allowNull: false },
        totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

        // Order Status
        status: { type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'cancelled'), allowNull: false, defaultValue: 'pending'},

        // Optional foreign key relationship to a user (customer)
        customerId: { type: DataTypes.INTEGER, allowNull: true },

        // Timestamps
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }

        
    };

    const options = {
        defaultScope: {
            attributes: { exclude: [] } // Exclude sensitive data if any
        },
        scopes: {
            withDetails: { attributes: {} }
        }
    };
    
    return sequelize.define('Order', attributes, options);
}