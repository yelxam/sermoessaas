const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    plan: {
        type: DataTypes.STRING,
        defaultValue: 'free', // free, pro, enterprise
    },
    max_sermons: {
        type: DataTypes.INTEGER,
        defaultValue: 3, // Default for free
        comment: '-1 for unlimited'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    openai_api_key: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    groq_api_key: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    allow_ai: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    max_users: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    sermons_count_month: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    last_reset_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'companies'
});

module.exports = Company;
