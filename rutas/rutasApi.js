const express = require('express');

// Crear una instancia de Router
const rutasApi = express.Router();

// Importar el controlador de la API
const controladorApi = require('../controladores/API/controladorApi.js');

// Get /api/productos
rutasApi.get('/productos', controladorApi.obtenerProductos);

module.exports = rutasApi;