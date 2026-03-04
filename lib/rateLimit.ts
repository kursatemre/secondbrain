import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return _redis;
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Kullanıcı başına rate limit kontrolü:
 * - 10 mesaj/dakika
 * - 100 mesaj/saat
 */
export async function checkRateLimit(userId: string): Promise<void> {
  const redis = getRedis();
  const now = Date.now();
  const minuteKey = `rl:min:${userId}:${Math.floor(now / 60_000)}`;
  const hourKey = `rl:hour:${userId}:${Math.floor(now / 3_600_000)}`;

  const [minuteCount, hourCount] = await Promise.all([
    redis.incr(minuteKey),
    redis.incr(hourKey),
  ]);

  // TTL set: only on first increment to avoid resetting the window
  if (minuteCount === 1) await redis.expire(minuteKey, 120); // 2 min safety
  if (hourCount === 1) await redis.expire(hourKey, 7200);    // 2 hr safety

  if (minuteCount > 10) {
    throw new RateLimitError('Dakikada en fazla 10 mesaj gönderebilirsiniz.');
  }
  if (hourCount > 100) {
    throw new RateLimitError('Saatte en fazla 100 mesaj gönderebilirsiniz.');
  }
}
