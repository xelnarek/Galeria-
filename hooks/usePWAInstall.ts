'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';

function subscribeStandalone(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia('(display-mode: standalone)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getStandaloneSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches;
}

function getIOSSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as { MSStream?: unknown }).MSStream;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const isInstalled = useSyncExternalStore(subscribeStandalone, getStandaloneSnapshot, getServerSnapshot);
  const isIOS = useSyncExternalStore(() => () => {}, getIOSSnapshot, getServerSnapshot);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;

    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
    } catch {
      // ignore
    } finally {
      setInstallPrompt(null);
    }
  };

  return {
    isInstallable: !!installPrompt,
    canInstall: !!installPrompt,
    isInstalled,
    isIOS,
    install,
    showInstallPrompt: install,
  };
}



