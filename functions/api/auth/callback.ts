interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
}

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string | null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET } = context.env;
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // Verify state to prevent CSRF
  const cookies = context.request.headers.get('Cookie') || '';
  const stateCookie = cookies.split(';').find(c => c.trim().startsWith('oauth_state='));
  const storedState = stateCookie?.split('=')[1];

  if (!code || !state || state !== storedState) {
    return new Response('Invalid OAuth callback', { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData: GitHubTokenResponse = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token');
    }

    // Fetch user information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    });

    const userData: GitHubUser = await userResponse.json();

    // Create JWT token with user info
    const payload = {
      userId: userData.id,
      username: userData.login,
      avatar: userData.avatar_url,
      name: userData.name || userData.login,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    };

    const jwt = await createJWT(payload, JWT_SECRET);

    // Redirect to homepage with JWT in cookie
    const response = Response.redirect(url.origin, 302);
    response.headers.set('Set-Cookie', `auth_token=${jwt}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`);

    // Clear state cookie
    response.headers.append('Set-Cookie', 'oauth_state=; Path=/; Max-Age=0');

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
};

async function createJWT(payload: object, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const data = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const encodedSignature = base64UrlEncode(signature);

  return `${data}.${encodedSignature}`;
}

function base64UrlEncode(data: string | ArrayBuffer): string {
  let base64: string;
  if (typeof data === 'string') {
    base64 = btoa(data);
  } else {
    const bytes = new Uint8Array(data);
    base64 = btoa(String.fromCharCode(...bytes));
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
