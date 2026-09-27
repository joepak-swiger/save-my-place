# Changelog

## v0.1.6 - Save My Place

- Officially renamed the app to **Save My Place**.
- Updated Expo display name and slug.
- Updated Android package and iOS bundle identifier to `com.joeking.savemyplace`.
- Updated visible app branding and changed the comeback heading to **WHERE WAS I?**.
- Added automatic migration from the old prototype AsyncStorage key.
- New media is now stored under the Save My Place media folder. Existing saved image URIs remain usable.
- Added one-click Windows helpers for the first GitHub push and future commits.
- Kept the Steam -> TheGamesDB -> GameBrain search chain and SteamGridDB artwork fallback from v0.1.5.

## v0.1.5

### Broader game search
- Kept Steam as the zero-setup primary source.
- Added optional TheGamesDB search for broader console/retro/handheld coverage.
- Added optional GameBrain as a quota-conscious final catalog fallback.
- Added provider status chips so the Add Game screen shows which sources are active.
- Search failures from one optional provider no longer kill results from the other providers.
- Search results now identify their source and show platform/year metadata when available.

### Better cover art fallback
- Added optional SteamGridDB portrait-art fallback using 600x900 static grids.
- SteamGridDB is used as an artwork layer rather than a duplicate search catalog.
- Manual games can use a new "Find cover online" button when SteamGridDB is configured.
- Remote images preserve PNG/WebP/JPEG file extensions when copied into local app storage.

### Setup
- Added `SETUP-GAME-SEARCH.bat` and `SETUP-GAME-SEARCH.ps1`.
- Added `.env.example` for optional provider keys.
- Stored catalog source/id on newly added catalog games for easier future provider integration.

## v0.1.4
- Added platform and edition metadata.
- Added editable game details.
- Added a "Before I play again" checklist.
- Added personal-library search and sorting.
- Added bookmark deletion/history management.
