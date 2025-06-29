# 📖 Punto Lector - TP Integrador

Este es el proyecto integrador para la materia Programación III. Consiste en una aplicación full-stack que simula autoservicio para la compra de libros y mangas, junto con un panel de administrador para la gestión de productos.

---

## 🚀 Configuración e Instalación

Sigue estos pasos para levantar el proyecto en un entorno de desarrollo local.

### Prerrequisitos

* Tener [Node.js](https://nodejs.org/) instalado (versión 18 o superior recomendada).
* Tener un servidor de [MySQL](https://www.mysql.com/) corriendo localmente.

### Pasos

1.  **Clonar el Repositorio**
    Abre la terminal y clona el proyecto en tu máquina local.
    ```bash
    git clone https://github.com/Mcarlos23/TP_integrador.PP2025331.git
    cd nombre-de-la-carpeta
    ```

2.  **Instalar Dependencias**
    Ejecuta el siguiente comando para instalar todos los paquetes necesarios definidos en `package.json`.
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Crea una copia del archivo `.env.example` y renómbrala a `.env`. Luego, abre el nuevo archivo `.env` y rellena las variables que estén vacías (DB_HOST, DB_USER, DB_PASSWORD).
    ```bash
    # En Windows
    copy .env.example .env

    # En macOS / Linux
    cp .env.example .env
    ```

4.  **Crear y realizar inserts en la Base de Datos**
    Ejecuta el siguiente comando. Este script se encargará de todo automáticamente: creará la base de datos si no existe, construirá todas las tablas y las llenará con los productos de prueba y el usuario administrador.
    ```bash
    npm run seed
    ```

5.  **Iniciar el Servidor de Desarrollo**
    Finalmente, levanta el servidor con `nodemon`, que se reiniciará automáticamente con cada cambio que hagas en el código.
    ```bash
    npm run dev
    ```

---

### Acceso a la Aplicación

Una vez que el servidor esté corriendo, puedes acceder a:

* **Sitio del Cliente:** `http://localhost:3000`
* **Panel de Administrador:** `http://localhost:3000/admin/login`
    * **Usuario de prueba:** `admin@puntoreader.com`
    * **Contraseña de prueba:** `password123`
