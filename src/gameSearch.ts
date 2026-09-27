import { searchGameBrain, hasGameBrainKey } from './gameBrain';
import { GameSearchResult, SearchProviderState, SearchResponse } from './models';
import { searchSteamGames } from './steam';
import { hasSteamGridDbKey } from './steamGridDb';
import { hasTheGamesDbKey, searchTheGamesDb } from './theGamesDb';

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function relevance(query: string, result: GameSearchResult) {
  const q = normalize(query);
  const name = normalize(result.name);
  if (name === q) return 100;
  if (name.startsWith(q)) return 82;
  if (name.includes(q)) return 72;
  if (q.includes(name)) return 64;
  const queryTokens = new Set(q.split(' ').filter(Boolean));
  const nameTokens = new Set(name.split(' ').filter(Boolean));
  const overlap = [...queryTokens].filter((token) => nameTokens.has(token)).length;
  return queryTokens.size ? Math.round((overlap / queryTokens.size) * 50) : 0;
}

const sourcePriority: Record<GameSearchResult['source'], number> = {
  steam: 3,
  thegamesdb: 2,
  gamebrain: 1
};

function dedupe(results: GameSearchResult[]) {
  const merged = new Map<string, GameSearchResult>();
  for (const result of results) {
    const platform = result.platforms[0]?.toLowerCase() ?? '';
    const key = `${normalize(result.name)}|${result.releaseYear ?? ''}|${platform}`;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, result);
      continue;
    }

    const preferred = sourcePriority[result.source] > sourcePriority[existing.source] ? result : existing;
    const other = preferred === result ? existing : result;
    merged.set(key, {
      ...preferred,
      imageUrl: preferred.imageUrl ?? other.imageUrl,
      coverCandidates: Array.from(new Set([...preferred.coverCandidates, ...other.coverCandidates])),
      platforms: Array.from(new Set([...preferred.platforms, ...other.platforms]))
    });
  }
  return [...merged.values()];
}

function hasStrongMatch(query: string, results: GameSearchResult[]) {
  return results.some((result) => relevance(query, result) >= 72);
}

export function searchProviderStates(): SearchProviderState[] {
  return [
    { id: 'steam', label: 'Steam', purpose: 'catalog', configured: true, alwaysOn: true },
    { id: 'thegamesdb', label: 'TheGamesDB', purpose: 'catalog', configured: hasTheGamesDbKey() },
    { id: 'gamebrain', label: 'GameBrain', purpose: 'catalog', configured: hasGameBrainKey() },
    { id: 'steamgriddb', label: 'SteamGridDB', purpose: 'art', configured: hasSteamGridDbKey() }
  ];
}

export async function searchGames(query: string): Promise<SearchResponse> {
  const q = query.trim();
  if (!q) return { results: [], warnings: [] };

  const warnings: string[] = [];
  const initialTasks: Promise<GameSearchResult[]>[] = [
    searchSteamGames(q).catch((error) => {
      warnings.push(error instanceof Error ? error.message : 'Steam search failed.');
      return [];
    })
  ];

  if (hasTheGamesDbKey()) {
    initialTasks.push(
      searchTheGamesDb(q).catch((error) => {
        warnings.push(error instanceof Error ? error.message : 'TheGamesDB search failed.');
        return [];
      })
    );
  }

  const initial = (await Promise.all(initialTasks)).flat();
  let combined = initial;

  // GameBrain is deliberately the last catalog fallback because its free tier has a small daily token allowance.
  if (hasGameBrainKey() && (combined.length < 6 || !hasStrongMatch(q, combined))) {
    try {
      combined = [...combined, ...(await searchGameBrain(q))];
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : 'GameBrain search failed.');
    }
  }

  const results = dedupe(combined)
    .sort((a, b) => {
      const scoreDiff = relevance(q, b) - relevance(q, a);
      if (scoreDiff) return scoreDiff;
      return sourcePriority[b.source] - sourcePriority[a.source];
    })
    .slice(0, 20);

  return { results, warnings };
}
