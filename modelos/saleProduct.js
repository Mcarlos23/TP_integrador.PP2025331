const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SaleProduct = sequelize.define('SaleProduct', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    price_at_sale: { // Guardar el precio al momento de la venta (en caso de que haya cambios en el producto)
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

module.exports = SaleProduct;