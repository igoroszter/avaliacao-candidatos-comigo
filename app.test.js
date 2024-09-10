const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const SECRET_KEY = 'secretK';

// Mock JWT middleware
function autenticarJWT(req, res, next) {
    req.user = { id: 1, role: 'Admin' }; // Mock user
    next();
}

// Roteamento de teste
app.post('/tickets', autenticarJWT, async (req, res) => {
    const { title, description, priority, colaboradorId } = req.body;
    const erros = [];

    if (!title || title.trim() === '') {
        erros.push('Título obrigatório.');
    }

    if (!description || description.trim() === '') {
        erros.push('Descrição obrigatória.');
    }

    if (priority === undefined || typeof priority !== 'number') {
        erros.push('Prioridade obrigatória (deve ser um número.)');
    }

    if (!colaboradorId) {
        erros.push('O ID do colaborador obrigatório.');
    }

    if (erros.length > 0) {
        return res.status(400).json({ mensagem: 'Erro na validação dos campos', erros });
    }

    try {
        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority,
                colaboradorId
            }
        });
        res.status(201).json(ticket);
    } catch (error) {
        console.error('Erro ao criar ticket:', error);
        res.status(500).json({ error: 'Erro ao criar ticket.' });
    }
});

describe('Testes de operações de tickets', () => {
    let colaboradorId;

    beforeAll(async () => {
        // Cria um colaborador para o teste
        const colaborador = await prisma.colaborador.create({
            data: {
                nome: 'Colaborador Teste',
                email: 'teste@teste.com'
            }
        });
        colaboradorId = colaborador.id;
    });

    afterAll(async () => {
        // Limpa o banco de dados após os testes
        await prisma.ticket.deleteMany({});
        await prisma.colaborador.deleteMany({});
        await prisma.$disconnect();
    });

    it('Deve criar um novo ticket', async () => {
        const res = await request(app)
            .post('/tickets')
            .send({
                title: 'Novo Ticket',
                description: 'Descrição do ticket',
                priority: 1,
                colaboradorId: colaboradorId // Usa o ID do colaborador criado
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });

    it('Deve retornar erro para validação de ticket sem título', async () => {
        const res = await request(app)
            .post('/tickets')
            .send({
                description: 'Descrição sem título',
                priority: 1,
                colaboradorId: colaboradorId
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('mensagem');
    });
});
