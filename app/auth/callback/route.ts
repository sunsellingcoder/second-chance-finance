import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const returnUrl = searchParams.get('returnUrl') ?? '/timeline';
  const error_code = searchParams.get('error_code');
  const error_description = searchParams.get('error_description');

  console.log('Callback received:', { 
    hasCode: !!code, 
    returnUrl, 
    error_code, 
    error_description,
    origin,
    fullUrl: request.url
  });

  // Handle error from Supabase
  if (error_code) {
    console.error('Supabase auth error:', { error_code, error_description });
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error_description || error_code)}`);
  }

  if (code) {
    console.log('Exchanging code for session...');
    
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    console.log('Exchange result:', { 
      hasData: !!data, 
      hasError: !!error, 
      error: error?.message,
      user: data?.user?.email 
    });
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      // Decode the return URL
      const decodedReturnUrl = decodeURIComponent(returnUrl);
      
      console.log('Redirecting to:', decodedReturnUrl);
      
      // Ensure the return URL starts with /
      const normalizedReturnUrl = decodedReturnUrl.startsWith('/') ? decodedReturnUrl : `/${decodedReturnUrl}`;
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${normalizedReturnUrl}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${normalizedReturnUrl}`);
      } else {
        return NextResponse.redirect(`${origin}${normalizedReturnUrl}`);
      }
    } else {
      console.error('Session exchange failed:', error);
    }
  } else {
    console.log('No code found in callback');
  }

  // Return the user to an error page with instructions
  console.log('Redirecting to error page');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
