import webpush from 'web-push';

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || 'BGmSISRaxLQ1_b3GBkAXME1LqazsaqGQjRGGZCfMDuQbmufkMvpt8ySbR6AqX_iWfyKsyYZ_6j6mf0b-ogXRYfY';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '3G4-r4RoQ1nHW0-WU72yVZyOqDWmCW1EllVmdr7rdGs';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'admin@beyacreative.com';

webpush.setVapidDetails('mailto:' + VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { subscription, title, body, url, icon } = req.body;
  if (!subscription || !title) return res.status(400).json({ error: 'Missing params' });

  const payload = JSON.stringify({
    title,
    body: body || '',
    url: url || '/portail',
    icon: icon || '/logo.png',
    badge: '/logo.png',
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return res.status(200).json({ success: true });
  } catch (err) {
    if (err.statusCode === 410) return res.status(410).json({ error: 'Subscription expired' });
    return res.status(500).json({ error: err.message });
  }
}
