# Deploying Morning Roots Management System to Vercel

This guide will walk you through deploying your application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
2. **MongoDB Atlas Account**: Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
3. **GitHub/GitLab/Bitbucket Account**: For connecting your repository

---

## Step 1: Set Up MongoDB Atlas

### 1.1 Create a MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click **"Create"** → **"Deploy a cloud database"**
4. Choose **"M0 FREE"** (Free tier)
5. Select a cloud provider and region (choose closest to your users)
6. Click **"Create Deployment"**

### 1.2 Configure Database Access

1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username and generate a secure password (save it!)
5. Set privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### 1.3 Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For testing, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **Note**: For production, restrict to Vercel's IP ranges or your specific IPs
4. Click **"Confirm"**

### 1.4 Get Your Connection String

1. Go to **"Database"** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with your database name (e.g., `morning-roots`)
6. **Save this connection string** - you'll need it for Vercel

**Example connection string:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/morning-roots?retryWrites=true&w=majority
```

---

## Step 2: Prepare Your Code for Deployment

### 2.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2.2 Push to GitHub/GitLab/Bitbucket

1. Create a new repository on GitHub/GitLab/Bitbucket
2. Push your code:

```bash
git remote add origin https://github.com/yourusername/morning-roots.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. Click **"Add New..."** → **"Project"**
3. **Import your Git repository**:
   - Connect your GitHub/GitLab/Bitbucket account if not already connected
   - Select your repository
   - Click **"Import"**

4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Add Environment Variables**:
   Click **"Environment Variables"** and add the following:

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/morning-roots?retryWrites=true&w=majority
   ```

   ```
   NEXTAUTH_SECRET=your-super-secret-random-string-here-min-32-chars
   ```
   💡 **Generate a secure secret**: Run `openssl rand -base64 32` in terminal or use [this generator](https://generate-secret.vercel.app/32)

   ```
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ```
   ⚠️ **Note**: Update this after first deployment with your actual Vercel URL

   ```
   DEFAULT_ADMIN_EMAIL=admin@morningroots.com
   ```

   ```
   DEFAULT_ADMIN_PASSWORD=ChangeMe123!
   ```
   ⚠️ **Important**: Change this to a strong password after first login!

   ```
   NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL=admin@morningroots.com
   ```

6. **Deploy**:
   - Click **"Deploy"**
   - Wait for the build to complete (2-5 minutes)

7. **Update NEXTAUTH_URL**:
   - After deployment, copy your app URL (e.g., `https://morning-roots.vercel.app`)
   - Go to **Project Settings** → **Environment Variables**
   - Update `NEXTAUTH_URL` with your actual URL
   - Redeploy (or it will auto-redeploy on next push)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Link to existing project or create new one
   - Add environment variables when prompted

4. **Set Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add DEFAULT_ADMIN_EMAIL
   vercel env add DEFAULT_ADMIN_PASSWORD
   vercel env add NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

## Step 4: Post-Deployment Steps

### 4.1 Verify Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. You should be redirected to `/login`
3. Log in with:
   - **Email**: `admin@morningroots.com`
   - **Password**: `ChangeMe123!` (or whatever you set)

### 4.2 Change Default Password

1. After logging in, go to your profile/settings
2. Use the "Change Password" feature
3. Set a strong, unique password

### 4.3 (Optional) Seed Demo Data

If you want to populate the database with sample data:

1. **Option 1: Use Vercel CLI** (if you have access):
   ```bash
   vercel env pull .env.local
   npm run seed
   ```

2. **Option 2: Use MongoDB Atlas Shell**:
   - Connect via MongoDB Compass or Atlas Data Explorer
   - Manually add test data

3. **Option 3: Create a one-time API route** (for initial setup only):
   - Create `/api/seed` endpoint
   - Call it once, then remove it

---

## Step 5: Configure Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` environment variable to your custom domain

---

## Troubleshooting

### Build Fails

- **Check build logs** in Vercel dashboard
- **Verify environment variables** are set correctly
- **Ensure MongoDB connection string** is valid
- **Check Node.js version** (Vercel auto-detects, but you can specify in `package.json`)

### Can't Connect to MongoDB

- **Verify Network Access**: Ensure MongoDB Atlas allows `0.0.0.0/0` or Vercel IPs
- **Check Connection String**: Ensure password is URL-encoded if it contains special characters
- **Verify Database User**: Ensure user has proper permissions

### Authentication Issues

- **Check NEXTAUTH_SECRET**: Must be at least 32 characters
- **Verify NEXTAUTH_URL**: Must match your actual Vercel URL exactly
- **Clear browser cookies** and try again

### Environment Variables Not Working

- **Redeploy** after adding/changing environment variables
- **Check variable names** (case-sensitive)
- **Verify no extra spaces** in values

---

## Security Best Practices

1. ✅ **Change default admin password** immediately after first login
2. ✅ **Use strong NEXTAUTH_SECRET** (32+ random characters)
3. ✅ **Restrict MongoDB network access** to Vercel IPs in production
4. ✅ **Use environment variables** for all secrets (never commit to Git)
5. ✅ **Enable MongoDB Atlas encryption** at rest
6. ✅ **Regular backups** of your MongoDB database

---

## Monitoring & Maintenance

### View Logs

- Go to Vercel dashboard → Your project → **"Deployments"** → Click a deployment → **"Functions"** tab
- Or use Vercel CLI: `vercel logs`

### Database Monitoring

- MongoDB Atlas dashboard shows:
  - Connection metrics
  - Storage usage
  - Query performance

### Updates

- **Automatic**: Every push to your main branch triggers a new deployment
- **Manual**: Go to Vercel dashboard → **"Deployments"** → **"Redeploy"**

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

## Quick Reference: Environment Variables

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
NEXTAUTH_SECRET=your-32-char-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
DEFAULT_ADMIN_EMAIL=admin@morningroots.com
DEFAULT_ADMIN_PASSWORD=YourSecurePassword123!
NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL=admin@morningroots.com
```

---

**🎉 Congratulations! Your Morning Roots Management System is now live on Vercel!**

