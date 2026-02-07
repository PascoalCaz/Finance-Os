# 🏥 Guia de Deploy: FinanceOS na Hostinger (Elite 360)

Este documento contém os passos finais para que o FinanceOS funcione perfeitamente no seu servidor Hostinger.

## 1. Preparação Local (Na sua Máquina)

Antes de enviar os ficheiros, execute:

```bash
npm run build
```

Isto criará a pasta `public/build` com todos os ativos do React otimizados.

## 2. Estrutura de Ficheiros

O arquivo `.htaccess` que criei na raiz já está configurado para redirecionar o seu domínio para a subpasta `public/`. **Transfira todo o conteúdo para a raiz da sua hospedagem (geralmente dentro de `public_html`).**

## 3. Comandos Iniciais (No Terminal da Hostinger via SSH)

Uma vez feito o upload, navegue para a pasta do projeto e execute:

```bash
# Instalar dependências de produção
composer install --no-dev --optimize-autoloader

# Gerar chave da aplicação (se necessário)
php artisan key:generate

# Criar link para armazenamento de ficheiros/anexos
php artisan storage:link

# Executar as migrações da base de dados
php artisan migrate --force

# Limpar e otimizar a cache
php artisan optimize
```

## 4. Configuração do `.env` na Hostinger

Certifique-se de que os seguintes campos estão configurados no seu painel Hostinger:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://oseudominio.com`
- `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (Dados do MySQL da Hostinger)

## 💎 Dica de Elite: Link Simbólico (Storage)

Na Hostinger, o comando `php artisan storage:link` pode às vezes falhar devido a restrições de caminho. Se não conseguir visualizar os anexos, remova a pasta `public/storage` e recrie o link manualmente por SSH:

```bash
ln -s /home/uXXXXXXX/domains/oseudominio.com/storage/app/public /home/uXXXXXXX/domains/oseudominio.com/public/storage
```

**Parabéns! O seu FinanceOS está agora pronto para brilhar globalmente.** 🌍✨🎯
