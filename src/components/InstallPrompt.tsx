'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = localStorage.getItem('install-prompt-dismissed');

    setIsIOS(isIOSDevice);
    setShowPrompt(!isStandalone && !dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('install-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-3 z-50 safe-top">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Add to Home Screen</p>
          <p className="text-xs opacity-90 truncate">
            {isIOS
              ? 'Tap Share → Add to Home Screen'
              : 'Install for the best experience'}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white text-xl px-2"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
