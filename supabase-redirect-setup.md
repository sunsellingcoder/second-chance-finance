# Supabase Redirect URL Configuration

To fix the 404 error when clicking magic links, you need to configure the redirect URLs in your Supabase Dashboard.

## Steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/fqxackkeigimakpkleds

2. Navigate to: Authentication → URL Configuration (or Site URL)

3. Set the following:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/callback/*`

4. For production (when deployed):
   - **Site URL**: `https://yourdomain.com`
   - **Redirect URLs**: 
     - `https://yourdomain.com/auth/callback`
     - `https://yourdomain.com/auth/callback/*`

## Why This Is Needed

Supabase requires the redirect URLs to be whitelisted for security. When a user clicks a magic link, Supabase validates that the redirect URL is in the allowed list before redirecting the user.

If the URL is not whitelisted, Supabase may redirect to an invalid URL or fail the authentication process entirely.
