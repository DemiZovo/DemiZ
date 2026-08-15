const encoder = new TextEncoder();
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
function redirect(location, cookieValues = []) {
  const headers = new Headers({ location, 'cache-control': 'no-store' });
  for (const value of cookieValues) headers.append('set-cookie', value);
  return new Response(null, { status: 302, headers });
}

function cookies(request) {
  return Object.fromEntries((request.headers.get('cookie') || '').split(';').map((part) => part.trim().split(/=(.*)/s)).filter(([key]) => key));
}

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(secret, value) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}

async function sha256(value) {
  return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
}

function equal(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index++) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

async function sessionUser(request, env) {
  const token = cookies(request).demiz_writer_session;
  if (!token) return null;
  const [userId, expires, signature] = token.split('.');
  if (!userId || !expires || !signature || Number(expires) < Date.now()) return null;
  const expected = await sign(env.SESSION_SECRET, `${userId}.${expires}`);
  return equal(signature, expected) && userId === String(env.ALLOWED_GITHUB_USER_ID) ? userId : null;
}

function cookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

async function github(env, path, init = {}) {
  const response = await fetch(`https://api.github.com/repos/${env.GITHUB_REPOSITORY}${path}`, {
    ...init,
    headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${env.GITHUB_TOKEN}`, 'content-type': 'application/json', 'user-agent': 'demiz-writer', 'x-github-api-version': '2022-11-28', ...(init.headers || {}) },
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  return response.json();
}

function validPath(path, collection, slug) {
  const prefix = `public/images/${collection}/${slug}/`;
  return path.startsWith(prefix) && !path.includes('..') && /^[a-zA-Z0-9_./-]+$/.test(path);
}

async function beginLogin(request, env) {
  const state = base64url(crypto.getRandomValues(new Uint8Array(24)));
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const callback = `${new URL(request.url).origin}/callback`;
  const target = new URL('https://github.com/login/oauth/authorize');
  target.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  target.searchParams.set('redirect_uri', callback);
  target.searchParams.set('state', state);
  target.searchParams.set('code_challenge', await sha256(verifier));
  target.searchParams.set('code_challenge_method', 'S256');
  target.searchParams.set('allow_signup', 'false');
  return redirect(target.toString(), [cookie('demiz_writer_state', state, 600), cookie('demiz_writer_verifier', verifier, 600)]);
}

async function finishLogin(request, env) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') || '';
  const expectedState = cookies(request).demiz_writer_state || '';
  const verifier = cookies(request).demiz_writer_verifier || '';
  const code = url.searchParams.get('code');
  if (!code || !state || !verifier || !equal(state, expectedState)) return new Response('登录状态无效，请重新登录。', { status: 400 });

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', 'user-agent': 'demiz-writer' },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, code_verifier: verifier, redirect_uri: `${url.origin}/callback` }),
  });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.access_token) return new Response('GitHub 登录失败。', { status: 401 });
  const userResponse = await fetch('https://api.github.com/user', { headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${token.access_token}`, 'user-agent': 'demiz-writer', 'x-github-api-version': '2022-11-28' } });
  const user = await userResponse.json();
  if (!userResponse.ok || String(user.id) !== String(env.ALLOWED_GITHUB_USER_ID)) return new Response('此 GitHub 账号无权访问写作台。', { status: 403 });

  const expires = Date.now() + 12 * 60 * 60 * 1000;
  const value = `${user.id}.${expires}`;
  const session = `${value}.${await sign(env.SESSION_SECRET, value)}`;
  return redirect('/', [cookie('demiz_writer_session', session, 43200), cookie('demiz_writer_state', '', 0), cookie('demiz_writer_verifier', '', 0)]);
}

async function publish(request, env) {
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return json({ message: '请求来源无效' }, 403);
  try {
    const payload = await request.json();
    const collection = payload.collection;
    const slug = String(payload.slug || '');
    if (!['blog', 'life'].includes(collection) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return json({ message: '文章类型或 slug 无效' }, 400);
    if (typeof payload.markdown !== 'string' || payload.markdown.length > 1_000_000) return json({ message: '文章内容无效或过大' }, 400);
    const files = Array.isArray(payload.files) ? payload.files : [];
    if (files.length > 30 || files.some((file) => !validPath(String(file.path), collection, slug) || typeof file.content !== 'string' || file.content.length > 12_000_000)) return json({ message: '图片路径、数量或大小不符合限制' }, 400);

    const branch = env.GITHUB_BRANCH || 'main';
    const ref = await github(env, `/git/ref/heads/${encodeURIComponent(branch)}`);
    const parent = await github(env, `/git/commits/${ref.object.sha}`);
    const entries = [];
    const markdownBlob = await github(env, '/git/blobs', { method: 'POST', body: JSON.stringify({ content: payload.markdown, encoding: 'utf-8' }) });
    entries.push({ path: `src/content/${collection}/${slug}.md`, mode: '100644', type: 'blob', sha: markdownBlob.sha });
    for (const file of files) {
      const blob = await github(env, '/git/blobs', { method: 'POST', body: JSON.stringify({ content: file.content, encoding: 'base64' }) });
      entries.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const tree = await github(env, '/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: parent.tree.sha, tree: entries }) });
    const commit = await github(env, '/git/commits', { method: 'POST', body: JSON.stringify({ message: `content: publish ${collection}/${slug}`, tree: tree.sha, parents: [ref.object.sha] }) });
    await github(env, `/git/refs/heads/${encodeURIComponent(branch)}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
    return json({ message: 'Published', commitUrl: `https://github.com/${env.GITHUB_REPOSITORY}/commit/${commit.sha}` });
  } catch (error) {
    console.error(error);
    return json({ message: '发布接口暂时不可用，请稍后重试' }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/login') return beginLogin(request, env);
    if (url.pathname === '/callback') return finishLogin(request, env);
    if (url.pathname === '/logout') return redirect('/login', [cookie('demiz_writer_session', '', 0)]);
    const userId = await sessionUser(request, env);
    if (!userId) return url.pathname.startsWith('/api/') ? json({ message: '请先登录' }, 401) : redirect('/login');
    if (url.pathname === '/api/publish' && request.method === 'POST') return publish(request, env);
    if (url.pathname.startsWith('/api/')) return json({ message: 'Not found' }, 404);
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('cache-control', 'private, no-store');
    headers.set('x-robots-tag', 'noindex, nofollow, noarchive');
    headers.set('content-security-policy', "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
