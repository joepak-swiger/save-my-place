import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game } from './models';

const KEY = 'save-my-place:v1:games';
const LEGACY_KEY = 'gamebacklog:v1:games';

export async function loadGames(): Promise<Game[]> {
  let raw = await AsyncStorage.getItem(KEY);

  // One-time migration from the prototype name so existing test libraries survive the rename.
  if (!raw) {
    const legacy = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacy) {
      raw = legacy;
      await AsyncStorage.setItem(KEY, legacy);
    }
  }

  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Game[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveGames(games: Game[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(games));
}

export async function clearGames() {
  await AsyncStorage.multiRemove([KEY, LEGACY_KEY]);
}
