const express = require('express');

// Crear una instancia de Router
const rutasApi = express.Router();

// Importar el controlador de la API
const controladorApi = require('../controladores/API/controladorApi.js');

// Get /api/productos
rutasApi.get('/productos', controladorApi.obtenerProductos);

// Post /api/ventas
rutasApi.post('/ventas', controladorApi.crearVenta);

// Get /api/ventas/:id
rutasApi.get('/ventas/:id/pdf', controladorApi.obtenerVentaPdfPorId);
rutasApi.get('/ventas/:id', controladorApi.obtenerVentaPorId);

module.exports = rutasApi;