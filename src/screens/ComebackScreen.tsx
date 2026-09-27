import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Cover } from '../components/Cover';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { formatDate, relativeDate } from '../date';
import { Game } from '../models';
import { colors, radius } from '../theme';

type Props = {
  game: Game;
  onBack: () => void;
  onSaveNew: () => void;
  onToggleChecklist: (itemId: string) => void;
};

export function ComebackScreen({ game, onBack, onSaveNew, onToggleChecklist }: Props) {
  const latest = game.sessions[0];
  const [image, setImage] = useState<string | null>(null);
  if (!latest) return null;
  const checklist = latest.checklist ?? [];
  const details = [game.platform, game.edition].filter(Boolean).join(' • ');

  return (
    <ScreenShell>
      <PrimaryButton label="‹ Back" onPress={onBack} variant="ghost" style={styles.back} />
      <View style={styles.top}>
        <Cover title={game.title} uri={game.coverUri} size="small" />
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>WELCOME BACK</Text>
          <Text style={styles.game}>{game.title}</Text>
          {details ? <Text style={styles.details}>{details}</Text> : null}
          <Text style={styles.date}>Last saved {formatDate(latest.createdAt)} • {relativeDate(latest.createdAt)}</Text>
        </View>
      </View>

      <Text style={styles.mainTitle}>WHERE WAS I?</Text>

      <View style={styles.card}>
        <Memory label="YOU WERE" value={latest.location} big />
        <Memory label="YOU WERE DOING" value={latest.doing} />
        <Memory label="NEXT THING YOU WANTED TO DO" value={latest.nextObjective} />
        <Memory label="PARTY / BUILD" value={latest.partyBuild} />
        {latest.dontForget ? (
          <View style={styles.warning}>
            <Text style={styles.warningLabel}>⚠ DO NOT FORGET</Text>
            <Text style={styles.warningValue}>{latest.dontForget}</Text>
          </View>
        ) : null}
        <Memory label="MY NOTE" value={latest.notes} />
      </View>

      {checklist.length > 0 ? (
        <View style={styles.checkSection}>
          <Text style={styles.shotTitle}>BEFORE I PLAY AGAIN</Text>
          {checklist.map((item) => (
            <Pressable key={item.id} onPress={() => onToggleChecklist(item.id)} style={({ pressed }) => [styles.checkItem, pressed && { opacity: 0.75 }]}>
              <Text style={styles.box}>{item.done ? '☑' : '☐'}</Text>
              <Text style={[styles.checkText, item.done && styles.checkTextDone]}>{item.text}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {latest.screenshots.length > 0 ? (
        <View style={styles.shotSection}>
          <Text style={styles.shotTitle}>SCREENSHOTS FROM LAST TIME</Text>
          <View style={styles.shotGrid}>
            {latest.screenshots.map((uri) => (
              <Pressable key={uri} onPress={() => setImage(uri)}>
                <Image source={{ uri }} style={styles.shot} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <PrimaryButton label="▶ I'M BACK" onPress={onBack} />
      <PrimaryButton label="💾 Save a New Place" onPress={onSaveNew} variant="secondary" />

      <Modal visible={Boolean(image)} transparent animationType="fade" onRequestClose={() => setImage(null)}>
        <Pressable style={styles.modal} onPress={() => setImage(null)}>
          {image ? <Image source={{ uri: image }} style={styles.fullImage} resizeMode="contain" /> : null}
          <Text style={styles.close}>Tap anywhere to close</Text>
        </Pressable>
      </Modal>
    </ScreenShell>
  );
}

function Memory({ label, value, big = false }: { label: string; value: string; big?: boolean }) {
  if (!value) return null;
  return (
    <View style={styles.memory}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, big && styles.bigValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.7 },
  game: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 3 },
  details: { color: colors.accent, fontSize: 11, fontWeight: '800', marginTop: 4 },
  date: { color: colors.muted, fontSize: 11, marginTop: 4 },
  mainTitle: { color: colors.text, fontSize: 32, lineHeight: 36, fontWeight: '950', marginTop: 8 },
  card: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: 19, gap: 18 },
  memory: { gap: 5 },
  label: { color: colors.accent, fontSize: 10, fontWeight: '950', letterSpacing: 1.5 },
  value: { color: colors.text, fontSize: 16, lineHeight: 23, fontWeight: '650' },
  bigValue: { fontSize: 20, lineHeight: 27, fontWeight: '850' },
  warning: { borderWidth: 1, borderColor: '#6A4C20', backgroundColor: '#31230F', padding: 15, borderRadius: radius.md, gap: 6 },
  warningLabel: { color: colors.warning, fontSize: 10, fontWeight: '950', letterSpacing: 1.5 },
  warningValue: { color: '#FFDA99', fontSize: 17, lineHeight: 24, fontWeight: '900' },
  checkSection: { gap: 9 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: 12 },
  box: { color: colors.accent, fontSize: 20 },
  checkText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 19, fontWeight: '700' },
  checkTextDone: { color: colors.faint, textDecorationLine: 'line-through' },
  shotSection: { gap: 10 },
  shotTitle: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  shotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  shot: { width: 104, height: 104, borderRadius: radius.sm, backgroundColor: colors.panel },
  modal: { flex: 1, backgroundColor: '#000000EE', alignItems: 'center', justifyContent: 'center', padding: 14 },
  fullImage: { width: '100%', height: '80%' },
  close: { color: colors.muted, fontSize: 12, marginTop: 12 }
});
