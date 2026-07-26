import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const returnUrl = searchParams.get('returnUrl') ?? '/timeline';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      // Decode the return URL
      const decodedReturnUrl = decodeURIComponent(returnUrl);
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${decodedReturnUrl}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${decodedReturnUrl}`);
      } else {
        return NextResponse.redirect(`${origin}${decodedReturnUrl}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
