import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy init — build sırasında değil, runtime'da oluşturulur
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

export interface User {
  id: string;
  whatsapp_id: string;
  plan: 'free' | 'premium';
  message_count: number;
  kvkk_accepted_at: string | null;
}

export interface Memory {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

/** Kullanıcıyı whatsapp_id ile bulur, yoksa oluşturur */
export async function getOrCreateUser(whatsappId: string): Promise<User> {
  const { data: existing } = await getSupabase()
    .from('users')
    .select('*')
    .eq('whatsapp_id', whatsappId)
    .single();

  if (existing) return existing as User;

  const { data, error } = await getSupabase()
    .from('users')
    .insert({ whatsapp_id: whatsappId })
    .select()
    .single();

  if (error) throw new Error(`getOrCreateUser: ${error.message}`);
  return data as User;
}

/** Hafıza kaydı oluşturur */
export async function saveMemory(
  userId: string,
  content: string,
  embedding: number[],
  metadata: Record<string, unknown> = {}
) {
  const { error } = await getSupabase()
    .from('memories')
    .insert({ user_id: userId, content, embedding, metadata });

  if (error) throw new Error(`saveMemory: ${error.message}`);
}

/** pgvector ile semantik arama yapar */
export async function searchMemories(
  userId: string,
  queryEmbedding: number[],
  limit = 5
): Promise<Memory[]> {
  const { data, error } = await getSupabase().rpc('match_memories', {
    query_embedding: queryEmbedding,
    match_user_id: userId,
    match_threshold: 0.3,
    match_count: limit,
  });

  if (error) throw new Error(`searchMemories: ${error.message}`);
  return (data as Memory[]) || [];
}

/** Mesaj sayacını artırır */
export async function incrementMessageCount(userId: string) {
  await getSupabase().rpc('increment_message_count', { user_id_param: userId });
}

/** Kullanıcının KVKK onayı verip vermediğini kontrol eder */
export async function hasAcceptedKvkk(userId: string): Promise<boolean> {
  const { data } = await getSupabase()
    .from('users')
    .select('kvkk_accepted_at')
    .eq('id', userId)
    .single();
  return !!(data as { kvkk_accepted_at: string | null } | null)?.kvkk_accepted_at;
}

/** KVKK onay tarihini kaydeder */
export async function recordKvkkConsent(userId: string) {
  const { error } = await getSupabase()
    .from('users')
    .update({ kvkk_accepted_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw new Error(`recordKvkkConsent: ${error.message}`);
}

/** KVKK silme talebi kaydeder */
export async function requestDataDeletion(userId: string, whatsappId: string) {
  const { error } = await getSupabase()
    .from('deletion_requests')
    .insert({ user_id: userId, whatsapp_id: whatsappId, requested_at: new Date().toISOString() });
  if (error) throw new Error(`requestDataDeletion: ${error.message}`);
}

/** Kullanıcının tüm verilerini ve kaydını siler (hard delete) */
export async function deleteUserData(userId: string) {
  // memories ON DELETE CASCADE ile otomatik silinir
  const { error } = await getSupabase()
    .from('users')
    .delete()
    .eq('id', userId);
  if (error) throw new Error(`deleteUserData: ${error.message}`);
}
