require('dotenv').config();
const Sequelize = require('sequelize');

// Configuración de la conexión a la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql', // Por defecto, usa MySQL
    logging: false, // Muestra los logs de las consultas SQL
  }
);

// Exportar la instancia de Sequelize
module.exports = sequelize;