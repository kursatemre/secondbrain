import axios from 'axios';

const baseUrl = () =>
  `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}`;

const headers = () => ({
  Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
});

/** WhatsApp'a metin mesajı gönderir */
export async function sendMessage(to: string, text: string) {
  await axios.post(
    `${baseUrl()}/messages`,
    { messaging_product: 'whatsapp', to, type: 'text', text: { body: text } },
    { headers: headers() }
  );
}

/** KVKK onayı gibi tek/çok butonlu interactive mesaj gönderir */
export async function sendButtonMessage(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
) {
  await axios.post(
    `${baseUrl()}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.map(b => ({
            type: 'reply',
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    },
    { headers: headers() }
  );
}

/** WhatsApp media ID ile dosyayı indirir */
export async function downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const { data: info } = await axios.get(
    `https://graph.facebook.com/v22.0/${mediaId}`,
    { headers: headers() }
  );

  const { data } = await axios.get(info.url, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` },
    responseType: 'arraybuffer',
  });

  return { buffer: Buffer.from(data), mimeType: info.mime_type };
}
