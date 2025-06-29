document.addEventListener('DOMContentLoaded', () => {
    
    const tablaProductos = document.querySelector('.tabla-productos');

    // Si la tabla no se encuentra cargada, retornar
    if (!tablaProductos) return;

    // Agregar el manejardor del evanto
    tablaProductos.addEventListener('submit', (event) => {
        
        // Validar que provenga del formulario para modificar el estado del producto
        if (event.target.matches('.form-estado-producto')) {
            
            //Prevenimos el envío inmediato del formulario
            event.preventDefault();

            // Tomar el título del producto desde el atributo data-title
            let titulo = event.target.dataset.title;
            let mensajeModal = `Estás a punto de cambiar el estado del producto: "${titulo}".\n\n¿Deseas confirmar la operación?`;

            // Abrir la ventana modal para solicitar la confirmacion.
            let confirmacion = window.confirm(mensajeModal);

           
            if (confirmacion) {
                // Si el usuario confirma, enviamos el formulario. 
                event.target.submit();
            }
            
        }
    });
});