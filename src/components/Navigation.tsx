'use client';

import { useState, useEffect } from 'react';
import { getStats } from '@/lib/srs';

type Tab = 'learn' | 'flashcards' | 'browse' | 'translate';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

// Custom SVG icons - refined for dark theme
const LearnIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const FlashcardsIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const BrowseIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const TranslateIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8l6 6" />
    <path d="M4 14l6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2v3" />
    <path d="M22 22l-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
);

const tabs: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'learn', label: 'Learn', Icon: LearnIcon },
  { id: 'flashcards', label: 'Cards', Icon: FlashcardsIcon },
  { id: 'browse', label: 'Browse', Icon: BrowseIcon },
  { id: 'translate', label: 'Translate', Icon: TranslateIcon },
];

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

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8 safe-bottom z-50 pointer-events-none">
      <nav className="glass-nav rounded-[28px] px-2 py-2 pointer-events-auto relative overflow-hidden mb-2">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center px-4 py-2 rounded-[20px] min-w-[64px] ${
                  isActive
                    ? 'nav-active text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <tab.Icon active={isActive} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-white' : ''}`}>
                  {tab.label}
                </span>
                {tab.id === 'flashcards' && dueCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg shadow-red-500/50">
                    {dueCount > 9 ? '9+' : dueCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
