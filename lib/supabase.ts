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
  plan: 'free' | 'kisisel' | 'profesyonel' | 'sinirsiz';
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

/** Hafıza kaydı oluşturur — isteğe bağlı görev/zaman/etiket alanları ile */
export async function saveMemory(
  userId: string,
  content: string,
  embedding: number[],
  metadata: Record<string, unknown> = {},
  extra: {
    due_date?: string | null;
    time_expression?: string | null;
    is_task?: boolean;
    task_status?: string;
    tags?: string[];
  } = {}
) {
  const row: Record<string, unknown> = { user_id: userId, content, embedding, metadata };
  if (extra.due_date      != null) row.due_date       = extra.due_date;
  if (extra.time_expression)       row.time_expression = extra.time_expression;
  if (extra.is_task)               row.is_task         = true;
  if (extra.task_status)           row.task_status     = extra.task_status;
  if (extra.tags && extra.tags.length > 0) row.tags    = extra.tags;

  const { data, error } = await getSupabase()
    .from('memories')
    .insert(row)
    .select('id')
    .single();

  if (error) throw new Error(`saveMemory: ${error.message}`);
  return (data as { id: string }).id;
}

/** pgvector ile semantik arama yapar (free + kisisel) */
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

/** Semantic + Türkçe full-text hibrit arama (profesyonel + sinirsiz) */
export async function searchMemoriesHybrid(
  userId: string,
  queryEmbedding: number[],
  queryText: string,
  limit = 8
): Promise<Memory[]> {
  const { data, error } = await getSupabase().rpc('match_memories_hybrid', {
    query_embedding: queryEmbedding,
    query_text: queryText,
    match_user_id: userId,
    match_threshold: 0.3,
    match_count: limit,
  });

  if (error) throw new Error(`searchMemoriesHybrid: ${error.message}`);
  return (data as Memory[]) || [];
}

/** Aylık kullanım limitini kontrol eder ve izin varsa sayacı artırır */
export async function checkUsage(
  userId: string,
  type: 'message' | 'audio' | 'url'
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const { data, error } = await getSupabase().rpc('check_and_increment_usage', {
    user_id_param: userId,
    usage_type: type,
  });
  if (error) throw new Error(`checkUsage: ${error.message}`);
  return data as { allowed: boolean; count: number; limit: number };
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

/** İşlenemeyen mesajı dead letter queue'ya kaydeder */
export async function saveFailedMessage(
  whatsappId: string,
  messageType: string,
  messageBody: string,
  errorMessage: string
) {
  // Hata kaydı başarısız olursa sessizce geç — asıl hatayı gizlemesin
  await getSupabase()
    .from('failed_messages')
    .insert({ whatsapp_id: whatsappId, message_type: messageType, message_body: messageBody, error_message: errorMessage })
    .then();
}

/** Kullanıcının tüm hafıza kayıtlarını döner (KVKK Md. 11 veri erişimi) */
export async function getUserMemories(userId: string): Promise<{
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}[]> {
  const { data, error } = await getSupabase()
    .from('memories')
    .select('content, metadata, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getUserMemories: ${error.message}`);
  return (data ?? []) as { content: string; metadata: Record<string, unknown>; created_at: string }[];
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

// ─── GÖREV YÖNETİMİ (Özellik 2) ────────────────────────────────────────────

export interface TaskRow {
  id: string;
  content: string;
  due_date: string | null;
  task_status: string;
  tags: string[];
  created_at: string;
  completed_at: string | null;
}

const TASK_SELECT = 'id, content, due_date, task_status, tags, created_at, completed_at';

export async function getPendingTasks(userId: string): Promise<TaskRow[]> {
  const { data, error } = await getSupabase()
    .from('memories')
    .select(TASK_SELECT)
    .eq('user_id', userId)
    .eq('is_task', true)
    .eq('task_status', 'pending')
    .order('due_date', { ascending: true, nullsFirst: false });
  if (error) throw new Error(`getPendingTasks: ${error.message}`);
  return (data ?? []) as TaskRow[];
}

export async function getTodayTasks(userId: string): Promise<TaskRow[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await getSupabase()
    .from('memories')
    .select(TASK_SELECT)
    .eq('user_id', userId)
    .eq('is_task', true)
    .eq('task_status', 'pending')
    .gte('due_date', `${today}T00:00:00Z`)
    .lt('due_date', `${today}T23:59:59Z`);
  if (error) throw new Error(`getTodayTasks: ${error.message}`);
  return (data ?? []) as TaskRow[];
}

export async function getOverdueTasks(userId: string): Promise<TaskRow[]> {
  const now = new Date().toISOString();
  const { data, error } = await getSupabase()
    .from('memories')
    .select(TASK_SELECT)
    .eq('user_id', userId)
    .eq('is_task', true)
    .eq('task_status', 'pending')
    .not('due_date', 'is', null)
    .lt('due_date', now);
  if (error) throw new Error(`getOverdueTasks: ${error.message}`);
  return (data ?? []) as TaskRow[];
}

export async function getRecentlyCompletedTasks(userId: string, days = 7): Promise<TaskRow[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await getSupabase()
    .from('memories')
    .select(TASK_SELECT)
    .eq('user_id', userId)
    .eq('is_task', true)
    .eq('task_status', 'done')
    .gte('completed_at', since)
    .order('completed_at', { ascending: false });
  if (error) throw new Error(`getRecentlyCompletedTasks: ${error.message}`);
  return (data ?? []) as TaskRow[];
}

export async function updateTaskStatus(
  memoryId: string,
  status: 'done' | 'cancelled'
): Promise<void> {
  const update: Record<string, unknown> = { task_status: status };
  if (status === 'done') update.completed_at = new Date().toISOString();
  const { error } = await getSupabase()
    .from('memories')
    .update(update)
    .eq('id', memoryId);
  if (error) throw new Error(`updateTaskStatus: ${error.message}`);
}

export async function getWeeklyTaskStats(userId: string): Promise<{
  done: number; pending: number; overdue: number; top_tags: Array<{ tag: string; count: number }>;
}> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const [doneRes, pendRes, overdueRes] = await Promise.all([
    getSupabase().from('memories').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('is_task', true).eq('task_status', 'done').gte('completed_at', weekAgo),
    getSupabase().from('memories').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('is_task', true).eq('task_status', 'pending'),
    getSupabase().from('memories').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('is_task', true).eq('task_status', 'pending')
      .not('due_date', 'is', null).lt('due_date', now),
  ]);

  // Etiket sayımı — basit sorgu
  const { data: tagData } = await getSupabase()
    .from('memories')
    .select('tags')
    .eq('user_id', userId)
    .gte('created_at', weekAgo)
    .not('tags', 'eq', '{}');

  const tagCount: Record<string, number> = {};
  (tagData ?? []).forEach((row: { tags: string[] }) => {
    (row.tags ?? []).forEach(t => { tagCount[t] = (tagCount[t] ?? 0) + 1; });
  });
  const top_tags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag, count]) => ({ tag, count }));

  return {
    done:    doneRes.count    ?? 0,
    pending: pendRes.count    ?? 0,
    overdue: overdueRes.count ?? 0,
    top_tags,
  };
}

