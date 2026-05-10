# Ensure results directories exist
New-Item -ItemType Directory -Force -Path "playwright-report", "test-results" | Out-Null

Write-Host "🚀 Building and running Playwright tests in Docker..." -ForegroundColor Cyan
docker-compose up --build --abort-on-container-exit

Write-Host "✅ Tests completed. Reports are available in ./playwright-report" -ForegroundColor Green
