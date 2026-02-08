# 🔑 Credenciais de Teste

## ✅ Sistema Atualizado!

O sistema agora usa autenticação simples com a tabela `users` ao invés do `auth.users` do Supabase.

## 👤 Usuário Admin Padrão

```
Email: admin@sistema.com
Senha: admin123
Role: admin
```

## 🎯 Como Funciona Agora

### Login
1. Digite o email e senha
2. O sistema busca na tabela `users`
3. Compara a senha (por enquanto em texto plano)
4. Salva o usuário no localStorage
5. Redireciona para o dashboard

### Cadastro
1. Clique em "Não tem conta? Cadastre-se"
2. Preencha: Nome, Email e Senha
3. O sistema cria um novo usuário com role 'user'
4. Você pode fazer login imediatamente

## 📊 Estrutura da Tabela Users

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  pixel_id TEXT,
  page_id TEXT,
  access_token TEXT,
  webhook_url TEXT,
  role TEXT DEFAULT 'user',
  client_supabase_url TEXT,
  client_supabase_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);
```

## ⚠️ Importante

### Segurança Temporária
- As senhas estão em **texto plano** por enquanto
- Isso é apenas para desenvolvimento/teste
- Em produção, você DEVE usar bcrypt

### Para Produção
1. Instalar bcrypt: `npm install bcryptjs`
2. Atualizar o hook useAuth.tsx para usar hash
3. Migrar senhas existentes para hash
4. Implementar recuperação de senha

## 🔄 Diferenças do Sistema Anterior

### Antes (auth.users do Supabase)
- ❌ Complexo
- ❌ Múltiplas tabelas
- ❌ RLS complicado
- ❌ Dependência do Supabase Auth

### Agora (tabela users simples)
- ✅ Simples
- ✅ Uma única tabela
- ✅ Sem RLS
- ✅ Controle total

## 🚀 Próximos Passos

1. Testar login com admin@sistema.com / admin123
2. Criar novos usuários pelo cadastro
3. Implementar bcrypt para senhas
4. Adicionar recuperação de senha
5. Implementar tokens JWT (opcional)

## 📝 Notas

- O campo `last_login` é atualizado automaticamente a cada login
- O campo `updated_at` é atualizado automaticamente via trigger
- Todos os dados do usuário estão em uma única linha
- Fácil de fazer backup e migração
