<#
PowerShell helper to run the migration SQL against a Supabase Postgres DB.

Usage (interactive):
  .\run_supabase_migration.ps1

Or pass parameters:
  .\run_supabase_migration.ps1 -Host db.xxxxx.supabase.co -Port 5432 -User postgres -DBName postgres -SqlFile .\supabase\migrations\20251114_fix_user_creation.sql

Security: This script prompts for the DB password securely and sets it in $env:PGPASSWORD only for the duration of the psql call.
Make sure `psql` is installed and on your PATH. If not, install PostgreSQL client (or full Postgres) first.
#>
param(
    [string]$Host,
    [int]$Port = 5432,
    [string]$User = 'postgres',
    [string]$DBName = 'postgres',
    [string]$SqlFile = "./supabase/migrations/20251114_fix_user_creation.sql"
)

function PromptIfEmpty([string]$val, [string]$prompt) {
    if ([string]::IsNullOrWhiteSpace($val)) {
        return Read-Host $prompt
    }
    return $val
}

# Resolve defaults / prompts
$Host = PromptIfEmpty $Host 'Enter DB host (e.g. db.abcd1234.supabase.co)'
$Port = [int](PromptIfEmpty $Port 'Enter DB port (default 5432)')
$User = PromptIfEmpty $User 'Enter DB user (default "postgres")'
$DBName = PromptIfEmpty $DBName 'Enter DB name (default "postgres")'
$SqlFile = PromptIfEmpty $SqlFile 'Enter path to SQL file (default ./supabase/migrations/20251114_fix_user_creation.sql)'

# Validate SQL file exists
$SqlFilePath = Resolve-Path -Path $SqlFile -ErrorAction SilentlyContinue
if (-not $SqlFilePath) {
    Write-Error "SQL file not found: $SqlFile"
    exit 2
}
$SqlFilePath = $SqlFilePath.Path

# Ensure psql exists
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Error "psql not found in PATH. Install PostgreSQL client or add psql to PATH."
    exit 3
}

# Prompt for password securely
$securePwd = Read-Host -Prompt "Enter DB password (hidden)" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd)
$plainPwd = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR) | Out-Null

# Set PGPASSWORD for the psql process
$env:PGPASSWORD = $plainPwd

# Build connection URI (without password)
$uri = "postgresql://$User@$Host:$Port/$DBName?sslmode=require"

Write-Host "Running migration SQL: $SqlFilePath against $Host:$Port/$DBName as $User..."

# Execute psql
$psqlArgs = "`"$uri`" -f `"$SqlFilePath`""
# Use Start-Process to inherit stdout/stderr
$proc = Start-Process -FilePath psql -ArgumentList $psqlArgs -NoNewWindow -Wait -PassThru

# Clear env var
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

if ($proc.ExitCode -eq 0) {
    Write-Host "Migration completed successfully."
    exit 0
} else {
    Write-Error "psql exited with code $($proc.ExitCode). Check the output above for errors."
    exit $proc.ExitCode
}
