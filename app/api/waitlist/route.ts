import { kv } from "@vercel/kv";

// Başlangıç değeri — KV boşsa bu sayıdan başlarız
const INITIAL_COUNT = 247;

const GF_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScpugExmAds20_w2M1c8T-HTL82YOKkofuEfJ1Sz5HDCzPfLQ/formResponse";
const GF = {
  FIELD_NAME: "entry.252005174",
  FIELD_PHONE: "entry.410165350",
  FIELD_EMAIL: "entry.132157625",
} as const;

// GET /api/waitlist → mevcut katılımcı sayısını döner
export async function GET() {
  const joins = (await kv.get<number>("waitlist:joins")) ?? 0;
  return Response.json({ count: INITIAL_COUNT + joins });
}

// POST /api/waitlist → Google Forms'a gönderir + sayacı artırır
export async function POST(request: Request) {
  const { name, phone, email } = await request.json();

  // Sunucu tarafında CORS kısıtı yok — düz POST yeterli
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
  } catch {
    // Google Forms iletim hatası — yine de sayacı artır
  }

  // Atomik artış (race-condition güvenli)
  const joins = await kv.incr("waitlist:joins");
  return Response.json({ count: INITIAL_COUNT + joins });
}
