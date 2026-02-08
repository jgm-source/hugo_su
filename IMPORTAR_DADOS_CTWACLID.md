# 📊 Importar Dados das Tabelas CTWAclid

## 🎯 Objetivo

Consolidar os dados das tabelas CTWAclid (Jonas, Matheus, Nicolas, Kaue, Danilo) na tabela `user_events` para exibir no dashboard.

## 📋 Estrutura Atual

### Tabelas CTWAclid
- Jonas CTWAclid (1.334 registros)
- Matheus CTWAclid (1.179 registros)
- Nicolas CTWAclid (398 registros)
- Kaue CTWAclid (330 registros)
- Danilo CTWAclid (0 registros)

### Campos nas Tabelas CTWAclid
```
- id (bigint)
- created_at (timestamp)
- telefone (numeric) → Nome do cliente
- ctwaclid (varchar) → FB Trace ID
- page_id (numeric) → Pixel ID
- Indexador (numeric)
- purchase (text) → NULL = Lead, NOT NULL = Purchase Event
```

### Tabela user_events (Destino)
```
- id (UUID)
- user_id (UUID) → FK para users
- event_type ('lead' ou 'conversion')
- event_name (TEXT)
- status ('pending', 'success', 'failed')
- response_data (JSONB)
- created_at (TIMESTAMPTZ)
- telefone (TEXT) → Nome do cliente
- ctwaclid (TEXT) → FB Trace
- page_id (TEXT) → Pixel ID
- indexador (TEXT)
- fbtrace_id (TEXT)
```

## 🔄 Lógica de Importação

### Regras
1. **Lead**: Quando `purchase` é NULL
2. **Purchase Event (Conversão)**: Quando `purchase` não é NULL

### Mapeamento
- `telefone` → Nome do cliente
- `ctwaclid` → FB Trace ID
- `page_id` → Pixel ID
- `created_at` → Horário do evento

## 📝 Script SQL de Importação

```sql
-- Importar dados da tabela Jonas CTWAclid
INSERT INTO public.user_events (
  user_id,
  event_type,
  event_name,
  status,
  created_at,
  telefone,
  ctwaclid,
  page_id,
  indexador
)
SELECT 
  (SELECT id FROM public.users WHERE email = 'admin@sistema.com'), -- user_id do admin
  CASE 
    WHEN purchase IS NULL THEN 'lead'
    ELSE 'conversion'
  END as event_type,
  CASE 
    WHEN purchase IS NULL THEN 'Lead Event'
    ELSE 'Purchase Event'
  END as event_name,
  'success' as status,
  created_at,
  telefone::TEXT,
  ctwaclid,
  page_id::TEXT,
  "Indexador"::TEXT
FROM "Jonas CTWAclid"
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_events 
  WHERE ctwaclid = "Jonas CTWAclid".ctwaclid
);

-- Repetir para outras tabelas (Matheus, Nicolas, Kaue, Danilo)
```

## 🎨 Exibição no Dashboard

### Card "Eventos de Lead"
- Conta registros onde `event_type = 'lead'`
- Mostra total de leads enviados hoje

### Card "Eventos de Conversão"
- Conta registros onde `event_type = 'conversion'`
- Mostra total de purchase events hoje

### Seção "Atividade Recente"
Exibe para cada evento:
- ✅ Horário do evento (created_at)
- ✅ FB Trace (ctwaclid)
- ✅ Pixel ID (page_id)
- ✅ Nome do cliente (telefone)
- ✅ Tipo (Lead ou Purchase Event)
- ✅ Status (success/failed/pending)

## 🚀 Como Executar

### Opção 1: Via SQL (Recomendado)
Execute o script SQL acima no Supabase SQL Editor

### Opção 2: Via API
Crie um endpoint que faça a importação programaticamente

### Opção 3: Automático
Configure um webhook que insira automaticamente na `user_events` quando houver novos dados nas tabelas CTWAclid

## ⚠️ Importante

1. **Duplicação**: O script verifica se o `ctwaclid` já existe antes de inserir
2. **User ID**: Por padrão, associa ao admin. Você pode criar lógica para associar a usuários específicos
3. **Performance**: Para muitos registros, faça em lotes
4. **Backup**: Faça backup antes de executar

## 📊 Resultado Esperado

Após a importação, o dashboard mostrará:
- Total de leads (purchase = NULL)
- Total de conversões (purchase != NULL)
- Lista detalhada com todas as informações solicitadas
