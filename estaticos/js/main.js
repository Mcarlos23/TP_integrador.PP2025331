//console.log("JavaScript cargado correctamente");

document.addEventListener("DOMContentLoaded", async () => {
  const contenedorHeader = document.getElementById("header");
  const contenedorFooter = document.getElementById("footer");

  // Cargamos el header

  if (!contenedorHeader) {
    console.error("El elemento con id 'header' no se encontró en el DOM.");
    return;
  } 
  try {
    const headerRespuesta = await fetch("/header.html");

    if (headerRespuesta.ok) {
      const headerHTML = await headerRespuesta.text();
      contenedorHeader.innerHTML = headerHTML;
    } else {
      console.error("Error al cargar el header:", headerRespuesta.status, headerRespuesta.statusText);
    }
  } catch (error) {
      console.error("Error al realizar la solicitud:", error);
  }

  // Cargamos el footer
  if (!contenedorFooter) {
    console.error("El elemento con id 'footer' no se encontró en el DOM.");
    return;
  }
  try {
    const footerRespuesta = await fetch("/footer.html");

    if (footerRespuesta.ok) {
      const footerHTML = await footerRespuesta.text();
      contenedorFooter.innerHTML = footerHTML;
    } else {
      console.error("Error al cargar el footer:", footerRespuesta.status, footerRespuesta.statusText);
    }
  } catch (error) {
      console.error("Error al realizar la solicitud:", error);
  }

});