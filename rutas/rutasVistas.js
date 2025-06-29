const express = require('express');
const router = express.Router();
const controladorVista = require('../controladores/Vista/controladorVista.js');
const autenticacionMiddleware = require('../middlewares/autenticacionMiddleware.js');
const cargaDeArchivosMiddleware = require('../middlewares/cargaDeArchivosMiddleware.js');
const redireccionarAutenticados = require('../middlewares/redireccionarAutenticados.js');
const validarProductosMiddleware = require('../middlewares/validarProductosMiddleware.js');

// Ruta para mostrar el formulario de login
router.get('/login', redireccionarAutenticados, controladorVista.mostrarLogin);

// Ruta para procesar el login
router.post('/login', controladorVista.procesarLogin);

// Ruta para cerrar sesión
router.post('/logout', autenticacionMiddleware, controladorVista.cerrarSesion);

// Ruta para mostrar el dashboard (protegida)
router.get('/dashboard', autenticacionMiddleware, controladorVista.mostrarDashboard);

// Rutas para productos (alta, edición, estado)
router.get('/productos/alta', autenticacionMiddleware, controladorVista.mostrarFormularioAltaProducto);

router.post(
  '/productos/alta',
  autenticacionMiddleware,
  cargaDeArchivosMiddleware.single('cover_image'),
  validarProductosMiddleware.validateProduct,
  controladorVista.procesarAltaProducto
);

router.get('/productos/editar/:id', autenticacionMiddleware, controladorVista.mostrarFormularioDeEdicion);

// Ruta para obtener el formulario para dar de alta un administrador
router.get('/crear', redireccionarAutenticados, controladorVista.mostrarFormularioCrearAdmin);

// Ruta para procesar el alta de un usuario administrador
router.post('/crear', redireccionarAutenticados, controladorVista.procesarCrearAdmin);


router.patch(
  '/productos/editar/:id',
  autenticacionMiddleware,
  cargaDeArchivosMiddleware.single('cover_image'),
  validarProductosMiddleware.validateProduct,
  controladorVista.procesarEdicionProducto
);

router.patch('/productos/estado/:id', autenticacionMiddleware, controladorVista.cambiarEstadoProducto);

// Mostrar historial de ventas
router.get('/api/ventas', autenticacionMiddleware, controladorVista.mostrarHistorialDeVentas);

module.exports = router;
