import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Hook to manage PWA installation for specific app manifests.
 * Call with the manifest URL to swap the manifest link before prompting.
 */
export function usePWAInstall(manifestUrl?: string) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detect when app is installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    // Swap manifest if a custom one is provided
    if (manifestUrl) {
      const link = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
      if (link) {
        link.href = manifestUrl;
        // Small delay to let the browser pick up new manifest
        await new Promise(r => setTimeout(r, 100));
      }
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  }, [deferredPrompt, manifestUrl]);

  return { canInstall, isInstalled, promptInstall };
}
