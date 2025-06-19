const { parse } = require('dotenv');
const Product = require('../../modelos/product.js'); // Importar modelos

class ControladorApi {
  // Constructor
  constructor() {
    // Inicialmente vacio
  }
  // Método para obtener todos los productos
  // async obtenerProductos(req,res) {
  //   try {
  //     const productos = await Product.findAll({
  //       where: { isActive: true }, // Solo productos activos
  //     });
  //     res.status(200).json(productos);
  //   } catch (error) {
  //     next(error); // Pasar el error al interceptor de errores
  //   }
  // }


  // Método para obtener todos los productos
  async obtenerProductos(req,res, next) {
    try {
      // Obtener pagina de la URL, si no existe, se usa 1
      const page = parseInt(req.query.page) || 1;
      // Definir el número de productos por página
      const limit = 6;
      const category = req.query.category; // Obtener la categoría de la query

      // Calcular el offset (desplazamiento) para la paginación
      const offset = (page - 1) * limit;

      let condicionWhere = { isActive: true }; // Condición por defecto para productos activos
      // Si se especifica una categoría, agregarla a la condición
      if (category) { 
        condicionWhere.category = category; // Filtrar por categoría
      }

      console.log(condicionWhere); // Para depuración, ver la condición de búsqueda

      // Obtener los productos activos con paginación
      const productos = await Product.findAll({
        where: condicionWhere, // Solo productos activos
        limit: limit, // Limitar el número de productos por página
        offset: offset, // Desplazamiento para la paginación
      });

      // Enviar la respuesta con los productos
      res.status(200).json({
        totalPaginas: Math.ceil(await Product.count({ where: condicionWhere }) / limit), // Calcular el total de páginas
        paginaActual: page, // Página actual
        productos: productos // Productos obtenidos
      });

    } catch (error) {
      next(error); // Pasar el error al interceptor de errores
    }
}
}


// Crear una instancia del controladorApi
const controladorApi = new ControladorApi();

// Exportar la instancia del controladorApi 
module.exports = controladorApi;