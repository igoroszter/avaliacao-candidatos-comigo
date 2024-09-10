const express = require('express');
const app = express();
app.use(express.json());

// Importando rotas
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');

// Usando rotas
app.use('/tickets', ticketRoutes);
app.use('/users', userRoutes);

// Inicializa o servidor na porta especificada
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
