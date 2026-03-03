import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Google OAuth — Step 2: Exchange the auth code for tokens.
 *
 * Google redirects here with ?code=... after the user consents.
 * We exchange the code with Google directly (never touching *.supabase.co),
 * extract the id_token, and redirect the browser to /auth/callback with the
 * id_token in the URL.  The React app then calls
 *   supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })
 * which goes through our /api/supabase proxy — also never touching *.supabase.co
 * directly.
 *
 * Required env vars (server-side, set in Vercel dashboard):
 *   GOOGLE_CLIENT_ID      — Google OAuth 2.0 client ID
 *   GOOGLE_CLIENT_SECRET  — Google OAuth 2.0 client secret
 *   APP_URL               — e.g. https://chaipaani.vercel.app  (no trailing slash)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL;

  if (!clientId || !clientSecret || !appUrl) {
    res.status(500).json({
      error: 'Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or APP_URL environment variables',
    });
    return;
  }

  const code = req.query.code as string | undefined;
  const stateParam = req.query.state as string | undefined;
  const errorParam = req.query.error as string | undefined;

  // User denied access or there was an OAuth error.
  if (errorParam) {
    res.redirect(302, `${appUrl}/auth?error=${encodeURIComponent(errorParam)}`);
    return;
  }

  if (!code) {
    res.status(400).json({ error: 'Missing code parameter' });
    return;
  }

  // Decode the state payload to recover any invite_token.
  let inviteToken: string | undefined;
  if (stateParam) {
    try {
      const decoded = Buffer.from(stateParam, 'base64url').toString('utf-8');
      if (decoded) {
        const parsed = JSON.parse(decoded) as { invite_token?: string };
        inviteToken = parsed.invite_token;
      }
    } catch {
      // State was empty or not JSON — ignore, it's optional.
    }
  }

  // Exchange the auth code for tokens at Google's token endpoint.
  // This request goes to googleapis.com — never blocked by ISPs.
  let tokenData: { id_token?: string; error?: string };
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }).toString(),
    });

    tokenData = (await tokenResponse.json()) as { id_token?: string; error?: string };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.redirect(302, `${appUrl}/auth?error=${encodeURIComponent('token_exchange_failed: ' + message)}`);
    return;
  }

  if (tokenData.error || !tokenData.id_token) {
    const errMsg = tokenData.error ?? 'no_id_token';
    res.redirect(302, `${appUrl}/auth?error=${encodeURIComponent(errMsg)}`);
    return;
  }

  // Redirect back to the React app's /auth/callback route with the id_token.
  // The AuthCallback component will call supabase.auth.signInWithIdToken() from
  // there (going through our /api/supabase proxy).
  const callbackParams = new URLSearchParams({
    provider: 'google',
    id_token: tokenData.id_token,
    ...(inviteToken ? { token: inviteToken } : {}),
  });

  res.redirect(302, `${appUrl}/auth/callback?${callbackParams.toString()}`);
}
