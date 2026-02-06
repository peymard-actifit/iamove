# =============================================================================
# SCRIPT DE COMMIT ET DEPLOIEMENT - iamove
# =============================================================================
# Usage: .\commit-and-deploy.ps1 [-Level <major|minor|patch>] [-Message <string>]
# 
# Niveaux de version :
#   major (1er niveau) : Modification majeure
#   minor (2e niveau)  : Ajout de fonctionnalité  
#   patch (3e niveau)  : Correctif ou modification mineure (défaut)
# =============================================================================

param(
    [ValidateSet("major", "minor", "patch")]
    [string]$Level = "patch",
    [string]$Message = "Mise à jour automatique"
)

# Configuration
$ErrorActionPreference = "Stop"

# Fonction pour afficher les étapes
function Write-Step {
    param([string]$Step, [string]$Status = "INFO")
    $color = switch ($Status) {
        "OK" { "Green" }
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        default { "Cyan" }
    }
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] [$Status] $Step" -ForegroundColor $color
}

# Fonction pour incrémenter la version
function Get-NextVersion {
    param([string]$CurrentVersion, [string]$Level)
    
    $parts = $CurrentVersion -split '\.'
    $major = [int]$parts[0]
    $minor = [int]$parts[1]
    $patch = [int]$parts[2]
    
    switch ($Level) {
        "major" { $major++; $minor = 0; $patch = 0 }
        "minor" { $minor++; $patch = 0 }
        "patch" { $patch++ }
    }
    
    return "$major.$minor.$patch"
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host "   IAMOVE - Commit & Deploy Pipeline" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host ""

try {
    # Étape 1: Vérification des changements
    Write-Step "Vérification des changements locaux..."
    $status = git status --porcelain
    
    if (-not $status) {
        Write-Step "Aucun changement détecté" "WARN"
        Write-Host ""
        Write-Host "Aucune modification à déployer." -ForegroundColor Yellow
        exit 0
    }
    
    Write-Step "Changements détectés: $($status.Count) fichier(s)" "OK"
    
    # Étape 2: Lecture de la version actuelle
    Write-Step "Lecture de la version actuelle..."
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $currentVersion = $packageJson.version
    Write-Step "Version actuelle: $currentVersion" "OK"
    
    # Étape 3: Calcul de la nouvelle version
    Write-Step "Calcul de la nouvelle version (niveau: $Level)..."
    $newVersion = Get-NextVersion -CurrentVersion $currentVersion -Level $Level
    Write-Step "Nouvelle version: $newVersion" "OK"
    
    # Étape 4: Mise à jour du package.json
    Write-Step "Mise à jour de package.json..."
    $packageJson.version = $newVersion
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8
    Write-Step "package.json mis à jour" "OK"
    
    # Étape 5: Git add
    Write-Step "Ajout des fichiers au staging..."
    git add -A
    Write-Step "Fichiers ajoutés" "OK"
    
    # Étape 6: Git commit
    Write-Step "Création du commit..."
    $commitMessage = "v$newVersion - $Message"
    git commit -m $commitMessage
    Write-Step "Commit créé: $commitMessage" "OK"
    
    # Étape 7: Git push
    Write-Step "Push vers GitHub..."
    git push origin main
    Write-Step "Push réussi" "OK"
    
    # Étape 8: Attente du déploiement Vercel
    Write-Step "Déploiement Vercel en cours (automatique via GitHub)..."
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "   DEPLOIEMENT REUSSI!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Version: $newVersion" -ForegroundColor White
    Write-Host "  Commit:  $commitMessage" -ForegroundColor White
    Write-Host "  URL:     https://iamove.vercel.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Step "Pipeline terminé avec succès" "OK"
    
} catch {
    Write-Step "Erreur: $_" "ERROR"
    Write-Host ""
    Write-Host "Le déploiement a échoué. Vérifiez les erreurs ci-dessus." -ForegroundColor Red
    exit 1
}
