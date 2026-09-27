import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { pickAndPersistMultipleImages } from '../media';
import { ChecklistItem, Game, SessionEntry } from '../models';
import { colors, radius } from '../theme';

type Props = {
  game: Game;
  onBack: () => void;
  onSave: (entry: SessionEntry) => void;
};

function makeId(prefix = 'session') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function BookmarkEditorScreen({ game, onBack, onSave }: Props) {
  const last = game.sessions[0];
  const [location, setLocation] = useState('');
  const [doing, setDoing] = useState('');
  const [nextObjective, setNextObjective] = useState('');
  const [dontForget, setDontForget] = useState('');
  const [partyBuild, setPartyBuild] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [taskText, setTaskText] = useState('');
  const [savingImages, setSavingImages] = useState(false);

  const useLast = () => {
    if (!last) return;
    setLocation(last.location);
    setDoing(last.doing);
    setNextObjective(last.nextObjective);
    setDontForget(last.dontForget);
    setPartyBuild(last.partyBuild);
    setNotes(last.notes);
    setChecklist((last.checklist ?? []).map((item) => ({ ...item, id: makeId('task'), done: false })));
  };

  const addTask = () => {
    const text = taskText.trim();
    if (!text) return;
    setChecklist((items) => [...items, { id: makeId('task'), text, done: false }]);
    setTaskText('');
  };

  const addShots = async () => {
    setSavingImages(true);
    try {
      const added = await pickAndPersistMultipleImages(`shot-${game.id}`);
      setScreenshots((current) => [...current, ...added].slice(0, 6));
    } catch {
      Alert.alert('Could not attach screenshots', 'Those images could not be copied into local app storage.');
    } finally {
      setSavingImages(false);
    }
  };

  const save = () => {
    if (![location, doing, nextObjective, dontForget, partyBuild, notes].some((x) => x.trim()) && checklist.length === 0) {
      Alert.alert('Give Future You something', 'Add at least one detail or checklist item before saving this bookmark.');
      return;
    }
    onSave({
      id: makeId(),
      createdAt: new Date().toISOString(),
      location: location.trim(),
      doing: doing.trim(),
      nextObjective: nextObjective.trim(),
      dontForget: dontForget.trim(),
      partyBuild: partyBuild.trim(),
      notes: notes.trim(),
      screenshots,
      checklist
    });
  };

  return (
    <ScreenShell>
      <PrimaryButton label="‹ Cancel" onPress={onBack} variant="ghost" style={styles.back} />
      <Text style={styles.eyebrow}>SAVE MY PLACE</Text>
      <Text style={styles.title}>{game.title}</Text>
      <Text style={styles.intro}>Write for the version of you who will remember absolutely none of this.</Text>

      {last ? <PrimaryButton label="Copy my last bookmark as a starting point" onPress={useLast} variant="secondary" /> : null}

      <Field label="Where are you?" hint="Area, chapter, dungeon, quest, boss, mission…" value={location} onChangeText={setLocation} placeholder="Heading toward Nibelheim" />
      <Field label="What were you doing?" value={doing} onChangeText={setDoing} placeholder="Grinding AP, solving a puzzle, chasing a side quest…" />
      <Field label="What should you do next?" value={nextObjective} onChangeText={setNextObjective} placeholder="Go back to the reactor, talk to the NPC by the bridge…" />
      <Field label="Anything you REALLY don't want to forget?" value={dontForget} onChangeText={setDontForget} placeholder="DO NOT SELL THE WEAPON WITH ENEMY SKILL" />
      <Field label="Party / build / loadout" value={partyBuild} onChangeText={setPartyBuild} placeholder="Cloud / Tifa / Aerith • Fire build • Bow + poison" />
      <Field label="Extra notes" value={notes} onChangeText={setNotes} placeholder="Anything else Future You should know…" />

      <View style={styles.checkPanel}>
        <Text style={styles.shotTitle}>Before I play again</Text>
        <Text style={styles.shotText}>Optional mini-checklist for the first few things you want to do when you come back.</Text>
        <View style={styles.taskRow}>
          <TextInput
            value={taskText}
            onChangeText={setTaskText}
            onSubmitEditing={addTask}
            placeholder="Buy potions, finish side quest…"
            placeholderTextColor={colors.faint}
            style={styles.taskInput}
            returnKeyType="done"
          />
          <PrimaryButton label="+ Add" onPress={addTask} disabled={!taskText.trim()} variant="secondary" />
        </View>
        {checklist.map((item) => (
          <View key={item.id} style={styles.taskItem}>
            <Text style={styles.taskBullet}>☐</Text>
            <Text style={styles.taskText}>{item.text}</Text>
            <Pressable onPress={() => setChecklist((items) => items.filter((x) => x.id !== item.id))} hitSlop={10}>
              <Text style={styles.taskRemove}>×</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.shotsPanel}>
        <View style={styles.shotHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.shotTitle}>Screenshots</Text>
            <Text style={styles.shotText}>Attach up to 6. They are copied into this app's local storage.</Text>
          </View>
          <PrimaryButton label={savingImages ? 'Adding…' : '+ Add'} onPress={addShots} disabled={savingImages || screenshots.length >= 6} variant="secondary" />
        </View>
        {screenshots.length > 0 ? (
          <View style={styles.shotGrid}>
            {screenshots.map((uri) => (
              <Pressable key={uri} onPress={() => setScreenshots((x) => x.filter((u) => u !== uri))}>
                <Image source={{ uri }} style={styles.shot} />
                <View style={styles.remove}><Text style={styles.removeText}>×</Text></View>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <PrimaryButton label="💾 Save This Bookmark" onPress={save} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  title: { color: colors.text, fontSize: 28, fontWeight: '950' },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  checkPanel: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: 14, gap: 10 },
  taskRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  taskInput: { flex: 1, minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, color: colors.text, paddingHorizontal: 12, fontSize: 14 },
  taskItem: { flexDirection: 'row', gap: 9, alignItems: 'center', backgroundColor: colors.panel2, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 },
  taskBullet: { color: colors.accent, fontSize: 18 },
  taskText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 19 },
  taskRemove: { color: colors.muted, fontSize: 24, fontWeight: '800' },
  shotsPanel: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: 14, gap: 12 },
  shotHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  shotTitle: { color: colors.text, fontSize: 16, fontWeight: '850' },
  shotText: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  shotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  shot: { width: 94, height: 94, borderRadius: radius.sm, backgroundColor: colors.bg },
  remove: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: '#000000AA', alignItems: 'center', justifyContent: 'center' },
  removeText: { color: colors.white, fontWeight: '900', fontSize: 18, marginTop: -2 }
});
