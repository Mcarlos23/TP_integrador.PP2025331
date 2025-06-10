class ControladorApi {
  constructor(vista, modelo) {
    this.vista = vista;
    this.modelo = modelo;
  }  
}

let controladorApi = new ControladorApi();

// Exportar la instancia del controlador
module.exports = controladorApi;