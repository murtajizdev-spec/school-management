# 🚀 Deploy to Vercel - Quick Guide

Your code is on GitHub! Now let's deploy it to Vercel.

---

## Step 1: Set Up MongoDB Atlas (If Not Done)

### 1.1 Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a **FREE M0 cluster**

### 1.2 Configure Database
1. **Database Access** → Add database user
   - Username: `visionadmin` (or your choice)
   - Password: Generate secure password (SAVE IT!)
   - Privileges: Atlas admin

2. **Network Access** → Add IP Address
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Click "Confirm"

3. **Get Connection String**
   - Go to **Database** → Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `morning-roots`

**Example:**
```
mongodb+srv://visionadmin:YourPassword123@cluster0.xxxxx.mongodb.net/morning-roots?retryWrites=true&w=majority
```

---

## Step 2: Deploy to Vercel

### 2.1 Sign Up / Login to Vercel
1. Go to: https://vercel.com
2. Sign up with GitHub (recommended) or email
3. Complete the setup

### 2.2 Import Your Repository
1. Click **"Add New..."** → **"Project"**
2. **Import Git Repository**:
   - Find your repository: `murtajizdev-spec/project` (or your repo name)
   - Click **"Import"**

### 2.3 Configure Project Settings
- **Framework Preset**: Next.js (auto-detected) ✅
- **Root Directory**: `./` (default) ✅
- **Build Command**: `npm run build` (default) ✅
- **Output Directory**: `.next` (default) ✅
- **Install Command**: `npm install` (default) ✅

**Click "Environment Variables"** to add:

### 2.4 Add Environment Variables

Click **"Environment Variables"** and add these **6 variables**:

#### 1. MONGODB_URI
```
Key: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/morning-roots?retryWrites=true&w=majority
```
*(Replace with your actual MongoDB connection string)*

#### 2. NEXTAUTH_SECRET
```
Key: NEXTAUTH_SECRET
Value: [Generate a 32+ character random string]
```
**Generate secret:**
- Online: https://generate-secret.vercel.app/32
- Or run: `openssl rand -base64 32`

#### 3. NEXTAUTH_URL
```
Key: NEXTAUTH_URL
Value: https://your-app-name.vercel.app
```
⚠️ **Note**: Update this AFTER first deployment with your actual Vercel URL

#### 4. DEFAULT_ADMIN_EMAIL
```
Key: DEFAULT_ADMIN_EMAIL
Value: admin@morningroots.com
```

#### 5. DEFAULT_ADMIN_PASSWORD
```
Key: DEFAULT_ADMIN_PASSWORD
Value: YourSecurePassword123!
```
⚠️ **Important**: Change this to a strong password!

#### 6. NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL
```
Key: NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL
Value: admin@morningroots.com
```

### 2.5 Deploy!
1. Click **"Deploy"** button
2. Wait 2-5 minutes for build to complete
3. ✅ Your app will be live!

---

## Step 3: Update NEXTAUTH_URL (After First Deploy)

1. After deployment, copy your app URL (e.g., `https://morning-roots.vercel.app`)
2. Go to **Project Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL` and click **Edit**
4. Update value to your actual URL: `https://your-actual-url.vercel.app`
5. Click **"Redeploy"** or wait for auto-redeploy

---

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. You should see the login page
3. Log in with:
   - **Email**: `admin@morningroots.com`
   - **Password**: `YourSecurePassword123!` (or what you set)
4. **IMPORTANT**: Change the password immediately after first login!

---

## Step 5: (Optional) Seed Demo Data

If you want to add 100 students and 20 teachers for testing:

### Option 1: Use MongoDB Compass
1. Download: https://www.mongodb.com/try/download/compass
2. Connect using your MongoDB connection string
3. Run the seed script locally pointing to production DB

### Option 2: Create Temporary API Route
Create `/api/seed` endpoint (one-time use, then delete)

---

## Troubleshooting

### Build Fails?
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Check MongoDB connection string format

### Can't Login?
- Verify `NEXTAUTH_SECRET` is set (32+ characters)
- Check `NEXTAUTH_URL` matches your actual Vercel URL
- Clear browser cookies

### MongoDB Connection Error?
- Verify network access allows `0.0.0.0/0` (or Vercel IPs)
- Check connection string has correct password
- Ensure database user has proper permissions

### Environment Variables Not Working?
- Redeploy after adding/changing variables
- Check for typos in variable names (case-sensitive)
- Verify no extra spaces in values

---

## Quick Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied
- [ ] Vercel account created
- [ ] Repository imported
- [ ] All 6 environment variables added
- [ ] Deployment successful
- [ ] NEXTAUTH_URL updated after first deploy
- [ ] Tested login
- [ ] Changed default password

---

## Your App is Live! 🎉

Once deployed, your Morning Roots Management System will be accessible at:
`https://your-app-name.vercel.app`

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

---

**Happy Deploying! 🚀**

