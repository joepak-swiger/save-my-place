$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Save My Place - first GitHub push" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git was not found. Install Git for Windows first." -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit 1
}

Set-Location $PSScriptRoot

$repoUrl = Read-Host "Paste the URL of your EMPTY GitHub repository (example: https://github.com/USERNAME/save-my-place.git)"
if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "No repository URL entered. Nothing was changed." -ForegroundColor Yellow
    Read-Host "Press Enter to close"
    exit 0
}

if (-not (Test-Path ".git")) {
    git init
}

git branch -M main
git add -A

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "Save My Place v0.1.6 - first GitHub release"
} else {
    Write-Host "Nothing new to commit." -ForegroundColor Gray
}

$existingOrigin = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0 -and $existingOrigin) {
    if ($existingOrigin -ne $repoUrl) {
        git remote set-url origin $repoUrl
    }
} else {
    git remote add origin $repoUrl
}

Write-Host ""
Write-Host "Pushing main to GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "Finished. If GitHub opened a sign-in window, complete it and rerun this file if the push did not finish." -ForegroundColor Green
Read-Host "Press Enter to close"
