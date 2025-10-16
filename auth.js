const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'repuestos-motos-secret-key-2024'; // En producción, usar variable de entorno

// Middleware para verificar token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

// Middleware para verificar rol de admin
function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
}

// Generar token
function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '24h' }
    );
}

// Hash de contraseña
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// Comparar contraseña
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

module.exports = {
    authenticateToken,
    isAdmin,
    generateToken,
    hashPassword,
    comparePassword,
    SECRET_KEY
};
