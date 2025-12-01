'use client';

import { useState } from 'react';
import Image from 'next/image';
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
          <div className="flex items-center gap-3">
            {categoryInfo?.icon && (
              <Image
                src={categoryInfo.icon}
                alt={categoryInfo.name}
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{categoryInfo?.name}</h2>
              <p className="text-sm text-white/50">
                {filteredWords.length} expressions
              </p>
            </div>
          </div>
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
        <h1 className="text-3xl font-bold logo-text mb-1">Zeal Russian</h1>
        <p className="text-white/50">Learn casual Russian expressions</p>
      </div>
      <div className="px-4 grid gap-3">
        {categories.map((category) => {
          const count = words.filter((w) => w.category === category.id).length;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="glass-card rounded-2xl overflow-hidden text-left hover:scale-[1.02] active:scale-[0.98] relative group"
            >
              {/* Large icon on the left, partially cropped */}
              <div className="flex items-stretch">
                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {category.icon ? (
                    <Image
                      src={category.icon}
                      alt={category.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain scale-110 opacity-90 group-hover:scale-[1.15] group-hover:opacity-100 transition-transform duration-300"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-4xl">
                      {category.emoji}
                    </span>
                  )}
                  {/* Gradient fade on right edge */}
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-white/[0.07]" />
                </div>

                {/* Text content on the right */}
                <div className="flex-1 py-4 px-4 flex items-center">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{category.name}</h3>
                    <p className="text-sm text-white/50 truncate">{category.description}</p>
                  </div>
                  <div className="text-sm text-white/40 bg-white/10 px-2.5 py-1 rounded-full ml-3 flex-shrink-0">
                    {count}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
