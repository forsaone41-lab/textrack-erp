export const GEMINI_FAST_VISION_MODELS = [
  'gemini-3-flash-preview',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest',
] as const;

export const GEMINI_IMAGE_GEN_MODELS = [
  'gemini-3.1-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-2.5-flash-image',
  'gemini-3.5-flash',
] as const;

/**
 * Normalizes and downscales large screenshots/photos (max 1280px, JPEG 0.88)
 * so Gemini Vision calls stay fast and within payload limits without losing seam/fabric details.
 */
export async function prepareImageForGemini(
  imageSrc: string,
  maxDimension = 1280
): Promise<{ base64Data: string; mimeType: string }> {
  if (!imageSrc) return { base64Data: '', mimeType: 'image/jpeg' };

  let dataUrl = imageSrc;
  if (imageSrc.startsWith('http') || imageSrc.startsWith('blob:')) {
    const resp = await fetch(imageSrc);
    const blob = await resp.blob();
    dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  }

  const rawMatch = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!rawMatch) return { base64Data: '', mimeType: 'image/jpeg' };

  const origMime = rawMatch[1];
  const origB64 = rawMatch[2];

  // Skip canvas re-encoding outside the browser or when payload is already compact (~<700KB base64)
  if (typeof document === 'undefined' || origB64.length < 700_000) {
    return { base64Data: origB64, mimeType: origMime };
  }

  try {
    const compressed = await new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width || 1;
        const h = img.naturalHeight || img.height || 1;
        const scale = Math.min(1, maxDimension / Math.max(w, h));
        const targetW = Math.max(1, Math.round(w * scale));
        const targetH = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => resolve('');
      img.src = dataUrl;
    });
    const compMatch = compressed.match(/^data:([^;]+);base64,(.+)$/);
    if (compMatch) {
      return { base64Data: compMatch[2], mimeType: compMatch[1] };
    }
  } catch {
    // Fall back to original payload if canvas draw fails
  }

  return { base64Data: origB64, mimeType: origMime };
}

export interface GeminiCallParams {
  apiKeys: string[];
  contents: any[];
  systemInstruction?: any;
  generationConfig?: Record<string, any>;
  models?: readonly string[];
  timeoutMs?: number;
}

/**
 * Calls Google Gemini generateContent with resilient model fallback, per-request abort timeout,
 * and automatic thinkingConfig gating (only passed to models that accept it without 400).
 */
export async function callGeminiGenerateContent({
  apiKeys,
  contents,
  systemInstruction,
  generationConfig,
  models = GEMINI_FAST_VISION_MODELS,
  timeoutMs = 18000,
}: GeminiCallParams): Promise<{ data: any | null; modelUsed: string | null; lastError: string }> {
  const uniqueKeys = Array.from(new Set(apiKeys.map((k) => (k || '').trim()).filter(Boolean)));
  let lastError = '';

  for (const keyCandidate of uniqueKeys) {
    for (const mod of models) {
      const controller = new AbortController();
      // Give larger 3.6-flash slightly more headroom if fast-tier models are transiently busy
      const effectiveTimeout = mod === 'gemini-3.6-flash' ? Math.max(timeoutMs, 26000) : timeoutMs;
      const timer = setTimeout(() => controller.abort(), effectiveTimeout);

      try {
        const body: Record<string, any> = { contents };
        if (systemInstruction) body.systemInstruction = systemInstruction;

        if (generationConfig) {
          const cfg = { ...generationConfig };
          // Only models supporting thinkingBudget: 0 accept thinkingConfig without 400 INVALID_ARGUMENT
          if (
            (mod === 'gemini-3-flash-preview' || mod === 'gemini-3.6-flash') &&
            cfg.responseMimeType === 'application/json' &&
            !cfg.thinkingConfig
          ) {
            cfg.thinkingConfig = { thinkingBudget: 0 };
          }
          body.generationConfig = cfg;
        }

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${keyCandidate}`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        );
        clearTimeout(timer);

        const json = await res.json().catch(() => null);
        if (res.ok && json?.candidates?.length > 0 && !json.error) {
          return { data: json, modelUsed: mod, lastError: '' };
        }
        if (json?.error?.message) {
          lastError = json.error.message;
        } else if (!res.ok) {
          lastError = `HTTP ${res.status}`;
        }
      } catch (err: any) {
        clearTimeout(timer);
        lastError = err?.name === 'AbortError' ? `Timeout on ${mod}` : (err?.message || 'Network error');
      }
    }
  }

  return { data: null, modelUsed: null, lastError };
}
