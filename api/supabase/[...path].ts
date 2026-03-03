import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Supabase Proxy — forwards all requests from /api/supabase/... to the real
 * Supabase URL (stored server-side only). This lets the browser talk to
 * *.vercel.app instead of *.supabase.co, bypassing Indian ISP DNS blocks.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const SUPABASE_URL = process.env.SUPABASE_URL;

  if (!SUPABASE_URL) {
    res.status(500).json({ error: 'SUPABASE_URL env var not configured' });
    return;
  }

  // req.url is the full path as seen by this function, e.g.
  //   /api/supabase/auth/v1/token?grant_type=...
  // Strip the /api/supabase prefix to get the real Supabase path.
  const rawUrl = req.url ?? '/';
  const supabasePath = rawUrl.replace(/^\/api\/supabase/, '');
  const targetUrl = `${SUPABASE_URL}${supabasePath}`;

  // Forward every header except 'host' (which would confuse Supabase).
  const forwardHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (key.toLowerCase() === 'host') continue;
    forwardHeaders[key] = Array.isArray(value) ? value.join(', ') : (value ?? '');
  }

  // Re-serialise the body that Vercel has already parsed for us.
  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (req.body !== undefined && req.body !== null) {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method: req.method ?? 'GET',
      headers: forwardHeaders,
      body,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: 'Failed to reach Supabase', detail: message });
    return;
  }

  // Copy status and response headers (skip hop-by-hop headers).
  const skipHeaders = new Set(['content-encoding', 'transfer-encoding', 'connection', 'keep-alive']);
  res.status(upstream.status);
  upstream.headers.forEach((value, key) => {
    if (!skipHeaders.has(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  });

  const buffer = await upstream.arrayBuffer();
  res.end(Buffer.from(buffer));
}
