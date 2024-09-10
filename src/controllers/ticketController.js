const prisma = require('../prismaClient');

// Controlador para criar um novo ticket
async function criarTicket(req, res) {
    const { title, description, priority, colaboradorId } = req.body;
    const erros = [];

    if (!title || title.trim() === '') erros.push('Título obrigatório.');
    if (!description || description.trim() === '') erros.push('Descrição obrigatória.');
    if (priority === undefined || typeof priority !== 'number') erros.push('Prioridade obrigatória (deve ser um número).');
    if (!colaboradorId) erros.push('ID do colaborador obrigatório.');

    if (erros.length > 0) return res.status(400).json({ mensagem: 'Erro na validação dos campos', erros });

    try {
        const ticket = await prisma.ticket.create({ data: { title, description, priority, colaboradorId } });
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar ticket.' });
    }
}

// Controlador para atualizar um ticket existente
async function atualizarTicket(req, res) {
    const { id } = req.params;
    const { title, description, priority } = req.body;

    try {
        const ticket = await prisma.ticket.update({ where: { id: parseInt(id) }, data: { title, description, priority } });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar ticket.' });
    }
}

// Controlador para excluir um ticket
async function excluirTicket(req, res) {
    const { id } = req.params;

    try {
        await prisma.ticket.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar ticket.' });
    }
}

// Controlador para obter todos os tickets
async function obterTickets(req, res) {
    try {
        const tickets = await prisma.ticket.findMany();
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar tickets.' });
    }
}

module.exports = { criarTicket, atualizarTicket, excluirTicket, obterTickets };
