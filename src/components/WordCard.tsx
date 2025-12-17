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
  const [playingConversation, setPlayingConversation] = useState(false);
  const [showVariations, setShowVariations] = useState(false);
  const [showChain, setShowChain] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const conversationAbortRef = useRef(false);

  useEffect(() => {
    setSaved(isWordSaved(word.id));
  }, [word.id]);

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      audioCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      conversationAbortRef.current = true;
    };
  }, []);

  const fetchAudio = async (text: string): Promise<string> => {
    // Check cache first
    const cachedUrl = audioCacheRef.current.get(text);
    if (cachedUrl) return cachedUrl;

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error('TTS failed');

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    audioCacheRef.current.set(text, url);
    return url;
  };

  const playAudioUrl = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Playback failed'));
      audio.play().catch(reject);
    });
  };

  const playAudio = useCallback(async (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (isLoading || playingConversation) return;

    setIsLoading(true);
    try {
      const url = await fetchAudio(text);
      setIsPlaying(true);
      await playAudioUrl(url);
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [isLoading, playingConversation]);

  // Play full conversation: prompt -> current word -> response
  const playConversation = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLoading || playingConversation) return;

    conversationAbortRef.current = false;
    setPlayingConversation(true);

    try {
      const conversationParts: string[] = [];

      // Get first respondsTo as the prompt (A says this)
      if (word.respondsTo && word.respondsTo.length > 0) {
        const promptWord = words.find(w => w.id === word.respondsTo![0]);
        if (promptWord) {
          conversationParts.push(promptWord.russian);
        }
      }

      // Current word is the response (B says this)
      conversationParts.push(word.russian);

      // Get first response as follow-up (A might say this)
      if (word.responses && word.responses.length > 0) {
        const responseWord = words.find(w => w.id === word.responses![0]);
        if (responseWord) {
          conversationParts.push(responseWord.russian);
        }
      }

      // Play each part with a small pause between
      for (let i = 0; i < conversationParts.length; i++) {
        if (conversationAbortRef.current) break;

        const url = await fetchAudio(conversationParts[i]);
        if (conversationAbortRef.current) break;

        await playAudioUrl(url);

        // Small pause between conversation parts
        if (i < conversationParts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      }
    } catch (error) {
      console.error('Conversation playback error:', error);
    } finally {
      setPlayingConversation(false);
    }
  }, [word, isLoading, playingConversation]);

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
      className="glass-card rounded-2xl p-4 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-white">
              {word.russian}
            </h3>
            <button
              onClick={(e) => playAudio(word.russian, e)}
              disabled={isLoading || playingConversation}
              className={`p-1.5 rounded-full transition-all ${
                isPlaying
                  ? 'bg-red-500/30 text-red-400'
                  : isLoading
                  ? 'bg-white/10 text-white/30'
                  : 'bg-white/10 text-white/50 hover:bg-red-500/20 hover:text-red-400'
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
          <p className="text-sm text-white/40 mb-1">{word.transliteration}</p>
          <p className="text-base text-white/70">{word.english}</p>
        </div>
        <button
          onClick={handleSave}
          className={`p-2 rounded-full transition-colors ${
            saved
              ? 'bg-amber-500/30 text-amber-400'
              : 'bg-white/10 text-white/30 hover:bg-white/20'
          }`}
          aria-label={saved ? 'Remove from flashcards' : 'Add to flashcards'}
        >
          {saved ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          {/* Example with audio */}
          <div>
            <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-1">
              Example
            </p>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-base text-white/90 italic">{word.example}</p>
                <p className="text-sm text-white/50 mt-1">{word.exampleTranslation}</p>
              </div>
              <button
                onClick={(e) => playAudio(word.example, e)}
                className="p-1.5 rounded-full bg-white/10 text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-colors shrink-0"
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
            <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-1">
              Notes
            </p>
            <p className="text-sm text-white/60">{word.notes}</p>
          </div>

          {/* Variations - collapsible */}
          {word.variations && word.variations.length > 0 && (
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVariations(!showVariations);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-400 uppercase tracking-wide mb-1 hover:text-blue-300"
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
                      className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-white">{v.russian}</span>
                        <span className="text-white/50 text-sm ml-2">({v.transliteration})</span>
                        <span className="text-blue-400 text-xs ml-2">• {v.nuance}</span>
                      </div>
                      <button
                        onClick={(e) => playAudio(v.russian, e)}
                        className="p-1 rounded-full bg-white/10 text-white/50 hover:text-blue-400"
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

          {/* Conversation Chain - collapsible with Play All button */}
          {hasChain && (
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChain(!showChain);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 uppercase tracking-wide hover:text-emerald-300"
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
                {/* Play full conversation button */}
                <button
                  onClick={playConversation}
                  disabled={playingConversation}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                    playingConversation
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {playingConversation ? (
                    <>
                      <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </svg>
                      Playing...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Play dialog
                    </>
                  )}
                </button>
              </div>
              {showChain && (
                <div className="space-y-2 mt-2">
                  {respondsToWords.length > 0 && (
                    <div className="text-xs text-white/40 mb-1">A: (prompt)</div>
                  )}
                  {respondsToWords.map((w) => (
                    <button
                      key={w.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToWord?.(w.id);
                      }}
                      className="w-full text-left p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <span className="text-white flex-1">{w.russian}</span>
                      <span className="text-white/50 text-sm">{w.english}</span>
                      <button
                        onClick={(e) => playAudio(w.russian, e)}
                        className="p-1 rounded-full hover:bg-white/10"
                      >
                        <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </button>
                  ))}

                  {/* Current word in chain */}
                  <div className="text-xs text-white/40 mb-1">B: (this phrase)</div>
                  <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                    <span className="font-medium text-white">{word.russian}</span>
                    <span className="text-white/60 text-sm ml-2">{word.english}</span>
                  </div>

                  {responseWords.length > 0 && (
                    <div className="text-xs text-white/40 mb-1 mt-2">A: (can respond)</div>
                  )}
                  {responseWords.map((w) => (
                    <button
                      key={w.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToWord?.(w.id);
                      }}
                      className="w-full text-left p-2 bg-emerald-500/10 rounded-xl hover:bg-emerald-500/15 transition-colors flex items-center gap-2"
                    >
                      <span className="text-white flex-1">{w.russian}</span>
                      <span className="text-white/50 text-sm">{w.english}</span>
                      <button
                        onClick={(e) => playAudio(w.russian, e)}
                        className="p-1 rounded-full hover:bg-emerald-500/20"
                      >
                        <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
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
