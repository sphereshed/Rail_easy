# ============================================================================
# Script to Apply Supabase Database Fix
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Supabase Database Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "ERROR: Supabase CLI is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install it using:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor White
    Write-Host ""
    Write-Host "OR follow the manual steps:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://app.supabase.com" -ForegroundColor White
    Write-Host "2. Select your project (tojbjsjpgkessgmgcuqw)" -ForegroundColor White
    Write-Host "3. Click 'SQL Editor' in the left sidebar" -ForegroundColor White
    Write-Host "4. Click 'New Query'" -ForegroundColor White
    Write-Host "5. Copy all content from: supabase/SIMPLE_FIX.sql" -ForegroundColor White
    Write-Host "6. Paste and click 'Run'" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Check if we're linked to a project
Write-Host "Checking Supabase project link..." -ForegroundColor Cyan
$projectStatus = supabase status 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Not linked to a Supabase project." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To link to your remote project, run:" -ForegroundColor Yellow
    Write-Host "  supabase link --project-ref tojbjsjpgkessgmgcuqw" -ForegroundColor White
    Write-Host ""
    Write-Host "OR follow the manual steps above." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Project linked" -ForegroundColor Green
Write-Host ""

# Apply the migration
Write-Host "Applying database fix..." -ForegroundColor Cyan
$sqlFile = Join-Path $PSScriptRoot "..\supabase\SIMPLE_FIX.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: SQL file not found at: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Reading SQL file: $sqlFile" -ForegroundColor Gray
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "Executing SQL migration..." -ForegroundColor Cyan
# Note: This requires the user to be logged in and linked
supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ SUCCESS! Database fix applied!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now try signing up again!" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to apply migration" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please follow the manual steps:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://app.supabase.com" -ForegroundColor White
    Write-Host "2. Select your project" -ForegroundColor White
    Write-Host "3. Go to SQL Editor" -ForegroundColor White
    Write-Host "4. Copy and paste content from: supabase/SIMPLE_FIX.sql" -ForegroundColor White
    Write-Host "5. Click Run" -ForegroundColor White
    Write-Host ""
}
