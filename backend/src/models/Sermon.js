const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Sermon = sequelize.define('Sermon', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    book: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    chapter: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    verses: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    theme: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    audience: {
        type: DataTypes.STRING, // e.g., Youth, Adults
        allowNull: true,
    },
    duration: {
        type: DataTypes.STRING, // e.g., "30 min"
        allowNull: true,
    },
    tone: {
        type: DataTypes.STRING, // e.g., Evangelistic, Teaching
        allowNull: true,
    },
    language: {
        type: DataTypes.STRING,
        defaultValue: 'pt-BR',
    },
    content: {
        type: DataTypes.TEXT('long'), // Long text for the sermon content
        allowNull: false,
    },
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    tableName: 'sermons'
});

// Association
User.hasMany(Sermon, { foreignKey: 'user_id' });
Sermon.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Sermon;
