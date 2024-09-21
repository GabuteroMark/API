const { DataTypes } = require('sequelize');
const db = require('_helpers/db');

module.exports = (sequelize) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        defaultScope: {
            attributes: { exclude: [] }
        },
        scopes: {
            withDetails: {
                attributes: {}
            }
        }
    });

    return Order; // Return the defined model
};