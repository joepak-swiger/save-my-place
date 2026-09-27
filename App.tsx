import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AddGameScreen } from './src/screens/AddGameScreen';
import { BookmarkEditorScreen } from './src/screens/BookmarkEditorScreen';
import { ComebackScreen } from './src/screens/ComebackScreen';
import { EditGameScreen } from './src/screens/EditGameScreen';
import { GameScreen } from './src/screens/GameScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { makeDemoGames } from './src/demo';
import { Game, Screen, SessionEntry } from './src/models';
import { loadGames, saveGames } from './src/storage';
import { colors } from './src/theme';

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [screen, setScreen] = useState<Screen>({ name: 'library' });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadGames()
      .then(setGames)
      .catch(() => Alert.alert('Storage error', 'The local library could not be loaded.'))
      .finally(() => setReady(true));
  }, []);

  const commit = async (next: Game[]) => {
    setGames(next);
    try {
      await saveGames(next);
    } catch {
      Alert.alert('Could not save', 'Your changes are visible now, but local storage failed to persist them.');
    }
  };

  const addGame = async (game: Game) => {
    await commit([game, ...games]);
    setScreen({ name: 'game', gameId: game.id });
  };

  const updateGame = async (updated: Game) => {
    await commit(games.map((game) => game.id === updated.id ? updated : game));
    setScreen({ name: 'game', gameId: updated.id });
  };

  const addSession = async (gameId: string, entry: SessionEntry) => {
    const next = games.map((game) =>
      game.id === gameId
        ? { ...game, sessions: [entry, ...game.sessions], updatedAt: entry.createdAt }
        : game
    );
    await commit(next);
    setScreen({ name: 'comeback', gameId });
  };

  const toggleChecklist = async (gameId: string, itemId: string) => {
    const now = new Date().toISOString();
    const next = games.map((game) => {
      if (game.id !== gameId) return game;
      const latest = game.sessions[0];
      if (!latest) return game;
      const rest = game.sessions.slice(1);
      const checklist = (latest.checklist ?? []).map((item) => item.id === itemId ? { ...item, done: !item.done } : item);
      return { ...game, updatedAt: now, sessions: [{ ...latest, checklist }, ...rest] };
    });
    await commit(next);
  };

  const deleteSession = async (gameId: string, sessionId: string) => {
    const now = new Date().toISOString();
    const next = games.map((game) => {
      if (game.id !== gameId) return game;
      const sessions = game.sessions.filter((session) => session.id !== sessionId);
      return { ...game, sessions, updatedAt: sessions[0]?.createdAt ?? now };
    });
    await commit(next);
  };

  const deleteLatest = async (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    const latest = game?.sessions[0];
    if (!latest) return;
    await deleteSession(gameId, latest.id);
  };

  const deleteGame = async (gameId: string) => {
    await commit(games.filter((g) => g.id !== gameId));
    setScreen({ name: 'library' });
  };

  const loadDemo = async () => {
    const demo = makeDemoGames();
    await commit(demo);
  };

  if (!ready) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const current = 'gameId' in screen ? games.find((g) => g.id === screen.gameId) : undefined;

  let content: React.ReactNode;

  switch (screen.name) {
    case 'add':
      content = <AddGameScreen onBack={() => setScreen({ name: 'library' })} onAdd={addGame} />;
      break;
    case 'game':
      content = current ? (
        <GameScreen
          game={current}
          onBack={() => setScreen({ name: 'library' })}
          onEdit={() => setScreen({ name: 'edit', gameId: current.id })}
          onSavePlace={() => setScreen({ name: 'bookmark', gameId: current.id })}
          onComeback={() => setScreen({ name: 'comeback', gameId: current.id })}
          onHistory={() => setScreen({ name: 'history', gameId: current.id })}
          onDeleteLatest={() => deleteLatest(current.id)}
          onDelete={() => deleteGame(current.id)}
        />
      ) : (
        <LibraryScreen games={games} onAdd={() => setScreen({ name: 'add' })} onOpen={(gameId) => setScreen({ name: 'game', gameId })} onDemo={loadDemo} />
      );
      break;
    case 'edit':
      content = current ? (
        <EditGameScreen
          game={current}
          onBack={() => setScreen({ name: 'game', gameId: current.id })}
          onSave={updateGame}
        />
      ) : null;
      break;
    case 'bookmark':
      content = current ? (
        <BookmarkEditorScreen
          game={current}
          onBack={() => setScreen({ name: 'game', gameId: current.id })}
          onSave={(entry) => addSession(current.id, entry)}
        />
      ) : null;
      break;
    case 'comeback':
      content = current ? (
        <ComebackScreen
          game={current}
          onBack={() => setScreen({ name: 'game', gameId: current.id })}
          onSaveNew={() => setScreen({ name: 'bookmark', gameId: current.id })}
          onToggleChecklist={(itemId) => toggleChecklist(current.id, itemId)}
        />
      ) : null;
      break;
    case 'history':
      content = current ? (
        <HistoryScreen
          game={current}
          onBack={() => setScreen({ name: 'game', gameId: current.id })}
          onDeleteSession={(sessionId) => deleteSession(current.id, sessionId)}
        />
      ) : null;
      break;
    default:
      content = (
        <LibraryScreen
          games={games}
          onAdd={() => setScreen({ name: 'add' })}
          onOpen={(gameId) => setScreen({ name: 'game', gameId })}
          onDemo={loadDemo}
        />
      );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }
});
