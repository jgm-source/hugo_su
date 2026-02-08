# 📊 Estrutura do Banco de Dados - Sistema Simplificado

## ✅ Tabelas Criadas

### 1. **users** (Tabela Principal - Tudo em Uma Linha)

Tabela única que contém TODOS os dados do usuário em uma única linha.

#### Colunas:

**🔐 Autenticação:**
- `id` (UUID, PK) - ID único do usuário
- `email` (TEXT, UNIQUE, NOT NULL) - Email para login
- `password` (TEXT, NOT NULL) - Senha em hash (bcrypt)
- `name` (TEXT, NOT NULL) - Nome do usuário

**📱 Credenciais da Meta:**
- `pixel_id` (TEXT, nullable) - Pixel ID do Facebook
- `page_id` (TEXT, nullable) - Page ID do Facebook
- `access_token` (TEXT, nullable) - Token de acesso da Meta

**🔗 Webhook:**
- `webhook_url` (TEXT, nullable) - URL do webhook

**👤 Permissões:**
- `role` (TEXT, NOT NULL, default: 'user') - Role do usuário ('admin' ou 'user')

**⚙️ Configurações Extras:**
- `client_supabase_url` (TEXT, nullable) - URL do Supabase do cliente
- `client_supabase_key` (TEXT, nullable) - Chave do Supabase do cliente

**📅 Timestamps:**
- `created_at` (TIMESTAMPTZ, default: NOW()) - Data de criação
- `updated_at` (TIMESTAMPTZ, default: NOW()) - Data de atualização (auto-atualiza)
- `last_login` (TIMESTAMPTZ, nullable) - Último login

#### Índices:
- `idx_users_email` - Busca rápida por email
- `idx_users_role` - Busca rápida por role

---

### 2. **user_events** (Eventos de Conversão)

Tabela para armazenar eventos de leads e conversões.

#### Colunas:
- `id` (UUID, PK) - ID único do evento
- `user_id` (UUID, FK → users.id) - Referência ao usuário
- `event_type` (TEXT, NOT NULL) - Tipo: 'lead' ou 'conversion'
- `event_name` (TEXT, NOT NULL) - Nome do evento
- `status` (TEXT, NOT NULL, default: 'pending') - Status: 'pending', 'success', 'failed'
- `response_data` (JSONB, nullable) - Dados da resposta da API
- `created_at` (TIMESTAMPTZ, default: NOW()) - Data de criação

#### Índices:
- `idx_user_events_user_id` - Busca por usuário
- `idx_user_events_created_at` - Busca por data
- `idx_user_events_type_status` - Busca por tipo e status

---

## 🔑 Usuário Admin Padrão

Foi criado um usuário admin padrão:

```
Email: admin@sistema.com
Senha: admin123
```

**⚠️ IMPORTANTE: Troque essa senha imediatamente em produção!**

---

## 💡 Como Usar

### Login Simples

```typescript
// 1. Buscar usuário por email
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single();

// 2. Verificar senha (usar bcrypt)
const isValid = await bcrypt.compare(password, user.password);

// 3. Atualizar last_login
if (isValid) {
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);
}
```

### Criar Novo Usuário

```typescript
// Hash da senha
const hashedPassword = await bcrypt.hash(password, 10);

// Inserir usuário
const { data } = await supabase
  .from('users')
  .insert({
    email: 'usuario@email.com',
    password: hashedPassword,
    name: 'Nome do Usuário',
    role: 'user'
  })
  .select()
  .single();
```

### Atualizar Credenciais da Meta

```typescript
await supabase
  .from('users')
  .update({
    pixel_id: '123456789',
    page_id: '987654321',
    access_token: 'EAAxxxxx...'
  })
  .eq('id', userId);
```

### Buscar Eventos do Usuário

```typescript
const { data: events } = await supabase
  .from('user_events')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'success')
  .order('created_at', { ascending: false });
```

---

## 🎯 Vantagens desta Estrutura

✅ **Simplicidade Total** - Tudo em uma única tabela
✅ **Sem Complexidade** - Não usa auth.users do Supabase
✅ **Fácil de Entender** - Estrutura clara e direta
✅ **Rápido** - Menos JOINs, mais performance
✅ **Flexível** - Fácil adicionar novos campos

---

## 📝 Próximos Passos

1. Implementar autenticação no frontend
2. Usar bcrypt para hash de senhas
3. Criar sistema de sessão/token JWT
4. Atualizar componentes React para usar a nova tabela
5. Trocar senha do admin padrão
