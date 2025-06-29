const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255), // Título con un límite de 255 caracteres
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cover_image_url: {
        type: DataTypes.STRING, // Acá almacenamos la URL o path de la imagen de la portada
        allowNull: true 
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), // 10 dígitos totales, 2 decimales
        allowNull: false
    },    
    description: {
        type: DataTypes.TEXT, // Para una descripción
        allowNull: true
    },
    publisher: {
        type: DataTypes.STRING, // La editorial del libro/manga
        allowNull: true
    },
    isbn: {
        type: DataTypes.STRING(13), // ISBN de 13 dígitos, identificador único para libros
        unique: true, // No puede haber dos productos con el mismo ISBN
        allowNull: true
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0 // Por defecto, un producto nuevo tiene 0 en stock
    },
    category: {
        type: DataTypes.ENUM('Libro', 'Cuento', 'Manga'), // Limita los valores a 3 categorías
        allowNull: false
    },
    isActive: { // Para la baja lógica
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    // Opciones adicionales del modelo
    // Por default Sequeliza le da nombres a las tablas en plural, pero podemos especificar el nombre
    tableName: 'Products' 
});

module.exports = Product;