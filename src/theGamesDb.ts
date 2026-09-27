import { GameSearchResult } from './models';

const BASE_URL = 'https://api.thegamesdb.net/v1.1/Games/ByGameName';
const API_KEY = process.env.EXPO_PUBLIC_THEGAMESDB_API_KEY?.trim() ?? '';

type LooseRecord = Record<string, unknown>;

function asRecord(value: unknown): LooseRecord | undefined {
  return value && typeof value === 'object' ? value as LooseRecord : undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

function releaseYear(value: unknown) {
  const text = asString(value);
  const match = text?.match(/\b(19|20)\d{2}\b/);
  return match?.[0];
}

function imageCandidatesForGame(payload: LooseRecord, gameId: string) {
  const include = asRecord(payload.include);
  const boxart = asRecord(include?.boxart);
  const baseUrl = asRecord(boxart?.base_url);
  const data = asRecord(boxart?.data);
  const rows = Array.isArray(data?.[gameId]) ? data?.[gameId] as unknown[] : [];
  const originals = [asString(baseUrl?.original), asString(baseUrl?.medium), asString(baseUrl?.small), asString(baseUrl?.thumb)].filter(Boolean) as string[];

  const images = rows
    .map(asRecord)
    .filter(Boolean) as LooseRecord[];

  images.sort((a, b) => {
    const aFront = asString(a.side)?.toLowerCase() === 'front' ? 1 : 0;
    const bFront = asString(b.side)?.toLowerCase() === 'front' ? 1 : 0;
    return bFront - aFront;
  });

  const urls: string[] = [];
  for (const image of images) {
    const filename = asString(image.filename) ?? asString(image.url);
    if (!filename) continue;
    if (/^https?:\/\//i.test(filename)) {
      urls.push(filename);
      continue;
    }
    for (const base of originals) urls.push(`${base}${filename}`);
  }
  return Array.from(new Set(urls));
}

function platformNames(payload: LooseRecord, game: LooseRecord) {
  const include = asRecord(payload.include);
  const platformInclude = asRecord(include?.platform);
  const platformData = asRecord(platformInclude?.data);
  const rawPlatform = game.platform;
  const id = asString(rawPlatform);
  const direct = id ? asRecord(platformData?.[id]) : undefined;
  const name = asString(direct?.name) ?? (typeof rawPlatform === 'string' && !/^\d+$/.test(rawPlatform) ? rawPlatform : undefined);
  return name ? [name] : [];
}

export function hasTheGamesDbKey() {
  return Boolean(API_KEY);
}

export async function searchTheGamesDb(query: string): Promise<GameSearchResult[]> {
  if (!API_KEY) return [];
  const q = query.trim();
  if (!q) return [];

  const params = new URLSearchParams({
    apikey: API_KEY,
    name: q,
    fields: 'platform',
    include: 'boxart,platform'
  });
  const response = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!response.ok) throw new Error(`TheGamesDB search failed (${response.status}).`);

  const payload = await response.json() as LooseRecord;
  const data = asRecord(payload.data);
  const games = Array.isArray(data?.games) ? data.games : [];
  const results: GameSearchResult[] = [];

  for (const raw of games.slice(0, 14)) {
    const game = asRecord(raw);
    if (!game) continue;
    const gameId = asString(game.id);
    const name = asString(game.game_title) ?? asString(game.name);
    if (!gameId || !name) continue;
    const covers = imageCandidatesForGame(payload, gameId);
    results.push({
      source: 'thegamesdb',
      id: gameId,
      name,
      releaseYear: releaseYear(game.release_date),
      imageUrl: covers[0],
      coverCandidates: covers,
      platforms: platformNames(payload, game)
    });
  }

  return results;
}
