# Checklist de Correções - Projeto Supabase + React

## ✅ ESTRUTURA REAL DO BANCO DE DADOS

### Tabelas Existentes (Verificadas via MCP)

#### 1. **client_login** (Autenticação)
- `id`: bigint (PK)
- `created_at`: timestamp
- `email`: varchar
- `senha`: varchar
- **RLS**: Desabilitado
- **Registros**: 1

#### 2. **credenciais** (Credenciais da Meta)
- `id`: bigint (PK)
- `created_at`: timestamp
- `pixel_id`: numeric
- `access_token`: varchar
- `webhook`: varchar
- `page_id`: numeric
- `link_instrucao`: text
- **RLS**: Desabilitado
- **Registros**: 1

#### 3. **eventos_lead** (Eventos de Lead)
- `id`: bigint (PK)
- `created_at`: timestamp
- `numero`: numeric
- `page_id`: numeric
- `ctw_acl_id`: varchar
- `pixel_id`: numeric
- `access_token`: varchar
- **RLS**: Desabilitado
- **Registros**: 0

#### 4. **purchase_events** (Eventos de Compra)
- `id`: bigint (PK)
- `created_at`: timestamp
- `pixel_id`: numeric
- `fbtrace`: varchar
- `cliente_name`: text
- **RLS**: Desabilitado
- **Registros**: 0

#### 5. **Track Encap Wpp** (Tracking WhatsApp)
- `id`: bigint (PK)
- `created_at`: timestamp
- `phone`: numeric
- `ctwaClid`: varchar
- `page_id`: numeric
- **RLS**: Habilitado
- **Registros**: 41

## ✅ CORREÇÕES APLICADAS

### 1. Types do Supabase
✅ Arquivo `src/integrations/supabase/types.ts` atualizado com as tabelas reais do banco
✅ Todos os tipos correspondem exatamente à estrutura do banco

### 2. Código Mantido
✅ `useAuth.tsx` - Usa autenticação customizada com tabela `client_login`
✅ `Dashboard.tsx` - Busca de `eventos_lead` e `purchase_events`
✅ `Configuracao.tsx` - Salva em `credenciais` com todos os campos

## 📋 CHECKLIST DE VERIFICAÇÃO

### Antes de Iniciar
- [ ] Instalar dependências: `npm install`
- [ ] Verificar arquivo `.env` com credenciais corretas
- [ ] Verificar MCP configurado com access token válido

### Verificações de Código
- [ ] Types do Supabase correspondem ao banco real
- [ ] Nomes de tabelas em minúsculas: `client_login`, `credenciais`, `eventos_lead`, `purchase_events`
- [ ] Nomes de colunas corretos: `pixel_id`, `page_id`, `access_token`, `ctw_acl_id`, etc.
- [ ] IDs são números (`number`), não UUIDs

### Testes Funcionais
- [ ] Login funciona com email e senha
- [ ] Dashboard exibe contadores de eventos
- [ ] Configuração salva credenciais corretamente
- [ ] Webhook URL é exibida (se configurada)
- [ ] Link de instruções é exibido (se configurado)

### Comandos Úteis

```bash
# Verificar tipos
npm run type-check

# Rodar diagnósticos
# (usar getDiagnostics no Kiro)

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
```

## 🔍 VERIFICAÇÃO VIA MCP

Para verificar a estrutura do banco:

```javascript
// Listar tabelas
mcp_supabase_mcp_server_list_tables({
  project_id: "kxddnogzupkvkxtfeiqv",
  schemas: ["public"]
})

// Executar SQL
mcp_supabase_mcp_server_execute_sql({
  project_id: "kxddnogzupkvkxtfeiqv",
  query: "SELECT * FROM client_login LIMIT 1"
})
```

## ⚠️ IMPORTANTE

1. **Não usar Supabase Auth**: O projeto usa autenticação customizada
2. **IDs são números**: Não são UUIDs
3. **RLS desabilitado**: Não há Row Level Security nas tabelas principais
4. **Senhas em texto plano**: Armazenadas diretamente (não recomendado para produção)

## 🚀 PRÓXIMOS PASSOS RECOMENDADOS

1. **Segurança**:
   - Considerar migrar para Supabase Auth
   - Implementar hash de senhas
   - Habilitar RLS nas tabelas

2. **Funcionalidades**:
   - Implementar webhook para receber eventos
   - Adicionar validação de credenciais da Meta
   - Criar logs de erros

3. **Melhorias**:
   - Adicionar testes automatizados
   - Implementar paginação nos eventos
   - Adicionar filtros avançados no dashboard
