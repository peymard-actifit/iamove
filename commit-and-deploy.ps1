<#
.SYNOPSIS
    Script de commit et deploiement automatique pour iamove

.DESCRIPTION
    Ce script gere le versioning semantique et le deploiement sur Vercel via GitHub.
    
    Niveaux de version :
      major (1er niveau) : Modification majeure
      minor (2e niveau)  : Ajout de fonctionnalite  
      patch (3e niveau)  : Correctif ou modification mineure (defaut)

.PARAMETER Level
    Niveau de version : major, minor, ou patch (defaut: patch)

.PARAMETER Message
    Message de commit (defaut: "Mise a jour automatique")

.EXAMPLE
    .\commit-and-deploy.ps1 -Level minor -Message "Nouvelle fonctionnalite"
#>

param(
    [ValidateSet("major", "minor", "patch")]
    [string]$Level = "patch",
    [string]$Message = "Mise a jour automatique"
)

# Configuration
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Fonction pour afficher les etapes
function Write-Step {
    param(
        [string]$Step,
        [ValidateSet("INFO", "OK", "ERROR", "WARN")]
        [string]$Status = "INFO"
    )
    
    $colors = @{
        "OK"    = "Green"
        "ERROR" = "Red"
        "WARN"  = "Yellow"
        "INFO"  = "Cyan"
    }
    
    $symbols = @{
        "OK"    = "[OK]"
        "ERROR" = "[!!]"
        "WARN"  = "[??]"
        "INFO"  = "[..]"
    }
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $($symbols[$Status]) $Step" -ForegroundColor $colors[$Status]
}

# Fonction pour incrementer la version
function Get-NextVersion {
    param(
        [string]$CurrentVersion,
        [string]$Level
    )
    
    $parts = $CurrentVersion -split '\.'
    $major = [int]$parts[0]
    $minor = [int]$parts[1]
    $patch = [int]$parts[2]
    
    switch ($Level) {
        "major" { 
            $major++
            $minor = 0
            $patch = 0
        }
        "minor" { 
            $minor++
            $patch = 0
        }
        "patch" { 
            $patch++
        }
    }
    
    return "$major.$minor.$patch"
}

# Fonction pour mettre a jour package.json proprement (sans BOM)
function Update-PackageVersion {
    param(
        [string]$NewVersion
    )
    
    $content = Get-Content "package.json" -Raw -Encoding UTF8
    $content = $content -replace '"version":\s*"[^"]*"', "`"version`": `"$NewVersion`""
    # Ecrire sans BOM pour compatibilite Vercel
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText("$PWD\package.json", $content, $utf8NoBom)
}

# =============================================================================
# DEBUT DU PIPELINE
# =============================================================================

Write-Host ""
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host "   IAMOVE - Commit & Deploy Pipeline" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host ""

try {
    # Etape 1: Verification des changements
    Write-Step "Verification des changements locaux..."
    $status = git status --porcelain
    
    if (-not $status) {
        Write-Step "Aucun changement detecte" "WARN"
        Write-Host ""
        Write-Host "Aucune modification a deployer." -ForegroundColor Yellow
        exit 0
    }
    
    $fileCount = ($status | Measure-Object).Count
    Write-Step "Changements detectes: $fileCount fichier(s)" "OK"
    
    # Etape 2: Lecture de la version actuelle
    Write-Step "Lecture de la version actuelle..."
    $packageContent = Get-Content "package.json" -Raw -Encoding UTF8
    if ($packageContent -match '"version":\s*"([^"]*)"') {
        $currentVersion = $matches[1]
    } else {
        throw "Impossible de lire la version dans package.json"
    }
    Write-Step "Version actuelle: $currentVersion" "OK"
    
    # Etape 3: Calcul de la nouvelle version
    Write-Step "Calcul de la nouvelle version (niveau: $Level)..."
    $newVersion = Get-NextVersion -CurrentVersion $currentVersion -Level $Level
    Write-Step "Nouvelle version: $newVersion" "OK"
    
    # Etape 4: Mise a jour du package.json
    Write-Step "Mise a jour de package.json..."
    Update-PackageVersion -NewVersion $newVersion
    Write-Step "package.json mis a jour" "OK"
    
    # Etape 5: Git add
    Write-Step "Ajout des fichiers au staging..."
    $null = git add -A 2>&1
    Write-Step "Fichiers ajoutes" "OK"
    
    # Etape 6: Git commit
    Write-Step "Creation du commit..."
    $commitMessage = "v$newVersion - $Message"
    $null = git commit -m $commitMessage 2>&1
    Write-Step "Commit cree: $commitMessage" "OK"
    
    # Etape 7: Git push
    Write-Step "Push vers GitHub..."
    $pushOutput = git push origin main 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) {
        throw "Git push failed: $pushOutput"
    }
    Write-Step "Push reussi" "OK"
    
    # Etape 8: Confirmation
    Write-Step "Deploiement Vercel en cours (automatique via GitHub)..."
    
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "   DEPLOIEMENT REUSSI!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Version: $newVersion" -ForegroundColor White
    Write-Host "  Commit:  $commitMessage" -ForegroundColor White
    Write-Host "  URL:     https://iamove.vercel.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Step "Pipeline termine avec succes" "OK"
    
    # Retourner la nouvelle version
    return $newVersion
    
} catch {
    Write-Step "Erreur: $_" "ERROR"
    Write-Host ""
    Write-Host "Le deploiement a echoue. Verifiez les erreurs ci-dessus." -ForegroundColor Red
    exit 1
}
