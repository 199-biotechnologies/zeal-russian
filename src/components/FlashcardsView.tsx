'use client';

import { useState, useEffect, useCallback } from 'react';
import { words } from '@/data/words';
import { Word } from '@/lib/types';
import { getSavedWords, getDueWords, reviewWord, getStats, removeWord } from '@/lib/srs';

export default function FlashcardsView() {
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ totalCards: 0, dueCards: 0, masteredCards: 0 });

  const loadCards = useCallback(() => {
    const due = getDueWords();
    const dueWordList = due
      .map((d) => words.find((w) => w.id === d.wordId))
      .filter((w): w is Word => w !== undefined);
    setDueWords(dueWordList);
    setStats(getStats());
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleReview = (quality: number) => {
    const currentWord = dueWords[currentIndex];
    if (currentWord) {
      reviewWord(currentWord.id, quality);
    }

    setShowAnswer(false);
    if (currentIndex < dueWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      loadCards();
      setCurrentIndex(0);
    }
  };

  const handleRemove = () => {
    const currentWord = dueWords[currentIndex];
    if (currentWord) {
      removeWord(currentWord.id);
      loadCards();
      if (currentIndex >= dueWords.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
    setShowAnswer(false);
  };

  if (stats.totalCards === 0) {
    return (
      <div className="pb-20 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Flashcards</h1>
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <span className="text-5xl mb-4 block">📚</span>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Cards Yet</h2>
          <p className="text-gray-500 mb-4">
            Save words while learning to add them to your flashcard deck.
          </p>
          <p className="text-sm text-gray-400">
            Tap the ☆ icon on any word to save it.
          </p>
        </div>
      </div>
    );
  }

  if (dueWords.length === 0) {
    return (
      <div className="pb-20 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Flashcards</h1>
        <div className="bg-white rounded-xl p-6 border border-gray-100 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalCards}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.masteredCards}</div>
              <div className="text-xs text-gray-500">Mastered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">{stats.dueCards}</div>
              <div className="text-xs text-gray-500">Due</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <span className="text-5xl mb-4 block">✨</span>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">All Done!</h2>
          <p className="text-gray-500">
            No cards due for review. Come back later!
          </p>
        </div>
      </div>
    );
  }

  const currentWord = dueWords[currentIndex];

  return (
    <div className="pb-20 px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {dueWords.length}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div
          onClick={() => setShowAnswer(true)}
          className="p-6 min-h-[280px] flex flex-col justify-center cursor-pointer"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {currentWord.russian}
            </p>
            <p className="text-lg text-gray-500 mb-4">
              {currentWord.transliteration}
            </p>

            {!showAnswer && (
              <p className="text-sm text-gray-400 mt-8">Tap to reveal answer</p>
            )}

            {showAnswer && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xl text-gray-900 mb-4">{currentWord.english}</p>
                <div className="text-left bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Example:</p>
                  <p className="text-sm italic text-gray-700">{currentWord.example}</p>
                  <p className="text-xs text-gray-500 mt-1">{currentWord.exampleTranslation}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showAnswer && (
          <div className="border-t border-gray-100 p-4">
            <p className="text-center text-xs text-gray-500 mb-3">How well did you know this?</p>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleReview(1)}
                className="py-3 px-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200"
              >
                Again
              </button>
              <button
                onClick={() => handleReview(3)}
                className="py-3 px-2 rounded-lg bg-orange-100 text-orange-700 text-sm font-medium hover:bg-orange-200"
              >
                Hard
              </button>
              <button
                onClick={() => handleReview(4)}
                className="py-3 px-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200"
              >
                Good
              </button>
              <button
                onClick={() => handleReview(5)}
                className="py-3 px-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200"
              >
                Easy
              </button>
            </div>
            <button
              onClick={handleRemove}
              className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-red-500"
            >
              Remove from deck
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
