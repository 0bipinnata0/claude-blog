interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { GITHUB_CLIENT_ID } = context.env;
  const url = new URL(context.request.url);
  const redirectUri = `${url.origin}/api/auth/callback`;

  // Generate random state for CSRF protection
  const state = crypto.randomUUID();

  // GitHub OAuth authorization URL
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.set('scope', 'read:user');
  githubAuthUrl.searchParams.set('state', state);

  // Store state in cookie for verification
  const response = Response.redirect(githubAuthUrl.toString(), 302);
  response.headers.set('Set-Cookie', `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

  return response;
};
