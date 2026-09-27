const API_KEY = process.env.EXPO_PUBLIC_STEAMGRIDDB_API_KEY?.trim() ?? '';
const BASE_URL = 'https://www.steamgriddb.com/api/v2';

type SteamGridDbGame = { id?: number; name?: string };
type SteamGridDbGrid = { id?: number; score?: number; url?: string; thumb?: string };
type SteamGridDbResponse<T> = { success?: boolean; data?: T[] };

function headers() {
  return { Authorization: `Bearer ${API_KEY}` };
}

function normalized(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function hasSteamGridDbKey() {
  return Boolean(API_KEY);
}

async function gameIdByTitle(title: string) {
  const response = await fetch(`${BASE_URL}/search/autocomplete/${encodeURIComponent(title)}`, { headers: headers() });
  if (!response.ok) return undefined;
  const payload = await response.json() as SteamGridDbResponse<SteamGridDbGame>;
  const games = payload.data ?? [];
  const exact = games.find((game) => game.name && normalized(game.name) === normalized(title));
  return (exact ?? games[0])?.id;
}

async function gridUrls(path: string) {
  const separator = path.includes('?') ? '&' : '?';
  const response = await fetch(`${BASE_URL}/${path}${separator}dimensions=600x900&types=static&nsfw=false&humor=false`, { headers: headers() });
  if (!response.ok) return [];
  const payload = await response.json() as SteamGridDbResponse<SteamGridDbGrid>;
  return (payload.data ?? [])
    .filter((grid) => Boolean(grid.url))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 8)
    .map((grid) => grid.url!)
    .filter(Boolean);
}

export async function findSteamGridCovers(title: string, steamAppId?: number) {
  if (!API_KEY || !title.trim()) return [];
  try {
    if (steamAppId) {
      const direct = await gridUrls(`grids/steam/${steamAppId}`);
      if (direct.length) return direct;
    }
    const gameId = await gameIdByTitle(title);
    if (!gameId) return [];
    return gridUrls(`grids/game/${gameId}`);
  } catch {
    return [];
  }
}
