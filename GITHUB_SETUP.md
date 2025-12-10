# GitHub Repository Setup Guide

## Issue: Repository Not Found

The remote repository doesn't exist yet. Follow these steps to fix it:

## Option 1: Create Repository on GitHub (Recommended)

### Step 1: Create Repository on GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name**: `morning-roots-management` (or your preferred name)
   - **Description**: "Morning Roots Management System - Next.js + MongoDB"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

### Step 2: Update Remote URL

After creating the repository, update your remote URL:

```bash
git remote set-url origin https://github.com/murtajizdev-spec/morning-roots-management.git
```

Replace `morning-roots-management` with your actual repository name.

### Step 3: Push Your Code

```bash
git push -u origin main
```

If prompted for authentication:
- **Personal Access Token**: Use a GitHub Personal Access Token (not password)
- **How to create token**: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
- **Required scopes**: `repo` (full control of private repositories)

---

## Option 2: Use Existing Repository

If you already have a repository, update the remote URL:

```bash
git remote set-url origin https://github.com/yourusername/your-repo-name.git
```

Then push:
```bash
git push -u origin main
```

---

## Option 3: Use SSH (Alternative)

If you prefer SSH authentication:

1. **Update remote to SSH**:
   ```bash
   git remote set-url origin git@github.com:murtajizdev-spec/your-repo-name.git
   ```

2. **Push**:
   ```bash
   git push -u origin main
   ```

---

## Authentication Methods

### Method 1: Personal Access Token (Recommended)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Morning Roots Deployment")
4. Select scopes: **`repo`** (full control)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. When pushing, use the token as your password

### Method 2: GitHub CLI

```bash
# Install GitHub CLI
# Windows: winget install GitHub.cli
# Or download from: https://cli.github.com

# Authenticate
gh auth login

# Push
git push -u origin main
```

### Method 3: SSH Keys

1. Generate SSH key (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. Add to GitHub:
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste and save

3. Update remote to SSH and push

---

## Quick Fix Commands

If you've created the repository, run these commands:

```bash
# Update remote URL (replace with your repo name)
git remote set-url origin https://github.com/murtajizdev-spec/morning-roots-management.git

# Verify remote
git remote -v

# Push to GitHub
git push -u origin main
```

---

## Troubleshooting

### "Repository not found"
- ✅ Make sure the repository exists on GitHub
- ✅ Check the repository name is correct
- ✅ Verify you have access to the repository

### "Authentication failed"
- ✅ Use Personal Access Token instead of password
- ✅ Make sure token has `repo` scope
- ✅ Token might be expired (generate a new one)

### "Permission denied"
- ✅ Check if you have write access to the repository
- ✅ Verify your GitHub account has access

---

## After Successful Push

Once your code is on GitHub, you can:

1. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Follow the deployment guide in `DEPLOYMENT.md`

2. **View your code**:
   - Visit: `https://github.com/murtajizdev-spec/your-repo-name`

---

**Need help?** Check GitHub's documentation: [docs.github.com](https://docs.github.com)

