const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');aqa
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const SECRET_KEY = 'secretK'; // Substitua por uma chave secreta mais segura em produção

// Middleware para autenticar usando JWT
// Verifica se o token JWT fornecido é válido e adiciona os dados do usuário ao objeto de solicitação
function autenticarJWT(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Pega o token do header Authorization

    if (!token) {
        return res.status(403).json({ mensagem: 'Token não fornecido.' }); // Retorna erro se o token não estiver presente
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ mensagem: 'Token inválido.' }); // Retorna erro se o token não for válido
        }
        req.user = user; // Adiciona os dados do usuário ao objeto de solicitação
        next(); // Continua para a próxima função middleware ou rota
    });
}

// Middleware para verificar se o usuário é Admin
// Garante que apenas usuários com o papel de Admin possam acessar certas rotas
function verificarAdmin(req, res, next) {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ mensagem: 'ACESSO NEGADO!. Somente admins podem realizar esta operação.' }); // Retorna erro se o usuário não for Admin
    }
    next(); // Continua para a próxima função middleware ou rota
}

// Rota de exclusão de tickets protegida por cargo de Admin
// Esta rota permite que um administrador exclua um ticket específico pelo ID
app.delete('/tickets/:id', autenticarJWT, verificarAdmin, async (req, res) => {
    const { id } = req.params; // Pega o ID do ticket a ser excluído

    try {
        await prisma.ticket.delete({
            where: { id: parseInt(id) } // Remove o ticket do banco de dados
        });
        res.status(204).send(); // Retorna status 204 (Sem Conteúdo) se a exclusão for bem-sucedida
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar ticket.' }); // Retorna erro se a exclusão falhar
    }
});

// Rota para registrar um novo usuário
// Esta rota cria um novo usuário com os dados fornecidos
app.post('/register', async (req, res) => {
    const { email, password, role } = req.body; // Pega os dados do novo usuário

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Cria um hash da senha para segurança
        const usuario = await prisma.usuario.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'Atendente' // Define o papel do usuário (padrão é 'Atendente')
            }
        });
        res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario }); // Retorna status 201 (Criado) e os detalhes do novo usuário
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao criar usuário.' }); // Retorna erro se a criação falhar
    }
});

// Rota para login e geração de JWT
// Verifica as credenciais do usuário e gera um token JWT se tudo estiver correto
app.post('/login', async (req, res) => {
    const { email, password } = req.body; // Pega o email e a senha fornecidos

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { email } // Tenta encontrar o usuário com o email fornecido
        });

        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas.' }); // Retorna erro se as credenciais forem inválidas
        }

        // Gera um token JWT válido por 1 hora com os dados do usuário
        const token = jwt.sign({ id: usuario.id, role: usuario.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ mensagem: 'Login bem-sucedido', token }); // Retorna o token e uma mensagem de sucesso
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao fazer login.' }); // Retorna erro se o login falhar
    }
});

// Rota para criar um novo ticket
// Só usuários autenticados podem criar tickets
app.post('/tickets', autenticarJWT, async (req, res) => {
    const { title, description, priority, colaboradorId } = req.body; // Pega os dados do novo ticket
    const erros = []; // Array para armazenar erros de validação

    // Verifica se o título foi fornecido e não está vazio
    if (!title || title.trim() === '') {
        erros.push('Título obrigatório.');
    }

    // Verifica se a descrição foi fornecida e não está vazia
    if (!description || description.trim() === '') {
        erros.push('Descrição obrigatória.');
    }

    // Verifica se a prioridade é um número e foi fornecida
    if (priority === undefined || typeof priority !== 'number') {
        erros.push('Prioridade obrigatória (deve ser um número).');
    }

    // Verifica se o ID do colaborador foi fornecido
    if (!colaboradorId) {
        erros.push('ID do colaborador obrigatório.');
    }

    // Se houver erros, retorna um status 400 (Bad Request) com as mensagens de erro
    if (erros.length > 0) {
        return res.status(400).json({ mensagem: 'Erro na validação dos campos', erros });
    }

    try {
        // Tenta criar o ticket no banco de dados com os dados fornecidos
        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority,
                colaboradorId
            }
        });
        res.status(201).json(ticket); // Retorna o ticket criado com status 201 (Criado)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar ticket.' }); // Retorna erro se a criação falhar
    }
});

// Rota para atualizar um ticket existente
// Só usuários autenticados podem atualizar tickets
app.put('/tickets/:id', autenticarJWT, async (req, res) => {
    const { id } = req.params; // Pega o ID do ticket a ser atualizado
    const { title, description, priority } = req.body; // Pega os novos dados do ticket

    try {
        // Tenta atualizar o ticket com o ID fornecido e os novos dados
        const ticket = await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: { title, description, priority }
        });
        res.json(ticket); // Retorna o ticket atualizado com status 200 (OK)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar ticket.' }); // Retorna erro se a atualização falhar
    }
});

// Rota para excluir um ticket existente
// Só usuários autenticados podem excluir tickets
app.delete('/tickets/:id', autenticarJWT, async (req, res) => {
    const { id } = req.params; // Pega o ID do ticket a ser excluído

    try {
        // Tenta excluir o ticket com o ID fornecido
        await prisma.ticket.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send(); // Retorna status 204 (Sem Conteúdo) se a exclusão for bem-sucedida
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar ticket.' }); // Retorna erro se a exclusão falhar
    }
});

// Rota para obter todos os tickets
// Só usuários autenticados podem acessar a lista de tickets
app.get('/tickets', autenticarJWT, async (req, res) => {
    try {
        // Tenta buscar todos os tickets no banco de dados
        const tickets = await prisma.ticket.findMany();
        res.json(tickets); // Retorna a lista de tickets com status 200 (OK)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar tickets.' }); // Retorna erro se a busca falhar
    }
});

// Inicializa o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`); // Informa que o servidor está rodando
});
