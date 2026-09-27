export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type SessionEntry = {
  id: string;
  createdAt: string;
  location: string;
  doing: string;
  nextObjective: string;
  dontForget: string;
  partyBuild: string;
  notes: string;
  screenshots: string[];
  checklist?: ChecklistItem[];
};

export type GameSearchSource = 'steam' | 'thegamesdb' | 'gamebrain';

export type Game = {
  id: string;
  title: string;
  coverUri?: string;
  steamAppId?: number;
  catalogSource?: GameSearchSource;
  catalogId?: string;
  releaseYear?: string;
  platforms?: string[];
  platform?: string;
  edition?: string;
  addedAt: string;
  updatedAt: string;
  sessions: SessionEntry[];
};

export type GameSearchResult = {
  source: GameSearchSource;
  id: string | number;
  name: string;
  releaseYear?: string;
  imageUrl?: string;
  coverCandidates: string[];
  platforms: string[];
};

export type SearchProviderState = {
  id: 'steam' | 'thegamesdb' | 'gamebrain' | 'steamgriddb';
  label: string;
  purpose: 'catalog' | 'art';
  configured: boolean;
  alwaysOn?: boolean;
};

export type SearchResponse = {
  results: GameSearchResult[];
  warnings: string[];
};

export type Screen =
  | { name: 'library' }
  | { name: 'add' }
  | { name: 'game'; gameId: string }
  | { name: 'edit'; gameId: string }
  | { name: 'bookmark'; gameId: string }
  | { name: 'comeback'; gameId: string }
  | { name: 'history'; gameId: string };
