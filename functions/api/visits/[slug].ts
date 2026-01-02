// Cloudflare Pages Function for serverless view counter
// This edge function handles GET and POST requests to track blog post views

interface Env {
  BLOG_VIEWS: KVNamespace;
}

// Helper function to get current view count
async function getViewCount(kv: KVNamespace, slug: string): Promise<number> {
  const count = await kv.get(slug);
  return count ? parseInt(count, 10) : 0;
}

// Helper function to increment view count
async function incrementViewCount(kv: KVNamespace, slug: string): Promise<number> {
  const currentCount = await getViewCount(kv, slug);
  const newCount = currentCount + 1;
  await kv.put(slug, newCount.toString());
  return newCount;
}

// Handle GET requests - Return current view count
export async function onRequestGet(context: EventContext<Env, "slug", unknown>) {
  try {
    const { slug } = context.params;
    const kv = context.env.BLOG_VIEWS;

    if (!kv) {
      return new Response(
        JSON.stringify({ error: 'KV namespace not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const views = await getViewCount(kv, slug as string);

    return new Response(
      JSON.stringify({ views }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get view count', views: 0 }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle POST requests - Increment and return new view count
export async function onRequestPost(context: EventContext<Env, "slug", unknown>) {
  try {
    const { slug } = context.params;
    const kv = context.env.BLOG_VIEWS;

    if (!kv) {
      return new Response(
        JSON.stringify({ error: 'KV namespace not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const views = await incrementViewCount(kv, slug as string);

    return new Response(
      JSON.stringify({ views }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to increment view count', views: 0 }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
