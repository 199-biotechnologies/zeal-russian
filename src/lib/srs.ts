'use client';

import { SavedWord, FlashcardStats } from './types';

const STORAGE_KEY = 'zeal-russian-saved';

export function getSavedWords(): SavedWord[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveWord(wordId: string): void {
  const saved = getSavedWords();
  if (saved.find(w => w.wordId === wordId)) return;

  const newWord: SavedWord = {
    wordId,
    savedAt: Date.now(),
    nextReview: Date.now(),
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
  };

  saved.push(newWord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export function removeWord(wordId: string): void {
  const saved = getSavedWords().filter(w => w.wordId !== wordId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export function isWordSaved(wordId: string): boolean {
  return getSavedWords().some(w => w.wordId === wordId);
}

export function getDueWords(): SavedWord[] {
  const now = Date.now();
  return getSavedWords().filter(w => w.nextReview <= now);
}

export function reviewWord(wordId: string, quality: number): void {
  // Quality: 0-2 = fail, 3 = hard, 4 = good, 5 = easy
  const saved = getSavedWords();
  const wordIndex = saved.findIndex(w => w.wordId === wordId);
  if (wordIndex === -1) return;

  const word = saved[wordIndex];

  if (quality < 3) {
    // Failed - reset
    word.repetitions = 0;
    word.interval = 0;
    word.nextReview = Date.now() + 60 * 1000; // Review in 1 minute
  } else {
    // Passed - apply SM-2 algorithm
    word.repetitions += 1;

    if (word.repetitions === 1) {
      word.interval = 1; // 1 day
    } else if (word.repetitions === 2) {
      word.interval = 6; // 6 days
    } else {
      word.interval = Math.round(word.interval * word.easeFactor);
    }

    // Update ease factor
    word.easeFactor = Math.max(1.3, word.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    // Set next review time
    word.nextReview = Date.now() + word.interval * 24 * 60 * 60 * 1000;
  }

  saved[wordIndex] = word;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export function getStats(): FlashcardStats {
  const saved = getSavedWords();
  const now = Date.now();

  return {
    totalCards: saved.length,
    dueCards: saved.filter(w => w.nextReview <= now).length,
    masteredCards: saved.filter(w => w.repetitions >= 5).length,
  };
}
