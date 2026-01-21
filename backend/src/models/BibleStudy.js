const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Company = require('./Company');

const BibleStudy = sequelize.define('BibleStudy', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id',
        },
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    tableName: 'bible_studies'
});

// Associations
User.hasMany(BibleStudy, { foreignKey: 'user_id' });
BibleStudy.belongsTo(User, { foreignKey: 'user_id' });

Company.hasMany(BibleStudy, { foreignKey: 'company_id' });
BibleStudy.belongsTo(Company, { foreignKey: 'company_id' });

module.exports = BibleStudy;
