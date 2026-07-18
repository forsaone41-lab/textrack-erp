import { supabase } from '../supabase';

const VAPID_PUBLIC_KEY = 'BGmSISRaxLQ1_b3GBkAXME1LqazsaqGQjRGGZCfMDuQbmufkMvpt8ySbR6AqX_iWfyKsyYZ_6j6mf0b-ogXRYfY';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export async function subscribeToPush(clientCode?: string): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
      });
    }

    if (sub && clientCode) {
      await saveSubscription(sub, clientCode);
    }

    return sub;
  } catch (err) {
    console.warn('Push subscription failed:', err);
    return null;
  }
}

async function saveSubscription(sub: PushSubscription, clientCode: string) {
  try {
    const subJson = sub.toJSON();
    await supabase.from('push_subscriptions').upsert({
      client_code: clientCode,
      endpoint: subJson.endpoint,
      subscription: subJson,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' });
  } catch (err) {
    console.warn('Save subscription failed:', err);
  }
}

export async function sendPushToClient(clientCode: string, title: string, body: string, url = '/portail') {
  try {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('client_code', clientCode);

    if (!subs?.length) return;

    await Promise.allSettled(
      subs.map(row =>
        fetch('/api/send-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: row.subscription, title, body, url }),
        })
      )
    );
  } catch (err) {
    console.warn('sendPushToClient failed:', err);
  }
}

export async function sendPushToAll(title: string, body: string, url = '/') {
  try {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription');

    if (!subs?.length) return;

    await Promise.allSettled(
      subs.map(row =>
        fetch('/api/send-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: row.subscription, title, body, url }),
        })
      )
    );
  } catch (err) {
    console.warn('sendPushToAll failed:', err);
  }
}
