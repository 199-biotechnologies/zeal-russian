'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import InstallPrompt from '@/components/InstallPrompt';
import LearnView from '@/components/LearnView';
import FlashcardsView from '@/components/FlashcardsView';
import BrowseView from '@/components/BrowseView';
import TranslateView from '@/components/TranslateView';

type Tab = 'learn' | 'flashcards' | 'browse' | 'translate';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('learn');

  return (
    <main className="min-h-screen bg-[#fdfcf9]">
      <InstallPrompt />

      <div className="max-w-lg mx-auto">
        {activeTab === 'learn' && <LearnView />}
        {activeTab === 'flashcards' && <FlashcardsView />}
        {activeTab === 'browse' && <BrowseView />}
        {activeTab === 'translate' && <TranslateView />}
      </div>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
