# Meta Events Manager

Sistema de gerenciamento de eventos de conversão da Meta (Facebook). Monitore leads e purchase events em tempo real.

## 🚀 Funcionalidades

- ✅ Dashboard em tempo real com métricas de leads e conversões
- ✅ Filtros de data (Hoje, Ontem, Últimos 7/30 dias, Personalizado)
- ✅ Paginação completa para visualizar todos os eventos
- ✅ Configuração de credenciais da Meta (Pixel ID, Access Token)
- ✅ Gerenciamento de webhooks
- ✅ Sistema de autenticação simples
- ✅ Painel administrativo

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Roteamento**: React Router v6
- **Estado**: TanStack Query
- **Testes**: Vitest

## 📦 Instalação

```sh
# 1. Clone o repositório
git clone <YOUR_GIT_URL>

# 2. Entre no diretório
cd <YOUR_PROJECT_NAME>

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
# Copie o arquivo .env.example para .env e configure suas credenciais do Supabase

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

## 🔧 Scripts Disponíveis

```sh
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Build para produção
npm run build:dev    # Build em modo desenvolvimento
npm run lint         # Executa o linter
npm run preview      # Preview do build de produção
npm run test         # Executa os testes
npm run test:watch   # Executa os testes em modo watch
```

## 📊 Estrutura do Banco de Dados

### Tabela `users`
Tabela única com todos os dados do usuário:
- Autenticação (email, senha, nome)
- Credenciais da Meta (pixel_id, page_id, access_token)
- Webhook (webhook_url)
- Permissões (role: admin/user)

### Tabela `user_events`
Eventos de leads e conversões:
- Tipo de evento (lead/conversion)
- Status (success/failed/pending)
- Dados do cliente (telefone, ctwaclid, page_id)
- Timestamps

## 🔐 Credenciais Padrão

```
Email: admin@sistema.com
Senha: admin123
```

**⚠️ IMPORTANTE: Troque essas credenciais em produção!**

## 📝 Documentação Adicional

- `ESTRUTURA_BANCO.md` - Documentação completa da estrutura do banco
- `EXEMPLO_AUTENTICACAO.md` - Guia de implementação da autenticação
- `CREDENCIAIS_TESTE.md` - Credenciais e instruções de teste
- `IMPORTAR_DADOS_CTWACLID.md` - Guia de importação de dados

## 🚀 Deploy

Este projeto pode ser deployado em qualquer plataforma que suporte aplicações React:
- Vercel
- Netlify
- AWS Amplify
- GitHub Pages

## 📄 Licença

Este projeto é privado e proprietário.
