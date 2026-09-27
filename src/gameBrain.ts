import { GameSearchResult } from './models';

const API_KEY = process.env.EXPO_PUBLIC_GAMEBRAIN_API_KEY?.trim() ?? '';
const SEARCH_URL = 'https://api.gamebrain.co/v1/games';

type GameBrainPlatform = { name?: string };
type GameBrainGame = {
  id?: string | number;
  name?: string;
  year?: string | number;
  image?: string;
  platforms?: GameBrainPlatform[];
};
type GameBrainResponse = { results?: GameBrainGame[] };

export function hasGameBrainKey() {
  return Boolean(API_KEY);
}

export async function searchGameBrain(query: string): Promise<GameSearchResult[]> {
  if (!API_KEY) return [];
  const q = query.trim();
  if (!q) return [];

  const params = new URLSearchParams({ query: q, limit: '12', offset: '0' });
  const response = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: { 'x-api-key': API_KEY }
  });
  if (!response.ok) throw new Error(`GameBrain search failed (${response.status}).`);

  const data = await response.json() as GameBrainResponse;
  return (data.results ?? [])
    .filter((game): game is GameBrainGame & { id: string | number; name: string } => Boolean(game.id != null && game.name))
    .map((game) => ({
      source: 'gamebrain' as const,
      id: game.id,
      name: game.name,
      releaseYear: game.year != null ? String(game.year) : undefined,
      imageUrl: game.image,
      coverCandidates: game.image ? [game.image] : [],
      platforms: (game.platforms ?? []).map((platform) => platform.name).filter((name): name is string => Boolean(name))
    }));
}
