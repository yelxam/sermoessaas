const { Sequelize } = require('sequelize');
const pg = require('pg'); // Explicitly require pg for Vercel bundler
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
    logging: false,
    pool: {
      max: 3,
      min: 0,
      acquire: 5000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  })
  : new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql', // Fallback to MySQL if no DATABASE_URL
      logging: false,
    }
  );

module.exports = sequelize;
