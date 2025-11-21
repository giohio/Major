# MindCare AI Backend - Run Script
# Run this file in PowerShell: .\run.ps1

Write-Host "🚀 Starting MindCare AI Backend..." -ForegroundColor Cyan
Write-Host ""

# Activate venv
Write-Host "📌 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Check if database exists and migrations are done
Write-Host "📌 Checking database setup..." -ForegroundColor Yellow
$env:FLASK_APP = "wsgi.py"

# Run migrations
Write-Host "📌 Running migrations..." -ForegroundColor Yellow
flask db upgrade

# Ask about seeding
Write-Host ""
$seed = Read-Host "Do you want to seed sample data? (y/n)"
if ($seed -eq "y") {
    Write-Host "📌 Seeding database..." -ForegroundColor Yellow
    python -m app.seeds.seed_data
}

# Start server
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "🎉 Starting Flask server..." -ForegroundColor Green
Write-Host "Server will run at: http://127.0.0.1:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

python wsgi.py
