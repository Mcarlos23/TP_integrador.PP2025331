document.addEventListener('DOMContentLoaded', async () => {
  const contenedorVentas = document.getElementById('ventas');

  if (contenedorVentas) {
    try {
      let ventas = await fetch('/api/ventas').then(res => res.json());

      let tarjetasVentas = ventas.map(venta => {
        // --- Lógica para los productos dentro de cada venta ---
        const productosHTML = venta.Products.map(producto => {
          return `
            <li class="producto">
              <img class="producto-cover" src="${producto.cover_image_url}" alt="Portada de ${producto.title}">
              <div class="producto-info">
                <span class="producto-titulo">${producto.title}</span>
                <span class="producto-precio">
                  ${producto.SaleProduct.quantity} x $${parseFloat(producto.SaleProduct.price_at_sale).toFixed(2)}
                </span>
              </div>
            </li>
          `;
        }).join('');

        // --- Formateo de datos para la tarjeta principal ---
        const fechaVenta = new Date(venta.createdAt).toLocaleDateString('es-AR', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
        const totalVenta = parseFloat(venta.total_price).toFixed(2);

        // --- Estructura HTML de la tarjeta completa ---
        return `
          <div class="tarjeta-venta">
            <div class="tarjeta-header">
              <h2>Venta #${venta.id}</h2>
              <span class="fecha-venta">${fechaVenta}</span>
            </div>
            <div class="resumen">
              <span>Cliente: <strong>${venta.client_name}</strong></span>
              <span class="sale-total">Total: <strong>$${totalVenta}</strong></span>
            </div>
            <div class="contenedor-productos">
              <h4>Productos:</h4>
              <ul class="lista-productos">
                ${productosHTML}
              </ul>
            </div>
          </div>
        `;
      }).join('');

      contenedorVentas.innerHTML = tarjetasVentas;

    } catch(error) {
      console.error("Error al cargar las ventas:", error);
    }    
  } else {
    console.error("No se encontró el contenedor 'ventas");
  }
});