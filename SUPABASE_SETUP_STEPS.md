# Supabase Configuration for rail-alpha.vercel.app

## Your Production URL
```
https://rail-alpha.vercel.app
```

## Step-by-Step Setup

### 1. Log in to Supabase
Go to: https://app.supabase.com

### 2. Select Your Project
- Project ID: `bympgnknrvaqttiofjyv`
- Click on your project

### 3. Navigate to URL Configuration
- Click **Authentication** in the left sidebar
- Click **URL Configuration**

### 4. Add Redirect URLs
Under "Redirect URLs", click **Add URI** and add these URLs (one at a time):

```
http://localhost:5173/auth/callback
http://localhost:5173/auth/callback?type=confirmation
http://localhost:5173/auth/callback?type=recovery
https://rail-alpha.vercel.app/auth/callback
https://rail-alpha.vercel.app/auth/callback?type=confirmation
https://rail-alpha.vercel.app/auth/callback?type=recovery
```

### 5. Save Configuration
Click **Save** button at the bottom

### 6. Verify Email Templates
1. Still in Authentication section, click **Email Templates**
2. Verify these are enabled:
   - ✅ **Confirmation** (for signup verification)
   - ✅ **Email change** (optional)
   - ✅ **Password reset** (for forgot password)

### 7. Check Confirmation Email Template
1. Click on the **Confirmation** email template
2. Verify the confirmation link in the template
3. It should contain your production domain

### 8. Test Configuration
1. Go to https://rail-alpha.vercel.app
2. Sign up with a test email
3. Check your email inbox (and spam folder)
4. The confirmation link should now have `rail-alpha.vercel.app` instead of `localhost`
5. Click the link - it should work!

## Expected Email Link Format
```
https://rail-alpha.vercel.app/auth/callback?token=xxxxx&type=confirmation
```

## If Links Still Show localhost
1. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Wait 5 minutes** - Supabase caches may need to propagate
3. **Re-test signup** with a different email address
4. **Check Supabase dashboard** - verify all URLs were saved correctly

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Email not arriving | Check spam folder, verify email in Supabase settings is enabled |
| Link shows localhost | Make sure you added ALL the redirect URLs listed above |
| Link shows wrong domain | Verify you copied the URL correctly: `rail-alpha.vercel.app` (no www) |
| Can't click the link | Make sure the full URL is in the email (not truncated) |
| 404 after clicking link | Verify `/auth/callback` page exists and is working |

## Your Project Details
- **Vercel URL**: https://rail-alpha.vercel.app
- **Supabase Project ID**: bympgnknrvaqttiofjyv
- **Repository**: https://github.com/sphereshed/Rail_easy

## Need Help?
- Supabase Docs: https://supabase.com/docs/guides/auth/redirect-urls
- Vercel Docs: https://vercel.com/docs
- Check browser console for errors: F12 → Console tab
