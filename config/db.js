// config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();  // Make sure to load environment variables

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false, // Disable Sequelize logging (optional)
});

module.exports = sequelize;
