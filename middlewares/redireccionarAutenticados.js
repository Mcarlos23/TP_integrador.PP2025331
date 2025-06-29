function redireccionarAutenticados(req, res, next) {
    // Verificamos si existe la sesión y si el usuario es un administrador
    if (req.session && req.session.isAdmin) {
        // Si ya está logueado, lo redirigimos al dashboard
        return res.redirect('/admin/dashboard');
    }
    
    // Si no está logueado, le permitimos continuar para que vea la página de login
    return next();
}

module.exports = redireccionarAutenticados;