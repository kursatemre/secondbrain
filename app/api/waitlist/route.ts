import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

const INITIAL_COUNT = 247;
const REDIS_TIMEOUT_MS = 4000;

const GF_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScpugExmAds20_w2M1c8T-HTL82YOKkofuEfJ1Sz5HDCzPfLQ/formResponse";
const GF = {
  FIELD_NAME: "entry.252005174",
  FIELD_PHONE: "entry.410165350",
  FIELD_EMAIL: "entry.132157625",
} as const;

// REDIS_URL: redis://default:TOKEN@HOSTNAME.upstash.io:PORT
function getRedis(): Redis {
  const url = new URL(process.env.REDIS_URL!);
  return new Redis({
    url: `https://${url.hostname}`,
    token: decodeURIComponent(url.password),
  });
}

// Redis çağrısını ms süre içinde tamamlamaya zorla, aksi hâlde hata fırlat
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Redis timeout")), ms)
    ),
  ]);
}

// GET /api/waitlist → mevcut katılımcı sayısını döner
export async function GET() {
  try {
    const joins = await withTimeout(
      getRedis().get<number>("waitlist:joins"),
      REDIS_TIMEOUT_MS
    );
    return Response.json({ count: INITIAL_COUNT + (joins ?? 0) });
  } catch {
    return Response.json({ count: INITIAL_COUNT });
  }
}

// POST /api/waitlist → Google Forms'a gönderir (fire & forget) + sayacı artırır
export async function POST(request: Request) {
  const { name, phone, email } = await request.json();

  const body = new URLSearchParams();
  body.append(GF.FIELD_NAME, name);
  body.append(GF.FIELD_PHONE, `+90 ${phone}`);
  if (email) body.append(GF.FIELD_EMAIL, email);

  // redirect: "manual" → redirect zincirini takip etme, ilk yanıtta dur
  // Böylece Google Forms bekleme fonksiyon kapanışını engellemez
  fetch(GF_ACTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    redirect: "manual",
  }).catch(() => {});

  try {
    const joins = await withTimeout(
      getRedis().incr("waitlist:joins"),
      REDIS_TIMEOUT_MS
    );
    return Response.json({ count: INITIAL_COUNT + joins });
  } catch {
    return Response.json({ count: INITIAL_COUNT + 1 });
  }
}
