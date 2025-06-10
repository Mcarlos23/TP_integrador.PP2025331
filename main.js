const express = require('express');

// Cargar variables de entorno desde .env. Me permite usar process.env para acceder a las variables definidas en .env
require('dotenv').config(); 

// Luego de installar method-override, crear una constante para usarlo
const methodOverride = require('method-override');

const app = express();

// Configuración del puerto
// Si no se define el puerto en .env, se usa el 3000 por defecto
const PORT = process.env.PORT || 3000; 

// Parseo del request body
app.use(express.json());


//app.use(express.urlencoded({ extended: true }));
// override with POST having ?_method=DELETE
//app.use(methodOverride('_method'));
//const compression = require('compression');
//app.use(compression());

// Configuración de la carpeta estática
// Sirve archivos estáticos desde la carpeta 'estaticos'
app.use(express.static('estaticos', {
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    }
}));


// Configuración de CORS
// Permite solicitudes desde cualquier origen
var cors = require('cors');
app.use(cors({
    origin: '*', // Permite todas las solicitudes de origen
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Encabezados permitidos
}));


// Uso del método override
app.use(methodOverride('_method'));


// Rutas
// app.use((req, res, next) => {
//     app.locals.protocol = req.protocol;
//     app.locals.hostname = req.hostname;
//     next();
// });


app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


