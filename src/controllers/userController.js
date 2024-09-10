const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { SECRET_KEY } = require('../config/config');

// Controlador para registrar um novo usuário
async function registrarUsuario(req, res) {
    const { email, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const usuario = await prisma.usuario.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'Atendente'
            }
        });
        res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao criar usuário.' });
    }
}

// Controlador para login e geração de JWT
async function login(req, res) {
    const { email, password } = req.body;

    try {
        const usuario = await prisma.usuario.findUnique({ where: { email } });

        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id: usuario.id, role: usuario.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ mensagem: 'Login bem-sucedido', token });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao fazer login.' });
    }
}

module.exports = { registrarUsuario, login };
