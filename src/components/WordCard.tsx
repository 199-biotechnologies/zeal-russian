'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Word } from '@/lib/types';
import { saveWord, removeWord, isWordSaved } from '@/lib/srs';
import { words } from '@/data/words';

interface WordCardProps {
  word: Word;
  onSaveChange?: () => void;
  onNavigateToWord?: (wordId: string) => void;
}

export default function WordCard({ word, onSaveChange, onNavigateToWord }: WordCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVariations, setShowVariations] = useState(false);
  const [showChain, setShowChain] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    setSaved(isWordSaved(word.id));
  }, [word.id]);

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      audioCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const playAudio = useCallback(async (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (isLoading) return;

    // Check cache first
    const cachedUrl = audioCacheRef.current.get(text);
    if (cachedUrl) {
      const audio = new Audio(cachedUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('TTS failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audioCacheRef.current.set(text, url);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

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

  // Get linked words for conversation chains
  const getLinkedWords = (ids: string[] | undefined) => {
    if (!ids) return [];
    return ids.map(id => words.find(w => w.id === id)).filter(Boolean) as Word[];
  };

  const responseWords = getLinkedWords(word.responses);
  const respondsToWords = getLinkedWords(word.respondsTo);
  const hasChain = responseWords.length > 0 || respondsToWords.length > 0;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {word.russian}
            </h3>
            <button
              onClick={(e) => playAudio(word.russian, e)}
              disabled={isLoading}
              className={`p-1.5 rounded-full transition-all ${
                isPlaying
                  ? 'bg-blue-100 text-blue-600'
                  : isLoading
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500'
              }`}
              aria-label="Play pronunciation"
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
          </div>
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
          {/* Example with audio */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Example
            </p>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-base text-gray-900 italic">{word.example}</p>
                <p className="text-sm text-gray-600 mt-1">{word.exampleTranslation}</p>
              </div>
              <button
                onClick={(e) => playAudio(word.example, e)}
                className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-colors shrink-0"
                aria-label="Play example"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Notes
            </p>
            <p className="text-sm text-gray-700">{word.notes}</p>
          </div>

          {/* Variations - collapsible */}
          {word.variations && word.variations.length > 0 && (
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVariations(!showVariations);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 uppercase tracking-wide mb-1 hover:text-blue-700"
              >
                <span>Also say</span>
                <svg
                  className={`w-3 h-3 transition-transform ${showVariations ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showVariations && (
                <div className="space-y-2 mt-2">
                  {word.variations.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{v.russian}</span>
                        <span className="text-gray-500 text-sm ml-2">({v.transliteration})</span>
                        <span className="text-blue-600 text-xs ml-2">• {v.nuance}</span>
                      </div>
                      <button
                        onClick={(e) => playAudio(v.russian, e)}
                        className="p-1 rounded-full bg-white text-gray-500 hover:text-blue-500"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Conversation Chain - collapsible */}
          {hasChain && (
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChain(!showChain);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-green-600 uppercase tracking-wide mb-1 hover:text-green-700"
              >
                <span>In conversation</span>
                <svg
                  className={`w-3 h-3 transition-transform ${showChain ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showChain && (
                <div className="space-y-2 mt-2">
                  {respondsToWords.length > 0 && (
                    <div className="text-xs text-gray-500 mb-1">Response to:</div>
                  )}
                  {respondsToWords.map((w) => (
                    <button
                      key={w.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToWord?.(w.id);
                      }}
                      className="w-full text-left p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-gray-900">{w.russian}</span>
                      <span className="text-gray-500 text-sm ml-2">{w.english}</span>
                    </button>
                  ))}
                  {responseWords.length > 0 && (
                    <div className="text-xs text-gray-500 mb-1 mt-2">Can respond with:</div>
                  )}
                  {responseWords.map((w) => (
                    <button
                      key={w.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToWord?.(w.id);
                      }}
                      className="w-full text-left p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <span className="text-gray-900">{w.russian}</span>
                      <span className="text-gray-500 text-sm ml-2">{w.english}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
