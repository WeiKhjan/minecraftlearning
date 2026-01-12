# Audio Generation Script
# Generates all audio files in batches with rate limiting

$baseUrl = "http://localhost:3000/api/generate-audio-batch"
$logFile = "audio-generation-log.txt"

# Categories and locales to generate
$categories = @(
    "syllable_pronunciation",
    "syllable_guide",
    "vocabulary",
    "phrase",
    "dictation",
    "matching"
)
$locales = @("ms", "zh", "en")

# Batch size (number of items per API call)
$batchSize = 5

function Write-Log {
    param($message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $message"
    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

function Generate-Batch {
    param(
        [string]$category,
        [string]$locale,
        [int]$startIndex,
        [int]$count
    )

    $body = @{
        category = $category
        locale = $locale
        startIndex = $startIndex
        count = $count
        dryRun = $false
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $body -ContentType "application/json" -TimeoutSec 300
        return $response
    }
    catch {
        Write-Log "ERROR: $($_.Exception.Message)"
        return $null
    }
}

Write-Log "Starting audio generation..."
Write-Log "Categories: $($categories -join ', ')"
Write-Log "Locales: $($locales -join ', ')"
Write-Log ""

$totalGenerated = 0
$totalErrors = 0

foreach ($category in $categories) {
    foreach ($locale in $locales) {
        Write-Log "=== Processing: $category / $locale ==="

        # First, get the total count for this category/locale
        $statsBody = @{
            category = $category
            locale = $locale
            startIndex = 0
            count = 1
            dryRun = $true
        } | ConvertTo-Json

        try {
            $stats = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $statsBody -ContentType "application/json"
            $total = $stats.total
            Write-Log "Total items for $category/$locale : $total"
        }
        catch {
            Write-Log "ERROR getting stats: $($_.Exception.Message)"
            continue
        }

        if ($total -eq 0) {
            Write-Log "No items to process, skipping..."
            continue
        }

        # Process in batches
        $currentIndex = 0
        while ($currentIndex -lt $total) {
            Write-Log "Generating batch: startIndex=$currentIndex, count=$batchSize"

            $result = Generate-Batch -category $category -locale $locale -startIndex $currentIndex -count $batchSize

            if ($result) {
                $totalGenerated += $result.successCount
                $totalErrors += $result.errorCount
                Write-Log "Batch complete: $($result.successCount) success, $($result.errorCount) errors"
                Write-Log "Progress: $($result.processed)/$total for this category"

                if ($result.nextIndex) {
                    $currentIndex = $result.nextIndex
                } else {
                    break
                }
            }
            else {
                Write-Log "Batch failed, retrying in 30 seconds..."
                Start-Sleep -Seconds 30
            }
        }

        Write-Log "Completed: $category / $locale"
        Write-Log ""
    }
}

Write-Log "=== GENERATION COMPLETE ==="
Write-Log "Total generated: $totalGenerated"
Write-Log "Total errors: $totalErrors"
