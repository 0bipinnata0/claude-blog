interface Env {
  BLOG_LIKES: KVNamespace;
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

// GET /api/likes/:slug - Get like count and user's like status
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { slug } = context.params;
  const kv = context.env.BLOG_LIKES;

  // Get total like count
  const likesKey = `likes:${slug}`;
  const likesCount = await kv.get(likesKey);
  const totalLikes = likesCount ? parseInt(likesCount, 10) : 0;

  // Check if current user has liked
  const user = await getCurrentUser(context);
  let hasLiked = false;

  if (user) {
    const userLikeKey = `like:${slug}:${user.userId}`;
    const userLike = await kv.get(userLikeKey);
    hasLiked = userLike === 'true';
  }

  return new Response(JSON.stringify({
    likes: totalLikes,
    hasLiked,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    },
  });
};

// POST /api/likes/:slug - Toggle like
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { slug } = context.params;
  const kv = context.env.BLOG_LIKES;

  // Verify user is authenticated
  const user = await getCurrentUser(context);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const likesKey = `likes:${slug}`;
  const userLikeKey = `like:${slug}:${user.userId}`;

  // Check if user has already liked
  const userLike = await kv.get(userLikeKey);
  const hasLiked = userLike === 'true';

  let newLikesCount: number;

  if (hasLiked) {
    // Unlike: decrement count and remove user's like
    const currentLikes = await kv.get(likesKey);
    newLikesCount = Math.max(0, (currentLikes ? parseInt(currentLikes, 10) : 0) - 1);
    await kv.put(likesKey, newLikesCount.toString());
    await kv.delete(userLikeKey);
  } else {
    // Like: increment count and set user's like
    const currentLikes = await kv.get(likesKey);
    newLikesCount = (currentLikes ? parseInt(currentLikes, 10) : 0) + 1;
    await kv.put(likesKey, newLikesCount.toString());
    await kv.put(userLikeKey, 'true');
  }

  return new Response(JSON.stringify({
    likes: newLikesCount,
    hasLiked: !hasLiked,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

async function getCurrentUser(context: EventContext<Env, string, Record<string, unknown>>): Promise<JWTPayload | null> {
  const { JWT_SECRET } = context.env;
  const cookies = context.request.headers.get('Cookie') || '';
  const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('auth_token='));
  const token = tokenCookie?.split('=')[1];

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyJWT(token, JWT_SECRET);

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

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
