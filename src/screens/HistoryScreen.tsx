import React from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { formatDate, relativeDate } from '../date';
import { Game } from '../models';
import { colors, radius } from '../theme';

type Props = {
  game: Game;
  onBack: () => void;
  onDeleteSession: (sessionId: string) => void;
};

export function HistoryScreen({ game, onBack, onDeleteSession }: Props) {
  const confirmDelete = (sessionId: string) => {
    Alert.alert('Delete this bookmark?', 'This removes only this saved session.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteSession(sessionId) }
    ]);
  };

  return (
    <ScreenShell>
      <PrimaryButton label="‹ Back to game" onPress={onBack} variant="ghost" style={styles.back} />
      <Text style={styles.eyebrow}>SESSION HISTORY</Text>
      <Text style={styles.title}>{game.title}</Text>
      <Text style={styles.sub}>Your old bookmarks stay here even after you save a newer one.</Text>

      {game.sessions.length === 0 ? (
        <View style={styles.entry}>
          <Text style={styles.location}>No saved bookmarks yet.</Text>
        </View>
      ) : null}

      {game.sessions.map((session, index) => (
        <View key={session.id} style={styles.entry}>
          <View style={styles.entryHeader}>
            <Text style={styles.number}>{index === 0 ? 'CURRENT' : `#${game.sessions.length - index}`}</Text>
            <Text style={styles.date}>{formatDate(session.createdAt)} • {relativeDate(session.createdAt)}</Text>
          </View>
          {session.location ? <Text style={styles.location}>{session.location}</Text> : null}
          {session.doing ? <Row label="YOU WERE DOING" value={session.doing} /> : null}
          {session.nextObjective ? <Row label="NEXT" value={session.nextObjective} /> : null}
          {session.dontForget ? <Row label="DON'T FORGET" value={session.dontForget} warning /> : null}
          {session.notes ? <Row label="NOTES" value={session.notes} /> : null}
          {(session.checklist ?? []).length > 0 ? (
            <View style={{ gap: 6 }}>
              <Text style={styles.rowLabel}>BEFORE I PLAY AGAIN</Text>
              {(session.checklist ?? []).map((item) => (
                <Text key={item.id} style={[styles.rowValue, item.done && styles.done]}>{item.done ? '☑' : '☐'} {item.text}</Text>
              ))}
            </View>
          ) : null}
          {session.screenshots.length > 0 ? (
            <View style={styles.shots}>
              {session.screenshots.slice(0, 4).map((uri) => <Image key={uri} source={{ uri }} style={styles.shot} />)}
            </View>
          ) : null}
          <PrimaryButton label="Delete this bookmark" onPress={() => confirmDelete(session.id)} variant="ghost" />
        </View>
      ))}
    </ScreenShell>
  );
}

function Row({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
  return (
    <View style={{ gap: 3 }}>
      <Text style={[styles.rowLabel, warning && { color: colors.warning }]}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  title: { color: colors.text, fontSize: 27, fontWeight: '950' },
  sub: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  entry: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: 16, gap: 13 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  number: { color: colors.accent, fontSize: 10, fontWeight: '950', letterSpacing: 1.4 },
  date: { color: colors.faint, fontSize: 11 },
  location: { color: colors.text, fontSize: 20, lineHeight: 26, fontWeight: '850' },
  rowLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  rowValue: { color: colors.text, fontSize: 14, lineHeight: 20 },
  done: { color: colors.faint, textDecorationLine: 'line-through' },
  shots: { flexDirection: 'row', gap: 7 },
  shot: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.bg }
});
