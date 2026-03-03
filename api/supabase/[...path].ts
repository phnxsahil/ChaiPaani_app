import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingMessage } from 'http';

/**
 * Supabase Proxy — forwards all requests from /api/supabase/... to the real
 * Supabase URL (stored server-side only). This lets the browser talk to
 * *.vercel.app instead of *.supabase.co, bypassing Indian ISP DNS blocks.
 *
 * bodyParser is disabled so we receive the raw stream and can forward it
 * unchanged (handles JSON, form data, binary uploads, etc.).
 */
export const config = {
  api: { bodyParser: false },
};

/** Read raw request body as a Buffer. */
function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
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

    // Headers to never forward upstream.
    const skipForwardHeaders = new Set([
      'host', 'content-length', 'transfer-encoding', 'connection', 'keep-alive',
    ]);

    const forwardHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (skipForwardHeaders.has(key.toLowerCase())) continue;
      forwardHeaders[key] = Array.isArray(value) ? value.join(', ') : (value ?? '');
    }

    // Re-serialise the body that Vercel has already parsed.
    // Vercel auto-parses JSON bodies into req.body as an object, so we must
    // re-stringify to get the raw bytes. content-length is intentionally
    // omitted above so fetch computes the correct length automatically.
    let body: Buffer | undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await readRawBody(req);
      if (body.length === 0) body = undefined;
    }

    const upstream = await fetch(targetUrl, {
      method: req.method ?? 'GET',
      headers: forwardHeaders,
      body,
    });

    // Copy response headers (skip hop-by-hop headers).
    const skipResponseHeaders = new Set([
      'content-encoding', 'transfer-encoding', 'connection', 'keep-alive',
    ]);
    res.status(upstream.status);
    upstream.headers.forEach((value: string, key: string) => {
      if (!skipResponseHeaders.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const buffer = await upstream.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[supabase-proxy] unhandled error:', message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Proxy error', detail: message });
    }
  }
}
