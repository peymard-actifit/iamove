<#
.SYNOPSIS
    Script de commit et deploiement automatique pour iamove

.DESCRIPTION
    Ce script gere le versioning semantique et le deploiement sur Vercel via API.
    Le deploiement est controle manuellement (pas de trigger automatique GitHub).
    
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

# Tokens et configuration Vercel
$VERCEL_TOKEN = "guslExykaaYwwyrd9ACspjFH"
$VERCEL_PROJECT = "iamove"
$GITHUB_REPO = "peymard-actifit/iamove"

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
    $oldErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    git push origin main 2>&1 | Out-Null
    $pushExitCode = $LASTEXITCODE
    $ErrorActionPreference = $oldErrorAction
    if ($pushExitCode -ne 0) {
        throw "Git push failed with exit code $pushExitCode"
    }
    Write-Step "Push reussi" "OK"
    
    # Etape 8: Declenchement du deploiement Vercel via API
    Write-Step "Declenchement du deploiement Vercel..."
    
    # Recuperer le dernier commit SHA
    $commitSha = git rev-parse HEAD
    
    $headers = @{
        "Authorization" = "Bearer $VERCEL_TOKEN"
        "Content-Type" = "application/json"
    }
    
    $deployBody = @{
        name = $VERCEL_PROJECT
        project = $VERCEL_PROJECT
        target = "production"
        gitSource = @{
            type = "github"
            ref = "main"
            repoId = "1151255766"
            sha = $commitSha
        }
    } | ConvertTo-Json -Depth 5
    
    $deployResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments" -Headers $headers -Method POST -Body $deployBody
    $deploymentId = $deployResponse.id
    $deploymentUrl = $deployResponse.url
    
    Write-Step "Deploiement lance: $deploymentId" "OK"
    
    # Etape 9: Suivi du deploiement
    Write-Step "Attente du build Vercel..."
    
    $maxAttempts = 60  # 5 minutes max (60 x 5 secondes)
    $attempt = 0
    $buildComplete = $false
    
    while (-not $buildComplete -and $attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 5
        $attempt++
        
        $statusResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments/$deploymentId" -Headers $headers -Method GET
        $readyState = $statusResponse.readyState
        
        switch ($readyState) {
            "READY" {
                $buildComplete = $true
                Write-Step "Build termine avec succes!" "OK"
            }
            "ERROR" {
                throw "Le build Vercel a echoue. Consultez les logs sur Vercel."
            }
            "CANCELED" {
                throw "Le deploiement a ete annule."
            }
            default {
                # QUEUED, INITIALIZING, BUILDING
                $elapsed = $attempt * 5
                Write-Host "`r[$((Get-Date).ToString('HH:mm:ss'))] [..] Build en cours... ($readyState - ${elapsed}s)" -NoNewline -ForegroundColor Cyan
            }
        }
    }
    
    Write-Host ""  # Nouvelle ligne apres le suivi
    
    if (-not $buildComplete) {
        Write-Step "Timeout - le build prend plus de 5 minutes" "WARN"
        Write-Host "Le deploiement continue en arriere-plan. Verifiez sur https://vercel.com" -ForegroundColor Yellow
    }
    
    # Etape 10: Confirmation finale
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "   DEPLOIEMENT REUSSI!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Version:      $newVersion" -ForegroundColor White
    Write-Host "  Commit:       $commitMessage" -ForegroundColor White
    Write-Host "  Deployment:   $deploymentId" -ForegroundColor White
    Write-Host "  URL:          https://iamove.vercel.app" -ForegroundColor Cyan
    Write-Host "  Preview URL:  https://$deploymentUrl" -ForegroundColor Cyan
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
