import FirecrawlApp from '@mendable/firecrawl-js';

let _firecrawl: FirecrawlApp | null = null;
function getFirecrawl(): FirecrawlApp {
  if (!_firecrawl) _firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });
  return _firecrawl;
}

/** URL'yi temiz Markdown'a dönüştürür */
export async function scrapeUrl(url: string): Promise<string> {
  const result = await getFirecrawl().scrapeUrl(url, { formats: ['markdown'] });

  if (!result.success) {
    throw new Error(`Firecrawl başarısız: ${(result as { error?: string }).error ?? 'Bilinmeyen hata'}`);
  }

  return (result as { markdown?: string }).markdown ?? '';
}
