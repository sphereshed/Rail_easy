-- Fix for email confirmation during signup
-- This ensures that signup sends confirmation emails, not password reset emails

-- The key is that when a user signs up with a password, Supabase should:
-- 1. Send a confirmation email (not a password reset email)
-- 2. User clicks confirmation link
-- 3. User is then able to log in

-- This is controlled by the "Confirm email" setting in Supabase Auth settings
-- Make sure in your Supabase dashboard:
-- 1. Go to Authentication → Policies
-- 2. Enable "Confirm email" 
-- 3. This is already configured in your dashboard (you can see it's toggled ON)

-- Additional setup to ensure proper auth flow:
-- Verify the email templates are correct in Authentication → Email Templates
-- The "Confirm signup" template should be used for signup confirmations

-- If users are still getting password reset emails:
-- 1. Check if "Require email confirmation before signing in" is enabled
-- 2. Check if the redirect URL is correct: http://localhost:5173/auth/callback
-- 3. Clear browser cache and try signing up again with a new email

-- The app will now:
-- - Send a confirmation email when user signs up
-- - User clicks the link and is redirected to /auth/callback
-- - The callback page auto-verifies the email
-- - User can then log in with their password
