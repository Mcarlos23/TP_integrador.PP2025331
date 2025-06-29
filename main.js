const express = require('express');
require('dotenv').config();  // Cargar variables de entorno desde .env. Me permite usar process.env para acceder a las variables definidas en .env
const methodOverride = require('method-override'); // Luego de installar method-override, crear una constante para usarlo
const sequelize = require('./config/database.js'); // Importar la conexion a la base de datos
const rutasApi = require('./rutas/rutasApi.js'); // Importar las rutas de la API
const rutasVistas = require('./rutas/rutasVistas.js'); // Importar las rutas de las vistas
const interceptorError = require('./controladores/interceptorErrores.js'); // importar el interceptor de errores
const session = require('express-session'); // Importar express-session para manejar sesiones
const path = require('path'); // Importar path para manejar rutas de archivos

const app = express();

// Configuración del puerto
// Si no se define el puerto en .env, se usa el 3000 por defecto
const PORT = process.env.PORT || 3000; 

// Configuración de la sesión
app.use(session({
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET || 'default_secret', // Clave secreta para firmar la sesión
    resave: false, // No volver a guardar la sesión si no ha habido cambios
    saveUninitialized: false, // No guardar sesiones no inicializadas
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // Duración de la cookie de sesión (1 día en milisegundos)
    }
}));

// Parseo del request body
app.use(express.json());

// Configuración de la vista
// Establece el motor de plantillas a EJS y la carpeta de vistas
app.set('view engine', 'ejs'); // Establece EJS como motor de plantillas
app.set('views', path.join(__dirname, 'vistas')); // Establece la carpeta de vistas


// Lo muevo aquí para que se aplique antes de las rutas
// Middleware para manejar el cuerpo de las solicitudes JSON
// Parseo de datos del formulario
// Permite que Express entienda los datos enviados en el cuerpo de las solicitudes POST
app.use(express.urlencoded({ extended: true }));

// Middleware para manejar métodos HTTP como PUT y DELETE
app.use(methodOverride('_method'));


// Configuración de CORS
// Permite solicitudes desde cualquier origen
var cors = require('cors');
app.use(cors({
    origin: '*', // Permite todas las solicitudes de origen 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Encabezados permitidos
}));


// Configuración de la carpeta estática
// Sirve archivos estáticos desde la carpeta 'estaticos'
app.use(express.static('estaticos', {
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    }
}));

// Rutas api
app.use('/api', rutasApi); // Usa las rutas de la API


// Rutas vistas
app.use('/admin', rutasVistas); // Usa las rutas de las vistas

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


