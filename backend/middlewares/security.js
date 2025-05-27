// backend/middlewares/security.js

module.exports = (req, res, next) => {
    // Protección contra XSS
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevenir carga de contenido en iframe (clickjacking)
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Política de contenido seguro
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob:;");
    
    // Prevenir MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Eliminar header que expone información del servidor
    res.removeHeader('X-Powered-By');
    
    next();
  };