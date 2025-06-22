const { parse } = require('dotenv');
const Product = require('../../modelos/product.js');
const Sale = require('../../modelos/sale.js');
const SaleProduct = require('../../modelos/saleProduct.js');
const sequelize = require('../../config/database');
const puppeteer = require('puppeteer');

// Establecer relación entre Sale y Product a través de SaleProduct
Sale.belongsToMany(Product, { through: SaleProduct });
Product.belongsToMany(Sale, { through: SaleProduct });

class ControladorApi {
  constructor() {
    // Constructor vacío
  }

  // Obtener todos los productos con paginación y filtro por categoría
  async obtenerProductos(req, res, next) {
    try {
      // Obtener página de la query, usar 1 si no existe
      const page = parseInt(req.query.page) || 1;
      // Definir cantidad de productos por página
      const limit = 6;
      // Obtener categoría de la query
      const category = req.query.category;
      // Calcular offset para la paginación
      const offset = (page - 1) * limit;

      // Definir condición para productos activos
      let condicionWhere = { isActive: true };
      // Agregar filtro por categoría si corresponde
      if (category) {
        condicionWhere.category = category;
      }

      // Mostrar condición de búsqueda en consola para depuración
      console.log(condicionWhere);

      // Buscar productos activos con paginación
      const productos = await Product.findAll({
        where: condicionWhere,
        limit: limit,
        offset: offset,
      });

      // Enviar respuesta con productos y datos de paginación
      res.status(200).json({
        totalPaginas: Math.ceil(await Product.count({ where: condicionWhere }) / limit),
        paginaActual: page,
        productos: productos
      });

    } catch (error) {
      next(error);
    }
  }

  // Crear una venta con sus productos y actualizar stock
  async crearVenta(req, res, next) {
    // Iniciar transacción para asegurar integridad de datos
    console.log("Iniciar creación de venta...");
    const t = await sequelize.transaction();

    try {
      const { nombreCliente, items } = req.body;
      // Mostrar datos recibidos para depuración
      console.log("Datos de la venta:", req.body);

      // Validar datos requeridos
      if (!nombreCliente || !items || items.length === 0) {
        throw new Error('Faltan datos necesarios para crear la venta.');
      }

      // Obtener IDs de productos de los items
      const productIds = items.map(item => item.id);
      // Buscar productos en la base de datos
      const productsInDB = await Product.findAll({ where: { id: productIds } });

      // Calcular precio total de la venta
      let precioTotal = 0;
      for (const item of items) {
        const productDB = productsInDB.find(p => p.id === item.id);
        if (!productDB) throw new Error(`Producto con ID ${item.id} no encontrado.`);
        precioTotal += productDB.price * item.cantidad;
      }

      // Crear venta principal
      const nuevaVenta = await Sale.create({
        client_name: nombreCliente,
        total_price: precioTotal
      }, { transaction: t });

      // Preparar datos para la tabla intermedia SaleProduct
      const saleProductsData = items.map(item => {
        const productDB = productsInDB.find(p => p.id === item.id);
        return {
          SaleId: nuevaVenta.id,
          ProductId: item.id,
          quantity: item.cantidad,
          price_at_sale: productDB.price
        };
      });

      // Insertar productos de la venta en la tabla intermedia
      await SaleProduct.bulkCreate(saleProductsData, { transaction: t });

      // Actualizar stock de los productos vendidos
      for (const item of items) {
        await Product.decrement('stock', {
          by: item.cantidad,
          where: { id: item.id },
          transaction: t
        });
      }

      // Confirmar la transacción si todo salió bien
      await t.commit();

      // Enviar respuesta de éxito con el ID de la venta creada
      res.status(201).json({ success: true, saleId: nuevaVenta.id });

    } catch (error) {
      // Revertir cambios si ocurre un error
      await t.rollback();
      next(error);
    }
  }

  // Obtener una venta por ID, incluyendo productos asociados
  async obtenerVentaPorId(req, res, next) {
    try {
      const saleId = req.params.id;

      // Buscar venta por PK e incluir productos asociados y datos de la tabla intermedia
      const sale = await Sale.findByPk(saleId, {
        include: [{
          model: Product,
          through: {
            attributes: ['quantity', 'price_at_sale']
          }
        }]
      });

      // Enviar error si la venta no existe
      if (!sale) {
        return res.status(404).json({ message: "Venta no encontrada." });
      }

      // Enviar venta encontrada
      res.status(200).json(sale);

    } catch (error) {
      next(error);
    }
  }

  // Generar PDF de una venta por ID usando Puppeteer
  async obtenerVentaPdfPorId(req, res, next) {
    let browser = null;
    try {
      const saleId = req.params.id;
      // Construir URL con el saleId como parámetro de consulta
      const url = `${req.protocol}://${req.get('host')}/ticket.html?saleId=${saleId}`;
      // Mostrar URL en consola para depuración
      console.log(`Puppeteer navegará a: ${url}`);

      // Lanzar navegador en modo headless
      browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
      const page = await browser.newPage();

      // Navegar a la URL del ticket
      await page.goto(url, { waitUntil: 'networkidle0' });

      // Esperar a que el contenido del ticket esté cargado
      await page.waitForSelector('#contenedor-ticket', { timeout: 10000 });

      // Generar PDF del contenido
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true
      });

      // Configurar headers y enviar PDF como respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ticket-${saleId}.pdf`);
      res.send(pdfBuffer);

    } catch (error) {
      next(error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

// Crear instancia del controlador
const controladorApi = new ControladorApi();

// Exportar instancia del controlador
module.exports = controladorApi;
