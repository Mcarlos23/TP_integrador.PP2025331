function autenticacionMiddleware(req, res, next) {
    // Verificar si el usuario está autenticado
    //console.log("Verificando autenticación del usuario...");
    if (req.session && req.session.isAdmin) {
        // Si está autenticado, continuar con la solicitud
        //console.log("Usuario autenticado, continuando con la solicitud...");
        return next();
    } else {
        // Si no está autenticado, redirigir al formulario de login
        return res.redirect('/admin/login');
    }
}

module.exports = autenticacionMiddleware;