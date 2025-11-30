export interface Variation {
  russian: string;
  transliteration: string;
  nuance: string; // e.g., "more casual", "slang", "formal"
}

export interface Word {
  id: string;
  russian: string;
  transliteration: string;
  english: string;
  example: string;
  exampleTranslation: string;
  notes: string;
  category: Category;
  // Optional: alternative ways to say the same thing
  variations?: Variation[];
  // Optional: IDs of words that naturally follow this one in conversation
  respondsTo?: string[];  // What phrases this is a response to
  responses?: string[];   // What phrases can respond to this
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
  | 'romance'
  | 'patterns'
  | 'verbs'
  | 'connectors'
  | 'jokes';

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
