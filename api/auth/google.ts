import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Google OAuth — Step 1: Redirect to Google's consent screen.
 *
 * Instead of going through Supabase's /auth/v1/authorize (which lives on
 * *.supabase.co and is blocked by Indian ISPs), we build the Google OAuth URL
 * directly and point the redirect_uri back to OUR server (Vercel).
 *
 * Required env vars (server-side, set in Vercel dashboard):
 *   GOOGLE_CLIENT_ID   — Google OAuth 2.0 client ID
 *   APP_URL            — e.g. https://chaipaani.vercel.app  (no trailing slash)
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.APP_URL;

  if (!clientId || !appUrl) {
    res.status(500).json({
      error: 'Missing GOOGLE_CLIENT_ID or APP_URL environment variables',
    });
    return;
  }

  // Forward any invitation token so it survives the OAuth round-trip.
  const inviteToken = req.query.invite_token as string | undefined;
  const statePayload = inviteToken ? JSON.stringify({ invite_token: inviteToken }) : '';
  const state = Buffer.from(statePayload).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state,
  });

  res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
