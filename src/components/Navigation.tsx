'use client';

import { useState, useEffect } from 'react';
import { getStats } from '@/lib/srs';

type Tab = 'learn' | 'flashcards' | 'browse';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const updateStats = () => {
      const stats = getStats();
      setDueCount(stats.dueCards);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'learn', label: 'Learn', icon: '📚' },
    { id: 'flashcards', label: 'Flashcards', icon: '🎴' },
    { id: 'browse', label: 'Browse', icon: '🔍' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full relative ${
              activeTab === tab.id
                ? 'text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
            {tab.id === 'flashcards' && dueCount > 0 && (
              <span className="absolute top-2 right-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {dueCount > 9 ? '9+' : dueCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
