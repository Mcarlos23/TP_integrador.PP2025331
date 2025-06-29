// seed.js

// Importar el modelo Admin para interactuar con la tabla correspondiente
const Admin = require('./modelos/admin.js'); 
// Importar la instancia de Sequelize para manejar la conexión a la base de datos
const sequelize = require('./config/database');

// Definir una función asíncrona para utilizar 'await' en las operaciones
async function createAdmin() {
    console.log('Iniciando el script de creación de administrador...');
    try {
        // Sincronizar el modelo con la base de datos para asegurar que la tabla 'Admins' exista
        await sequelize.sync();

        console.log('Verificando existencia o creando el usuario administrador...');

        // Utilizar el método findOrCreate de Sequelize.
        // Busca un administrador con el email especificado. Si no existe, lo crea con los valores por defecto.
        const [admin, created] = await Admin.findOrCreate({
            where: { email: 'admin@puntoreader.com' },
            defaults: {
                // La contraseña se proporciona en texto plano.
                // El hook 'beforeCreate' del modelo se encargará de encriptarla automáticamente.
                password: 'password123' 
            }
        });

        if (created) {
            // Este mensaje se muestra solo si el usuario fue creado en esta ejecución
            console.log('✅ Administrador creado exitosamente.');
            console.log('   -> Email:', admin.email);
            console.log('   -> Contraseña (en texto plano): password123');
        } else {
            // Este mensaje se muestra si el usuario ya existía previamente en la base de datos
            console.log('ℹ️ El administrador "admin@puntoreader.com" ya existe en la base de datos.');
        }

    } catch (error) {
        console.error('❌ Ocurrió un error al ejecutar el script de creación:', error);
    } finally {
        // Cerrar la conexión a la base de datos para finalizar correctamente el script
        await sequelize.close();
        console.log('Conexión a la base de datos cerrada.');
    }
}

// Ejecutar la función definida para crear o verificar el administrador
createAdmin();