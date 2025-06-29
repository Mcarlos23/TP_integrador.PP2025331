const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    // Define la carpeta donde se guardarán las imágenes
    destination: function (req, file, cb) {
        cb(null, 'estaticos/images/covers');
    },
    // Define el nombre del archivo
    filename: function (req, file, cb) {
        // Crea un nombre de archivo único con el timestamp actual
        const nuevoNombre = 'cover-' + Date.now() + path.extname(file.originalname);
        cb(null, nuevoNombre);
    }
   
});

// Creamos la instancia de Multer con la configuración de almacenamiento
const cargaDeArchivosMiddleware = multer({ storage: storage });

module.exports = cargaDeArchivosMiddleware;