'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOSDevice || isAndroid || window.innerWidth < 768;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = localStorage.getItem('install-prompt-dismissed');

    setIsIOS(isIOSDevice);
    // Only show on mobile devices, not desktop
    setShowPrompt(isMobile && !isStandalone && !dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('install-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 glass-card border-t-0 rounded-t-none text-white p-3 z-50 safe-top">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">Add to Home Screen</p>
          <p className="text-xs text-white/60 truncate">
            {isIOS
              ? 'Tap Share → Add to Home Screen'
              : 'Install for the best experience'}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/50 hover:text-white text-xl px-2"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
