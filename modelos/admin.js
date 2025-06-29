// Librería bcrypt utilizada para encriptar contraseñas

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// Documentación sobre encriptación de contraseñas en Node.js usando bcryptjs:
// https://www.geeksforgeeks.org/node-js-password-encryption-in-node-js-using-bcryptjs-module/
//https://www.freecodecamp.org/news/how-to-hash-passwords-with-bcrypt-in-nodejs/#:~:text=To%20verify%20a%20password%20using,using%20bcrypt%20in%20your%20Node.
const bcrypt = require('bcryptjs'); // Librería para encriptar contraseñas

const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // El email no se repite entre administradores
        validate: {
            isEmail: true // Garantiza que el formato del email sea correcto
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    // Configuración adicional del modelo
    // Los hooks son funciones que se ejecutan en momentos específicos del ciclo de vida del modelo
    hooks: {
        // El hook 'beforeCreate' se ejecuta antes de guardar un nuevo administrador en la base de datos
        // Almacena salt y hash lo que permite lugar usar compare para validar las contraseñas
        beforeCreate: async (admin) => {
            // Genera un 'salt' y hashea la contraseña
            // Salt es un valor aleatorio añadido a la contraseña antes de hashearla
            // Permite que dos contraseñas iguales generen hashes diferentes
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(admin.password, salt);
        }
    },
    tableName: 'Admins' // Nombre explícito de la tabla
});

// Método de instancia disponible en cada objeto 'admin' recuperado de la base de datos
// Este método compara la contraseña proporcionada (por ejemplo, en el login) con la contraseña hasheada almacenada
Admin.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = Admin;
