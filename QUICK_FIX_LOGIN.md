# Quick Fix: Invalid Credentials on Vercel

## Step-by-Step Fix

### Step 1: Verify NEXTAUTH_URL (Most Important!)

1. **Get your actual Vercel URL**:
   - Go to Vercel Dashboard → Your Project
   - Copy the URL (e.g., `https://morning-roots-management.vercel.app`)

2. **Update NEXTAUTH_URL**:
   - Vercel → Settings → Environment Variables
   - Find `NEXTAUTH_URL`
   - **Must be exactly**: `https://your-actual-url.vercel.app`
   - **No trailing slash!**
   - **Must be https:// not http://**

3. **Redeploy**:
   - Go to Deployments → Click "..." → "Redeploy"

### Step 2: Reset Admin Password via API

The admin user might not exist in your production database. Reset it:

**Option A: Using Browser/Postman**

1. **URL**: `https://your-app.vercel.app/api/admin/reset-password`
2. **Method**: POST
3. **Headers**: `Content-Type: application/json`
4. **Body**:
   ```json
   {
     "password": "YourSecurePassword123!"
   }
   ```
   *(Use the same password as in `DEFAULT_ADMIN_PASSWORD`)*

5. **Response should be**:
   ```json
   {
     "success": true,
     "email": "admin@morningroots.com",
     "password": "YourSecurePassword123!"
   }
   ```

**Option B: Using cURL (Terminal)**

```bash
curl -X POST https://your-app.vercel.app/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{"password": "YourSecurePassword123!"}'
```

### Step 3: Verify All Environment Variables

Check these are set correctly in Vercel:

- ✅ `MONGODB_URI` - Correct connection string
- ✅ `NEXTAUTH_SECRET` - 32+ characters
- ✅ `NEXTAUTH_URL` - Matches your actual URL exactly
- ✅ `DEFAULT_ADMIN_EMAIL` - admin@morningroots.com
- ✅ `DEFAULT_ADMIN_PASSWORD` - Your password
- ✅ `NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL` - admin@morningroots.com

### Step 4: Check Vercel Logs

1. Go to Vercel → Your Project → Deployments
2. Click latest deployment → "Functions" tab
3. Look for errors related to:
   - MongoDB connection
   - Authentication
   - Environment variables

### Step 5: Test Login

After resetting password:
- **Email**: `admin@morningroots.com`
- **Password**: The value from `DEFAULT_ADMIN_PASSWORD`

---

## Common Issues

### Issue: "Invalid credentials" but password is correct

**Fix:**
1. ✅ `NEXTAUTH_URL` must match your actual Vercel URL exactly
2. ✅ Call `/api/admin/reset-password` to create/reset admin user
3. ✅ Redeploy after changing environment variables

### Issue: API route returns error

**Check:**
- MongoDB connection string is correct
- Network access allows 0.0.0.0/0 (or Vercel IPs)
- Database user has proper permissions

### Issue: Still not working

**Try:**
1. Clear browser cookies for your Vercel domain
2. Use incognito/private window
3. Check Vercel function logs for specific errors
4. Verify MongoDB Atlas cluster is running

---

## Quick Checklist

- [ ] `NEXTAUTH_URL` = `https://your-actual-vercel-url.vercel.app` (exact match)
- [ ] Called `/api/admin/reset-password` API route
- [ ] All 6 environment variables set in Vercel
- [ ] Redeployed after changing environment variables
- [ ] Cleared browser cookies
- [ ] Checked Vercel logs for errors

---

**Most likely fix: Update NEXTAUTH_URL to match your actual Vercel URL exactly!**


