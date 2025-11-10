# Eventally - Quick Deploy to Vercel Script
# Run this script to commit changes and prepare for deployment

Write-Host "🚀 Eventally - Vercel Deployment Helper" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not found!" -ForegroundColor Red
    Write-Host "Please run: git init" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Current Git Status:" -ForegroundColor Green
git status --short
Write-Host ""

# Ask user if they want to commit
$commit = Read-Host "Do you want to commit all changes? (y/n)"
if ($commit -eq "y" -or $commit -eq "Y") {
    Write-Host ""
    Write-Host "📝 Committing changes..." -ForegroundColor Green
    
    # Add all files
    git add .
    
    # Get commit message
    $message = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($message)) {
        $message = "Update: Apply fixes and improvements for Vercel deployment"
    }
    
    git commit -m $message
    Write-Host "✅ Changes committed!" -ForegroundColor Green
    Write-Host ""
}

# Check if remote exists
$remote = git remote -v 2>$null
if ([string]::IsNullOrWhiteSpace($remote)) {
    Write-Host "⚠️  No remote repository configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To deploy to Vercel, you need to:" -ForegroundColor Cyan
    Write-Host "1. Create a repository on GitHub" -ForegroundColor White
    Write-Host "2. Run: git remote add origin https://github.com/YOUR_USERNAME/eventally.git" -ForegroundColor White
    Write-Host "3. Run: git push -u origin master" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "📤 Remote repository found:" -ForegroundColor Green
    git remote -v
    Write-Host ""
    
    $push = Read-Host "Do you want to push to remote? (y/n)"
    if ($push -eq "y" -or $push -eq "Y") {
        Write-Host ""
        Write-Host "🔄 Pushing to remote..." -ForegroundColor Green
        git push
        Write-Host "✅ Pushed successfully!" -ForegroundColor Green
        Write-Host ""
    }
}

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Next Steps for Vercel Deployment:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Deploy via Vercel Dashboard (Easiest)" -ForegroundColor Yellow
Write-Host "  1. Go to: https://vercel.com/new" -ForegroundColor White
Write-Host "  2. Import your GitHub repository" -ForegroundColor White
Write-Host "  3. Add environment variables (see DEPLOY_TO_VERCEL_NOW.md)" -ForegroundColor White
Write-Host "  4. Click Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Deploy via CLI" -ForegroundColor Yellow
Write-Host "  1. Install: npm install -g vercel" -ForegroundColor White
Write-Host "  2. Login: vercel login" -ForegroundColor White
Write-Host "  3. Deploy: vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full guide: See DEPLOY_TO_VERCEL_NOW.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Required Environment Variables:" -ForegroundColor Yellow
Write-Host "  • NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "  • NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "  • SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "  • EMAIL_SERVICE=gmail" -ForegroundColor White
Write-Host "  • GMAIL_USER" -ForegroundColor White
Write-Host "  • GMAIL_APP_PASSWORD" -ForegroundColor White
Write-Host ""
Write-Host "✨ Your code is ready for deployment!" -ForegroundColor Green
Write-Host ""