// ─── PROAKTIF ZEKA (Özellik 4) ──────────────────────────────────────────────

export interface UserState {
  user_id: string;
  last_briefing_date: string | null;
  last_weekly_report: string | null;
}

export async function getUserState(whatsappId: string): Promise<UserState> {
  const { data } = await getSupabase()
    .from('user_state')
    .select('*')
    .eq('user_id', whatsappId)
    .single();

  if (data) return data as UserState;

  // İlk kez — satır oluştur
  await getSupabase().from('user_state').insert({ user_id: whatsappId }).then();
  return { user_id: whatsappId, last_briefing_date: null, last_weekly_report: null };
}

export async function updateUserState(
  whatsappId: string,
  updates: { last_briefing_date?: string; last_weekly_report?: string }
): Promise<void> {
  await getSupabase()
    .from('user_state')
    .upsert({ user_id: whatsappId, ...updates, updated_at: new Date().toISOString() });
}

// ─── BAĞLAM HAFIZASI (Özellik 5) ─────────────────────────────────────────────

export async function getUserProfile(
  whatsappId: string
): Promise<{ profile: Record<string, unknown>; memory_count_at_update: number }> {
  const { data } = await getSupabase()
    .from('user_profiles')
    .select('profile, memory_count_at_update')
    .eq('user_id', whatsappId)
    .single();

  if (data) return data as { profile: Record<string, unknown>; memory_count_at_update: number };
  return { profile: {}, memory_count_at_update: 0 };
}

export async function updateUserProfile(
  whatsappId: string,
  profile: Record<string, unknown>,
  memoryCount: number
): Promise<void> {
  await getSupabase()
    .from('user_profiles')
    .upsert({
      user_id: whatsappId,
      profile,
      memory_count_at_update: memoryCount,
      last_updated: new Date().toISOString(),
    });
}

export async function getRecentMemoryContents(userId: string, limit = 50): Promise<string[]> {
  const { data } = await getSupabase()
    .from('memories')
    .select('content')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []).map((r: { content: string }) => r.content);
}

