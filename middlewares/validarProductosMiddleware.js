// middlewares/productValidationMiddleware.js

const validateProduct = async (req, res, next) => {
    // Extraer los campos del cuerpo de la solicitud
    console.log('Validando producto:', req.body);
    const { title, author, publisher, isbn, price, stock } = req.body;
    let errors = [];

    // Validaciones

    if (!title || title.trim().length < 5) {
        errors.push({ msg: 'El título es obligatorio y debe tener al menos 5 caracteres.' });
    }

    if (!author || author.trim() === '') {
        errors.push({ msg: 'El nombre del autor no puede estar vacío.' });
    }

    if (publisher && publisher.trim().length > 100) {
        errors.push({ msg: 'El nombre de la editorial no puede superar los 100 caracteres.' });
    } else if (!publisher || publisher.trim() === '') {
        errors.push({ msg: 'El nombre de la editorial es obligatorio.' });
    }

    if (!isbn || isbn.trim() === '') {
        errors.push({ msg: 'El ISBN es obligatorio.' });
    }

    if (!price || isNaN(price) || parseFloat(price) <= 0) {
        errors.push({ msg: 'El precio debe ser un número válido mayor que cero.' });
    }

    if (!stock || isNaN(stock) || parseInt(stock) < 0) {
        errors.push({ msg: 'El stock debe ser un número entero igual o mayor a cero.' });
    }

    // --- Si encontramos errores, manejamos el renderizado ---
    if (errors.length > 0) {
        let modoEdicion;

        if (req.params.id) {
          modoEdicion = true;
        } else {
          modoEdicion = false;
        }

        if (modoEdicion) {
            // Pasamos los datos que el usuario ya había escrito para que no los pierda
            return res.render('product-form.ejs', {
                title: 'Editar Producto',
                isEditMode: true,
                errors: errors,
                product: { id: req.params.id, ...req.body }
            });
        } else {
            return res.render('product-form.ejs', {
                title: 'Alta de Producto',
                isEditMode: false,
                errors: errors,
                product: req.body
            });
        }
    }

    // Si no hubo ningún error, le damos paso al controlador
    next();
};

module.exports = {
    validateProduct
};