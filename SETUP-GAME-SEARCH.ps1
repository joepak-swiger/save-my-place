$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Save My Place optional search setup" -ForegroundColor Cyan
Write-Host "Steam needs no key and always works." -ForegroundColor Gray
Write-Host "Press Enter to skip any optional provider." -ForegroundColor Gray
Write-Host ""

$tgdb = Read-Host "TheGamesDB API key"
$gamebrain = Read-Host "GameBrain API key"
$sgdb = Read-Host "SteamGridDB API key"

$lines = @(
  "EXPO_PUBLIC_THEGAMESDB_API_KEY=$tgdb",
  "EXPO_PUBLIC_GAMEBRAIN_API_KEY=$gamebrain",
  "EXPO_PUBLIC_STEAMGRIDDB_API_KEY=$sgdb"
)

$envPath = Join-Path $PSScriptRoot ".env"
$lines | Set-Content -Path $envPath -Encoding utf8

Write-Host ""
Write-Host "Saved $envPath" -ForegroundColor Green
Write-Host "Restart Expo with: npx expo start -c" -ForegroundColor Yellow
Write-Host ""
Write-Host "Important: .env is gitignored. Do not publish these prototype API keys in a public repo." -ForegroundColor Gray
Read-Host "Press Enter to close"
