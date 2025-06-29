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
      let page = parseInt(req.query.page) || 1;
      // Definir cantidad de productos por página
      let limit = 6;
      // Obtener categoría de la query
      let category = req.query.category;
      // Calcular offset para la paginación (desplazamiento o salto de registros)
      let offset = (page - 1) * limit;

      // Definir condición para productos activos
      let condicionWhere = { isActive: true };
      // Agregar filtro por categoría si corresponde
      if (category) {
        condicionWhere.category = category;
      }

      //console.log(condicionWhere);

      // Buscar productos activos con paginación
      let productos = await Product.findAll({
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
    //console.log("Iniciar creación de venta...");
    //https://sequelize.org/docs/v6/other-topics/transactions/
    const t = await sequelize.transaction();

    try {
      let { nombreCliente, items } = req.body;
      //console.log("Datos de la venta:", req.body);

      // Validar datos requeridos
      if (!nombreCliente || !items || items.length === 0) {
        throw new Error('Faltan datos necesarios para crear la venta.');
      }

      // Obtener IDs de productos de los items
      let productIds = items.map(item => item.id);
      // Buscar productos en la base de datos
      //SELECT * FROM "Products" WHERE "id" IN (2, 3, etc);
      let productsInDB = await Product.findAll({ where: { id: productIds } });

      // Calcular precio total de la venta
      let precioTotal = 0;
      for (const item of items) {
        let productDB = productsInDB.find(p => p.id === item.id);
        if (!productDB) throw new Error(`Producto con ID ${item.id} no encontrado.`);
        precioTotal += productDB.price * item.cantidad;
      }

      // Crear venta principal
      let nuevaVenta = await Sale.create({
        client_name: nombreCliente,
        total_price: precioTotal
      }, { transaction: t });

      // Preparar datos para la tabla intermedia SaleProduct
      let saleProductsData = items.map(item => {
        let productDB = productsInDB.find(p => p.id === item.id);
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
      let saleId = req.params.id;

      // Buscar venta por PK e incluir productos asociados y datos de la tabla intermedia
      let sale = await Sale.findByPk(saleId, {
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
      let saleId = req.params.id;
      // Construir URL con el saleId como parámetro de consulta
      let url = `${req.protocol}://${req.get('host')}/ticket.html?saleId=${saleId}`;
      // Mostrar URL en consola para depuración
      console.log(`Puppeteer navegará a: ${url}`);

      // Lanzar navegador en modo headless
      browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
      let page = await browser.newPage();

      // Navegar a la URL del ticket
      // Usar networkidle0 para esperar a que la página esté completamente cargada
      await page.goto(url, { waitUntil: 'networkidle0' });

      // Modificacion para que el ticket siempre se imprima en modo claro
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
      });

      // Esperar a que el contenido del ticket esté cargado
      await page.waitForSelector('#contenedor-principal-ticket', { timeout: 10000 });

      // Generar PDF del contenido
      let pdfBuffer = await page.pdf({
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
        // Cerrar el navegador si se abrió para evitar que consuma recursos
        await browser.close();
      }
    }
  }

  async obtenerHistorialDeVentas(req, res, next) {
    console.log("obteniendo historial")
    try {
      let ventas = await Sale.findAll({
        include: [{
          model: Product,
          through: {
            attributes: ['quantity', 'price_at_sale']
          }
        }],
        order: [['createdAt', 'ASC']]
      });
      res.status(200).json(ventas);
    }
    catch(error) {
      next(error)
    }
  } 

}

// Crear instancia del controlador
let controladorApi = new ControladorApi();

// Exportar instancia del controlador
module.exports = controladorApi;
