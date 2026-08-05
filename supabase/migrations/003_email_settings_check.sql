-- Check if email sending is properly configured
-- This will help diagnose email configuration issues

-- 1. Check if the email provider is enabled
SELECT * FROM auth.providers WHERE name = 'email';

-- 2. Check email templates configuration
SELECT * FROM auth.email_templates WHERE type = 'signup';

-- 3. Check site URL configuration
SELECT * FROM auth.config WHERE key = 'site_url';

-- 4. Check SMTP settings (if configured)
-- Note: SMTP settings are stored separately and might not be accessible via SQL
