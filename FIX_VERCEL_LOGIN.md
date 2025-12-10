# Fix: Invalid Login After Vercel Deployment

If you're seeing "Invalid credentials" after deploying to Vercel, follow these steps:

---

## Step 1: Verify Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and verify all 6 variables are set:

### Required Variables:

1. **MONGODB_URI**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/morning-roots?retryWrites=true&w=majority
   ```

2. **NEXTAUTH_SECRET**
   ```
   [Must be 32+ characters - generate at https://generate-secret.vercel.app/32]
   ```

3. **NEXTAUTH_URL** ⚠️ **MOST IMPORTANT**
   ```
   https://your-actual-app-name.vercel.app
   ```
   **Must match your actual Vercel URL exactly!**

4. **DEFAULT_ADMIN_EMAIL**
   ```
   admin@morningroots.com
   ```

5. **DEFAULT_ADMIN_PASSWORD**
   ```
   YourSecurePassword123!
   ```

6. **NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL**
   ```
   admin@morningroots.com
   ```

---

## Step 2: Fix NEXTAUTH_URL

**This is the #1 cause of login issues!**

1. **Get your actual Vercel URL**:
   - Go to Vercel dashboard → Your project
   - Copy the URL (e.g., `https://morning-roots-management.vercel.app`)

2. **Update NEXTAUTH_URL**:
   - Go to **Settings** → **Environment Variables**
   - Find `NEXTAUTH_URL`
   - Click **Edit**
   - Update to: `https://your-actual-url.vercel.app`
   - **No trailing slash!**

3. **Redeploy**:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment → **"Redeploy"**
   - Or push a new commit to trigger redeploy

---

## Step 3: Reset Admin Password

The admin user might not exist in your production database. Use one of these methods:

### Method 1: Use Reset API Route (Easiest)

1. **Call the reset endpoint**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/admin/reset-password \
     -H "Content-Type: application/json" \
     -d '{"password": "YourSecurePassword123!"}'
   ```

   Or use a tool like Postman/Insomnia:
   - **URL**: `https://your-app.vercel.app/api/admin/reset-password`
   - **Method**: POST
   - **Body** (JSON):
     ```json
     {
       "password": "YourSecurePassword123!"
     }
     ```
   - If you omit the password, it will use `DEFAULT_ADMIN_PASSWORD` from env vars

2. **Response will show**:
   ```json
   {
     "success": true,
     "message": "Admin password reset successfully",
     "email": "admin@morningroots.com",
     "password": "YourSecurePassword123!"
   }
   ```

3. **Try logging in** with those credentials

4. **⚠️ IMPORTANT**: After successful login, **delete or protect** the `/api/admin/reset-password` route for security!

### Method 2: Use MongoDB Atlas

1. Go to MongoDB Atlas → Your cluster → **"Browse Collections"**
2. Find the `users` collection
3. Check if admin user exists:
   - Look for email: `admin@morningroots.com`
4. If it doesn't exist or password is wrong:
   - Delete the existing user document (if any)
   - The app will auto-create it on next login attempt (if env vars are correct)

### Method 3: Use MongoDB Compass

1. Download: https://www.mongodb.com/try/download/compass
2. Connect using your MongoDB connection string
3. Navigate to `users` collection
4. Delete or update the admin user document
5. Restart your Vercel deployment

---

## Step 4: Verify NEXTAUTH_SECRET

1. **Generate a new secret** (if unsure):
   - Go to: https://generate-secret.vercel.app/32
   - Copy the generated secret

2. **Update in Vercel**:
   - Settings → Environment Variables
   - Update `NEXTAUTH_SECRET`
   - Redeploy

---

## Step 5: Clear Browser Data

Sometimes cached sessions cause issues:

1. **Clear cookies** for your Vercel domain
2. **Use incognito/private window** to test
3. **Try different browser**

---

## Step 6: Check Vercel Logs

1. Go to Vercel dashboard → Your project → **"Deployments"**
2. Click on the latest deployment
3. Check **"Functions"** tab for errors
4. Look for:
   - MongoDB connection errors
   - Authentication errors
   - Environment variable issues

---

## Common Issues & Solutions

### Issue: "Invalid credentials" but password is correct

**Solution:**
- ✅ Check `NEXTAUTH_URL` matches your actual URL exactly
- ✅ Verify `NEXTAUTH_SECRET` is set (32+ chars)
- ✅ Reset admin password using API route
- ✅ Check MongoDB connection string is correct

### Issue: "User not found"

**Solution:**
- ✅ Admin user doesn't exist in database
- ✅ Use reset API route to create it
- ✅ Or manually create in MongoDB Atlas

### Issue: "MongoDB connection failed"

**Solution:**
- ✅ Check `MONGODB_URI` is correct
- ✅ Verify network access allows `0.0.0.0/0` (or Vercel IPs)
- ✅ Check database user password is correct
- ✅ Ensure connection string includes database name

### Issue: Login works locally but not on Vercel

**Solution:**
- ✅ `NEXTAUTH_URL` is probably wrong (most common)
- ✅ Environment variables not set in Vercel
- ✅ Different database (local vs production)

---

## Quick Checklist

- [ ] All 6 environment variables set in Vercel
- [ ] `NEXTAUTH_URL` matches actual Vercel URL exactly
- [ ] `NEXTAUTH_SECRET` is 32+ characters
- [ ] `MONGODB_URI` is correct and accessible
- [ ] Admin password reset via API route
- [ ] Redeployed after changing environment variables
- [ ] Cleared browser cookies/cache
- [ ] Checked Vercel logs for errors

---

## Test Login

After fixing, try logging in with:

- **Email**: `admin@morningroots.com`
- **Password**: The value you set in `DEFAULT_ADMIN_PASSWORD`

---

## Security Note

**After successful login:**
1. ✅ Change the default password immediately
2. ✅ Delete or protect `/api/admin/reset-password` route
3. ✅ Consider restricting MongoDB network access to Vercel IPs only

---

## Still Not Working?

1. **Check Vercel Function Logs**:
   - Deployments → Latest → Functions tab
   - Look for error messages

2. **Test MongoDB Connection**:
   - Verify you can connect from outside (use MongoDB Compass)
   - Check network access settings

3. **Verify Environment Variables**:
   - Make sure all variables are set for **Production** environment
   - Check for typos or extra spaces

4. **Contact Support**:
   - Vercel: https://vercel.com/support
   - MongoDB Atlas: https://www.mongodb.com/support

---

**Most common fix: Update `NEXTAUTH_URL` to match your actual Vercel URL!** 🎯

