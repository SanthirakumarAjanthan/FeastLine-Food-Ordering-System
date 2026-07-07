const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'food_ordering_system',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL connected: ${process.env.DB_NAME || 'food_ordering_system'}@${process.env.DB_HOST || '127.0.0.1'}`);
  } catch (err) {
    console.error('MySQL connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
