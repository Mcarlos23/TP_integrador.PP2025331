
// Esta funcion agrega un evento al formulario para manejar el envío
// y validar el nombre del cliente antes de redirigirlo a la página de productos.
function agregarEventSubmit() {
  const formulario = document.getElementById('formulario-inicio');
  const inputNombre = document.getElementById('nombre-input');

  formulario.addEventListener('submit', (event) => {
    // 1. Prevenimos que el formulario se envíe de la forma tradicional
    event.preventDefault();

    // 2. Obtenemos el valor del input y quitamos espacios en blanco
    const nombreCliente = inputNombre.value.trim();

    // 3. Hacemos la validación de caracteres
    if (nombreCliente.length >= 2 && nombreCliente.length <= 30) {
      // Si es válido, lo guardamos en localStorage
      localStorage.setItem('nombreCliente', nombreCliente);

      // Y redirigimos al usuario a la página de productos
      window.location.href = formulario.action; // Usa la acción definida en el HTML
    } else {
      // Si no es válido, mostramos una alerta
      alert('Por favor, ingresa un nombre que tenga entre 2 y 30 caracteres.');
    }
  });
}

// Este script se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  // limpiar usuario de localStorage
  localStorage.removeItem('nombreCliente');

  // limpiar el carrito de compras
  localStorage.removeItem('carrito');
  //console.log("Carrito de compras limpiado");

  // console.log("JavaScript cargado correctamente");
  agregarEventSubmit();
});