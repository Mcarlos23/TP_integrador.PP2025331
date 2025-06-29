// Importar el manejador del carrito (Modelo)
import manejadorCarrito from './servicios/manejadorCarrito.js';

// Vista para el html productos
class VistaProductos {
  constructor() {
    this.contenedorProductos = document.getElementById("contenedor-productos");
    this.contenedorPaginacion = document.getElementById('paginacion');
    this.contenedorCarrito = document.getElementById('contenedor-carrito');
    this.contenedorFiltros = document.getElementById('contenedor-filtros');

    // Validar que existan los contenedores principales en el DOM
    if (!this.contenedorProductos || !this.contenedorPaginacion || !this.contenedorCarrito || !this.contenedorFiltros) {
      throw new Error("Falta uno de los contenedores principales en el DOM.");
    }
  }

  // Mostrar los productos en el contenedor correspondiente
  renderizarProductos(productos, carrito) {
    if (!productos || productos.length === 0) {
      this.contenedorProductos.innerHTML = '<p class="no-productos">No se encontraron productos para esta selección.</p>';
      return;
    }
    this.contenedorProductos.innerHTML = productos.map(producto => {
      const productoEnCarrito = carrito.find(item => item.id === producto.id);
      const precioNumerico = parseFloat(producto.price); 

      let botonesHtml;

      // Si el producto ya está en el carrito, mostrar botones para modificar cantidad/agregar o quitar
      // Si no, mostrar solo el botón de agregar al carrito
      if (productoEnCarrito) {
      botonesHtml = `
      <div class="controles-carrito">
        <button class="btn-remover-carrito" data-product-id="${producto.id}">-</button>
        <span class="cantidad-producto">${productoEnCarrito.cantidad}</span>
        <button class="btn-agregar-carrito" data-product-id="${producto.id}">+</button>
      </div>`;
      } else {
        //console.log("Producto no encontrado en el carrito:", producto.id);
      botonesHtml = `
      <button class="btn-agregar-carrito" data-product-id="${producto.id}">
        Agregar al carrito
      </button>`;
      }

      return `
      <div class="tarjeta-producto">
        <div class="contenedor-imagen">
        <img src="${producto.cover_image_url}" alt="Imagen de ${producto.title}" class="producto-cover" onerror="this.onerror=null;this.src='/images/covers/default.jpg';">
        </div>
        <div class="contenido-producto">
        <h3 class="titulo">${producto.title}</h3>
        <p class="precio">$${precioNumerico.toFixed(2)}</p>
        <p class="precio-cuotas">6 x $${(precioNumerico / 6).toFixed(2).replace(".", ",")}</p>
        ${botonesHtml}
        </div>
      </div>`;
    }).join('');
  }

