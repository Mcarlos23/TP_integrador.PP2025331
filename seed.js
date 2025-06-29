const mysql = require('mysql2/promise'); // Usar la versión con promesas de mysql2
const sequelize = require('./config/database'); // Importar la conexión a la base de datos
const Product = require('./modelos/product');
const Admin = require('./modelos/admin');
const productsData = require('./products-data.json');

// Cargar los datos de la base de datos desde el archivo .env
require('dotenv').config();
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

async function setupDatabase() {
  let connection; // Definir la conexión aquí para poder cerrarla en 'finally'
  try {
    console.log('Iniciando configuración completa...');

    // Crear la base de datos si no existe
    connection = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();
    console.log('✅ Base de datos verificada/creada.');
    
    // Conectar con Sequelize y resetear todas las tablas
    console.log('Conectando con Sequelize...');
    await sequelize.authenticate();
    
    // Desactivar temporalmente la revisión de claves foráneas para evitar errores al correr el seed varias veces
    console.log('Desactivando revisión de claves foráneas...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true });

    // Borrar y recrear todas las tablas
    console.log('Borrando y recreando todas las tablas...');
    await sequelize.sync({ force: true });
    
    // Volver a activar la revisión de claves foráneas
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true });
    console.log('✅ Tablas reseteadas y revisión de claves foráneas reactivada.');

    // Insertar los productos
    await Product.bulkCreate(productsData);
    console.log(`✅ ${productsData.length} productos insertados.`);

    // Insertar o verificar el usuario administrador
    await Admin.findOrCreate({
      where: { email: 'admin@puntoreader.com' },
      defaults: { password: 'password123' }
    });
    console.log('✅ Administrador de prueba creado o verificado.');

  } catch (error) {
    console.error('❌ Error durante el proceso de setup:', error);
  } finally {
    // Cerrar la conexión de Sequelize
    if (sequelize) {
      await sequelize.close();
    }
    console.log('Proceso finalizado. Conexión cerrada.');
  }
}

setupDatabase();