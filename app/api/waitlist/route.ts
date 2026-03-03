import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

const INITIAL_COUNT = 247;

const GF_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScpugExmAds20_w2M1c8T-HTL82YOKkofuEfJ1Sz5HDCzPfLQ/formResponse";
const GF = {
  FIELD_NAME: "entry.252005174",
  FIELD_PHONE: "entry.410165350",
  FIELD_EMAIL: "entry.132157625",
} as const;

// Vercel KV (Upstash) — HTTP REST, serverless'ta TCP gibi kopmaz
function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

// GET /api/waitlist → mevcut katılımcı sayısını döner
export async function GET() {
  try {
    const joins = await getRedis().get<number>("waitlist:joins");
    return Response.json({ count: INITIAL_COUNT + (joins ?? 0) });
  } catch (e) {
    console.error("[waitlist GET]", e);
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

  fetch(GF_ACTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    redirect: "manual",
  }).catch(() => {});

  try {
    const joins = await getRedis().incr("waitlist:joins");
    return Response.json({ count: INITIAL_COUNT + joins });
  } catch (e) {
    console.error("[waitlist POST]", e);
    return Response.json({ count: INITIAL_COUNT + 1 });
  }
}
