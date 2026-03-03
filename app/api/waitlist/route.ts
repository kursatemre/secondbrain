import Redis from "ioredis";

export const dynamic = "force-dynamic";

const INITIAL_COUNT = 247;

const GF_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScpugExmAds20_w2M1c8T-HTL82YOKkofuEfJ1Sz5HDCzPfLQ/formResponse";
const GF = {
  FIELD_NAME: "entry.252005174",
  FIELD_PHONE: "entry.410165350",
  FIELD_EMAIL: "entry.132157625",
} as const;

// Serverless için: her çağrıda fresh bağlantı aç, işlem bitince kapat
function createRedis() {
  return new Redis(process.env.REDIS_URL!, {
    connectTimeout: 5000,
    commandTimeout: 4000,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: () => null, // bağlanamıyorsa hemen hata ver, tekrar deneme
  });
}

// GET /api/waitlist → mevcut katılımcı sayısını döner
export async function GET() {
  const redis = createRedis();
  try {
    const joins = await redis.get("waitlist:joins");
    return Response.json({ count: INITIAL_COUNT + (Number(joins) || 0) });
  } catch (e) {
    console.error("[waitlist GET]", e);
    return Response.json({ count: INITIAL_COUNT });
  } finally {
    redis.disconnect();
  }
}

// POST /api/waitlist → Google Forms'a gönderir (fire & forget) + sayacı artırır
export async function POST(request: Request) {
  const { name, phone, email } = await request.json();

  const body = new URLSearchParams();
  body.append(GF.FIELD_NAME, name);
  body.append(GF.FIELD_PHONE, `+90 ${phone}`);
  if (email) body.append(GF.FIELD_EMAIL, email);

  fetch(GF_ACTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    redirect: "manual",
  }).catch(() => {});

  const redis = createRedis();
  try {
    const joins = await redis.incr("waitlist:joins");
    return Response.json({ count: INITIAL_COUNT + joins });
  } catch (e) {
    console.error("[waitlist POST]", e);
    return Response.json({ count: INITIAL_COUNT + 1 });
  } finally {
    redis.disconnect();
  }
}
