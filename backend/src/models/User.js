const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Company = require('./Company');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'member', // member, admin, owner
    },
    sermon_limit: {
        type: DataTypes.INTEGER,
        defaultValue: null, // Null means "use company limit"
        comment: 'Override company limit for this user. -1 for unlimited.'
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'companies',
            key: 'id',
        },
    },
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    tableName: 'users'
});

// Associations
User.belongsTo(Company, { foreignKey: 'company_id' });
Company.hasMany(User, { foreignKey: 'company_id' });

module.exports = User;
