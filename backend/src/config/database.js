const { Sequelize } = require('sequelize');
const pg = require('pg'); // Explicitly require pg for Vercel bundler
require('dotenv').config();

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg, // Pass the pg module directly
    logging: false,
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
