import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface User {
  id: string;
  whatsapp_id: string;
  plan: 'free' | 'premium';
  message_count: number;
}

export interface Memory {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

/** Kullanıcıyı whatsapp_id ile bulur, yoksa oluşturur */
export async function getOrCreateUser(whatsappId: string): Promise<User> {
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('whatsapp_id', whatsappId)
    .single();

  if (existing) return existing as User;

  const { data, error } = await supabase
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
  const { error } = await supabase
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
  const { data, error } = await supabase.rpc('match_memories', {
    query_embedding: queryEmbedding,
    match_user_id: userId,
    match_threshold: 0.5,
    match_count: limit,
  });

  if (error) throw new Error(`searchMemories: ${error.message}`);
  return (data as Memory[]) || [];
}

/** Mesaj sayacını artırır */
export async function incrementMessageCount(userId: string) {
  await supabase.rpc('increment_message_count', { user_id_param: userId });
}
