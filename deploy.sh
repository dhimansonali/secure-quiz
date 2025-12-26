#!/bin/bash

# Secure Quiz - Vercel Deployment Helper
# This script helps you deploy to Vercel with the correct settings

set -e

echo "========================================="
echo "Secure Quiz - Vercel Deployment Setup"
echo "========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✓ Vercel CLI is ready"
echo ""

# Deploy Backend
echo "========================================="
echo "Deploying Backend to Vercel..."
echo "========================================="
cd backend
echo ""
echo "You'll be prompted to:"
echo "1. Link your GitHub account"
echo "2. Confirm the project name"
echo "3. Confirm the framework (Node.js)"
echo ""
read -p "Press Enter to continue with backend deployment..."
vercel --prod

BACKEND_URL=$(vercel --prod --json | jq -r '.url')
echo "✓ Backend deployed to: https://${BACKEND_URL}"
echo ""

# Deploy Frontend
echo "========================================="
echo "Deploying Frontend to Vercel..."
echo "========================================="
cd ../frontend
echo ""
echo "Set the following in Vercel dashboard:"
echo "  Build Command: npm run build"
echo "  Output Directory: dist"
echo "  Environment Variable:"
echo "    VITE_API_URL = https://${BACKEND_URL}/api"
echo ""
read -p "Press Enter to continue with frontend deployment..."
vercel --prod

FRONTEND_URL=$(vercel --prod --json | jq -r '.url')
echo "✓ Frontend deployed to: https://${FRONTEND_URL}"
echo ""

echo "========================================="
echo "✓ Deployment Complete!"
echo "========================================="
echo ""
echo "Frontend: https://${FRONTEND_URL}"
echo "Backend:  https://${BACKEND_URL}"
echo "Admin:    https://${FRONTEND_URL}/admin/login"
echo ""
echo "Next steps:"
echo "1. Add MongoDB Atlas connection string to backend env vars"
echo "2. Update frontend VITE_API_URL with backend URL"
echo "3. Run: npm run seed (to initialize admin user)"
