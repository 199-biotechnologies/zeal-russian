'use client';

import { useState, useMemo } from 'react';
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
      <div className="sticky top-0 bg-[#fdfcf9] z-10 px-4 py-4 border-b border-gray-100 space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">Browse</h1>

        <input
          type="text"
          placeholder="Search words..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none text-sm"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              categoryFilter === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  categoryFilter === cat.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.emoji} {count}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredWords.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-gray-500">No words found</p>
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
