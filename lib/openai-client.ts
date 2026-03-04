import OpenAI from 'openai';

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

/** Metni 1536 boyutlu vektöre dönüştürür */
export async function embed(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

/** GPT-4o-mini vision ile görseli analiz eder */
export async function analyzeImage(imageBuffer: Buffer, mimeType: string, caption?: string): Promise<string> {
  const base64 = imageBuffer.toString('base64');
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
        {
          type: 'text',
          text: caption
            ? `Bu görseli detaylıca analiz et. Kullanıcı notu: "${caption}". İçeriği, kategorisi ve önemli detayları Türkçe olarak yaz. Hafızaya kaydedilecek.`
            : 'Bu görseli detaylıca analiz et. İçeriği, kategorisi, önemli detayları ve anahtar kelimeleri Türkçe olarak yaz. Hafızaya kaydedilecek.',
        },
      ],
    }],
    max_tokens: 600,
  });
  return response.choices[0].message.content ?? '';
}

/** GPT-4o-mini ile tamamlama üretir */
export async function chat(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 600,
    temperature: 0.7,
  });
  return response.choices[0].message.content ?? '';
}
