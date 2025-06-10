async function interceptorError(req, res, next) {
    try {
        await next();
    } catch (error) {
        let codigo = error.codigo || 500;
        let mensaje = error.mensaje;
        console.error('Error interceptado:', error);
        res.status(codigo).json({
            mensaje: 'Ocurrió un error en el servidor',
            error: error.message
        });
    }
  
}
module.exports = interceptorError;
// Este interceptor captura errores en las rutas y devuelve una respuesta JSON con el error