const express = require('express');
// Cargar variables de entorno desde .env. Me permite usar process.env para acceder a las variables definidas en .env
require('dotenv').config(); 
const methodOverride = require('method-override'); // Luego de installar method-override, crear una constante para usarlo
const sequelize = require('./config/database.js'); // Importar la conexion a la base de datos
const rutasApi = require('./rutas/rutasApi.js'); // Importar las rutas de la API
const interceptorError = require('./controladores/interceptorErrores.js'); // importar el interceptor de errores

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
app.use('/api', rutasApi); // Usa las rutas de la API
app.use(interceptorError); // Interceptor de errores para manejar errores en las rutas


app.listen(PORT, async () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    
    // Sincronizar los modelos con la base de datos
    try {
        await sequelize.sync({ force: false }); // Puedo cambiar 'force' a true si necesito reiniciar la base de datos
        console.log('✅ Modelos sincronizados con la base de datos.');
    } catch (error) {
        console.error('❌ Error al sincronizar los modelos con la base de datos:', error);
    }
});


