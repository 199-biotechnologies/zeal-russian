'use client';

import { useState } from 'react';
import { categories } from '@/data/categories';
import { words } from '@/data/words';
import { Category } from '@/lib/types';
import WordCard from './WordCard';

export default function LearnView() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const filteredWords = selectedCategory
    ? words.filter((w) => w.category === selectedCategory)
    : [];

  if (selectedCategory) {
    const categoryInfo = categories.find((c) => c.id === selectedCategory);
    return (
      <div className="pb-20">
        <div className="sticky top-0 z-10 px-4 py-4 glass-card rounded-b-3xl">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>{categoryInfo?.emoji}</span>
            <span>{categoryInfo?.name}</span>
          </h2>
          <p className="text-sm text-white/50 mt-1">
            {filteredWords.length} expressions
          </p>
        </div>
        <div className="p-4 space-y-3">
          {filteredWords.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gradient mb-1">Zeal Russian</h1>
        <p className="text-white/50">Learn casual Russian expressions</p>
      </div>
      <div className="px-4 grid gap-3">
        {categories.map((category) => {
          const count = words.filter((w) => w.category === category.id).length;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="glass-card rounded-2xl p-4 text-left hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{category.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{category.name}</h3>
                  <p className="text-sm text-white/50">{category.description}</p>
                </div>
                <div className="text-sm text-white/40 bg-white/10 px-2 py-1 rounded-full">{count}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
