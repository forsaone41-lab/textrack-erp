import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cyduteruvmpefvemeutm.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    lock: async (_name, _acquireTimeout, fn) => {
      return await fn();
    }
  }
});

export function isJwtExpiredError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || error.error_description || String(error)).toLowerCase();
  return (
    msg.includes('jwt expired') ||
    msg.includes('token expired') ||
    msg.includes('invalid jwt') ||
    (msg.includes('jwt') && msg.includes('expired')) ||
    error.code === 'PGRST301' ||
    error.status === 401
  );
}

export async function recoverExpiredJwt(): Promise<void> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data?.session) {
      console.log('[Auth] Refreshed Supabase session successfully');
      return;
    }
  } catch (_) {}

  // If refresh failed, clear local session so client falls back to clean anon key
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (_) {}

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (_) {}
  console.log('[Auth] Expired JWT recovered, fell back to anon key.');
}

// Proactive check on client boot: if session is expired, refresh or clear it immediately
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const isExpired = session.expires_at ? (session.expires_at * 1000 < Date.now()) : false;
        if (isExpired) {
          console.warn('[Supabase] Stale expired session detected on init, recovering...');
          await recoverExpiredJwt();
        }
      }
    } catch (_) {}
  }, 100);
}
