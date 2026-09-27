import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Cover } from '../components/Cover';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { formatDate, relativeDate } from '../date';
import { Game } from '../models';
import { colors, radius } from '../theme';

type Props = {
  game: Game;
  onBack: () => void;
  onEdit: () => void;
  onSavePlace: () => void;
  onComeback: () => void;
  onHistory: () => void;
  onDeleteLatest: () => void;
  onDelete: () => void;
};

export function GameScreen({ game, onBack, onEdit, onSavePlace, onComeback, onHistory, onDeleteLatest, onDelete }: Props) {
  const latest = game.sessions[0];
  const checklist = latest?.checklist ?? [];
  const checklistDone = checklist.filter((item) => item.done).length;

  const confirmDelete = () => {
    Alert.alert('Delete this game?', `This removes ${game.title} and its local notes from the library.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete }
    ]);
  };

  const confirmDeleteBookmark = () => {
    Alert.alert('Delete current bookmark?', 'The previous bookmark, if there is one, will become current.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete bookmark', style: 'destructive', onPress: onDeleteLatest }
    ]);
  };

  const gameDetails = [game.platform, game.edition].filter(Boolean).join(' • ');

  return (
    <ScreenShell>
      <PrimaryButton label="‹ My Games" onPress={onBack} variant="ghost" style={styles.back} />
      <View style={styles.hero}>
        <Cover title={game.title} uri={game.coverUri} size="hero" />
        <View style={styles.heroInfo}>
          <Text style={styles.eyebrow}>GAME BOOKMARK</Text>
          <Text style={styles.title}>{game.title}</Text>
          {gameDetails ? <Text style={styles.gameDetails}>{gameDetails}</Text> : null}
          <Text style={styles.meta}>Last saved: {latest ? `${formatDate(latest.createdAt)} • ${relativeDate(latest.createdAt)}` : 'Never'}</Text>
          {game.releaseYear ? <Text style={styles.meta}>Released: {game.releaseYear}</Text> : null}
        </View>
      </View>

      <PrimaryButton label="Edit game details" onPress={onEdit} variant="secondary" />

      {latest ? (
        <View style={styles.bookmark}>
          <Text style={styles.bookmarkTitle}>CURRENT BOOKMARK</Text>
          <LabelValue label="YOU WERE" value={latest.location} />
          <LabelValue label="YOU WERE DOING" value={latest.doing} />
          <LabelValue label="NEXT" value={latest.nextObjective} />
          {latest.partyBuild ? <LabelValue label="PARTY / BUILD" value={latest.partyBuild} /> : null}
          {latest.dontForget ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningLabel}>⚠ DO NOT FORGET</Text>
              <Text style={styles.warningText}>{latest.dontForget}</Text>
            </View>
          ) : null}
          {checklist.length > 0 ? (
            <View style={styles.checkSummary}>
              <Text style={styles.checkLabel}>BEFORE I PLAY AGAIN</Text>
              <Text style={styles.checkValue}>{checklistDone}/{checklist.length} done</Text>
            </View>
          ) : null}
          {latest.screenshots.length > 0 ? (
            <Text style={styles.shotCount}>📷 {latest.screenshots.length} screenshot{latest.screenshots.length === 1 ? '' : 's'} attached</Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.emptyBookmark}>
          <Text style={styles.emptyTitle}>No bookmark yet.</Text>
          <Text style={styles.emptyText}>Save your place before you abandon this game for eight months.</Text>
        </View>
      )}

      {latest ? <PrimaryButton label="WHERE WAS I?" onPress={onComeback} /> : null}
      <PrimaryButton label={latest ? '💾 Save a New Place' : '💾 Save My Place'} onPress={onSavePlace} variant={latest ? 'secondary' : 'primary'} />
      {game.sessions.length > 0 ? <PrimaryButton label={`Session History (${game.sessions.length})`} onPress={onHistory} variant="secondary" /> : null}
      {latest ? <PrimaryButton label="Delete current bookmark" onPress={confirmDeleteBookmark} variant="ghost" /> : null}
      <PrimaryButton label="Delete game" onPress={confirmDelete} variant="ghost" />
    </ScreenShell>
  );
}

function LabelValue({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  hero: { flexDirection: 'row', gap: 18, alignItems: 'center' },
  heroInfo: { flex: 1 },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  title: { color: colors.text, fontSize: 27, lineHeight: 31, fontWeight: '950', marginTop: 6 },
  gameDetails: { color: colors.accent, fontSize: 12, lineHeight: 18, marginTop: 5, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  bookmark: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 18, gap: 16 },
  bookmarkTitle: { color: colors.text, fontSize: 17, fontWeight: '950', letterSpacing: 0.4 },
  item: { gap: 4 },
  label: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  value: { color: colors.text, fontSize: 16, lineHeight: 23, fontWeight: '650' },
  warningBox: { backgroundColor: '#2F2413', borderWidth: 1, borderColor: '#5D4724', borderRadius: radius.md, padding: 14, gap: 5 },
  warningLabel: { color: colors.warning, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  warningText: { color: '#FFD998', fontSize: 15, lineHeight: 21, fontWeight: '800' },
  checkSummary: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, backgroundColor: colors.panel2, borderRadius: radius.md, padding: 12 },
  checkLabel: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  checkValue: { color: colors.text, fontSize: 12, fontWeight: '850' },
  shotCount: { color: colors.muted, fontSize: 12 },
  emptyBookmark: { padding: 20, backgroundColor: colors.panel, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, gap: 8 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '900' },
  emptyText: { color: colors.muted, fontSize: 14, lineHeight: 20 }
});