  // Mostrar la paginación de productos
  renderizarPaginacion(totalPaginas, paginaActual) {
    if (totalPaginas <= 1) {
      this.contenedorPaginacion.innerHTML = '';
      return;
    }
    let paginacionHTML = '';
    // Boton de pagina anterior, botones de páginas y botón de página siguiente
    // Deshabilitar botones si estamos en la primera o última página
    // Pagina anterior
    paginacionHTML += `<button class="btn-paginacion" data-page="${paginaActual - 1}" ${paginaActual === 1 ? 'disabled' : ''}>Anterior</button>`;
    // Numeros de páginas
    // Crear botones para cada página
    for (let i = 1; i <= totalPaginas; i++) {
      paginacionHTML += `<button class="btn-paginacion ${i === paginaActual ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    // Pagina siguiente
    paginacionHTML += `<button class="btn-paginacion" data-page="${paginaActual + 1}" ${paginaActual === totalPaginas ? 'disabled' : ''}>Siguiente</button>`;
    this.contenedorPaginacion.innerHTML = paginacionHTML;
  }

  // Mostrar el resumen del carrito
  renderizarCarrito(carrito) {
    if (carrito.length === 0) {
      this.contenedorCarrito.classList.add('oculto');
      return;
    }
    this.contenedorCarrito.classList.remove('oculto');
    const subtotal = carrito.reduce((sum, item) => sum + (parseFloat(item.price) * item.cantidad), 0);
    const itemsHtml = carrito.map(item => `
      <div class="libro-carrito">
        <span>${item.title} (x${item.cantidad})</span>
        <span>$${(parseFloat(item.price) * item.cantidad).toFixed(2)}</span>
      </div>`).join('');
    this.contenedorCarrito.innerHTML = `
      <h3>Resumen de Compra</h3>
      <div class="carrito-lista-libros">${itemsHtml}</div>
      <hr>
      <div class="carrito-total">
        <strong>Total:</strong>
        <strong>$${subtotal.toFixed(2)}</strong>
      </div>
      <button class="btn-finalizar-compra">Continuar</button>`;
  }
  
  // Conectar los eventos del DOM con los manejadores del controlador
  bindEventos(controlador) {
    this.contenedorProductos.addEventListener('click', controlador.manejarAccionesCarrito);
    this.contenedorPaginacion.addEventListener('click', controlador.manejarPaginacion);
    this.contenedorFiltros.addEventListener('click', controlador.manejarFiltro);
    this.contenedorCarrito.addEventListener('click', controlador.manejarFinalizarCompra);
  }
}

// Clase para manejar la lógica de la aplicación y coordinar modelo y vista
class Controlador {
  constructor(modelo, vista) {
    this.modelo = modelo;
    this.vista = vista;
    this.productosEnPagina = [];
    this.paginaActual = 1;
    this.categoriaActual = '';
    this.totalPaginas = 1;

    // Pasar el controlador a la vista para conectar los eventos
    this.vista.bindEventos(this);

    // Cargar los datos iniciales
    this.cargarPagina(this.paginaActual, this.categoriaActual);
  }

  // Actualizar toda la interfaz de usuario
  actualizarVistas = () => {
    const carrito = this.modelo.obtenerCarrito();
    this.vista.renderizarProductos(this.productosEnPagina, carrito);
    this.vista.renderizarPaginacion(this.totalPaginas, this.paginaActual);
    this.vista.renderizarCarrito(carrito);
  }

  // Obtener los productos desde la API y actualizar la vista
  cargarPagina = async (pagina, categoria) => {
    this.paginaActual = pagina;
    this.categoriaActual = categoria;
    let url = `/api/productos?page=${this.paginaActual}&limit=6`;
    if (this.categoriaActual) {
      url += `&category=${this.categoriaActual}`;
    }
    try {
      const data = await fetch(url).then(res => res.json());
      this.productosEnPagina = data.productos;
      this.totalPaginas = data.totalPaginas; 
      this.paginaActual = data.paginaActual; 
      this.actualizarVistas();
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }

  // Manejar los eventos relacionados con los productos (agregar o quitar del carrito)
  manejarAccionesCarrito = (event) => {
    const target = event.target;
    const productoId = parseInt(target.dataset.productId);
    if (!productoId) return;

    if (target.matches('.btn-agregar-carrito')) {
      const producto = this.productosEnPagina.find(p => p.id === productoId);
      if(producto) this.modelo.agregarAlCarrito(producto);
    } else if (target.matches('.btn-remover-carrito')) {
      this.modelo.eliminarDelCarrito(productoId);
    }
    this.actualizarVistas();
  }

  // Manejar la paginación de productos
  manejarPaginacion = (event) => {
    if (event.target.matches('.btn-paginacion') && !event.target.disabled) {
      this.cargarPagina(parseInt(event.target.dataset.page), this.categoriaActual);
    }
  }

  // Manejar el filtrado por categoría
  manejarFiltro = (event) => {
    if (event.target.matches('.btn-filtro')) {
      const nuevaCategoria = event.target.dataset.category;
      document.querySelectorAll('.btn-filtro').forEach(boton => {
        boton.classList.toggle('active', boton.dataset.category === nuevaCategoria);
      });
      this.cargarPagina(1, nuevaCategoria);
    }
  }

  // Manejar el evento de finalizar la compra
  manejarFinalizarCompra = (event) => {
    if (event.target.matches('.btn-finalizar-compra')) {
      window.location.href = '/carrito.html';
    }
  }
}

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  // Ejecutar solo si estamos en la página de productos
  if (document.getElementById('contenedor-productos')) {
    //console.log("Inicializando la vista de productos...");
    new Controlador(manejadorCarrito, new VistaProductos());
  } 
});
