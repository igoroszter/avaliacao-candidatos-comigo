const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/config');

// Middleware para autenticar usando JWT
function autenticarJWT(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Pega o token do header Authorization

    if (!token) {
        return res.status(403).json({ mensagem: 'Token não fornecido.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ mensagem: 'Token inválido.' });
        }
        req.user = user;
        next();
    });
}

module.exports = autenticarJWT;
