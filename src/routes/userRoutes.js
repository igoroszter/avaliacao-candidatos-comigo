const express = require('express');
const router = express.Router();
const { registrarUsuario, login } = require('../controllers/userController');

// Rotas de usuários
router.post('/register', registrarUsuario);
router.post('/login', login);

module.exports = router;
