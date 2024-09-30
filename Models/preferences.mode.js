const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        userId: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            references: {
                model: 'users', // Reference to User model
                key: 'id'
            }
        },
        theme: { type: DataTypes.ENUM('light', 'dark'), allowNull: false, defaultValue: 'light' },
        notifications: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
        language: { type: DataTypes.ENUM('en', 'fr'), allowNull: false, defaultValue: 'en' },
    };
    const options = {
        defaultScope: {
            attributes: { exclude: [
                'theme', 'notifications', 'language'
                ] 
            }
        },
        scopes: {
            withHash: { attributes: {} }
        }
    };

    return sequelize.define('Preferences', attributes,options);
}