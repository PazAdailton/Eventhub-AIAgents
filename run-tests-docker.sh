#!/bin/bash

# Ensure results directories exist so they can be written to by Docker
mkdir -p playwright-report test-results

echo "🚀 Building and running Playwright tests in Docker..."
docker-compose up --build --abort-on-container-exit

echo "✅ Tests completed. Reports are available in ./playwright-report"
