# 🔓 Configure MongoDB Atlas Network Access

This guide will help you allow Vercel to connect to your MongoDB Atlas database.

---

## Step 1: Log in to MongoDB Atlas

1. Go to **https://cloud.mongodb.com**
2. Log in with your MongoDB Atlas account

---

## Step 2: Select Your Project

1. If you have multiple projects, select the project that contains your cluster
2. You should see your cluster (e.g., `Cluster0`)

---

## Step 3: Configure Network Access

### Option A: Allow Access from Anywhere (Easiest - For Testing)

1. In the left sidebar, click **"Network Access"** (under Security)
2. Click **"Add IP Address"** button (top right)
3. You'll see a dialog box
4. Click **"Allow Access from Anywhere"** button
   - This automatically sets the IP address to `0.0.0.0/0`
5. Optionally, add a comment: `"Vercel deployment"`
6. Click **"Confirm"**
7. Wait 1-2 minutes for the change to take effect

**⚠️ Security Note:** 
- `0.0.0.0/0` allows access from ANY IP address
- This is fine for testing and small projects
- For production, consider restricting to Vercel IP ranges (see Option B)

---

### Option B: Allow Only Vercel IPs (More Secure - Recommended for Production)

Vercel uses specific IP ranges. You can add these:

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Add Current IP Address"** (this adds your current IP)
4. Then add these Vercel IP ranges one by one:

**Vercel IP Ranges:**
```
76.76.21.0/24
76.223.126.0/24
```

Or you can use these broader ranges:
```
76.76.21.0/24
76.223.126.0/24
```

**Note:** Vercel's IP ranges can change. For the most up-to-date list, check:
- Vercel's documentation
- Or use `0.0.0.0/0` for simplicity (Option A)

---

## Step 4: Verify Network Access

1. After adding IP addresses, you should see them in the Network Access list
2. Status should show as **"Active"** (green)
3. If it shows "Pending", wait a minute and refresh

---

## Step 5: Test Your Connection

After configuring network access:

1. **Redeploy on Vercel** (if already deployed):
   - Go to Vercel dashboard
   - Click on your project
   - Go to "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"

2. **Or test locally** with your connection string:
   ```powershell
   # Test MongoDB connection
   node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb+srv://murtajizdev_db_user:slifeline123@cluster0.wt8x9uz.mongodb.net/morning-roots?retryWrites=true&w=majority').then(() => console.log('✅ Connected!')).catch(err => console.error('❌ Error:', err.message))"
   ```

---

## Step 6: Verify Database User Permissions

Make sure your database user has proper permissions:

1. In MongoDB Atlas, go to **"Database Access"** (left sidebar)
2. Find your user: `murtajizdev_db_user`
3. Click **"Edit"** (pencil icon)
4. Under **"Database User Privileges"**, make sure it's set to:
   - **"Atlas admin"** (full access), OR
   - **"Read and write to any database"**
5. Click **"Update User"**

---

## Troubleshooting

### Still Getting "Invalid Credentials" Error?

1. **Wait 2-3 minutes** after adding IP address (takes time to propagate)
2. **Redeploy on Vercel** after changing network access
3. **Check your connection string**:
   - Make sure password is correct: `slifeline123`
   - Make sure database name is included: `morning-roots`
   - Full string: `mongodb+srv://murtajizdev_db_user:slifeline123@cluster0.wt8x9uz.mongodb.net/morning-roots?retryWrites=true&w=majority`

4. **Verify environment variables in Vercel**:
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Check `MONGODB_URI` is set correctly
   - Make sure `NEXTAUTH_URL` matches your actual Vercel URL

5. **Check Vercel Function Logs**:
   - Go to Vercel → Your Project → Deployments
   - Click on latest deployment
   - Click "Functions" tab
   - Look for errors related to MongoDB connection

6. **Test MongoDB connection directly**:
   - Use MongoDB Compass or a connection test script
   - Verify the connection string works

---

## Quick Checklist

- [ ] Logged into MongoDB Atlas
- [ ] Went to "Network Access"
- [ ] Added IP address (0.0.0.0/0 or Vercel IPs)
- [ ] Status shows "Active"
- [ ] Verified database user permissions
- [ ] Redeployed on Vercel
- [ ] Tested login again

---

## Visual Guide

**Network Access Page:**
```
MongoDB Atlas Dashboard
├── Security (left sidebar)
│   ├── Database Access
│   └── Network Access ← Click here
│       └── Add IP Address button (top right)
│           └── Allow Access from Anywhere
│               └── Confirm
```

---

## Still Having Issues?

If you're still getting "Invalid credentials" after configuring network access:

1. **Reset admin password** using the reset endpoint:
   - `POST https://your-app.vercel.app/api/admin/reset-password`
   - This will create/reset the admin user in your database

2. **Check Vercel logs** for specific error messages

3. **Verify NEXTAUTH_URL** matches your actual Vercel URL exactly

---

**Once network access is configured, your Vercel deployment should be able to connect to MongoDB!** 🎉

