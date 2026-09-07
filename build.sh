#!/bin/bash

# PWA Build Script
# Run: ./build.sh or bash build.sh

set -e

echo "🏗️  Building PWA Gallery..."
echo "================================"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Lint code
echo "🔍 Linting code..."
npm run lint || echo "⚠️  Lint warnings (continuing...)"

# Build the project
echo "🔨 Building application..."
npm run build

# Verify output
echo "✅ Verifying build output..."
if [ ! -d "dist" ]; then
  echo "❌ Error: dist folder not found"
  exit 1
fi

echo "✅ Build successful!"
echo ""
echo "📁 Build artifacts location: ./dist"
echo "📊 Dist folder contents:"
du -sh dist/
echo ""

# Check critical PWA files
echo "🔎 Checking PWA files..."
[ -f "dist/manifest.json" ] && echo "✅ manifest.json found" || echo "⚠️  manifest.json missing"
[ -f "dist/sw.js" ] && echo "✅ Service Worker found" || echo "⚠️  Service Worker missing"

echo ""
echo "🚀 Ready to deploy!"
echo "Next steps:"
echo "  1. Push to GitHub"
echo "  2. Deploy dist/ to hosting (Vercel, Netlify, GitHub Pages, etc.)"
echo ""
