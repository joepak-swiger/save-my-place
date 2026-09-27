$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "Save My Place - save and push changes" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".git")) {
    Write-Host "This folder is not a Git repository yet. Run GIT-FIRST-PUSH.bat first." -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit 1
}

$message = Read-Host "Commit message"
if ([string]::IsNullOrWhiteSpace($message)) {
    $message = "Update Save My Place"
}

git add -A
$staged = git diff --cached --name-only
if (-not $staged) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    Read-Host "Press Enter to close"
    exit 0
}

git commit -m $message
git push

Write-Host ""
Write-Host "Changes pushed." -ForegroundColor Green
Read-Host "Press Enter to close"
