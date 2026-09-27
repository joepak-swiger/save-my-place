import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

const MEDIA_DIR = `${FileSystem.documentDirectory}save-my-place-media/`;

async function ensureMediaDir() {
  const info = await FileSystem.getInfoAsync(MEDIA_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
  }
}

function extensionForUri(uri: string) {
  const clean = uri.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return '.png';
  if (clean.endsWith('.webp')) return '.webp';
  if (clean.endsWith('.jpeg')) return '.jpeg';
  if (clean.endsWith('.jpg')) return '.jpg';
  return '.jpg';
}

function fileName(prefix: string, uri: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${extensionForUri(uri)}`;
}

export async function persistImageUri(uri: string, prefix = 'image') {
  await ensureMediaDir();
  const target = `${MEDIA_DIR}${fileName(prefix, uri)}`;

  if (/^https?:\/\//i.test(uri)) {
    const result = await FileSystem.downloadAsync(uri, target);
    return result.uri;
  }

  await FileSystem.copyAsync({ from: uri, to: target });
  return target;
}

export async function pickAndPersistImage(prefix = 'picked') {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.9,
    selectionLimit: 1
  });

  if (result.canceled || !result.assets[0]?.uri) return null;
  return persistImageUri(result.assets[0].uri, prefix);
}

export async function pickAndPersistMultipleImages(prefix = 'shot') {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    orderedSelection: true,
    quality: 0.9,
    selectionLimit: 6
  });

  if (result.canceled) return [];
  const uris = result.assets.map((asset) => asset.uri).filter(Boolean);
  return Promise.all(uris.map((uri) => persistImageUri(uri, prefix)));
}
