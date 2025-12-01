'use client';

import { useState } from 'react';

export default function TranslateView() {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');
  const [examples, setExamples] = useState<Array<{ text: string; english: string }>>([]);
  const [casualAlternative, setCasualAlternative] = useState('');
  const [casualExamples, setCasualExamples] = useState<Array<{ text: string; english: string }>>([]);
  const [showCasual, setShowCasual] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fromLang, setFromLang] = useState<'en' | 'ru'>('en');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          fromLang,
          toLang: fromLang === 'en' ? 'ru' : 'en',
        }),
      });

      const data = await res.json();
      setTranslation(data.translation);
      setExamples(data.examples || []);
      setCasualAlternative(data.casual_alternative || '');
      setCasualExamples(data.casual_examples || []);
      setShowCasual(true);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslation('Translation failed. Please try again.');
      setExamples([]);
      setCasualAlternative('');
      setCasualExamples([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setFromLang(fromLang === 'en' ? 'ru' : 'en');
    setTranslation('');
    setExamples([]);
    setCasualAlternative('');
    setCasualExamples([]);
    setShowCasual(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const clearInput = () => {
    setText('');
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const playAudio = async (textToSpeak: string, audioId: string) => {
    setPlayingAudio(audioId);

    const audio = document.createElement('audio');
    audio.controls = false;
    audio.setAttribute('playsinline', 'true');
    audio.preload = 'auto';
    audio.style.display = 'none';
    document.body.appendChild(audio);

    audio.onended = () => {
      setPlayingAudio(null);
      document.body.removeChild(audio);
    };

    audio.onerror = () => {
      console.error('Audio playback error');
      setPlayingAudio(null);
      if (document.body.contains(audio)) {
        document.body.removeChild(audio);
      }
    };

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak }),
      });

      if (!res.ok) {
        throw new Error('Text-to-speech failed');
      }

      const audioBuffer = await res.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      audio.src = audioUrl;
      await audio.load();

      audio.onloadeddata = () => {
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setPlayingAudio(null);
      if (document.body.contains(audio)) {
        document.body.removeChild(audio);
      }
    }
  };

  return (
    <div className="pb-20">
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold logo-text mb-1">Translate</h1>
        <p className="text-white/50">English-Russian casual translation</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Language Toggle */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-white w-24 justify-end">
              <span className="text-2xl">{fromLang === 'en' ? '🇬🇧' : '🇷🇺'}</span>
              <span className="text-lg font-semibold">{fromLang === 'en' ? 'EN' : 'RU'}</span>
            </div>
            <button
              onClick={toggleLanguage}
              className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full transition-colors shadow-lg shadow-red-500/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-white w-24">
              <span className="text-2xl">{fromLang === 'en' ? '🇷🇺' : '🇬🇧'}</span>
              <span className="text-lg font-semibold">{fromLang === 'en' ? 'RU' : 'EN'}</span>
            </div>
          </div>

          {/* Input */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={fromLang === 'en' ? 'Enter English text...' : 'Введите русский текст...'}
              className="w-full p-3 pr-12 bg-white/5 border border-white/10 rounded-xl resize-none focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 text-lg text-white placeholder-white/30 transition-all"
              rows={3}
            />
            {text && (
              <button
                onClick={clearInput}
                className="absolute right-3 top-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/50 transition-colors"
                title="Clear input"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Translate Button */}
          <button
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
            className="w-full mt-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30 btn-glow"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Translating...
              </span>
            ) : (
              'Translate'
            )}
          </button>
        </div>

        {/* Translation Result */}
        {translation && (
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{fromLang === 'en' ? '🇷🇺' : '🇬🇧'}</span>
                <span className="text-sm font-medium text-white/50">
                  {fromLang === 'en' ? 'Russian' : 'English'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(translation, 'main')}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 transition-colors"
                  title="Copy translation"
                >
                  {copiedId === 'main' ? (
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                {fromLang === 'en' && (
                  <button
                    onClick={() => playAudio(translation, 'main-translation')}
                    disabled={playingAudio !== null}
                    className="p-2 rounded-full bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Play audio"
                  >
                    {playingAudio === 'main-translation' ? (
                      <svg className="w-5 h-5 animate-pulse text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Main Translation */}
            <p className="text-2xl font-semibold text-white leading-relaxed mb-4">{translation}</p>

            {/* Usage Examples */}
            {examples && examples.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wide">Examples</h4>
                <div className="space-y-2">
                  {examples.map((example, idx) => (
                    <div key={idx} className="pl-3 border-l-2 border-white/20 space-y-0.5">
                      <div className="flex items-start gap-2">
                        {fromLang === 'en' && (
                          <button
                            onClick={() => playAudio(example.text, `example-${idx}`)}
                            disabled={playingAudio !== null}
                            className="flex-shrink-0 p-0.5 hover:bg-white/10 rounded transition-colors disabled:opacity-50 mt-0.5"
                            title="Play audio"
                          >
                            {playingAudio === `example-${idx}` ? (
                              <svg className="w-3.5 h-3.5 animate-pulse text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              </svg>
                            )}
                          </button>
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-white/90 leading-relaxed font-medium">{example.text}</p>
                          <p className="text-xs text-white/50 italic">{example.english}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Casual/Street Alternative - Collapsible */}
        {casualAlternative && (
          <div className="glass-card rounded-2xl p-4 border-amber-500/20">
            <button
              onClick={() => setShowCasual(!showCasual)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide">Street Russian</h4>
                <p className="text-xs text-white/40">Ultra-casual slang / Informal</p>
              </div>
              <svg
                className={`w-5 h-5 text-white/50 transition-transform ${showCasual ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showCasual && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-end gap-2 mb-3">
                  <button
                    onClick={() => copyToClipboard(casualAlternative, 'casual')}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 transition-colors"
                    title="Copy street translation"
                  >
                    {copiedId === 'casual' ? (
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  {fromLang === 'en' && (
                    <button
                      onClick={() => playAudio(casualAlternative, 'casual-main')}
                      disabled={playingAudio !== null}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-amber-500/20 text-white/60 hover:text-amber-400 transition-colors disabled:opacity-50"
                      title="Play audio"
                    >
                      {playingAudio === 'casual-main' ? (
                        <svg className="w-4 h-4 animate-pulse text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>

                {/* Casual Translation */}
                <p className="text-xl font-semibold text-white leading-relaxed mb-4">{casualAlternative}</p>

                {/* Casual Examples */}
                {casualExamples && casualExamples.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wide">Street Examples</h4>
                    <div className="space-y-2">
                      {casualExamples.map((example, idx) => (
                        <div key={idx} className="pl-3 border-l-2 border-amber-500/30 space-y-0.5">
                          <div className="flex items-start gap-2">
                            {fromLang === 'en' && (
                              <button
                                onClick={() => playAudio(example.text, `casual-example-${idx}`)}
                                disabled={playingAudio !== null}
                                className="flex-shrink-0 p-0.5 hover:bg-white/10 rounded transition-colors disabled:opacity-50 mt-0.5"
                                title="Play audio"
                              >
                                {playingAudio === `casual-example-${idx}` ? (
                                  <svg className="w-3.5 h-3.5 animate-pulse text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                  </svg>
                                )}
                              </button>
                            )}
                            <div className="flex-1">
                              <p className="text-sm text-white/90 leading-relaxed font-medium">{example.text}</p>
                              <p className="text-xs text-white/50 italic">{example.english}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
