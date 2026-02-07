<#
.SYNOPSIS
    Script de commit et deploiement automatique pour iamove

.DESCRIPTION
    Ce script gere le versioning semantique et le deploiement sur Vercel via API.
    Le deploiement est controle manuellement (pas de trigger automatique GitHub).
    
    Fonctionnalites :
      - Synchronisation automatique avec le repo distant
      - Versioning semantique (major, minor, patch)
      - Deploiement via API Vercel avec suivi du build
      - Option Force pour redeployer sans changements

.PARAMETER Level
    Niveau de version : major, minor, ou patch (defaut: patch)

.PARAMETER Message
    Message de commit (defaut: "Mise a jour automatique")

.PARAMETER Force
    Force le deploiement meme sans changements locaux

.EXAMPLE
    .\commit-and-deploy.ps1 -Level minor -Message "Nouvelle fonctionnalite"
    .\commit-and-deploy.ps1 -Force  # Redeployer la version actuelle
#>

param(
    [ValidateSet("major", "minor", "patch")]
    [string]$Level = "patch",
    [string]$Message = "Mise a jour automatique",
    [switch]$Force
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

# Fonction pour mettre a jour le fichier .env avec la version
function Update-EnvVersion {
    param(
        [string]$NewVersion
    )
    
    if (Test-Path ".env") {
        $content = Get-Content ".env" -Raw -Encoding UTF8
        if ($content -match 'NEXT_PUBLIC_APP_VERSION=') {
            $content = $content -replace 'NEXT_PUBLIC_APP_VERSION="[^"]*"', "NEXT_PUBLIC_APP_VERSION=`"$NewVersion`""
        } else {
            $content += "`nNEXT_PUBLIC_APP_VERSION=`"$NewVersion`""
        }
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText("$PWD\.env", $content, $utf8NoBom)
    }
}

# Fonction pour synchroniser avec le remote
function Sync-WithRemote {
    Write-Step "Fetch des changements distants..."
    $oldErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    git fetch origin main 2>&1 | Out-Null
    $fetchExitCode = $LASTEXITCODE
    $ErrorActionPreference = $oldErrorAction
    if ($fetchExitCode -ne 0) {
        throw "Impossible de fetch depuis origin"
    }
    Write-Step "Fetch termine" "OK"
    
    # Verifier si on est en retard par rapport au remote
    $behind = git rev-list HEAD..origin/main --count 2>&1
    $ahead = git rev-list origin/main..HEAD --count 2>&1
    
    if ($behind -gt 0) {
        Write-Step "Branche locale en retard de $behind commit(s), mise a jour..." "WARN"
        
        # Verifier s'il y a des changements non commites
        $localChanges = git status --porcelain
        if ($localChanges) {
            Write-Step "Stash des changements locaux..."
            git stash push -m "Auto-stash avant sync" | Out-Null
            $stashed = $true
        }
        
        # Pull avec rebase pour garder l'historique propre
        $oldErrorAction = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        git pull --rebase origin main 2>&1 | Out-Null
        $pullExitCode = $LASTEXITCODE
        $ErrorActionPreference = $oldErrorAction
        if ($pullExitCode -ne 0) {
            if ($stashed) { git stash pop | Out-Null }
            throw "Impossible de pull depuis origin"
        }
        Write-Step "Branche mise a jour avec le remote" "OK"
        
        # Restaurer les changements locaux
        if ($stashed) {
            Write-Step "Restauration des changements locaux..."
            git stash pop | Out-Null
            Write-Step "Changements restaures" "OK"
        }
    } else {
        Write-Step "Branche locale synchronisee avec le remote" "OK"
    }
    
    if ($ahead -gt 0) {
        Write-Step "Branche locale en avance de $ahead commit(s) (non pousse)" "INFO"
    }
}

# Fonction pour declencher le deploiement Vercel
function Start-VercelDeployment {
    param(
        [string]$CommitSha
    )
    
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
            sha = $CommitSha
        }
    } | ConvertTo-Json -Depth 5
    
    try {
        $deployResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments" -Headers $headers -Method POST -Body $deployBody
        return $deployResponse
    } catch {
        $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorBody.error.message) {
            throw "Erreur Vercel API: $($errorBody.error.message)"
        }
        throw "Erreur Vercel API: $_"
    }
}

