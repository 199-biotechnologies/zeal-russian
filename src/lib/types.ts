export interface Word {
  id: string;
  russian: string;
  transliteration: string;
  english: string;
  example: string;
  exampleTranslation: string;
  notes: string;
  category: Category;
}

export type Category =
  | 'greetings'
  | 'daily'
  | 'slang'
  | 'emotions'
  | 'questions'
  | 'polite'
  | 'time'
  | 'smalltalk'
  | 'work'
  | 'health'
  | 'food'
  | 'travel'
  | 'shopping'
  | 'romance';

export interface CategoryInfo {
  id: Category;
  name: string;
  emoji: string;
  description: string;
}

export interface SavedWord {
  wordId: string;
  savedAt: number;
  nextReview: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface FlashcardStats {
  totalCards: number;
  dueCards: number;
  masteredCards: number;
}
