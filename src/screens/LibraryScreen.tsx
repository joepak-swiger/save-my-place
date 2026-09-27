import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Cover } from '../components/Cover';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { relativeDate } from '../date';
import { Game } from '../models';
import { colors, radius } from '../theme';

type Props = {
  games: Game[];
  onAdd: () => void;
  onOpen: (id: string) => void;
  onDemo: () => void;
};

type SortMode = 'recent' | 'az' | 'longest';

export function LibraryScreen({ games, onAdd, onOpen, onDemo }: Props) {
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const visibleGames = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = games.filter((game) => {
      if (!needle) return true;
      return [game.title, game.platform, game.edition]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(needle));
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'az') return a.title.localeCompare(b.title);
      const aActivity = a.sessions[0]?.createdAt ?? a.addedAt;
      const bActivity = b.sessions[0]?.createdAt ?? b.addedAt;
      if (sortMode === 'longest') return aActivity.localeCompare(bActivity);
      return bActivity.localeCompare(aActivity);
    });
  }, [games, query, sortMode]);

  return (
    <ScreenShell>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SAVE MY PLACE</Text>
          <Text style={styles.title}>Your game bookmarks</Text>
          <Text style={styles.sub}>Pick up exactly where you left off, even months later.</Text>
        </View>
        <PrimaryButton label="+ Add Game" onPress={onAdd} style={styles.add} />
      </View>

      {games.length > 0 ? (
        <View style={styles.tools}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search your library…"
            placeholderTextColor={colors.faint}
            style={styles.search}
            returnKeyType="search"
          />
          <View style={styles.sortRow}>
            <SortChip label="Recent" selected={sortMode === 'recent'} onPress={() => setSortMode('recent')} />
            <SortChip label="A–Z" selected={sortMode === 'az'} onPress={() => setSortMode('az')} />
            <SortChip label="Longest away" selected={sortMode === 'longest'} onPress={() => setSortMode('longest')} />
          </View>
          <Text style={styles.resultCount}>{visibleGames.length} of {games.length} game{games.length === 1 ? '' : 's'}</Text>
        </View>
      ) : null}

      {games.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🎮</Text>
          <Text style={styles.emptyTitle}>Your future self has no notes.</Text>
          <Text style={styles.emptyText}>
            Add a game, save where you are, and leave Future You enough information to avoid restarting from scratch.
          </Text>
          <PrimaryButton label="Add your first game" onPress={onAdd} />
          <PrimaryButton label="Load a 2-game demo" onPress={onDemo} variant="secondary" />
        </View>
      ) : visibleGames.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No games match that search.</Text>
          <Text style={styles.emptyText}>Try the title, platform, or edition.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {visibleGames.map((game) => {
            const latest = game.sessions[0];
            const details = [game.platform, game.edition].filter(Boolean).join(' • ');
            return (
              <Pressable
                key={game.id}
                onPress={() => onOpen(game.id)}
                style={({ pressed }) => [styles.gameCard, pressed && { opacity: 0.78 }]}
              >
                <Cover title={game.title} uri={game.coverUri} />
                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  {details ? <Text style={styles.gameMeta} numberOfLines={1}>{details}</Text> : null}
                  <Text style={styles.lastPlayed}>Last saved: {relativeDate(latest?.createdAt)}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.cardLabel}>YOU WERE</Text>
                  <Text style={styles.cardValue} numberOfLines={2}>
                    {latest?.location || 'No bookmark yet.'}
                  </Text>
                  {latest?.dontForget ? (
                    <View style={styles.warning}>
                      <Text style={styles.warningText} numberOfLines={2}>
                        ⚠ {latest.dontForget}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {games.length > 0 ? <PrimaryButton label="+ Add another game" onPress={onAdd} variant="secondary" /> : null}
    </ScreenShell>
  );
}

function SortChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.sortChip, selected && styles.sortChipSelected, pressed && { opacity: 0.8 }]}>
      <Text style={[styles.sortChipText, selected && styles.sortChipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { gap: 16, marginBottom: 4 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2.4 },
  title: { color: colors.text, fontSize: 31, lineHeight: 35, fontWeight: '950', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 7, maxWidth: 520 },
  add: { alignSelf: 'flex-start' },
  tools: { gap: 10 },
  search: { minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, color: colors.text, paddingHorizontal: 14, fontSize: 15 },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sortChip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9 },
  sortChipSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  sortChipText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  sortChipTextSelected: { color: colors.text },
  resultCount: { color: colors.faint, fontSize: 11 },
  empty: { marginTop: 16, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 22, gap: 14 },
  emptyEmoji: { fontSize: 38 },
  emptyTitle: { color: colors.text, fontSize: 21, fontWeight: '900' },
  emptyText: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  list: { gap: 14 },
  gameCard: { flexDirection: 'row', gap: 14, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel },
  gameInfo: { flex: 1, minHeight: 152 },
  gameTitle: { color: colors.text, fontSize: 20, fontWeight: '900' },
  gameMeta: { color: colors.accent, fontSize: 11, marginTop: 4, fontWeight: '750' },
  lastPlayed: { color: colors.muted, fontSize: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  cardLabel: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  cardValue: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: '700', marginTop: 4 },
  warning: { marginTop: 10, backgroundColor: '#2F2413', padding: 8, borderRadius: 9 },
  warningText: { color: colors.warning, fontSize: 11, lineHeight: 16, fontWeight: '700' }
});
