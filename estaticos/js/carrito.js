// Importar módulo carrito
import manejadorCarrito from './servicios/manejadorCarrito.js';

// Renderizar productos
function renderizarProductos(carrito, contenedorListaCarrito) {
  contenedorListaCarrito.innerHTML = carrito.map(item => `
    <div class="carrito-item">
      <img src="${item.cover_image_url}" alt="${item.title}" class="carrito-item-img">
      <div class="carrito-item-info">
        <span class="carrito-item-titulo">${item.title}</span>
        <span class="carrito-item-precio">$${parseFloat(item.price).toFixed(2)} c/u</span>
      </div>
      <div class="carrito-item-controles">
        <button class="btn-cantidad" data-product-id="${item.id}" data-action="disminuir">-</button>
        <span class="cantidad">${item.cantidad}</span>
        <button class="btn-cantidad" data-product-id="${item.id}" data-action="aumentar">+</button>
      </div>
      <div class="carrito-item-subtotal">
        <span>$${(parseFloat(item.price) * item.cantidad).toFixed(2)}</span>
      </div>
      <button class="btn-remover-item" data-product-id="${item.id}">&times;</button>
    </div>
  `).join('');
}

// Renderizar carrito
function renderizarPaginaCarrito(contenedorListaCarrito, contenedorResumenCarrito) {
  let carrito = manejadorCarrito.obtenerCarrito();
  contenedorListaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    contenedorListaCarrito.innerHTML = "<p>El carrito está vacío.</p>";
    contenedorResumenCarrito.innerHTML = "";
    return;
  }

  renderizarProductos(carrito, contenedorListaCarrito);
  renderizarResumen(carrito, contenedorResumenCarrito);
}

// Renderizar resumen
function renderizarResumen(carrito, contenedorResumenCarrito) {
  const subtotal = carrito.reduce((sum, item) => sum + (parseFloat(item.price) * item.cantidad), 0);
  const total = subtotal;

  contenedorResumenCarrito.innerHTML = `
    <div class="resumen-fila">
      <span>Subtotal:</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    <hr>
    <div class="resumen-fila total">
      <strong>Total:</strong>
      <strong>$${total.toFixed(2)}</strong>
    </div>
    <button id="btn-finalizar-compra" class="btn-finalizar-compra">Finalizar Compra</button>
  `;
}

// Manejar eventos de items
function manejarEventosItemsCarrito(contenedorListaCarrito, contenedorResumenCarrito) {
  contenedorListaCarrito.addEventListener('click', (e) => {
    const target = e.target;
    const productoId = parseInt(target.dataset.productId);

    if (target.matches('.btn-cantidad[data-action="aumentar"]')) {
      manejadorCarrito.aumentarCantidad(productoId);
    } else if (target.matches('.btn-cantidad[data-action="disminuir"]')) {
      manejadorCarrito.eliminarDelCarrito(productoId);
    } else if (target.matches('.btn-remover-item')) {
      manejadorCarrito.removerTodasLasUnidades(productoId);
    }

    renderizarPaginaCarrito(contenedorListaCarrito, contenedorResumenCarrito);
  });
}

// Manejar evento finalizar compra
function manejarEventoFinalizarCompra(contenedorResumenCarrito) {
  contenedorResumenCarrito.addEventListener('click', async (e) => {
    if (e.target.id === 'btn-finalizar-compra') {
      const nombreCliente = localStorage.getItem('nombreCliente');
      const carrito = manejadorCarrito.obtenerCarrito();

      if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
      }

      try {
        const respuesta = await fetch('/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombreCliente: nombreCliente,
            items: carrito
          })
        });

        if (!respuesta.ok) throw new Error('Error al finalizar la compra en el servidor.');

        const ventaResult = await respuesta.json();

        localStorage.setItem('lastSaleId', ventaResult.saleId);
        localStorage.removeItem('carrito');

        alert('¡Gracias por tu compra!');
        window.location.href = '/ticket.html';

      } catch (error) {
        console.error("Error en el proceso de venta:", error);
        alert("Hubo un problema al procesar tu compra. Por favor, inténtalo de nuevo.");
      }
    }
  });
}

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  const contenedorResumenCarrito = document.getElementById("resumen-carrito");
  const contenedorListaCarrito = document.getElementById("lista-carrito");

  if (!contenedorListaCarrito || !contenedorResumenCarrito) {
    console.error("No se encontraron los contendores");
  }
  manejarEventosItemsCarrito(contenedorListaCarrito, contenedorResumenCarrito);
  manejarEventoFinalizarCompra(contenedorResumenCarrito);
  renderizarPaginaCarrito(contenedorListaCarrito, contenedorResumenCarrito);
});