# Fonction pour suivre le deploiement
function Wait-VercelDeployment {
    param(
        [string]$DeploymentId
    )
    
    $headers = @{
        "Authorization" = "Bearer $VERCEL_TOKEN"
    }
    
    $maxAttempts = 90  # 7.5 minutes max (90 x 5 secondes)
    $attempt = 0
    $lastState = ""
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 5
        $attempt++
        
        try {
            $statusResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments/$DeploymentId" -Headers $headers -Method GET
        } catch {
            Write-Step "Erreur lors de la verification du statut, nouvelle tentative..." "WARN"
            continue
        }
        
        $readyState = $statusResponse.readyState
        
        switch ($readyState) {
            "READY" {
                Write-Host ""
                Write-Step "Build et deploiement termines avec succes!" "OK"
                return @{
                    Success = $true
                    Url = $statusResponse.url
                    ReadyState = $readyState
                }
            }
            "ERROR" {
                Write-Host ""
                Write-Step "Le build Vercel a echoue!" "ERROR"
                
                # Essayer de recuperer les logs d'erreur
                try {
                    $eventsResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments/$DeploymentId/events" -Headers $headers -Method GET
                    $errorEvents = $eventsResponse | Where-Object { $_.type -eq "error" -or $_.type -eq "build-error" }
                    if ($errorEvents) {
                        Write-Host "Erreurs de build:" -ForegroundColor Red
                        foreach ($event in $errorEvents) {
                            Write-Host "  - $($event.text)" -ForegroundColor Red
                        }
                    }
                } catch {
                    # Ignorer les erreurs de recuperation des logs
                }
                
                return @{
                    Success = $false
                    Url = $statusResponse.url
                    ReadyState = $readyState
                    Error = "Build failed"
                }
            }
            "CANCELED" {
                Write-Host ""
                Write-Step "Le deploiement a ete annule" "ERROR"
                return @{
                    Success = $false
                    ReadyState = $readyState
                    Error = "Deployment canceled"
                }
            }
            default {
                # QUEUED, INITIALIZING, BUILDING
                if ($readyState -ne $lastState) {
                    Write-Host ""
                    $lastState = $readyState
                }
                $elapsed = $attempt * 5
                Write-Host "`r[$((Get-Date).ToString('HH:mm:ss'))] [..] $readyState... (${elapsed}s)    " -NoNewline -ForegroundColor Cyan
            }
        }
    }
    
    Write-Host ""
    Write-Step "Timeout - le build prend plus de 7.5 minutes" "WARN"
    return @{
        Success = $false
        ReadyState = "TIMEOUT"
        Error = "Deployment timeout"
    }
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
    # Etape 0: Verifier qu'on est sur la branche main
    Write-Step "Verification de la branche courante..."
    $currentBranch = git branch --show-current
    if ($currentBranch -ne "main") {
        throw "Vous devez etre sur la branche 'main' pour deployer (actuellement sur '$currentBranch')"
    }
    Write-Step "Branche: main" "OK"
    
    # Etape 1: Synchronisation avec le remote
    Sync-WithRemote
    
    # Etape 2: Verification des changements locaux
    Write-Step "Verification des changements locaux..."
    $status = git status --porcelain
    
    $hasChanges = $status -and $status.Length -gt 0
    
    if (-not $hasChanges -and -not $Force) {
        Write-Step "Aucun changement detecte" "WARN"
        Write-Host ""
        Write-Host "Aucune modification a deployer." -ForegroundColor Yellow
        Write-Host "Utilisez -Force pour redeployer la version actuelle." -ForegroundColor Yellow
        exit 0
    }
    
    if ($hasChanges) {
        $fileCount = ($status | Measure-Object).Count
        Write-Step "Changements detectes: $fileCount fichier(s)" "OK"
    } else {
        Write-Step "Mode Force: redeploiement sans changements" "INFO"
    }
    
    # Etape 3: Lecture de la version actuelle
    Write-Step "Lecture de la version actuelle..."
    $packageContent = Get-Content "package.json" -Raw -Encoding UTF8
    if ($packageContent -match '"version":\s*"([^"]*)"') {
        $currentVersion = $matches[1]
    } else {
        throw "Impossible de lire la version dans package.json"
    }
    Write-Step "Version actuelle: $currentVersion" "OK"
    
    # Variables pour le commit
    $newVersion = $currentVersion
    $commitMessage = ""
    $commitSha = ""
    
    if ($hasChanges) {
        # Etape 4: Calcul de la nouvelle version
        Write-Step "Calcul de la nouvelle version (niveau: $Level)..."
        $newVersion = Get-NextVersion -CurrentVersion $currentVersion -Level $Level
        Write-Step "Nouvelle version: $newVersion" "OK"
        
        # Etape 5: Mise a jour du package.json et .env
        Write-Step "Mise a jour de package.json et .env..."
        Update-PackageVersion -NewVersion $newVersion
        Update-EnvVersion -NewVersion $newVersion
        Write-Step "Fichiers de version mis a jour" "OK"
        
        # Etape 6: Git add
        Write-Step "Ajout des fichiers au staging..."
        $null = git add -A 2>&1
        Write-Step "Fichiers ajoutes" "OK"
        
        # Etape 7: Git commit
        Write-Step "Creation du commit..."
        $commitMessage = "v$newVersion - $Message"
        $null = git commit -m $commitMessage 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Echec du commit"
        }
        Write-Step "Commit cree: $commitMessage" "OK"
        
        # Etape 8: Git push
        Write-Step "Push vers GitHub..."
        $oldErrorAction = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        git push origin main 2>&1 | Out-Null
        $pushExitCode = $LASTEXITCODE
        $ErrorActionPreference = $oldErrorAction
        if ($pushExitCode -ne 0) {
            throw "Git push failed"
        }
        Write-Step "Push reussi" "OK"
    } else {
        $commitMessage = "Redeploiement v$currentVersion"
    }
    
    # Recuperer le SHA du commit actuel
    $commitSha = git rev-parse HEAD
    Write-Step "Commit SHA: $($commitSha.Substring(0,8))..." "INFO"
    
    # Etape 9: Verification que le push est bien arrive
    Write-Step "Verification de la synchronisation finale..."
    $oldErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    git fetch origin main 2>&1 | Out-Null
    $ErrorActionPreference = $oldErrorAction
    $remoteSha = git rev-parse origin/main
    if ($commitSha -ne $remoteSha) {
        throw "Le commit local ($($commitSha.Substring(0,8))) ne correspond pas au remote ($($remoteSha.Substring(0,8)))"
    }
    Write-Step "Local et remote synchronises" "OK"
    
    # Etape 10: Declenchement du deploiement Vercel
    Write-Step "Declenchement du deploiement Vercel..."
    $deployResponse = Start-VercelDeployment -CommitSha $commitSha
    $deploymentId = $deployResponse.id
    $deploymentUrl = $deployResponse.url
    Write-Step "Deploiement lance: $deploymentId" "OK"
    
    # Etape 11: Suivi du deploiement
    Write-Step "Attente du build Vercel..."
    $deployResult = Wait-VercelDeployment -DeploymentId $deploymentId
    
    if (-not $deployResult.Success) {
        throw "Deploiement echoue: $($deployResult.Error)"
    }
    
    # Etape 12: Confirmation finale
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "   DEPLOIEMENT REUSSI!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Version:      $newVersion" -ForegroundColor White
    Write-Host "  Commit:       $commitMessage" -ForegroundColor White
    Write-Host "  Commit SHA:   $($commitSha.Substring(0,8))" -ForegroundColor White
    Write-Host "  Deployment:   $deploymentId" -ForegroundColor White
    Write-Host "  URL:          https://iamove.vercel.app" -ForegroundColor Cyan
    Write-Host "  Preview URL:  https://$($deployResult.Url)" -ForegroundColor Cyan
    Write-Host ""
    Write-Step "Pipeline termine avec succes" "OK"
    
    # Retourner la nouvelle version
    return $newVersion
    
} catch {
    Write-Host ""
    Write-Step "Erreur: $_" "ERROR"
    Write-Host ""
    Write-Host "Le deploiement a echoue. Verifiez les erreurs ci-dessus." -ForegroundColor Red
    Write-Host ""
    Write-Host "Conseils de debug:" -ForegroundColor Yellow
    Write-Host "  - Verifiez votre connexion internet" -ForegroundColor Yellow
    Write-Host "  - Verifiez que vous etes sur la branche main" -ForegroundColor Yellow
    Write-Host "  - Consultez les logs sur https://vercel.com" -ForegroundColor Yellow
    exit 1
}
