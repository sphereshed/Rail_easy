# Fix: Send Email Confirmation on Signup (Not Password Reset)

## Problem
During signup, users are receiving **password reset emails** instead of **email confirmation emails**.

## Root Cause
Supabase is configured to send the wrong email template. The authentication settings must explicitly enable email confirmations for signup flow.

## Solution

### Step 1: Configure Supabase Email Provider

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project: **Rail_easy** (bympgnknrvaqttiofjyv)
3. Navigate to: **Authentication → Providers → Email**

### Step 2: Enable Email Confirmations

Look for these settings and ensure they are configured correctly:

**Email Confirmations:**
- ✅ Enable **"Confirm email"** toggle (should be ON)
- This sends a verification email when users sign up

**Email Provider Settings:**
- Make sure you're using the **default Supabase email provider** (or configure SMTP if using custom)
- The redirect URL should be: `http://localhost:5173/auth/callback` (for development)

### Step 3: Verify Email Templates

1. Go to **Authentication → Email Templates**
2. Make sure you have **two separate templates**:
   - **Confirmation Email** (for signup verification)
   - **Password Reset Email** (for password recovery)

The confirmation email template should have a link like:
```
{{ .ConfirmationURL }}
```

### Step 4: Check Auth Settings

Navigate to **Authentication → Policies** and verify:
- Email confirmations are required before user can log in
- This ensures the signup flow sends confirmation emails, not password reset

### Step 5: Restart Your App

After making these changes:
```bash
npm run dev
```

Then test by:
1. Going to signup page
2. Creating a new account
3. Check your email - you should receive a **confirmation email** with a verification link
4. Click the link to verify your email
5. Then you can log in

## If You're Still Receiving Password Reset Emails

This usually means:
1. The "Confirm email" setting is OFF in your Supabase dashboard
2. OR you're using a custom email template that's sending the wrong type of link
3. OR your email provider is configured to send password reset by default

**Quick Debug:**
- Check the email you're receiving - if it says "Reset your password", that's the password reset template
- Check your Supabase console logs for what email type is being triggered

## Code Changes Made

The `useAuth.tsx` file has been updated:
- Added `shouldCreateUser: true` option to signUp to ensure proper user creation
- Updated `resendConfirmationEmail` to use proper Supabase APIs

These changes work with Supabase's confirmation email system when properly configured.

## Still Having Issues?

If the problem persists after following these steps, you may need to:
1. Check Supabase logs: **Logs → Auth Logs**
2. Verify your email provider settings in Supabase
3. Ensure the redirect URL is correct in your authentication settings
