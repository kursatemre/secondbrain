import FirecrawlApp from '@mendable/firecrawl-js';

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

/** URL'yi temiz Markdown'a dönüştürür */
export async function scrapeUrl(url: string): Promise<string> {
  const result = await firecrawl.scrapeUrl(url, { formats: ['markdown'] });

  if (!result.success) {
    throw new Error(`Firecrawl başarısız: ${(result as { error?: string }).error ?? 'Bilinmeyen hata'}`);
  }

  return (result as { markdown?: string }).markdown ?? '';
}
