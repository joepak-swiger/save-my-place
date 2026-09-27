# Save My Place v0.1.6

A local-first Expo app for leaving yourself a useful bookmark before you stop playing a game for weeks, months, or years.

## New in v0.1.6: official Save My Place rename

The project is now officially named **Save My Place**. The Expo display name, slug, bundle/package IDs, launcher text, in-app branding, and storage namespace have been updated. Existing prototype AsyncStorage data is migrated automatically when possible.

The game-search stack from v0.1.5 remains in place:

The Add Game screen uses a provider chain instead of relying only on Steam:

1. **Steam** - always on, no API key needed.
2. **TheGamesDB** - optional broad catalog for console, retro, handheld, and PC games.
3. **GameBrain** - optional final catalog fallback when the first sources do not return enough useful matches.
4. **SteamGridDB** - optional artwork rescue layer. It is not used as another duplicate catalog list; it supplies portrait cover art when the main catalog image is missing or unusable.
5. **Manual Add** - always available and will never be removed.

The Add Game screen shows which providers are currently active.

## Optional API key setup

Steam works immediately. To enable the broader sources, obtain any keys you want and then double-click:

```text
SETUP-GAME-SEARCH.bat
```

The setup helper asks for:

- TheGamesDB API key
- GameBrain API key
- SteamGridDB API key

Press Enter to skip any provider. The script creates a local `.env` file and `.env` is excluded from Git.

After changing keys, restart Expo with:

```powershell
npx expo start -c
```

You can also copy `.env.example` to `.env` and enter the values manually.

### Provider notes

- **TheGamesDB:** uses `/v1.1/Games/ByGameName` with box art/platform includes.
- **GameBrain:** the free plan is intended for non-commercial projects, has a small daily token allowance, and requires attribution. The app therefore only calls GameBrain as a fallback rather than on every search.
- **SteamGridDB:** uses its v2 API and only requests static 600x900 portrait grids. For Steam results the app can use the Steam app ID directly; for other results it searches SteamGridDB by title.
- **Production security:** Expo `EXPO_PUBLIC_*` values are visible in a compiled client. This setup is convenient for local prototyping, but a public App Store build should move provider secrets behind a tiny serverless proxy or use a provider-approved public-client strategy.

## Existing features

- Save your own platform and edition for each game
- Edit game title, platform, edition, and cover later
- Save bookmarks with:
  - where you are
  - what you were doing
  - what you wanted to do next
  - a do-not-forget warning
  - party/build/loadout
  - extra notes
  - up to 6 screenshots
  - a "Before I play again" checklist
- Check off comeback checklist items directly from the "Where Was I?" screen
- Keep bookmark/session history
- Delete one bookmark without deleting the whole game
- Delete a game and its local notes
- Search your personal game library
- Sort your library by Recent, A-Z, or Longest away
- Store app data locally with AsyncStorage
- Copy covers and screenshots into app-local storage

## Run on Expo Go

This project targets Expo SDK 57.

Requirements:

- Node.js 22.13 or newer
- Current Expo Go compatible with SDK 57

From PowerShell:

```powershell
cd "E:\JOEPAK\Save My Place"
npm install
npx expo install --fix
npx expo-doctor
npx expo start -c
```

Or, after dependencies are installed, double-click:

```text
START-EXPO-GO.bat
```

## Put it on GitHub

This project includes two Windows helpers:

- `GIT-FIRST-PUSH.bat` - initializes Git, creates the first commit, connects your empty GitHub repository, and pushes `main`.
- `GIT-SAVE.bat` - prompts for a commit message and pushes later updates.

Create an empty GitHub repository first (recommended repo name: `save-my-place`), then run `GIT-FIRST-PUSH.bat` and paste the repository URL when prompted. Do **not** add a GitHub README, `.gitignore`, or license during repository creation because this folder already contains project files.

The local `.env` file is ignored by Git and should never be committed.

## Browser test

After dependencies are installed, double-click:

```text
START-WEB.bat
```

## Local storage note

Notes, game metadata, checklist state, and session history are stored locally on the device. Selected covers and screenshots are copied into the app's local document storage.

Deleting the app or clearing its app data can remove this information. Backup/export remains a good future feature before relying on the app for long-term archives.
