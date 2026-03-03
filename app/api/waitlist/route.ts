import IoRedis from "ioredis";

const INITIAL_COUNT = 247;

const GF_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScpugExmAds20_w2M1c8T-HTL82YOKkofuEfJ1Sz5HDCzPfLQ/formResponse";
const GF = {
  FIELD_NAME: "entry.252005174",
  FIELD_PHONE: "entry.410165350",
  FIELD_EMAIL: "entry.132157625",
} as const;

// Serverless warm invocations arasında bağlantıyı yeniden kullan
let redis: IoRedis | null = null;
function getRedis() {
  if (!redis) {
    redis = new IoRedis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
    });
  }
  return redis;
}

// GET /api/waitlist → mevcut katılımcı sayısını döner
export async function GET() {
  try {
    const joins = await getRedis().get("waitlist:joins");
    const count = INITIAL_COUNT + (joins ? parseInt(joins) : 0);
    return Response.json({ count });
  } catch {
    return Response.json({ count: INITIAL_COUNT });
  }
}

// POST /api/waitlist → Google Forms'a gönderir + sayacı artırır
export async function POST(request: Request) {
  const { name, phone, email } = await request.json();

  const body = new URLSearchParams();
  body.append(GF.FIELD_NAME, name);
  body.append(GF.FIELD_PHONE, `+90 ${phone}`);
  if (email) body.append(GF.FIELD_EMAIL, email);

  try {
    await fetch(GF_ACTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      redirect: "follow",
    });
  } catch {}

  try {
    const joins = await getRedis().incr("waitlist:joins");
    return Response.json({ count: INITIAL_COUNT + joins });
  } catch {
    return Response.json({ count: INITIAL_COUNT + 1 });
  }
}
