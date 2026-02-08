import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

/**
 * Helper functions para trabalhar com Supabase
 */

// ============= PROFILES =============
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
}

export async function updateProfile(userId: string, updates: TablesUpdate<'profiles'>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
}

// ============= META CREDENTIALS =============
export async function getMetaCredentials(userId: string) {
  const { data, error } = await supabase
    .from('meta_credentials')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
}

export async function upsertMetaCredentials(credentials: TablesInsert<'meta_credentials'>) {
  const { data, error } = await supabase
    .from('meta_credentials')
    .upsert(credentials)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteMetaCredentials(userId: string) {
  const { error } = await supabase
    .from('meta_credentials')
    .delete()
    .eq('user_id', userId);
  
  return { error };
}

// ============= WEBHOOK URLS =============
export async function getWebhookUrl(userId: string) {
  const { data, error } = await supabase
    .from('webhook_urls')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
}

export async function getAllWebhooks() {
  const { data, error } = await supabase
    .from('webhook_urls')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function upsertWebhookUrl(webhook: TablesInsert<'webhook_urls'>) {
  const { data, error } = await supabase
    .from('webhook_urls')
    .upsert(webhook)
    .select()
    .single();
  
  return { data, error };
}

// ============= EVENTS =============
export async function getEvents(userId: string, filters?: {
  eventType?: 'lead' | 'conversion';
  status?: 'pending' | 'success' | 'failed';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (filters?.eventType) {
    query = query.eq('event_type', filters.eventType);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  query = query.order('created_at', { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  
  return { data, error, count };
}

export async function createEvent(event: TablesInsert<'events'>) {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();
  
  return { data, error };
}

export async function getEventStats(userId: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('events')
    .select('event_type, status')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;

  if (error) return { error };

  const stats = {
    totalLeads: data?.filter(e => e.event_type === 'lead').length || 0,
    totalConversions: data?.filter(e => e.event_type === 'conversion').length || 0,
    successfulLeads: data?.filter(e => e.event_type === 'lead' && e.status === 'success').length || 0,
    successfulConversions: data?.filter(e => e.event_type === 'conversion' && e.status === 'success').length || 0,
    failedEvents: data?.filter(e => e.status === 'failed').length || 0,
    pendingEvents: data?.filter(e => e.status === 'pending').length || 0,
  };

  return { data: stats, error: null };
}

// ============= USER ROLES =============
export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
}

export async function isAdmin(userId: string) {
  const { data } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin'
  });
  
  return data === true;
}

// ============= REALTIME SUBSCRIPTIONS =============
export function subscribeToEvents(
  userId: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel('events-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();

  return channel;
}

export function unsubscribe(channel: any) {
  supabase.removeChannel(channel);
}
