# MindCare AI Backend - Quick Setup Script
# Run this file in PowerShell: .\setup.ps1

Write-Host "🚀 MindCare AI Backend Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "📌 Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Python not found! Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host ""
Write-Host "📌 Checking PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    Write-Host "✓ PostgreSQL found: $($pgService.DisplayName)" -ForegroundColor Green
    if ($pgService.Status -ne "Running") {
        Write-Host "⚠ PostgreSQL is not running. Starting..." -ForegroundColor Yellow
        Start-Service $pgService.Name
    }
} else {
    Write-Host "✗ PostgreSQL not found!" -ForegroundColor Red
    Write-Host "  Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") { exit 1 }
}

# Create virtual environment
Write-Host ""
Write-Host "📌 Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "⊘ Virtual environment already exists" -ForegroundColor Gray
} else {
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "📌 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "📌 Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Check .env file
Write-Host ""
Write-Host "📌 Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠ Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Edit .env file and update:" -ForegroundColor Red
    Write-Host "  - POSTGRES_PASSWORD (your PostgreSQL password)" -ForegroundColor Yellow
    Write-Host "  - SECRET_KEY (generate a secure key)" -ForegroundColor Yellow
    Write-Host "  - JWT_SECRET_KEY (generate a secure key)" -ForegroundColor Yellow
    Write-Host "  - GOOGLE_API_KEY (if using Gemini AI)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your settings" -ForegroundColor White
Write-Host "2. Create database: psql -U postgres -c 'CREATE DATABASE mental_care_db;'" -ForegroundColor White
Write-Host "3. Run migrations: flask db upgrade" -ForegroundColor White
Write-Host "4. Seed data: python -m app.seeds.seed_data" -ForegroundColor White
Write-Host "5. Start server: python wsgi.py" -ForegroundColor White
Write-Host ""
Write-Host "Or run: .\run.ps1" -ForegroundColor Yellow
