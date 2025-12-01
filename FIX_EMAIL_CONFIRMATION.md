# Fix: Send Email Confirmation Instead of Password Reset on Signup

## Problem
When users sign up, they receive a **password reset email** instead of an **email confirmation email**.

## Solution

### Step 1: Go to Supabase Dashboard
1. Visit https://app.supabase.com
2. Select your project: **Rail_easy** (bympgnknrvaqttiofjyv)
3. Navigate to **Authentication** in the left sidebar

### Step 2: Configure Email Provider

1. Click on **Providers** → **Email**
2. Look for the **Confirm email** section
3. Make sure **Email confirmations** is **ENABLED** ✅
   - Toggle should be ON (not OFF)
   - This ensures users receive confirmation emails on signup

### Step 3: Verify Email Settings

1. Still in **Authentication → Providers → Email**
2. Check these settings:
   - ✅ "Confirm email" should be toggled **ON**
   - ✅ "Self sign-ups disabled" should be toggled **OFF**
   - ✅ Redirect URL should be: `http://localhost:5173/auth/callback` (for development)

### Step 4: Check Email Templates

1. Go to **Authentication → Email Templates**
2. You should see two templates:
   - **Confirm signup**: This sends confirmation emails ✅
   - **Reset Password**: This sends password reset emails
3. Make sure the **Confirm signup** template is properly configured

### Step 5: Test the Fix

1. Sign up with a new email
2. Check your inbox - you should receive a **confirmation email** (not a password reset email)
3. Click the confirmation link to verify your email

## If Still Receiving Password Reset Emails

This means Supabase is configured to use password reset flow instead of confirmation flow. To fix:

1. In Supabase Dashboard, go to **Authentication → Policies**
2. Find the setting: **"Require email confirmation before signing in"**
3. Make sure it's **ENABLED**
4. This will force the confirmation email flow

## Technical Details

The code has been updated to:
- Use standard `signUp()` method with proper `emailRedirectTo`
- Avoid triggering password reset flows
- Properly handle email confirmation verification

When configured correctly, users will see this flow:
1. Sign up → Confirmation email sent
2. User clicks link in email → Email verified
3. User can now log in

## Support

If you're still having issues:
1. Check Supabase email logs: **Logs → Auth Logs**
2. Verify SMTP configuration if using custom email provider
3. Check spam/junk folder for emails
4. Ensure redirect URL matches your app's domain

## Vehicle Type Options

The driver profile form now includes these vehicle type options:
- Bike/Scooter
- Auto/Rickshaw
- Sedan
- SUV

These are displayed in a dropdown menu on the Edit Profile page.
