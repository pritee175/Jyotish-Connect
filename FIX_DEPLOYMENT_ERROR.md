# 🔧 Fix Firebase 401 Error

## The Problem
You're seeing: `Firebase: Error (auth/invalid-api-key)` or 401 errors.

This happens because either:
1. Environment variables are missing in Vercel
2. Your Vercel domain isn't authorized in Firebase

## ✅ Solution - Follow These Steps:

### Step 1: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click on your project**: `jyotish-connect`
3. **Go to Settings** → **Environment Variables**
4. **Add each variable** (click "Add" for each one):

```
Name: VITE_FIREBASE_API_KEY
Value: AIzaSyCGz-jIlgoSoSmmenXxBPtAWO69obpweRQ
Environment: Production ✓
```

```
Name: VITE_FIREBASE_AUTH_DOMAIN
Value: jyotish-connect.firebaseapp.com
Environment: Production ✓
```

```
Name: VITE_FIREBASE_PROJECT_ID
Value: jyotish-connect
Environment: Production ✓
```

```
Name: VITE_FIREBASE_STORAGE_BUCKET
Value: jyotish-connect.firebasestorage.app
Environment: Production ✓
```

```
Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 826989991466
Environment: Production ✓
```

```
Name: VITE_FIREBASE_APP_ID
Value: 1:826989991466:web:d70517d07450a7a9725553
Environment: Production ✓
```

```
Name: VITE_ADMIN_UID
Value: qakPJ9dO67XBLmN3NK6Us7UDfjG3
Environment: Production ✓
```

```
Name: VITE_ADMIN_UPI
Value: astrologer@upi
Environment: Production ✓
```

5. **After adding all variables**, click **"Redeploy"** in the Deployments tab

### Step 2: Authorize Vercel Domain in Firebase

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `jyotish-connect`
3. **Go to Authentication** → **Settings** → **Authorized domains**
4. **Click "Add domain"**
5. **Add your Vercel domain**:
   - Find your exact domain from Vercel (e.g., `jyotish-connect-git-main-karpepriteee71-gmailcoms-projects.vercel.app`)
   - Or add the pattern: `*.vercel.app` (this covers all Vercel deployments)
6. **Click "Add"**

### Step 3: Redeploy

1. Go back to **Vercel Dashboard** → Your project
2. Go to **Deployments** tab
3. Click the **three dots (...)** on the latest deployment
4. Click **"Redeploy"**
5. Wait 2-3 minutes for the new deployment

## 🎯 Quick Check - Did You Add Variables?

To verify environment variables are set:

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. You should see 8 variables listed
3. Each should have "Production" checked

## 🔍 Alternative: Check Your Exact Vercel URL

Your deployment URL might be different. Check:

1. Vercel Dashboard → Your Project → Deployments
2. Copy the exact URL (e.g., `jyotish-connect-abc123.vercel.app`)
3. Add that exact URL to Firebase authorized domains

## 📱 After Fix

Once you've:
- ✅ Added all 8 environment variables to Vercel
- ✅ Added Vercel domain to Firebase authorized domains
- ✅ Redeployed

Your app should work! Test by:
1. Opening the Vercel URL
2. You should see the login page (not errors)
3. Try logging in with a phone number

## 🆘 Still Not Working?

### Check Firebase Project Status:
1. Go to Firebase Console
2. Make sure the project is active (not paused)
3. Check if Phone Authentication is enabled:
   - Authentication → Sign-in method → Phone → Enabled

### Check Browser Console:
1. Open your deployed site
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for specific error messages
5. Share the error if you need more help

## 💡 Pro Tip

After fixing, you can set up a custom domain:
1. Vercel → Settings → Domains
2. Add your domain (e.g., `jyotishconnect.com`)
3. Update Firebase authorized domains with your custom domain
4. Much cleaner URL for customers!

---

**The most common issue is forgetting to add environment variables to Vercel!**
Make sure all 8 variables are added and redeploy.
