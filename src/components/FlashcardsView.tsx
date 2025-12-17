'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { words } from '@/data/words';
import { Word } from '@/lib/types';
import { getSavedWords, getDueWords, reviewWord, getStats, removeWord } from '@/lib/srs';

export default function FlashcardsView() {
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ totalCards: 0, dueCards: 0, masteredCards: 0 });
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      audioCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const playAudio = useCallback(async (text: string, audioId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playingAudio) return;

    setPlayingAudio(audioId);

    try {
      // Check cache first
      let audioUrl = audioCacheRef.current.get(text);

      if (!audioUrl) {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) throw new Error('TTS failed');

        const blob = await res.blob();
        audioUrl = URL.createObjectURL(blob);
        audioCacheRef.current.set(text, audioUrl);
      }

      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => setPlayingAudio(null);
      await audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      setPlayingAudio(null);
    }
  }, [playingAudio]);

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
        <h1 className="text-2xl font-bold logo-text mb-4">Flashcards</h1>
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={1.5} />
              <path d="M3 10h18" strokeWidth={1.5} />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Cards Yet</h2>
          <p className="text-white/50 mb-4">
            Save words while learning to add them to your flashcard deck.
          </p>
          <p className="text-sm text-white/30">
            Tap the ☆ icon on any word to save it.
          </p>
        </div>
      </div>
    );
  }

  if (dueWords.length === 0) {
    return (
      <div className="pb-20 px-4 py-8">
        <h1 className="text-2xl font-bold logo-text mb-4">Flashcards</h1>
        <div className="glass-card rounded-2xl p-6 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalCards}</div>
              <div className="text-xs text-white/40">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">{stats.masteredCards}</div>
              <div className="text-xs text-white/40">Mastered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{stats.dueCards}</div>
              <div className="text-xs text-white/40">Due</div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">All Done!</h2>
          <p className="text-white/50">
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
        <h1 className="text-2xl font-bold logo-text">Flashcards</h1>
        <span className="text-sm text-white/50 bg-white/10 px-3 py-1 rounded-full">
          {currentIndex + 1} / {dueWords.length}
        </span>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div
          onClick={() => setShowAnswer(true)}
          className="p-6 min-h-[280px] flex flex-col justify-center cursor-pointer"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <p className="text-3xl font-bold text-white">
                {currentWord.russian}
              </p>
              <button
                onClick={(e) => playAudio(currentWord.russian, 'word', e)}
                disabled={playingAudio !== null}
                className={`p-2 rounded-full transition-all ${
                  playingAudio === 'word'
                    ? 'bg-red-500/30 text-red-400'
                    : 'bg-white/10 text-white/50 hover:bg-red-500/20 hover:text-red-400'
                }`}
                aria-label="Play pronunciation"
              >
                {playingAudio === 'word' ? (
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-lg text-white/40 mb-4">
              {currentWord.transliteration}
            </p>

            {!showAnswer && (
              <p className="text-sm text-white/30 mt-8">Tap to reveal answer</p>
            )}

            {showAnswer && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xl text-white mb-4">{currentWord.english}</p>
                <div className="text-left bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-white/40 mb-1 uppercase tracking-wide">Example</p>
                  <div className="flex items-start gap-2">
                    <button
                      onClick={(e) => playAudio(currentWord.example, 'example', e)}
                      disabled={playingAudio !== null}
                      className={`flex-shrink-0 p-1 rounded-full transition-all mt-0.5 ${
                        playingAudio === 'example'
                          ? 'bg-red-500/30 text-red-400'
                          : 'bg-white/10 text-white/40 hover:bg-red-500/20 hover:text-red-400'
                      }`}
                      aria-label="Play example"
                    >
                      {playingAudio === 'example' ? (
                        <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm italic text-white/80">{currentWord.example}</p>
                      <p className="text-xs text-white/40 mt-1">{currentWord.exampleTranslation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showAnswer && (
          <div className="border-t border-white/10 p-4">
            <p className="text-center text-xs text-white/40 mb-3">How well did you know this?</p>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleReview(1)}
                className="py-3 px-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 border border-red-500/20"
              >
                Again
              </button>
              <button
                onClick={() => handleReview(3)}
                className="py-3 px-2 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 border border-amber-500/20"
              >
                Hard
              </button>
              <button
                onClick={() => handleReview(4)}
                className="py-3 px-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 border border-emerald-500/20"
              >
                Good
              </button>
              <button
                onClick={() => handleReview(5)}
                className="py-3 px-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 border border-blue-500/20"
              >
                Easy
              </button>
            </div>
            <button
              onClick={handleRemove}
              className="w-full mt-3 py-2 text-xs text-white/30 hover:text-red-400"
            >
              Remove from deck
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
