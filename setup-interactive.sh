#!/bin/bash

echo "🚀 PaperTrail Interactive Setup"
echo "This will help you configure all necessary API keys and credentials"
echo

# Run base setup first
echo "📦 Running base setup..."
npm run setup:python

echo
echo "🔑 API Configuration"
echo "You can skip any section by pressing Enter (you can configure it later)"
echo

# Supabase configuration
echo "=== Supabase Configuration ==="
read -p "Supabase URL: " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY

# Gemini AI configuration
echo
echo "=== Google Gemini AI Configuration ==="
read -p "Gemini API Key: " GEMINI_API_KEY

# Google OAuth configuration
echo
echo "=== Google OAuth (for Gmail scraping) ==="
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET
read -p "Google Project ID: " GOOGLE_PROJECT_ID

# Create .env.local
if [ ! -z "$SUPABASE_URL" ] || [ ! -z "$SUPABASE_ANON_KEY" ] || [ ! -z "$GEMINI_API_KEY" ]; then
    echo "Creating .env.local..."
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# Google Gemini AI
NEXT_PRIVATE_GEMINI_API_KEY=${GEMINI_API_KEY}

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF
    echo "✅ Created .env.local"
fi

# Create scripts/.env
if [ ! -z "$GOOGLE_CLIENT_ID" ] || [ ! -z "$GOOGLE_CLIENT_SECRET" ] || [ ! -z "$GOOGLE_PROJECT_ID" ]; then
    echo "Creating scripts/.env..."
    cat > scripts/.env << EOF
# Google OAuth Configuration for Gmail Scraping
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_PROJECT_ID=${GOOGLE_PROJECT_ID}
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_REDIRECT_URIS=http://localhost:3000
EOF
    echo "✅ Created scripts/.env"
fi

echo
echo "🎉 Setup complete!"
echo
echo "📋 What's configured:"
[ ! -z "$SUPABASE_URL" ] && echo "  ✅ Supabase" || echo "  ⏭️  Supabase (skipped)"
[ ! -z "$GEMINI_API_KEY" ] && echo "  ✅ Gemini AI" || echo "  ⏭️  Gemini AI (skipped)"
[ ! -z "$GOOGLE_CLIENT_ID" ] && echo "  ✅ Gmail Integration" || echo "  ⏭️  Gmail Integration (skipped)"
echo
echo "🚀 Ready to run: npm run dev"
echo "📖 See README.md for detailed documentation"
