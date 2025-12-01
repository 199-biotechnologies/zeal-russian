'use client';

import { useState, useEffect } from 'react';
import { getStats } from '@/lib/srs';

type Tab = 'learn' | 'flashcards' | 'browse' | 'translate';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

// Custom SVG icons
const LearnIcon = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const FlashcardsIcon = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.01M6 10h.01M6 14h.01M10 6h8M10 10h8M10 14h8M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
  </svg>
);

const BrowseIcon = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const TranslateIcon = ({ active }: { active: boolean }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="max-w-lg mx-auto flex items-center h-14 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative py-1 ${
                isActive
                  ? 'text-red-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.Icon active={isActive} />
              <span className="text-[10px] font-medium mt-0.5">{tab.label}</span>
              {tab.id === 'flashcards' && dueCount > 0 && (
                <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {dueCount > 9 ? '9+' : dueCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
