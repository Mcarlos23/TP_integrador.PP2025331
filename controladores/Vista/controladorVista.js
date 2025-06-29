const Admin = require('../../modelos/admin.js');
const Product = require('../../modelos/product.js');

class ControladorVista {
  constructor() {
    // Constructor vacío
  }

  // Muestra el formulario de login
  mostrarLogin(req, res) {
    //console.log("Mostrando formulario de login");
    res.render('login.ejs', { 
      title: 'Login',
      pagina: 'login'
    
    });
  }

  // Muestra el dashboard con productos, filtrando por categoría si se proporciona
  async mostrarDashboard(req, res) {
    try {
      let categoria = req.query.category || '';
      console.log("Mostrando dashboard con categoría:", categoria);

      let whereClause = {};
      if (categoria) {
        whereClause.category = categoria;
      }

      const productos = await Product.findAll({
        where: whereClause,
        order: [['id', 'ASC']]
      });

      res.render('dashboard.ejs', {
        title: 'Dashboard',
        productos,
        categoria,
        pagina: 'dashboard'
      });
    } catch (error) {
      console.error("Error al mostrar el dashboard:", error);
      res.status(500).render('dashboard.ejs', { error: 'Ocurrió un error al cargar el dashboard.' });
    }
  }

  // Procesa el login del administrador
  async procesarLogin(req, res, next) {
    //console.log("Session", req.session);
    //console.log("Procesando login del administrador...");
    try {
      //console.log(req.body);
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).render('login.ejs', { error: 'Email y contraseña son requeridos' });
      }

      const admin = await Admin.findOne({ where: { email } });

      if (!admin || !(await admin.validatePassword(password))) {
        return res.render('login.ejs', { 
          error: 'Credenciales inválidas. Por favor, intente de nuevo.',
          pagina: 'login' 
        });
      }

      req.session.isAdmin = true;
      req.session.adminId = admin.id;

      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error("Error al procesar el login:", error);
      next(error);
    }
  }

  // Muestra el formulario para dar de alta un producto
  mostrarFormularioAltaProducto(req, res) {
    //console.log("Mostrando formulario de alta de producto");
    res.render('product-form.ejs', {
      title: 'Alta de Producto',
      isEditMode: false,
      product: {},
      errors: [],
      pagina: 'dashboard'
    });
  }

  // Procesa la creación de un nuevo producto
  async procesarAltaProducto(req, res, next) {
    //console.log("Procesando alta de producto...");
    try {
      const { title, author, publisher, isbn, price, stock, category, description } = req.body;
      let cover_image_url;

      if (req.file) {
        cover_image_url = `/images/covers/${req.file.filename}`;
      } else {
        cover_image_url = '/images/default.png';
      }

      await Product.create({
        title,
        author,
        publisher,
        isbn,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        description,
        cover_image_url
      });

      res.redirect('/admin/dashboard');
    } catch (error) {
      next(error);
    }
  }

  // Procesa la edición de un producto existente
  async procesarEdicionProducto(req, res, next) {
    try {
      let producto = await Product.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).send('Producto no encontrado');
      }

      const { title, author, publisher, isbn, price, stock, category, description } = req.body;
      let cover_image_url;
      if (req.file) {
        cover_image_url = `/images/covers/${req.file.filename}`;
      } else {
        cover_image_url = producto.cover_image_url;
      }

      await producto.update({
        title,
        author,
        publisher,
        isbn,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        description,
        cover_image_url
      });

      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error("Error al procesar la edición del producto:", error);
      res.status(500).send('Error al procesar la edición del producto');
      next(error);
    }
  }

  // Muestra el formulario de edición de un producto
  async mostrarFormularioDeEdicion(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (product) {
        res.render('product-form.ejs', {
          title: `Editar: ${product.title}`,
          isEditMode: true,
          product: product,
          errors: [],
          pagina: 'dashboard'
        });
      } else {
        res.redirect('/admin/dashboard');
      }
    } catch (error) {
      next(error);
    }
  }

  // Cambia el estado (activo/inactivo) de un producto
  async cambiarEstadoProducto(req, res, next) {
    try {
      let producto = await Product.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).send('Producto no encontrado');
      }
      console.log("Producto encontrado:", producto.title, "Estado actual:", producto.isActive);

      producto.isActive = !producto.isActive;
      await producto.save();

      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error("Error al cambiar el estado del producto:", error);
      res.status(500).send('Error al cambiar el estado del producto');
      next(error);
    }
  }

  // Cierra la sesión del administrador
  cerrarSesion(req, res) {
    //console.log("Cerrando sesión del administrador");

    req.session.destroy(error => {
      if (error) {
        console.log("Error al destruir la sessión:", error);
        return next(error);
      }
      
      res.clearCookie('connect.sid')
      res.redirect('/admin/login');
    });
  }

  // Rederizar la vista crear administrador
  mostrarFormularioCrearAdmin(req, res) {
    res.render('crear-admin.ejs', {
      title: 'Crear Administrador',
      errors: [],
      datos_ingresados: {},
      pagina: 'crear-admin'
    })
  }

  // Procesar la creacion de un nuevo usario administrador
  async procesarCrearAdmin(req, res) {
    try {
      const { email, password } = req.body;

      await Admin.create({
        email: email,
        password: password
      });

      res.redirect('/admin/dashboard');
    } catch(error) {
       if (error.name === 'SequelizeUniqueConstraintError') {  
        //console.log("Entramos en el error");
        return res.render('crear-admin.ejs', {
          title: 'Crear Administrador',
          errors: [{msg: 'El email ingresado ya se encuentra en uso'}],
          datos_ingresados: req.body,
          pagina: 'crear-admin'
        })
       }
    }
  }

  mostrarHistorialDeVentas(req, res) {
    res.render('historial-ventas.ejs');
  }

}

module.exports = new ControladorVista();
