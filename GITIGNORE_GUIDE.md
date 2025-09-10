# .gitignore Configuration Guide

## Overview

The `.gitignore` file has been configured to exclude files and directories that should not be tracked in version control for the Inventory Management System.

## Categories of Ignored Files

### 1. Dependencies
- `node_modules/` - NPM packages
- `package-lock.json` - Lock files (optional, depending on team preference)
- `yarn.lock` - Yarn lock files

### 2. Build Outputs
- `/.next/` - Next.js build output
- `/out/` - Next.js export output
- `/build/` - Production build
- `/dist/` - Distribution files

### 3. Environment Files
- `.env` - Environment variables
- `.env*.local` - Local environment files
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.test` - Test environment

### 4. Database Files
- `*.db` - SQLite databases
- `*.sqlite` - SQLite files
- `*.sqlite3` - SQLite3 files
- `/data/` - Database data directory

### 5. Uploads and Media
- `/uploads/` - User uploaded files
- `/public/uploads/` - Public uploads
- `/public/images/` - Image assets
- `/public/assets/` - Static assets
- `/public/temp/` - Temporary files

### 6. Logs
- `logs/` - Log directories
- `*.log` - Log files
- `npm-debug.log*` - NPM debug logs
- `yarn-debug.log*` - Yarn debug logs

### 7. Testing
- `/coverage/` - Test coverage reports
- `/test-results/` - Test result files
- `/playwright-report/` - Playwright test reports
- `/blob-report/` - Blob test reports

### 8. IDE and Editor Files
- `.vscode/` - VS Code settings
- `.idea/` - JetBrains IDEs
- `*.swp` - Vim swap files
- `*.swo` - Vim swap files

### 9. Operating System Files
- `.DS_Store` - macOS Finder metadata
- `Thumbs.db` - Windows thumbnail cache
- `Desktop.ini` - Windows desktop settings

### 10. Security Files
- `*.pem` - Private keys
- `*.key` - Key files
- `*.crt` - Certificate files
- `*.p12` - PKCS#12 files
- `*.pfx` - Personal Information Exchange files

### 11. Inventory Management System Specific
- `/inventory-data/` - Inventory data exports
- `/backups/` - Database backups
- `/exports/` - Report exports
- `/reports/` - Generated reports
- `*.csv` - CSV export files
- `*.xlsx` - Excel export files
- `*.pdf` - PDF reports
- `/invoice-templates/` - Custom invoice templates
- `/product-images/` - Product image uploads
- `/user-uploads/` - User uploaded content

## Important Notes

### Files That Should Be Committed
- `package.json` - Dependencies list
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `jest.config.js` - Jest testing configuration
- `playwright.config.ts` - Playwright configuration
- Source code files (`.ts`, `.tsx`, `.js`, `.jsx`)
- Configuration files (`.json`, `.js`, `.ts`)

### Files That Should NOT Be Committed
- Environment variables (`.env*`)
- Database files (`*.db`, `*.sqlite`)
- Uploaded content (`/uploads/`, `/public/uploads/`)
- Build outputs (`/.next/`, `/build/`)
- Dependencies (`/node_modules/`)
- Log files (`*.log`)
- IDE settings (`.vscode/`, `.idea/`)

## Setup Instructions

1. **Copy environment template:**
   ```bash
   cp env.example .env.local
   ```

2. **Edit `.env.local` with your values:**
   - Set your MongoDB connection string
   - Generate a strong JWT secret
   - Configure other environment variables

3. **Verify .gitignore is working:**
   ```bash
   git status
   ```
   - Should not show ignored files
   - Only show tracked files that have changes

## Common Issues

### Files Still Showing in Git Status
If ignored files are still showing in `git status`:

1. **Files were tracked before .gitignore:**
   ```bash
   git rm --cached filename
   git commit -m "Remove tracked file from git"
   ```

2. **Check .gitignore syntax:**
   - Ensure no trailing spaces
   - Use forward slashes for paths
   - Check for typos in patterns

### Environment Variables Not Loading
If environment variables aren't loading:

1. **Check file name:** Must be `.env.local` (not `.env.local.txt`)
2. **Check location:** Must be in project root
3. **Restart development server:** `npm run dev`

## Best Practices

1. **Never commit sensitive data:**
   - API keys
   - Database passwords
   - JWT secrets
   - Private keys

2. **Use environment-specific files:**
   - `.env.local` for local development
   - `.env.production` for production
   - `.env.test` for testing

3. **Regular cleanup:**
   - Remove unused files from .gitignore
   - Update patterns as project grows
   - Review ignored files periodically

4. **Team coordination:**
   - Document any custom .gitignore rules
   - Share environment setup instructions
   - Use consistent naming conventions
