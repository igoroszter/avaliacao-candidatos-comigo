const express = require('express');
const router = express.Router();
const { criarTicket, atualizarTicket, excluirTicket, obterTickets } = require('../controllers/ticketController');
const autenticarJWT = require('../middlewares/authMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');

// Rotas de tickets
router.post('/', autenticarJWT, criarTicket);
router.put('/:id', autenticarJWT, atualizarTicket);
router.delete('/:id', autenticarJWT, excluirTicket);
router.get('/', autenticarJWT, obterTickets);

module.exports = router;
