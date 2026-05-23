import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to get Redirect URI using the app URL provided by AI Studio
  // Fallback to local if not set or run locally
  const getRedirectUri = (req: express.Request) => {
    let host = req.get('host') || 'localhost:3000';
    let protocol = 'http';
    if (host.includes('run.app') || req.headers['x-forwarded-proto'] === 'https') {
      protocol = 'https';
    }
    const base = process.env.APP_URL && process.env.APP_URL !== "MY_APP_URL" ? process.env.APP_URL : `${protocol}://${host}`;
    return `${base}/api/auth/callback`;
  };

  app.get('/api/auth/url', (req, res) => {
    const redirectUri = getRedirectUri(req);
    const OAUTH_CLIENT_ID = process.env.GITHUB_CLIENT_ID;

    if (!OAUTH_CLIENT_ID) {
      // For demo purposes if keys aren't configured, we'll send a dummy structure
      // that the client can handle or we instruct the user to add keys.
      return res.status(400).json({ error: 'Missing GITHUB_CLIENT_ID environment variable' });
    }

    const params = new URLSearchParams({
      client_id: OAUTH_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'read:user',
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  app.get(['/api/auth/callback', '/api/auth/callback/'], async (req, res) => {
    const { code } = req.query;
    const OAUTH_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const OAUTH_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
    
    // In a real app we would exchange the code for a token and verify with the provider
    // const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", "Accept": "application/json" },
    //   body: JSON.stringify({ client_id: OAUTH_CLIENT_ID, client_secret: OAUTH_CLIENT_SECRET, code })
    // });
    
    // Send success message to parent window and close popup
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', code: '${code}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
