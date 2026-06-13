export interface SermonSection {
  id: string;
  title: string;
  durationMinutes: number;
  content: string;
  isExpanded?: boolean;
}

export interface Sermon {
  id: string;
  title: string;
  theme: string;
  mainPassage: string;
  durationMinutes: number;
  notes: string;
  sections: SermonSection[];
  createdAt?: string;
  updatedAt?: string;
  bibleVersion?: string;
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: string;
  text: string;
  version: string;
}
