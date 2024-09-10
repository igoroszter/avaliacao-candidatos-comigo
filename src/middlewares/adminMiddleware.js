// Middleware para verificar se o usuário é Admin
function verificarAdmin(req, res, next) {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ mensagem: 'ACESSO NEGADO!. Somente admins podem realizar esta operação.' });
    }
    next();
}

module.exports = verificarAdmin;
