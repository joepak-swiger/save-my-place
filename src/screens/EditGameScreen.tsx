import React, { useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { Cover } from '../components/Cover';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { pickAndPersistImage } from '../media';
import { Game } from '../models';
import { colors, radius } from '../theme';

type Props = {
  game: Game;
  onBack: () => void;
  onSave: (game: Game) => void;
};

export function EditGameScreen({ game, onBack, onSave }: Props) {
  const [title, setTitle] = useState(game.title);
  const [platform, setPlatform] = useState(game.platform ?? '');
  const [edition, setEdition] = useState(game.edition ?? '');
  const [coverUri, setCoverUri] = useState(game.coverUri);

  const pickCover = async () => {
    try {
      const uri = await pickAndPersistImage(`edit-cover-${game.id}`);
      if (uri) setCoverUri(uri);
    } catch {
      Alert.alert('Could not change cover', 'The image could not be copied into local app storage.');
    }
  };

  const save = () => {
    if (!title.trim()) {
      Alert.alert('Game title required', 'The game needs a title before it can be saved.');
      return;
    }
    Keyboard.dismiss();
    onSave({
      ...game,
      title: title.trim(),
      platform: platform.trim() || undefined,
      edition: edition.trim() || undefined,
      coverUri,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <ScreenShell>
      <PrimaryButton label="‹ Cancel" onPress={onBack} variant="ghost" style={styles.back} />
      <Text style={styles.eyebrow}>EDIT GAME</Text>
      <Text style={styles.title}>Fix the details Future You will see.</Text>

      <View style={styles.panel}>
        <Text style={styles.label}>Game title</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholderTextColor={colors.faint} />

        <Text style={styles.label}>Platform</Text>
        <TextInput value={platform} onChangeText={setPlatform} style={styles.input} placeholder="PS5, Switch, PC…" placeholderTextColor={colors.faint} />

        <Text style={styles.label}>Edition</Text>
        <TextInput value={edition} onChangeText={setEdition} style={styles.input} placeholder="Standard, Deluxe, Intergrade…" placeholderTextColor={colors.faint} />

        <View style={styles.coverRow}>
          <Cover title={title || game.title} uri={coverUri} />
          <View style={styles.coverInfo}>
            <Text style={styles.help}>You can replace the current cover with any image from your phone.</Text>
            <PrimaryButton label={coverUri ? 'Change cover' : 'Choose cover image'} onPress={pickCover} variant="secondary" />
          </View>
        </View>

        <PrimaryButton label="Save Changes" onPress={save} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  title: { color: colors.text, fontSize: 28, lineHeight: 33, fontWeight: '950' },
  panel: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16, gap: 12 },
  label: { color: colors.text, fontSize: 14, fontWeight: '800' },
  input: { minHeight: 50, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, color: colors.text, borderRadius: radius.md, paddingHorizontal: 14, fontSize: 15 },
  coverRow: { flexDirection: 'row', gap: 14, marginTop: 4 },
  coverInfo: { flex: 1, gap: 12, justifyContent: 'center' },
  help: { color: colors.muted, fontSize: 13, lineHeight: 19 }
});
