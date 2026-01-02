interface Env {
  JWT_SECRET: string;
}

interface JWTPayload {
  userId: number;
  username: string;
  avatar: string;
  name: string;
  iat: number;
  exp: number;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { JWT_SECRET } = context.env;
  const cookies = context.request.headers.get('Cookie') || '';
  const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('auth_token='));
  const token = tokenCookie?.split('=')[1];

  if (!token) {
    return new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const payload = await verifyJWT(token, JWT_SECRET);

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({
      user: {
        userId: payload.userId,
        username: payload.username,
        avatar: payload.avatar,
        name: payload.name,
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('JWT verification error:', error);
    return new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

async function verifyJWT(token: string, secret: string): Promise<JWTPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = base64UrlDecode(encodedSignature);

  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signature,
    encoder.encode(data)
  );

  if (!isValid) {
    throw new Error('Invalid JWT signature');
  }

  const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));
  return payload;
}

function base64UrlDecode(base64Url: string): ArrayBuffer {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  const binaryString = atob(paddedBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
