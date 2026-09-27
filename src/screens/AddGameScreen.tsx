import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Cover } from '../components/Cover';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { searchGames, searchProviderStates } from '../gameSearch';
import { pickAndPersistImage, persistImageUri } from '../media';
import { Game, GameSearchResult, GameSearchSource } from '../models';
import { findSteamGridCovers, hasSteamGridDbKey } from '../steamGridDb';
import { colors, radius } from '../theme';

const commonPlatforms = ['PS5', 'PS4', 'Xbox Series X|S', 'Xbox One', 'Nintendo Switch', 'Windows', 'Steam Deck'];

const sourceLabels: Record<GameSearchSource, string> = {
  steam: 'Steam',
  thegamesdb: 'TheGamesDB',
  gamebrain: 'GameBrain'
};

type Props = {
  onBack: () => void;
  onAdd: (game: Game) => void;
};

function id() {
  return `game-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function persistFirstWorkingCover(result: GameSearchResult) {
  for (const uri of result.coverCandidates) {
    try {
      return await persistImageUri(uri, `${result.source}-cover`);
    } catch {
      // Try the next official/provider candidate.
    }
  }

  // SteamGridDB is intentionally an artwork rescue layer rather than another duplicate catalog list.
  if (hasSteamGridDbKey()) {
    const steamAppId = result.source === 'steam' ? Number(result.id) : undefined;
    const rescueCandidates = await findSteamGridCovers(result.name, Number.isFinite(steamAppId) ? steamAppId : undefined);
    for (const uri of rescueCandidates) {
      try {
        return await persistImageUri(uri, 'steamgriddb-cover');
      } catch {
        // Keep trying artwork candidates.
      }
    }
  }

  return undefined;
}

export function AddGameScreen({ onBack, onAdd }: Props) {
  const scrollRef = useRef<ScrollView | null>(null);
  const providers = useMemo(() => searchProviderStates(), []);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GameSearchResult[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<GameSearchResult | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedEdition, setSelectedEdition] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualPlatform, setManualPlatform] = useState('');
  const [manualEdition, setManualEdition] = useState('');
  const [manualCover, setManualCover] = useState<string | undefined>();
  const [artLoading, setArtLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);
    setSelected(null);
    setWarnings([]);
    try {
      const response = await searchGames(query);
      setResults(response.results);
      setWarnings(response.warnings);
    } catch (error) {
      setResults([]);
      Alert.alert('Search failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chooseResult = (result: GameSearchResult) => {
    setSelected(result);
    setSelectedPlatform(result.platforms.length === 1 ? result.platforms[0] : '');
    setSelectedEdition('');
    setTimeout(() => scrollRef.current?.scrollTo({ y: 760, animated: true }), 120);
  };

  const addSearchResult = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const coverUri = await persistFirstWorkingCover(selected);
      const now = new Date().toISOString();
      const steamId = selected.source === 'steam' ? Number(selected.id) : undefined;
      onAdd({
        id: id(),
        title: selected.name,
        coverUri,
        steamAppId: Number.isFinite(steamId) ? steamId : undefined,
        catalogSource: selected.source,
        catalogId: String(selected.id),
        releaseYear: selected.releaseYear,
        platforms: selected.platforms,
        platform: selectedPlatform.trim() || undefined,
        edition: selectedEdition.trim() || undefined,
        addedAt: now,
        updatedAt: now,
        sessions: []
      });
    } catch {
      Alert.alert('Could not add game', 'The game was found, but something went wrong while saving it locally.');
    } finally {
      setLoading(false);
    }
  };

  const pickCover = async () => {
    try {
      const uri = await pickAndPersistImage('manual-cover');
      if (uri) setManualCover(uri);
    } catch {
      Alert.alert('Could not add cover', 'The image could not be copied into local app storage.');
    }
  };

  const findManualCoverOnline = async () => {
    if (!manualTitle.trim()) {
      Alert.alert('Type the game title first', 'SteamGridDB needs a title to search for artwork.');
      return;
    }
    setArtLoading(true);
    try {
      const candidates = await findSteamGridCovers(manualTitle.trim());
      if (!candidates.length) {
        Alert.alert('No artwork found', 'SteamGridDB did not return a portrait cover for that title. You can still choose an image from your phone.');
        return;
      }
      for (const uri of candidates) {
        try {
          setManualCover(await persistImageUri(uri, 'steamgriddb-manual-cover'));
          return;
        } catch {
          // Try the next grid.
        }
      }
      Alert.alert('Artwork could not be saved', 'The artwork was found, but the image download failed.');
    } finally {
      setArtLoading(false);
    }
  };

  const addManual = () => {
    if (!manualTitle.trim()) {
      Alert.alert('Give the game a title', 'Future You will appreciate knowing which game this belongs to.');
      return;
    }
    Keyboard.dismiss();
    const now = new Date().toISOString();
    onAdd({
      id: id(),
      title: manualTitle.trim(),
      coverUri: manualCover,
      platform: manualPlatform.trim() || undefined,
      edition: manualEdition.trim() || undefined,
      addedAt: now,
      updatedAt: now,
      sessions: []
    });
  };

  const revealManualInput = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 220);
  };

  const suggestedPlatforms = selected
    ? Array.from(new Set([...selected.platforms, ...commonPlatforms])).slice(0, 12)
    : commonPlatforms;

  const catalogCount = providers.filter((provider) => provider.purpose === 'catalog' && provider.configured).length;

  return (
    <ScreenShell scrollViewRef={scrollRef}>
      <PrimaryButton label="‹ Back to library" onPress={onBack} variant="ghost" style={styles.back} />
      <Text style={styles.eyebrow}>ADD GAME</Text>
      <Text style={styles.title}>What are you pretending you'll finish?</Text>

      <View style={styles.sourcePanel}>
        <View style={styles.sourceHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sourceTitle}>Game search sources</Text>
            <Text style={styles.sourceSubtitle}>{catalogCount} catalog source{catalogCount === 1 ? '' : 's'} active</Text>
          </View>
          <Text style={styles.sourceHint}>Steam first • broader fallbacks next</Text>
        </View>
        <View style={styles.providerChips}>
          {providers.map((provider) => (
            <View key={provider.id} style={[styles.providerChip, provider.configured ? styles.providerOn : styles.providerOff]}>
              <Text style={[styles.providerChipText, provider.configured && styles.providerChipTextOn]}>
                {provider.label}{provider.purpose === 'art' ? ' ART' : ''} {provider.configured ? '✓' : '○'}
              </Text>
            </View>
          ))}
        </View>
        {!providers.find((provider) => provider.id === 'thegamesdb')?.configured ? (
          <Text style={styles.sourceHelp}>Steam works immediately. Run SETUP-GAME-SEARCH.bat once to enable TheGamesDB and the optional fallback/art providers.</Text>
        ) : (
          <Text style={styles.sourceHelp}>Steam and TheGamesDB are searched together. GameBrain is only used when the first searches are thin, which saves its daily quota.</Text>
        )}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Search for a game</Text>
        <Text style={styles.searchHelp}>
          Search normally. Steam handles the easy matches, TheGamesDB broadens console and retro coverage, and GameBrain can act as a last catalog fallback when configured.
        </Text>
        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            placeholder="Final Fantasy VII, Sly Cooper, Zelda…"
            placeholderTextColor={colors.faint}
            style={styles.searchInput}
            returnKeyType="search"
            autoCapitalize="words"
            autoCorrect={false}
          />
          <PrimaryButton label="Search" onPress={search} disabled={loading || !query.trim()} style={styles.searchButton} />
        </View>

        {loading ? <ActivityIndicator size="large" /> : null}

        {!loading && searched && results.length === 0 ? (
          <View style={styles.noResults}>
            <Text style={styles.noResultsTitle}>No catalog matches found.</Text>
            <Text style={styles.apiText}>Try a shorter title, check that the optional search keys are enabled, or add the game manually below.</Text>
          </View>
        ) : null}

        {warnings.length ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>One source had trouble, but the others still searched.</Text>
            {warnings.map((warning) => <Text key={warning} style={styles.warningText}>• {warning}</Text>)}
          </View>
        ) : null}

        <View style={styles.results}>
          {results.map((result) => (
            <Pressable
              key={`${result.source}-${result.id}`}
              style={({ pressed }) => [
                styles.result,
                selected?.source === result.source && selected?.id === result.id && styles.resultSelected,
                pressed && { opacity: 0.76 }
              ]}
              onPress={() => chooseResult(result)}
              disabled={loading}
            >
              {result.imageUrl ? (
                <Image source={{ uri: result.imageUrl }} style={styles.resultImage} resizeMode="cover" />
              ) : (
                <Cover title={result.name} size="small" />
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.resultTopRow}>
                  <Text style={styles.resultTitle}>{result.name}</Text>
                  <View style={styles.sourceBadge}><Text style={styles.sourceBadgeText}>{sourceLabels[result.source]}</Text></View>
                </View>
                <Text style={styles.resultMeta}>
                  {[result.releaseYear, result.platforms.slice(0, 3).join(' / ')].filter(Boolean).join(' • ') || 'Platform can be chosen after selecting'}
                </Text>
                <Text style={styles.tap}>{selected?.source === result.source && selected?.id === result.id ? 'Selected' : 'Tap to select'}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.providerNote}>
          SteamGridDB is used as an artwork fallback instead of another duplicate game list. If a catalog result has no usable cover, the app can try SteamGridDB automatically when its key is configured.
        </Text>
        {providers.find((provider) => provider.id === 'gamebrain')?.configured ? (
          <Pressable onPress={() => Linking.openURL('https://gamebrain.co/api')}>
            <Text style={styles.attribution}>GameBrain catalog fallback • gamebrain.co</Text>
          </Pressable>
        ) : null}
      </View>

      {selected ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Finish adding {selected.name}</Text>
          <Text style={styles.searchHelp}>Platform and edition are optional, but they help if you own the same game in more than one place.</Text>
          <TextInput
            value={selectedPlatform}
            onChangeText={setSelectedPlatform}
            placeholder="Your platform: PS5, Switch, PC…"
            placeholderTextColor={colors.faint}
            style={styles.searchInput}
          />
          <View style={styles.chips}>
            {suggestedPlatforms.map((platform) => (
              <Pressable key={platform} onPress={() => setSelectedPlatform(platform)} style={[styles.chip, selectedPlatform === platform && styles.chipSelected]}>
                <Text style={[styles.chipText, selectedPlatform === platform && styles.chipTextSelected]}>{platform}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={selectedEdition}
            onChangeText={setSelectedEdition}
            placeholder="Edition: Standard, Deluxe, Remaster…"
            placeholderTextColor={colors.faint}
            style={styles.searchInput}
          />
          <PrimaryButton label="Add to My Games" onPress={addSearchResult} disabled={loading} />
        </View>
      ) : null}

      <View style={styles.orRow}>
        <View style={styles.line} />
        <Text style={styles.or}>OR ADD MANUALLY</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Manual game</Text>
        <TextInput
          value={manualTitle}
          onChangeText={setManualTitle}
          onFocus={revealManualInput}
          placeholder="Game title"
          placeholderTextColor={colors.faint}
          style={styles.searchInput}
          autoCapitalize="words"
        />
        <TextInput
          value={manualPlatform}
          onChangeText={setManualPlatform}
          onFocus={revealManualInput}
          placeholder="Platform (optional)"
          placeholderTextColor={colors.faint}
          style={styles.searchInput}
        />
        <TextInput
          value={manualEdition}
          onChangeText={setManualEdition}
          onFocus={revealManualInput}
          placeholder="Edition (optional)"
          placeholderTextColor={colors.faint}
          style={styles.searchInput}
        />
        <View style={styles.manualCoverRow}>
          <Cover title={manualTitle || 'YOUR GAME'} uri={manualCover} />
          <View style={styles.manualInfo}>
            <Text style={styles.apiText}>Cover art is optional. Pick any image from your phone{hasSteamGridDbKey() ? ', or let SteamGridDB try to find one.' : '.'}</Text>
            {hasSteamGridDbKey() ? (
              <PrimaryButton label={artLoading ? 'Finding art…' : 'Find cover online'} onPress={findManualCoverOnline} variant="secondary" disabled={artLoading || !manualTitle.trim()} />
            ) : null}
            <PrimaryButton label={manualCover ? 'Change cover' : 'Choose cover image'} onPress={pickCover} variant="secondary" />
          </View>
        </View>
        <PrimaryButton label="Add to My Games" onPress={addManual} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  eyebrow: { color: colors.accent, fontWeight: '900', fontSize: 12, letterSpacing: 2 },
  title: { color: colors.text, fontSize: 28, lineHeight: 33, fontWeight: '950' },
  panel: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16, gap: 14 },
  sourcePanel: { backgroundColor: colors.panel2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 14, gap: 10 },
  sourceHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  sourceTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  sourceSubtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
  sourceHint: { color: colors.accent, fontSize: 10, fontWeight: '800', maxWidth: 120, textAlign: 'right' },
  providerChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  providerChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  providerOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  providerOff: { borderColor: colors.border, backgroundColor: colors.bg },
  providerChipText: { color: colors.faint, fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
  providerChipTextOn: { color: colors.text },
  sourceHelp: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  searchHelp: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchInput: { flex: 1, minHeight: 50, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, color: colors.text, borderRadius: radius.md, paddingHorizontal: 14, fontSize: 15 },
  searchButton: { minWidth: 96 },
  results: { gap: 10 },
  result: { flexDirection: 'row', gap: 12, padding: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel2, borderRadius: radius.md },
  resultSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  resultImage: { width: 72, height: 96, borderRadius: radius.sm, backgroundColor: colors.bg },
  resultTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  resultTitle: { color: colors.text, fontSize: 16, fontWeight: '850', flex: 1 },
  sourceBadge: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4, backgroundColor: colors.bg },
  sourceBadgeText: { color: colors.muted, fontSize: 8, fontWeight: '900' },
  resultMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  tap: { color: colors.accent, fontSize: 12, fontWeight: '800', marginTop: 12 },
  noResults: { backgroundColor: colors.bg, borderRadius: radius.md, padding: 14, gap: 5 },
  noResultsTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  warningBox: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, gap: 4 },
  warningTitle: { color: colors.text, fontSize: 12, fontWeight: '800' },
  warningText: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  providerNote: { color: colors.faint, fontSize: 11, lineHeight: 16 },
  attribution: { color: colors.accent, fontSize: 11, fontWeight: '800', textDecorationLine: 'underline' },
  apiText: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel2, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8 },
  chipSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  chipText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  chipTextSelected: { color: colors.text },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { height: 1, backgroundColor: colors.border, flex: 1 },
  or: { color: colors.faint, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  manualCoverRow: { flexDirection: 'row', gap: 14 },
  manualInfo: { flex: 1, gap: 10, justifyContent: 'center' }
});
