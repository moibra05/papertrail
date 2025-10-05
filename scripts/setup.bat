@echo off
REM PaperTrail Python Environment Setup Script for Windows
echo 🐍 Setting up Python environment for PaperTrail Gmail Scraper...
echo.

REM Check if Python 3 is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Python is not installed or not in PATH
    echo Please install Python 3 and try again
    pause
    exit /b 1
)

echo ✅ Python found
python --version

REM Navigate to scripts directory
cd /d "%~dp0"
echo 📁 Working in: %cd%

REM Create virtual environment if it doesn't exist
if not exist ".venv" (
    echo 📦 Creating virtual environment...
    python -m venv .venv
    if %errorlevel% neq 0 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created successfully
) else (
    echo ✅ Virtual environment already exists
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call .venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️  Upgrading pip...
pip install --upgrade pip

REM Install requirements
echo 📥 Installing Python dependencies...
if exist "requirements.txt" (
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ❌ Failed to install some dependencies
        pause
        exit /b 1
    )
    echo ✅ All dependencies installed successfully
) else (
    echo ❌ requirements.txt not found
    pause
    exit /b 1
)

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo    1. Copy example environment files:
echo       copy .env.example .env
echo       copy ..\.env.example ..\.env.local
echo    2. Edit the .env files with your actual API keys and credentials
echo    3. Set up your Supabase project and database tables
echo    4. To activate the environment manually: scripts\.venv\Scripts\activate.bat
echo    5. To run the app: npm run dev
echo.
echo 💡 See README.md for detailed configuration instructions
echo.
pause
