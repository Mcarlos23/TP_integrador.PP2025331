  //---- Obtener datos para renderizar el ticket ----

async function cargarDatosTicket() {
  const idLocalStorage = localStorage.getItem('lastSaleId');

  const idUrlParams = new URLSearchParams(window.location.search).get('saleId');

  if (!idLocalStorage && !idUrlParams) {
    console.error("No se encontró el ID de la última venta en localStorage.");
    return;
  }

  // Si hay un ID en los parámetros de la URL, lo usamos en lugar del localStorage (el browser de puppeteer no tiene el id en su localstorage)
  const idVenta = idUrlParams || idLocalStorage;

  console.log("ID de venta a cargar:", idVenta);

  try {
    // Realizar la solicitud para obtener los datos del ticket
    const respuesta = await fetch(`/api/ventas/${idVenta}`);

    if (!respuesta.ok) {
      throw new Error(`Error al obtener los datos del ticket: ${respuesta.status} ${respuesta.statusText}`);
    }

    const datosTicket = await respuesta.json();
    // Verificar si los datos del ticket tienen la estructura esperada
    if (!datosTicket || !datosTicket.Products || !Array.isArray(datosTicket.Products)) {
      throw new Error("Los datos del ticket no tienen la estructura esperada.");
    }
    // Retornar los datos del ticket como un objeto
    //console.log("Datos del ticket cargados correctamente:", datosTicket);
    return datosTicket; 


  } catch (error) {
    console.error("Error al cargar los datos del ticket:", error);
    return;
  }
}

//---- Renderizar el ticket en el DOM ----
function renderizarTicket(datosTicket) {
  //console.log("Datos del ticket:", datosTicket);
  const contenedorTicket = document.getElementById("contenedor-ticket");

  if (!contenedorTicket) {
    console.error("El contenedor del ticket no se encontró en el DOM.");
    return;
  }

  const fechaDeVenta = new Date(datosTicket.createdAt).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' });


  // Creamos el HTML para la lista de productos
    const itemsHtml = datosTicket.Products.map(product => {
        // La info de la venta (cantidad, precio) está en el objeto 'SaleProduct' anidado
        const datosTicketInfo = product.SaleProduct; 
        const priceAtSale = parseFloat(datosTicketInfo.price_at_sale);
        const quantity = parseInt(datosTicketInfo.quantity);
        const itemTotal = priceAtSale * quantity;

        return `
            <div class="ticket-item">
                <span class="item-quantity">${quantity}x</span>
                <span class="item-title">${product.title}</span>
                <span class="item-price">$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    // Creamos el HTML final del ticket
    const ticketHtml = `
        <h1>¡Gracias por tu compra, ${datosTicket.client_name}!</h1>
        <p class="subtitulo-ticket">Este es el resumen de tu pedido:</p>
        <div class="ticket-info">
            <span>Fecha: ${fechaDeVenta}</span>
            <span>ID de Venta: #${datosTicket.id}</span>
        </div>
        <hr>
        <div class="ticket-items-container">
            ${itemsHtml}
        </div>
        <hr>
        <div class="ticket-total">
            <strong>Total Pagado:</strong>
            <strong>$${parseFloat(datosTicket.total_price).toFixed(2)}</strong>
        </div>
        <p class="ticket-footer">Punto Lector - ¡Vuelve pronto!</p>
    `;

    contenedorTicket.innerHTML = ticketHtml;

}

//--- Agregar evento al botón de imprimir ticket ---
function eventoImprimirTicket() {
  const botonImprimir = document.getElementById("btn-imprimir");

  if (!botonImprimir) {
    console.error("El botón de imprimir no se encontró en el DOM.");
    return;
  }
  botonImprimir.addEventListener('click', () => {
        const lastSaleId = localStorage.getItem('lastSaleId');
        if (lastSaleId) {
            // Simplemente redirigimos a la nueva URL.
            // El navegador recibirá la respuesta con las cabeceras de descarga
            // y automáticamente iniciará la descarga del archivo.
            window.location.href = `/api/ventas/${lastSaleId}/pdf`;
        } else {
            alert("No se encontró un ID de venta para descargar el ticket.");
        }
    });
}

function eventoSalir() {
  const botonSalir = document.getElementById("btn-salir");

  if (!botonSalir) {
    console.error("El botón de salir no se encontró en el DOM.");
    return;
  }
  botonSalir.addEventListener('click', () => {
    // Limpiar el localStorage
    localStorage.removeItem('nombreCliente');
    localStorage.removeItem('carrito');
    localStorage.removeItem('lastSaleId');
    // Redirigir a la página de inicio
    window.location.href = '/index.html';
  });
}


document.addEventListener("DOMContentLoaded", async () => {
  // Cargar los datos del ticket
  const datosTicket = await cargarDatosTicket();
  
  renderizarTicket(datosTicket);
  eventoImprimirTicket();
  eventoSalir();

});