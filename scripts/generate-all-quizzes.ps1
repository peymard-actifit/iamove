# Script de génération en masse des quiz
# Génère des questions pour tous les niveaux jusqu'à atteindre 120 par niveau

$API_KEY = "iamove-maint-2024"
$BASE_URL = "https://iamove.vercel.app/api/quizzes/bulk-generate"
$BATCH_SIZE = 10  # Nombre de questions par lot
$TARGET_PER_LEVEL = 120
$PAUSE_SECONDS = 5  # Pause entre les lots

Write-Host "=== Génération en masse des Quiz ===" -ForegroundColor Cyan
Write-Host "Objectif: $TARGET_PER_LEVEL questions par niveau" -ForegroundColor Yellow

# Récupérer les stats actuelles
Write-Host "`nRécupération des statistiques..." -ForegroundColor Gray
$stats = Invoke-RestMethod -Uri "$BASE_URL`?key=$API_KEY" -Method GET

Write-Host "Total actuel: $($stats.summary.totalCurrent) / $($stats.summary.totalTarget)" -ForegroundColor White
Write-Host "Questions manquantes: $($stats.summary.totalMissing)" -ForegroundColor Yellow

# Générer pour chaque niveau
foreach ($level in $stats.stats) {
    if ($level.missing -eq 0) {
        Write-Host "`n[Niveau $($level.number)] $($level.name) - COMPLET ($($level.currentCount)/$TARGET_PER_LEVEL)" -ForegroundColor Green
        continue
    }
    
    Write-Host "`n[Niveau $($level.number)] $($level.name) - $($level.currentCount)/$TARGET_PER_LEVEL (manque $($level.missing))" -ForegroundColor Yellow
    
    $remaining = $level.missing
    $batchNum = 1
    
    while ($remaining -gt 0) {
        $toGenerate = [Math]::Min($BATCH_SIZE, $remaining)
        
        Write-Host "  Lot $batchNum : Génération de $toGenerate questions..." -ForegroundColor Gray -NoNewline
        
        try {
            $body = @{ 
                levelNumber = $level.number
                count = $toGenerate
                withTranslations = $true 
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri "$BASE_URL`?key=$API_KEY" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 120
            
            if ($response.success) {
                Write-Host " OK! ($($response.created) créées, total: $($response.newTotal))" -ForegroundColor Green
                $remaining = $response.remaining
            } else {
                Write-Host " ERREUR: $($response.error)" -ForegroundColor Red
                break
            }
        } catch {
            Write-Host " ERREUR: $_" -ForegroundColor Red
            # Continuer malgré l'erreur
        }
        
        $batchNum++
        
        if ($remaining -gt 0) {
            Write-Host "  Pause de $PAUSE_SECONDS secondes..." -ForegroundColor Gray
            Start-Sleep -Seconds $PAUSE_SECONDS
        }
    }
}

# Afficher le résumé final
Write-Host "`n=== Génération terminée ===" -ForegroundColor Cyan
$finalStats = Invoke-RestMethod -Uri "$BASE_URL`?key=$API_KEY" -Method GET
Write-Host "Total final: $($finalStats.summary.totalCurrent) / $($finalStats.summary.totalTarget)" -ForegroundColor White
Write-Host "Progression: $($finalStats.summary.percentComplete)%" -ForegroundColor Green
