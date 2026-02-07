# Script de traduction de masse des quizzes existants
# À exécuter une seule fois pour rattraper le retard de traduction

param(
    [string]$BaseUrl = "https://iamove.vercel.app",
    [string]$Key = $env:MAINTENANCE_KEY
)

if (-not $Key) {
    Write-Host "ERREUR: La cle MAINTENANCE_KEY est requise" -ForegroundColor Red
    Write-Host "Usage: .\translate-all-quizzes.ps1 -Key <votre_cle>" -ForegroundColor Yellow
    exit 1
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Traduction de masse des quizzes" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$batch = 0
$totalProcessed = 0
$hasMore = $true

while ($hasMore) {
    Write-Host "[Batch $batch] Traduction en cours..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/quizzes/retranslate?batch=$batch&key=$Key" `
            -Method POST `
            -ContentType "application/json" `
            -TimeoutSec 120
        
        if ($response.processed -eq 0) {
            Write-Host "[OK] Toutes les questions ont ete traduites!" -ForegroundColor Green
            $hasMore = $false
        } else {
            Write-Host "[OK] Batch $batch: $($response.successCount) traductions" -ForegroundColor Green
            $totalProcessed += $response.successCount
            $batch++
            
            # Petite pause entre les batches pour ne pas surcharger DeepL
            Start-Sleep -Seconds 2
        }
    } catch {
        Write-Host "[ERREUR] Batch $batch: $($_.Exception.Message)" -ForegroundColor Red
        
        # Réessayer après une pause plus longue
        Write-Host "Nouvelle tentative dans 10 secondes..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   TERMINÉ" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Total: $totalProcessed traductions créées" -ForegroundColor Green
