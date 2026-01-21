const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plan = sequelize.define('Plan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    max_sermons: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '-1 for unlimited'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    allow_ai: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    max_users: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: '-1 for unlimited'
    },
    max_churches: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: '-1 for unlimited'
    },
    allow_bible_study: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'plans'
});

module.exports = Plan;
