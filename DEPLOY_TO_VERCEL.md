# 🚀 Step-by-Step: Deploy to Vercel

## Your MongoDB Connection String
```
mongodb+srv://murtajizdev_db_user:slifeline123@cluster0.wt8x9uz.mongodb.net/morning-roots?retryWrites=true&w=majority
```

**Note:** I've added the database name `morning-roots` and query parameters to your connection string.

---

## Step 1: Push Code to GitHub (If Not Done)

1. **Create a GitHub repository** (if you haven't already)
   - Go to https://github.com/new
   - Name it (e.g., `morning-roots-management`)
   - Don't initialize with README
   - Click "Create repository"

2. **Push your code** (if not already pushed):
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Sign Up / Login to Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"** or **"Log In"**
3. **Sign up with GitHub** (recommended - easiest way)
   - Click **"Continue with GitHub"**
   - Authorize Vercel to access your GitHub account
4. Complete the setup

---

## Step 3: Import Your Repository

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories
3. Find your repository (e.g., `morning-roots-management`)
4. Click **"Import"** next to your repository

---

## Step 4: Configure Project Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset**: `Next.js` ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

**Don't click Deploy yet!** First, add environment variables.

---

## Step 5: Add Environment Variables

Click **"Environment Variables"** section and add these **6 variables**:

### Variable 1: MONGODB_URI
- **Key**: `MONGODB_URI`
- **Value**: 
  ```
  mongodb+srv://murtajizdev_db_user:slifeline123@cluster0.wt8x9uz.mongodb.net/morning-roots?retryWrites=true&w=majority
  ```
- **Environment**: Select all (Production, Preview, Development)

### Variable 2: NEXTAUTH_SECRET
- **Key**: `NEXTAUTH_SECRET`
- **Value**: Generate a random 32+ character string
  - Go to: https://generate-secret.vercel.app/32
  - Copy the generated secret
  - Or use this PowerShell command:
    ```powershell
    -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
    ```
- **Environment**: Select all

### Variable 3: NEXTAUTH_URL
- **Key**: `NEXTAUTH_URL`
- **Value**: `https://your-app-name.vercel.app`
  - ⚠️ **IMPORTANT**: Replace `your-app-name` with your actual Vercel app name
  - You'll get the actual URL after first deployment
  - For now, use a placeholder like: `https://morning-roots.vercel.app`
  - **We'll update this after deployment!**
- **Environment**: Select all

### Variable 4: DEFAULT_ADMIN_EMAIL
- **Key**: `DEFAULT_ADMIN_EMAIL`
- **Value**: `admin@morningroots.com`
- **Environment**: Select all

### Variable 5: DEFAULT_ADMIN_PASSWORD
- **Key**: `DEFAULT_ADMIN_PASSWORD`
- **Value**: `ChangeMe123!` (or your preferred password)
  - ⚠️ **Important**: Use a strong password!
- **Environment**: Select all

### Variable 6: NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL
- **Key**: `NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL`
- **Value**: `admin@morningroots.com`
- **Environment**: Select all

---

## Step 6: Deploy!

1. After adding all 6 environment variables, scroll down
2. Click **"Deploy"** button
3. Wait 2-5 minutes for the build to complete
4. You'll see a success message with your app URL!

---

## Step 7: Update NEXTAUTH_URL (CRITICAL!)

After deployment, you'll get your actual Vercel URL (e.g., `https://morning-roots-abc123.vercel.app`)

1. **Copy your actual Vercel URL** from the deployment page
2. Go to your project → **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL` and click **"Edit"**
4. Update the value to your **actual URL**:
   ```
   https://your-actual-app-name.vercel.app
   ```
   - **No trailing slash!**
   - **Must be https:// not http://**
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click **"..."** on the latest deployment → **"Redeploy"**
8. Wait for redeploy to complete

---

## Step 8: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://morning-roots-abc123.vercel.app`)
2. You should see the **login page**
3. Log in with:
   - **Email**: `admin@morningroots.com`
   - **Password**: `ChangeMe123!` (or what you set in `DEFAULT_ADMIN_PASSWORD`)
4. **IMPORTANT**: Change your password immediately after first login!

---

## Step 9: Verify MongoDB Connection

1. After logging in, try creating a student or teacher
2. If you see data being saved, MongoDB is connected! ✅
3. If you get errors, check:
   - MongoDB Network Access allows `0.0.0.0/0` (or Vercel IPs)
   - Connection string is correct
   - Database user has proper permissions

---

## Troubleshooting

### Build Fails?
- Check build logs in Vercel dashboard
- Verify all 6 environment variables are set correctly
- Check for typos in variable names (case-sensitive!)

### Can't Login?
- **Most common issue**: `NEXTAUTH_URL` doesn't match your actual Vercel URL
- Verify `NEXTAUTH_SECRET` is 32+ characters
- Clear browser cookies and try again
- Check Vercel function logs for errors

### MongoDB Connection Error?
1. Go to MongoDB Atlas → **Network Access**
2. Make sure `0.0.0.0/0` is allowed (or add Vercel IP ranges)
3. Verify your connection string is correct
4. Check database user permissions

### Environment Variables Not Working?
- Variables are only available after redeploy
- Make sure you selected all environments (Production, Preview, Development)
- Check for extra spaces in values
- Variable names are case-sensitive

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Repository imported to Vercel
- [ ] All 6 environment variables added
- [ ] Deployment successful
- [ ] NEXTAUTH_URL updated to actual URL
- [ ] Redeployed after updating NEXTAUTH_URL
- [ ] Tested login
- [ ] Changed default password
- [ ] Verified MongoDB connection

---

## Your App is Live! 🎉

Your Morning Roots Management System is now deployed at:
**https://your-app-name.vercel.app**

**Next Steps:**
- Share the URL with your team
- Set up a custom domain (optional)
- Monitor usage in Vercel dashboard
- Set up automatic backups for MongoDB

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Next.js Docs**: https://nextjs.org/docs

**Happy Deploying! 🚀**

