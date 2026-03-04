import Groq from 'groq-sdk';
import { toFile } from 'openai';

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

/** Ses buffer'ını Whisper-large-v3 ile metne dönüştürür */
export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const ext = mimeType.includes('ogg') ? 'ogg'
    : mimeType.includes('mp4') ? 'mp4'
    : mimeType.includes('mpeg') || mimeType.includes('mp3') ? 'mp3'
    : 'ogg';

  const file = await toFile(audioBuffer, `audio.${ext}`, { type: mimeType });

  const transcription = await getGroq().audio.transcriptions.create({
    file,
    model: 'whisper-large-v3',
    language: 'tr',
    response_format: 'text',
  });

  return transcription as unknown as string;
}
