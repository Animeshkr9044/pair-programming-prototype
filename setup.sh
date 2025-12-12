#!/bin/bash

echo "🚀 Starting Setup for Pair Programming Prototype..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "📦 Building and Starting Containers..."
docker-compose up --build -d

echo ""
echo "✅ Deployment Complete!"
echo "------------------------------------------------"
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8000/docs"
echo "🗄️  Database: localhost:5432"
echo "------------------------------------------------"
echo "ℹ️  To view logs: docker-compose logs -f"
echo "ℹ️  To stop: docker-compose down"
