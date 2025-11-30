'use client';

import { useState, useEffect } from 'react';
import { Word } from '@/lib/types';
import { saveWord, removeWord, isWordSaved } from '@/lib/srs';

interface WordCardProps {
  word: Word;
  onSaveChange?: () => void;
}

export default function WordCard({ word, onSaveChange }: WordCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isWordSaved(word.id));
  }, [word.id]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      removeWord(word.id);
      setSaved(false);
    } else {
      saveWord(word.id);
      setSaved(true);
    }
    onSaveChange?.();
  };

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {word.russian}
          </h3>
          <p className="text-sm text-gray-500 mb-1">{word.transliteration}</p>
          <p className="text-base text-gray-700">{word.english}</p>
        </div>
        <button
          onClick={handleSave}
          className={`p-2 rounded-full transition-colors ${
            saved
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
          aria-label={saved ? 'Remove from flashcards' : 'Add to flashcards'}
        >
          {saved ? '★' : '☆'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Example
            </p>
            <p className="text-base text-gray-900 italic">{word.example}</p>
            <p className="text-sm text-gray-600 mt-1">{word.exampleTranslation}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Notes
            </p>
            <p className="text-sm text-gray-700">{word.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
