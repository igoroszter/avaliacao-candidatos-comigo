# Avaliação de Candidatos Comigo

## Descrição

Este projeto é uma API para gerenciamento de tickets e usuários. Foi construído utilizando Node.js, Express, Prisma, PostgreSQL e autenticação JWT. Ele permite o registro, login, criação, edição, visualização e exclusão de tickets, com permissões de acesso baseadas em cargo.

## Funcionalidades

- Registro de usuários com cargos definidos (Atendente ou Admin).
- Autenticação de usuários via JWT.
- CRUD de tickets.
- Rotas protegidas por autenticação JWT e autorização baseada em cargos.
  
## Tecnologias Utilizadas

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- Docker para containerização

## Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (v14 ou superior)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Configuração do Ambiente

**1. Clone o Repositório**

bash
git clone https://github.com/username/avaliacao-candidatos-comigo.git
cd avaliacao-candidatos-comigo

**2. Instale as Dependências**

Instale as dependências do projeto com o npm:
npm install

**3. Configure as Variáveis de Ambiente**

Crie um arquivo .env na raiz do projeto e adicione as seguintes variáveis:
DATABASE_URL="postgresql://postgres:admin1234@localhost:5432/bancotickets"
SECRET_KEY="secretK"

**4. Executando com Docker**

4.1. Crie a Imagem Docker
No diretório do projeto, crie uma imagem Docker usando o Dockerfile:
docker build -t avaliacao-candidatos-comigo .

4.2. Inicie os Contêineres
Inicie os contêineres utilizando o Docker Compose:
docker-compose up -d

4.3. Acesse a Aplicação
A aplicação estará rodando em http://localhost:3000.

**5. Executando o Projeto Localmente (Sem Docker)**
Caso prefira rodar o projeto localmente sem Docker:

5.1. Migre o Banco de Dados
Rode as migrações do Prisma para configurar o banco de dados:
npx prisma migrate dev

5.2. Execute o Projeto
Inicie o servidor de desenvolvimento:
npm run dev

**O projeto estará disponível em http://localhost:3000.**

**Testes**
Para rodar os testes, utilize:
npm test