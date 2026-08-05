-- Temporary fix: Disable email confirmation for testing
-- This allows users to sign up without email verification
-- IMPORTANT: Re-enable this in production with proper email configuration

-- Note: This setting is managed in Supabase Dashboard, not via SQL
-- Go to: Authentication → Providers → Email → Set "Confirm email" to "Off"

-- Alternative: Modify the trigger to not require email confirmation
-- The trigger already works, but we need to ensure the auth system allows signup without email verification

-- For now, this is a placeholder migration to document the setting
-- The actual change must be made in the Supabase Dashboard