// ─── HATIRLATICI (Özellik 8) ─────────────────────────────────────────────────

export interface Reminder {
  id: string;
  user_id: string;
  memory_id: string | null;
  message: string;
  remind_at: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  status: string;
  created_at: string;
}

export async function createReminder(
  whatsappId: string,
  message: string,
  remindAt: string,
  memoryId?: string | null,
  isRecurring = false,
  recurrenceRule?: string | null
): Promise<string> {
  const { data, error } = await getSupabase()
    .from('reminders')
    .insert({
      user_id: whatsappId,
      message,
      remind_at: remindAt,
      memory_id: memoryId ?? null,
      is_recurring: isRecurring,
      recurrence_rule: recurrenceRule ?? null,
    })
    .select('id')
    .single();

  if (error) throw new Error(`createReminder: ${error.message}`);
  return (data as { id: string }).id;
}

export async function getDueReminders(): Promise<Reminder[]> {
  const now = new Date().toISOString();
  const { data, error } = await getSupabase()
    .from('reminders')
    .select('*')
    .eq('status', 'active')
    .lte('remind_at', now)
    .order('remind_at', { ascending: true })
    .limit(50);
  if (error) throw new Error(`getDueReminders: ${error.message}`);
  return (data ?? []) as Reminder[];
}

export async function markReminderSent(reminderId: string): Promise<void> {
  await getSupabase().from('reminders').update({ status: 'sent' }).eq('id', reminderId);
}

export async function updateReminderTime(reminderId: string, newRemindAt: string): Promise<void> {
  await getSupabase()
    .from('reminders')
    .update({ status: 'active', remind_at: newRemindAt })
    .eq('id', reminderId);
}

export async function getActiveReminders(whatsappId: string): Promise<Reminder[]> {
  const { data, error } = await getSupabase()
    .from('reminders')
    .select('*')
    .eq('user_id', whatsappId)
    .eq('status', 'active')
    .order('remind_at', { ascending: true })
    .limit(20);
  if (error) throw new Error(`getActiveReminders: ${error.message}`);
  return (data ?? []) as Reminder[];
}

export async function cancelReminder(reminderId: string, whatsappId: string): Promise<void> {
  await getSupabase()
    .from('reminders')
    .update({ status: 'cancelled' })
    .eq('id', reminderId)
    .eq('user_id', whatsappId);
}

// ─── AKILLI BAĞLANTILAR (Özellik 9) ─────────────────────────────────────────

export async function saveMemoryConnection(
  memoryId1: string,
  memoryId2: string,
  score: number
): Promise<void> {
  // Çift kayıt önleme: her iki yönü de kontrol et
  const { count } = await getSupabase()
    .from('memory_connections')
    .select('id', { count: 'exact', head: true })
    .or(`and(memory_id_1.eq.${memoryId1},memory_id_2.eq.${memoryId2}),and(memory_id_1.eq.${memoryId2},memory_id_2.eq.${memoryId1})`);

  if ((count ?? 0) > 0) return;

  await getSupabase()
    .from('memory_connections')
    .insert({ memory_id_1: memoryId1, memory_id_2: memoryId2, similarity_score: score });
}

export async function getRelatedMemories(
  memoryId: string
): Promise<Array<{ id: string; content: string; similarity_score: number }>> {
  const { data } = await getSupabase()
    .from('memory_connections')
    .select('memory_id_2, similarity_score, memories!memory_id_2(id, content)')
    .eq('memory_id_1', memoryId)
    .order('similarity_score', { ascending: false })
    .limit(5);

  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: (r.memories as { id: string; content: string }).id,
    content: (r.memories as { id: string; content: string }).content,
    similarity_score: r.similarity_score as number,
  }));
}

/** Yeni kayıt için benzer kayıtları bulur (Özellik 9 — kayıt anında) */
export async function findSimilarMemories(
  userId: string,
  embedding: number[],
  excludeId: string,
  threshold = 0.85,
  limit = 5
): Promise<Array<{ id: string; content: string; similarity: number }>> {
  const { data, error } = await getSupabase().rpc('match_memories', {
    query_embedding: embedding,
    match_user_id: userId,
    match_threshold: threshold,
    match_count: limit + 1,
  });
  if (error) return [];
  return ((data as Array<{ id: string; content: string; similarity: number }>) ?? [])
    .filter(m => m.id !== excludeId)
    .slice(0, limit);
}

// ─── TOPLAM HAFIZA SAYISI ────────────────────────────────────────────────────

export async function getTotalMemoryCount(userId: string): Promise<number> {
  const { count } = await getSupabase()
    .from('memories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count ?? 0;
}
