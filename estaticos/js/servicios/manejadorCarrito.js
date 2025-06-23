const manejadorCarrito = {
    obtenerCarrito() {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    },

    guardarCarrito(carrito) {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    },

    agregarAlCarrito(producto) {
        const carrito = this.obtenerCarrito();
        const productoExistente = carrito.find(item => item.id === producto.id);
        
        if (productoExistente) {
            this.aumentarCantidad(producto.id);
        } else {
            carrito.push({ ...producto, cantidad: 1 });
            this.guardarCarrito(carrito);
        }      
    },
    aumentarCantidad(productoId) {
      const carrito = this.obtenerCarrito();
      const productoExistente = carrito.find(item => item.id === productoId);
      if (productoExistente) {
        //console.log(productoExistente);
          productoExistente.cantidad++;
          this.guardarCarrito(carrito);
      } else {
          console.error(`Producto con ID ${productoId} no encontrado en el carrito.`);
      } 
    },
    eliminarDelCarrito(productoId) {
        let carrito = this.obtenerCarrito();
        const productoExistente = carrito.find(item => item.id === productoId);

        if (productoExistente && productoExistente.cantidad > 1) {
            productoExistente.cantidad--;
        } else {
            carrito = carrito.filter(item => item.id !== productoId);
        }
        
        this.guardarCarrito(carrito);
    },
    removerTodasLasUnidades(productoId) {
        let carrito = this.obtenerCarrito();
        carrito = carrito.filter(item => item.id !== productoId);
        this.guardarCarrito(carrito);
        console.log(`Todas las unidades del producto con ID ${productoId} han sido eliminadas del carrito.`);
    }
};

export default manejadorCarrito;


  
