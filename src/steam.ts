import { GameSearchResult } from './models';

const SEARCH_URL = 'https://store.steampowered.com/api/storesearch/';
const ASSET_BASE = 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps';

type SteamSearchItem = {
  type?: string;
  name?: string;
  id?: number;
  tiny_image?: string;
  platforms?: {
    windows?: boolean;
    mac?: boolean;
    linux?: boolean;
  };
};

type SteamSearchResponse = {
  items?: SteamSearchItem[];
};

function platformNames(platforms?: SteamSearchItem['platforms']) {
  if (!platforms) return [];
  const names: string[] = [];
  if (platforms.windows) names.push('Windows');
  if (platforms.mac) names.push('macOS');
  if (platforms.linux) names.push('Linux');
  return names;
}

function coverCandidates(appId: number, tinyImage?: string) {
  const urls = [
    `${ASSET_BASE}/${appId}/library_600x900_2x.jpg`,
    `${ASSET_BASE}/${appId}/library_600x900.jpg`
  ];
  if (tinyImage) urls.push(tinyImage);
  return urls;
}

export async function searchSteamGames(query: string): Promise<GameSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const url = `${SEARCH_URL}?term=${encodeURIComponent(q)}&l=english&cc=US`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Steam search failed (${response.status}).`);

  const data = (await response.json()) as SteamSearchResponse;
  const items = data.items ?? [];

  return items
    .filter((item): item is SteamSearchItem & { id: number; name: string } =>
      Boolean(item.id && item.name && (!item.type || item.type === 'app'))
    )
    .slice(0, 12)
    .map((item) => ({
      source: 'steam' as const,
      id: item.id,
      name: item.name,
      imageUrl: item.tiny_image,
      coverCandidates: coverCandidates(item.id, item.tiny_image),
      platforms: platformNames(item.platforms)
    }));
}

export function steamStoreUrl(appId: number) {
  return `https://store.steampowered.com/app/${appId}/`;
}
