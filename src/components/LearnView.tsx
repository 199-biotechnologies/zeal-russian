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
        <div className="sticky top-0 bg-[#fdfcf9] z-10 px-4 py-4 border-b border-gray-100">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <span>←</span>
            <span className="text-sm font-medium">Back</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>{categoryInfo?.emoji}</span>
            <span>{categoryInfo?.name}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Zeal Russian</h1>
        <p className="text-gray-500">Learn casual Russian expressions</p>
      </div>
      <div className="px-4 grid gap-3">
        {categories.map((category) => {
          const count = words.filter((w) => w.category === category.id).length;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="bg-white rounded-xl p-4 text-left shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{category.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
                <div className="text-sm text-gray-400">{count}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
