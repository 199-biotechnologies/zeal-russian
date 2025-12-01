'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { words } from '@/data/words';
import { categories } from '@/data/categories';
import WordCard from './WordCard';

export default function BrowseView() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredWords = useMemo(() => {
    let result = words;

    if (categoryFilter !== 'all') {
      result = result.filter((w) => w.category === categoryFilter);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.russian.toLowerCase().includes(searchLower) ||
          w.transliteration.toLowerCase().includes(searchLower) ||
          w.english.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [search, categoryFilter]);

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-10 px-4 py-4 glass-card rounded-b-3xl border-t-0 space-y-3">
        <h1 className="text-2xl font-bold logo-text">Browse</h1>

        <input
          type="text"
          placeholder="Search words..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 outline-none text-sm"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              categoryFilter === 'all'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-white/10 text-white/60 hover:bg-white/15'
            }`}
          >
            All ({words.length})
          </button>
          {categories.map((cat) => {
            const count = words.filter((w) => w.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  categoryFilter === cat.id
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                    : 'bg-white/10 text-white/60 hover:bg-white/15'
                }`}
              >
                {cat.icon ? (
                  <Image
                    src={cat.icon}
                    alt={cat.name}
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  <span>{cat.emoji}</span>
                )}
                {count}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredWords.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-white/50">No words found</p>
          </div>
        ) : (
          filteredWords.map((word) => (
            <WordCard key={word.id} word={word} />
          ))
        )}
      </div>
    </div>
  );
}
