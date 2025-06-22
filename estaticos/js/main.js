//console.log("JavaScript cargado correctamente");
// Protección de rutas en el lado del cliente
const paginasPublicas = ['/', '/index.html', '/ticket.html'];
const paginaActual = window.location.pathname;

// Verificar si la página actual es pública
function validarRuta() {
  if (!paginasPublicas.includes(paginaActual)) { 
    const nombreCliente = localStorage.getItem('nombreCliente');
    // Si no hay nombre de cliente en localStorage, redirigir a la página de inicio
    if (!nombreCliente) {
      window.location.href = '/index.html'; // Redirigir a la página de inicio
      console.warn("No se encontró el nombre del cliente en localStorage. Redirigiendo a la página de inicio.");
    }
  }
}

 // Funcion para cargar plantillas HTML en el DOM
  const cargarPlantilla = async (url, contenedor) => {
    if (!contenedor) {
      console.error(`El elemento con id '${contenedor.id}' no se encontró en el DOM.`);
      return;
    }
    try {
      const respuesta = await fetch(url);
      if (respuesta.ok) {
        const html = await respuesta.text();
        contenedor.innerHTML = html;
      } else {
        console.error(`Error al cargar la plantilla desde ${url}:`, respuesta.status, respuesta.statusText);
      }
    } catch (error) {
      console.error(`Error al realizar la solicitud a ${url}:`, error); 
    }
  };

document.addEventListener("DOMContentLoaded", async () => {
  const contenedorHeader = document.getElementById("header");
  const contenedorFooter = document.getElementById("footer");

  // Cargar las plantillas de header y footer
  validarRuta(); // Validar la ruta antes de cargar las plantillas
  cargarPlantilla('header.html', contenedorHeader);
  cargarPlantilla('footer.html', contenedorFooter);

});