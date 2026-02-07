# 🏦 FinanceOs - Gestão Financeira Premium (Angola)

Bem-vindo ao **FinanceOs**, um sistema de finanças pessoais robusto desenhado especificamente para o contexto angolano. Este sistema permite que você gerencie suas contas bancárias (BAI, BFA, BIC, etc), controle despesas e visualize sua saúde financeira através de dashboards modernos e intuitivos.

## 🚀 Tecnologias Utilizadas

- **Backend:** Laravel 11/12 (PHP 8.3)
- **Frontend:** React + Inertia.js (Single Page Application)
- **Estilização:** Tailwind CSS (Design Premium & Glassmorphism)
- **Visualização de Dados:** Recharts & Lucide Icons
- **Banco de Dados:** MySQL (XAMPP)

## 📦 Funcionalidades Implementadas

- [x] **Dashboard Financeiro:** Visão consolidada de saldo total, receitas e despesas.
- [x] **Gestão de Contas:** Cadastro de bancos angolanos e carteiras físicas.
- [x] **Registo de Transações:** Entradas, saídas e transferências com atualização automática de saldo.
- [x] **Categorização Inteligente:** Organização de gastos por categorias (Alimentação, Transporte, etc).
- [x] **Relatórios Visuais:** Gráficos de área para acompanhamento do fluxo de caixa.

## 🛠️ Como Executar o Projeto

1. **Dependências do PHP:**
    ```bash
    php composer.phar install
    ```
2. **Dependências do Frontend:**
    ```bash
    npm install
    npm run build
    ```
3. **Configuração do Ambiente:**
    - O arquivo `.env` já está configurado para o banco `financeos`.
    - Execute as migrações e o seeder:
        ```bash
        php artisan migrate:fresh --seed
        ```
4. **Acesso:**
    - Inicie o servidor: `php artisan serve`
    - Acesse em: `http://localhost:8000`

---

## 📚 Guia de Aprendizado Progressivo

Este projecto foi construído com um foco pedagógico profundo. Aqui estão os conceitos que podes aprender ao explorar o código:

### 1. Arquitetura Laravel

- **Models & Eloquent:** Veja como os modelos em `app/Models` representam tabelas e como os relacionamentos (1-N) protegem a integridade dos dados.
- **Controllers:** Em `app/Http/Controllers`, exploramos como a lógica de negócio (validar dados, calcular saldos) é separada da visualização.

### 2. Frontend Moderno (React)

- **Inertia.js:** Aprenda como ligar o backend Laravel ao frontend React sem precisar criar uma API REST complexa.
- **Hooks (useState, useForm):** Veja como gerimos o estado da interface de forma reativa.

### 3. Banco de Dados & Segurança

- **Migrations:** O histórico de alterações do banco em `database/migrations`.
- **Atomicidade (DB Transactions):** No `TransactionController.php`, veja como garantimos que o saldo só muda se a transação for gravada com sucesso.

---

**Desenvolvido como Professor de Programação para o utilizador angolano.**
