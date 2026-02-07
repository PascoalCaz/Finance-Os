# 🤖 Automação FinanceOS com n8n (Guia Completo)

Este guia contém as **Ferramentas SQL de Elite** para o seu servidor Hostinger.

---

## 📦 FICHEIROS DE AUTOMAÇÃO

| Ficheiro                                                                                                                 | Função                         |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| [FinanceOS_Fix_Referencias_n8n.json](file:///c:/xampp/htdocs/FinanceOs/FinanceOS_Fix_Referencias_n8n.json)               | Registo de Receitas e Despesas |
| [FinanceOS_CRUD_Categorias_Contas_n8n.json](file:///c:/xampp/htdocs/FinanceOs/FinanceOS_CRUD_Categorias_Contas_n8n.json) | Gestão de Categorias e Contas  |

---

## 🏷️ CRUD DE CATEGORIAS E CONTAS

### Como usar o workflow de CRUD:

1. No nó "Entrada", defina o campo `operacao` com um destes valores:
    - `listar_categorias` - Lista categorias do utilizador
    - `criar_categoria` - Cria uma nova categoria
    - `listar_contas` - Lista contas do utilizador
    - `criar_conta` - Cria uma nova conta

2. Preencha os campos conforme a operação:
    - **Listar Categorias**: `filtro_tipo` = `expense` ou `income`
    - **Criar Categoria**: `nome`, `filtro_tipo`, `icon`, `cor`
    - **Criar Conta**: `nome`, `tipo_conta` (checking/savings/cash), `banco`, `saldo_inicial`

---

## 🔧 TIPOS DE CONTA DISPONÍVEIS

| Valor        | Descrição         |
| ------------ | ----------------- |
| `checking`   | Conta Corrente    |
| `savings`    | Poupança          |
| `investment` | Investimento      |
| `cash`       | Dinheiro/Carteira |

---

🚀 **O seu ecossistema de automação está completo!**
