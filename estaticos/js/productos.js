
// =======================
// 1. EVENTO PRINCIPAL DOMContentLoaded
// =======================
document.addEventListener("DOMContentLoaded", async () => {
  // =======================
  // 2. DECLARACIONES DE VARIABLES Y ELEMENTOS DEL DOM
  // =======================
  const contenedorProductos = document.getElementById("contenedor-productos");
  const contenedorPaginacion = document.getElementById('paginacion');
  let productosRenderizados = [];
  let paginaActual = 1;
  let categoriaActual = '';

  // =======================
  // 3. VALIDACIÓN DE ELEMENTOS DEL DOM
  // =======================
  if (!contenedorProductos || !contenedorPaginacion) {
    console.error("El elemento con id 'productos' no se encontró en el DOM.");
    return;
  }

  // =======================
  // 4. MANEJADOR DEL CARRITO
  // =======================
  const manejadorCarrito = {
    obtenerCarrito() {
      const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      return carrito;
    },
    agregarAlCarrito(producto) {
      const carrito = this.obtenerCarrito();
      const productoExistente = carrito.find(item => item.id === producto.id);
      if (productoExistente) {
        productoExistente.cantidad += 1;
      } else {
        const nuevoProducto = { ...producto, cantidad: 1 };
        carrito.push(nuevoProducto);
      }
      this.guardarCarrito(carrito);
      renderizarProductos(productosRenderizados);
      console.log(`"${producto.title}" fue agregado al carrito.`);
      renderizarCarrito();
      agregarEventoFinalizarCompra();
    },
    guardarCarrito(carrito) {
      localStorage.setItem('carrito', JSON.stringify(carrito));
    },
    eliminarDelCarrito(productoId) {
      let carrito = this.obtenerCarrito();
      const productoExistente = carrito.find(item => item.id === productoId);
      if (productoExistente && productoExistente.cantidad > 1) {
        productoExistente.cantidad -= 1;
      } else {
        carrito = carrito.filter(item => item.id !== productoId);
      }
      this.guardarCarrito(carrito);
      renderizarProductos(productosRenderizados);
      renderizarCarrito();
      console.log(`Producto con ID ${productoId} removido del carrito.`);
    }
  };

  // =======================
  // 5. FUNCIONES DE PRODUCTOS Y PAGINACIÓN
  // =======================
  async function cargarProductos(pagina = 1, categoria = '') {
    let url = `/api/productos?page=${pagina}`;
    if (categoria) {
      url += `&category=${categoria}`;
    }
    try {
      const respuesta = await fetch(url);
      if (respuesta.ok) {
        const objetoRespuesta = await respuesta.json();
        renderizarProductos(objetoRespuesta.productos);
        renderizarPaginacion(objetoRespuesta.totalPaginas, objetoRespuesta.paginaActual);
        productosRenderizados = objetoRespuesta.productos;
        console.log("Total de páginas:", objetoRespuesta.totalPaginas);
      } else {
        console.error("Error al cargar los productos:", respuesta.status, respuesta.statusText);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  }

  function renderizarProductos(productos) {
    if (!productos || productos.length === 0) {
      contenedorProductos.innerHTML = '<p>No se encontraron productos.</p>';
      return;
    }
    contenedorProductos.innerHTML = '';
    contenedorProductos.innerHTML = productos.map(producto => {
      let productoEnCarrito = manejadorCarrito.obtenerCarrito().find(item => item.id === producto.id);
      let botonesHtml = '';
      if (productoEnCarrito) {
        botonesHtml = `
          <div class="controles-carrito">
            <button class="btn-remover-carrito" data-product-id="${producto.id}">-</button>
            <span class="cantidad-producto">${productoEnCarrito.cantidad}</span>
            <button class="btn-agregar-carrito" data-product-id="${producto.id}">+</button>
          </div>`;
      } else {
        botonesHtml = `
          <button 
            class="btn-agregar-carrito" 
            data-product-id="${producto.id}">
            Agregar al carrito
          </button>`;
      }
      return `
        <div class="tarjeta-producto">
          <div class="contenedor-imagen">
            <img src="${producto.cover_image_url}" alt="Imagen de ${producto.title}" class="producto-cover">
          </div>
          <div class="contenido-producto">
            <h3 class="titulo">${producto.title}</h3>
            <p class="precio">$${producto.price}</p>
            <p class="precio-cuotas">6 x $${(producto.price/6).toFixed(2).replace(".",",")} sin interés</p>
            ${botonesHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderizarPaginacion(totalPaginas, paginaActual) {
    let paginacionHTML = '';
    contenedorPaginacion.innerHTML = '';
    paginacionHTML += `<button class="btn-paginacion" data-page="${paginaActual - 1}" ${paginaActual === 1 ? 'disabled' : ''}>Anterior</button>`;
    for (let i = 1; i <= totalPaginas; i++) {
      paginacionHTML += `<button class="btn-paginacion ${i === paginaActual ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    paginacionHTML += `<button class="btn-paginacion" data-page="${paginaActual + 1}" ${paginaActual === totalPaginas ? 'disabled' : ''}>Siguiente</button>`;
    contenedorPaginacion.innerHTML = paginacionHTML;
  }

  // =======================
  // 6. EVENTOS DE PAGINACIÓN Y PRODUCTOS
  // =======================
  contenedorPaginacion.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-paginacion')) {
      
      const paginaSeleccionada = parseInt(e.target.getAttribute('data-page'));
      if (!isNaN(paginaSeleccionada) && paginaSeleccionada !== paginaActual) {
        paginaActual = paginaSeleccionada;
        cargarProductos(paginaActual, categoriaActual);
      }
    }
  });

  contenedorProductos.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-agregar-carrito')) {
      const productoId = parseInt(e.target.getAttribute('data-product-id'));
      const producto = productosRenderizados.find(p => p.id === productoId);
      if (producto) {
        manejadorCarrito.agregarAlCarrito(producto);
        console.log(`Producto ${producto.title} agregado al carrito.`);
      } else {
        console.error("Producto no encontrado en los productos renderizados.");
      }
    } else if (e.target.classList.contains('btn-remover-carrito')) {
      const productoId = parseInt(e.target.getAttribute('data-product-id'));
      manejadorCarrito.eliminarDelCarrito(productoId);
      console.log(`Producto con ID ${productoId} removido del carrito.`);
      cargarProductos(paginaActual, categoriaSeleccionada);
    }
  });

  // =======================
  // 7. CARRITO: RENDER Y EVENTOS
  // =======================
  const contenedorCarrito = document.getElementById('contenedor-carrito');

  function renderizarCarrito() {
    const carrito = manejadorCarrito.obtenerCarrito();
    if (carrito.length === 0) {
      contenedorCarrito.classList.add('oculto');
      return;
    }
    contenedorCarrito.classList.remove('oculto');
    let subtotal = 0;
    const itemsHtml = carrito.map(item => {
      const itemTotal = item.price * item.cantidad;
      subtotal += itemTotal;
      return `
        <div class="libro-carrito">
          <span>${item.title} (x${item.cantidad})</span>
          <span>$${itemTotal.toFixed(2)}</span>
        </div>
      `;
    }).join('');
    const total = subtotal;
    contenedorCarrito.innerHTML = `
      <h3>Resumen de Compra</h3>
      <div class="carrito-lista-libros">
        ${itemsHtml}
      </div>
      <hr>
      <div class="carrito-total">
        <strong>Total:</strong>
        <strong>$${total.toFixed(2)}</strong>
      </div>
      <button class="btn-finalizar-compra">Finalizar Compra</button>
    `;
  }

  function agregarEventoFinalizarCompra() {
    const botonFinalizarCompra = contenedorCarrito.querySelector('.btn-finalizar-compra');
    if (botonFinalizarCompra) {
      botonFinalizarCompra.addEventListener('click', () => {
        window.location.href = '/carrito.html';
      });
    }
  }

  // =======================
  // 8. FILTROS DE CATEGORÍA
  // =======================
  const contenedorFiltros = document.getElementById('contenedor-filtros');
  if (contenedorFiltros) {
    contenedorFiltros.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-filtro')) {
        const categoriaSeleccionada = e.target.getAttribute('data-category');
        categoriaActual = categoriaSeleccionada;

        paginaActual = 1;
        contenedorProductos.innerHTML = '<p>Cargando productos...</p>';
        const botonesFiltro = contenedorFiltros.querySelectorAll('.btn-filtro');
        botonesFiltro.forEach(boton => {
          const isSelected = boton.getAttribute('data-category') === categoriaSeleccionada;
          boton.classList.toggle('active', isSelected);
        });
        cargarProductos(paginaActual, categoriaSeleccionada);
      }
    });
  }

  // =======================
  // 9. INICIALIZACIÓN
  // =======================
  manejadorCarrito.obtenerCarrito();
  cargarProductos(paginaActual);
  renderizarCarrito();
  agregarEventoFinalizarCompra();
});
