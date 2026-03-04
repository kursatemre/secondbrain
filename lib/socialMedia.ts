import axios from 'axios';

export interface SocialMediaMeta {
  title: string;
  author: string;
  platform: string;
}

/**
 * TikTok oEmbed — ücretsiz, auth gerekmez
 * Döner: title, author_name
 */
async function fetchTikTokMeta(url: string): Promise<SocialMediaMeta | null> {
  try {
    const { data } = await axios.get('https://www.tiktok.com/oembed', {
      params: { url },
      timeout: 8000,
    });
    return {
      title: data.title || '',
      author: data.author_name || '',
      platform: 'TikTok',
    };
  } catch {
    return null;
  }
}

/**
 * Instagram oEmbed — Meta access token ile
 * Döner: author_name (caption genellikle dönmez ama author + thumbnail yeterli)
 */
async function fetchInstagramMeta(url: string): Promise<SocialMediaMeta | null> {
  try {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!token) return null;
    const { data } = await axios.get('https://graph.facebook.com/v22.0/instagram_oembed', {
      params: { url, access_token: token },
      timeout: 8000,
    });
    return {
      title: data.title || data.media_type || '',
      author: data.author_name || '',
      platform: 'Instagram',
    };
  } catch {
    return null;
  }
}

/**
 * URL'den sosyal medya meta verisi çeker.
 * Desteklenen: Instagram, TikTok
 * Desteklenmeyen URL için null döner.
 */
export async function fetchSocialMeta(url: string): Promise<SocialMediaMeta | null> {
  if (/tiktok\.com/i.test(url)) return fetchTikTokMeta(url);
  if (/instagram\.com/i.test(url)) return fetchInstagramMeta(url);
  return null;
}
