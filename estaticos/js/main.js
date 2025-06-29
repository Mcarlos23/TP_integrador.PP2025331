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
      //console.log("No se encontró el nombre del cliente en localStorage. Redirigiendo a la página de inicio.");
    }
  }
}

// Funcion para cargar plantillas HTML en el DOM
async function cargarPlantilla(url, contenedor) {
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
}

// Funciona para aplicar modo claro o modo oscuro
function aplicarTema(tema) {
  if (tema === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  // Actualizar el botón.
  const themeToggleButton = document.getElementById('theme-toggle');
  if (themeToggleButton) {
    themeToggleButton.classList.toggle('dark-mode', tema === 'dark');
  }
}

// Funciona para inicializar el modo claro u oscuro
function cargarModo() {
  const modo = localStorage.getItem('theme') || 'light'; // Por defecto, modo claro
  aplicarTema(modo);
}

// Funcion para añadir el evento de cambio de tema
function añadirEventoCambioTema() {
  const themeToggleButton = document.getElementById('theme-toggle');
  if (!themeToggleButton) return; // Si no está el botón, no hace nada

  themeToggleButton.addEventListener('click', () => {
    let temaActual = document.documentElement.getAttribute('data-theme') ? 'dark' : 'light';
    let temaNuevo = temaActual === 'dark' ? 'light' : 'dark';

    aplicarTema(temaNuevo);
    localStorage.setItem('theme', temaNuevo); // Guardar el tema en localStorage
  });
}

cargarModo(); // Cargar el modo claro u oscuro

document.addEventListener("DOMContentLoaded", async () => {

  if (!paginaActual.startsWith('/admin')) {
    // Si la página es del admin, validar la ruta
  validarRuta(); // Validar la ruta antes de cargar las plantillas
  const contenedorHeader = document.getElementById("header");
  const contenedorFooter = document.getElementById("footer");

  // Cargar las plantillas de header y footer
  //cargarModo(); // Cargar el modo claro u oscuro
  await cargarPlantilla('header.html', contenedorHeader);
  añadirEventoCambioTema(); // Añadir el evento de cambio de tema

  await cargarPlantilla('footer.html', contenedorFooter);
  añadirEventoCambioTema(); // Añadir el evento de cambio de tema
  await cargarPlantilla('footer.html', contenedorFooter);
  }

  añadirEventoCambioTema(); // Añadir el evento de cambio de tema
   
});
