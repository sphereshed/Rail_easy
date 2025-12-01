# Fix Supabase Email Confirmation Links for Vercel Deployment

## Problem
Supabase is sending email confirmation links with `localhost` URLs instead of your Vercel production URL.

## Solution

### Step 1: Get Your Vercel URL
1. Go to your Vercel project: https://vercel.com/dashboard
2. Find your Rail_easy project
3. Copy your production URL (e.g., `https://rail-easy.vercel.app`)

### Step 2: Configure Supabase Redirect URLs
1. Go to https://app.supabase.com
2. Select your project (bympgnknrvaqttiofjyv)
3. Navigate to **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add both:
   - `http://localhost:5173/auth/callback` (for local development)
   - `https://YOUR-VERCEL-URL.vercel.app/auth/callback` (replace with your actual Vercel URL)
   - `https://YOUR-VERCEL-URL.vercel.app/auth/callback?type=confirmation` (for confirmation emails)
   - `https://YOUR-VERCEL-URL.vercel.app/auth/callback?type=recovery` (for password reset)

### Step 3: Enable Email Provider (if not already done)
1. Go to **Authentication** → **Providers**
2. Click on **Email**
3. Enable **Email/Password**
4. Under **Email Templates**, verify that **Confirmation** email is enabled
5. Click on **Confirmation** email template and check the redirect link includes your domain

### Step 4: Test the Configuration
1. Deploy your changes to Vercel
2. Try signing up from your Vercel URL
3. Check the email - the confirmation link should now have your Vercel domain
4. Click the confirmation link and verify it redirects correctly

### Step 5: Environment Variables (if needed)
If you want to use environment variables for the URL, create a `.env.local`:
```
VITE_APP_URL=https://YOUR-VERCEL-URL.vercel.app
```

Then update the code to use:
```typescript
const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
```

## Expected Email Link Format
**Before (Wrong):**
```
https://localhost:5173/auth/callback?token=...&type=confirmation
```

**After (Correct):**
```
https://rail-easy.vercel.app/auth/callback?token=...&type=confirmation
```

## Troubleshooting
- **Still showing localhost?** Clear Supabase cache by logging out completely
- **Link not working?** Verify the URL is in the Redirect URLs list
- **Email not arriving?** Check spam/junk folder and verify email provider settings
- **Wrong domain?** Double-check the Vercel URL spelling in Supabase config

## Files Modified
- `src/hooks/useAuth.tsx` - Updated redirect URL handling
- `src/pages/AuthCallback.tsx` - Handles both confirmation and reset flows

## Questions?
Contact support if email links still show localhost after 24 hours (Supabase may need time to propagate changes).
