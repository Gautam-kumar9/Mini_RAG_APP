# Quick Start Script for Mini RAG App
# Run this after setting up your .env file

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Mini RAG App - Quick Start" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file from .env.example" -ForegroundColor Red
    Write-Host ""
    Write-Host "Required variables:" -ForegroundColor Yellow
    Write-Host "  - OPENAI_API_KEY" -ForegroundColor White
    Write-Host "  - COHERE_API_KEY" -ForegroundColor White
    Write-Host "  - SUPABASE_URL" -ForegroundColor White
    Write-Host "  - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green

# Display next steps
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Make sure Supabase is configured:" -ForegroundColor White
Write-Host "   - Create a Supabase project" -ForegroundColor Gray
Write-Host "   - Run the SQL from supabase_schema.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Test the application:" -ForegroundColor White
Write-Host "   - Upload a document from sample-docs/" -ForegroundColor Gray
Write-Host "   - Ask a question about the content" -ForegroundColor Gray
Write-Host "   - Verify citations appear" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed setup instructions, see SETUP.md" -ForegroundColor Yellow
Write-Host "For testing guide, see TESTING.md" -ForegroundColor Yellow
Write-Host ""
