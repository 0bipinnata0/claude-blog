export const onRequestPost: PagesFunction = async (context) => {
  const response = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });

  // Clear auth token cookie
  response.headers.set('Set-Cookie', 'auth_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax');

  return response;
};
