# 🔧 FIX SIGNUP/LOGIN DATABASE ERROR

## Problem
You're getting this error:
```
❌ Supabase signup error: AuthApiError: Database error saving new user
```

## Root Cause
Your Supabase database is missing:
- The `profiles` table
- The `drivers` table  
- The database triggers that auto-create profile records when users sign up

## ✅ SOLUTION

### Step 1: Apply SQL Fix to Supabase

#### 🌟 **Method A: Using Supabase Dashboard (Easiest)**

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Login to your account

2. **Select Your Project**
   - Click on project: `tojbjsjpgkessgmgcuqw`

3. **Open SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"** button

4. **Run the Fix**
   - Open the file: `supabase/SIMPLE_FIX.sql` in your code editor
   - Copy **ALL** the content
   - Paste it into the Supabase SQL Editor
   - Click **"Run"** (or press Ctrl+Enter)

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - Go to **"Table Editor"** in the sidebar
   - You should now see:
     - ✓ `profiles` table
     - ✓ `drivers` table

---

#### 📋 **Method B: Using PowerShell Script**

Run this command in PowerShell from your project root:

```powershell
.\scripts\apply-supabase-fix.ps1
```

> **Note:** This requires Supabase CLI. If not installed, follow Method A instead.

---

### Step 2: Test Signup

1. **Clear Browser Cache** (Optional but recommended)
   - Press `Ctrl + Shift + Delete`
   - Clear cached images and files

2. **Go to Your App**
   - Navigate to: http://localhost:5173/auth
   - Or click "Sign Up" in your app

3. **Try Signing Up**
   - Fill in:
     - **Full Name:** Test User
     - **Email:** test@example.com
     - **Password:** password123
     - **Confirm Password:** password123
   - Click **"Create Account"**

4. **Expected Result** ✅
   - Success message: "Account created! Please check your email to verify your account."
   - Check your email inbox (and spam folder) for verification email

---

## 🐛 Still Having Issues?

### Issue: "Email already exists"
**Solution:** The user was created in auth but the profile failed. You need to:
1. Go to Supabase Dashboard → Authentication → Users
2. Delete the test user
3. Re-run the SQL fix (Method A above)
4. Try signing up again

### Issue: "Failed to load resource: net::ERR_CONNECTION_REFUSED"
**Solution:** Your local dev server isn't running
```powershell
npm run dev
```

### Issue: SQL Editor shows an error
**Solution:** You might have existing tables. Run this first:
```sql
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```
Then run the full `SIMPLE_FIX.sql` again.

---

## 📚 What the SQL Fix Does

The `SIMPLE_FIX.sql` script:

1. **Drops** any existing broken tables and triggers
2. **Creates** `profiles` table for all users
3. **Creates** `drivers` table for driver-specific data
4. **Sets up** Row Level Security (RLS) policies
5. **Creates** trigger functions that auto-populate these tables
6. **Activates** triggers on user signup

This ensures that whenever someone signs up:
- An entry is automatically created in `profiles`
- If they're a driver, an entry is also created in `drivers`

---

## ✨ Quick Reference

| File | Purpose |
|------|---------|
| `supabase/SIMPLE_FIX.sql` | Complete database fix (run this!) |
| `scripts/apply-supabase-fix.ps1` | PowerShell script to apply fix |
| `SIGNUP_LOGIN_FIX_GUIDE.txt` | Detailed troubleshooting guide |

---

## 🎯 After Fixing

Once the database is set up correctly, you should be able to:
- ✅ Sign up new users
- ✅ Sign up as a driver (checkbox)
- ✅ Log in with existing accounts
- ✅ Reset passwords
- ✅ Access driver dashboard (drivers only)

---

## Need More Help?

If you're still stuck:
1. Check the browser console (F12) for detailed errors
2. Check Supabase Dashboard → Logs for backend errors
3. Make sure you're using the correct project: `tojbjsjpgkessgmgcuqw`

**Last Updated:** November 16, 2025
