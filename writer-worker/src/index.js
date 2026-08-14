const encoder = new TextEncoder();
const AI_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8';
const DEMIZ_BLOG_SKILL = `
你正在使用 DemiZ 博客写作 Skill。请严格遵守：
- 使用自然、清晰、克制的简体中文，像程序员整理自己的学习和实践记录。
- 先说明为什么，再说明怎么做；区分事实、经验与建议。
- 不虚构版本号、运行结果、性能数据或个人经历；信息不足时明确保留待确认项。
- 使用短段落，每节只处理一个核心问题；主要章节使用二级标题。
- 代码块注明语言；命令、路径、字段和代码标识符使用反引号。
- 根据主题灵活包含背景、目标与约束、方案选择、实现、踩坑与验证、限制和总结，不制造空章节。
- 禁止夸张标题、营销话术、网络热词、表情符号和模板化结尾。
- 本站不使用文章封面，不生成 cover 字段或封面建议。
`;
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

async function assist(request, env) {
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return json({ message: '请求来源无效' }, 403);
  if (!env.AI) return json({ message: 'AI 写作助手尚未配置' }, 503);
  try {
    const payload = await request.json();
    const action = String(payload.action || '');
    const prompt = String(payload.prompt || '').trim();
    const context = payload.context && typeof payload.context === 'object' ? payload.context : {};
    if (!['outline', 'draft', 'polish'].includes(action)) return json({ message: 'AI 写作操作无效' }, 400);
    if (prompt.length > 6_000 || String(context.body || '').length > 50_000) return json({ message: '提交给 AI 的内容过长' }, 413);
    if (action === 'polish' && !String(context.body || '').trim()) return json({ message: '没有可润色的正文' }, 400);

    const tasks = {
      outline: '根据写作要求和文章信息生成一份可直接继续编辑的 Markdown 大纲。每个章节附一条简短写作提示，不要写 frontmatter。',
      draft: '根据写作要求和文章信息生成完整的 Markdown 正文。不要输出 frontmatter，不要把全文包在代码围栏中。',
      polish: '在不改变事实和技术含义的前提下润色现有正文，改善结构、表达和 Markdown 格式。只输出润色后的正文，不要输出说明或 frontmatter。',
    };
    const safeContext = {
      collection: context.collection === 'life' ? 'life' : 'blog',
      title: String(context.title || '').slice(0, 100),
      description: String(context.description || '').slice(0, 240),
      category: String(context.category || '').slice(0, 80),
      tags: String(context.tags || '').slice(0, 300),
      body: String(context.body || '').slice(0, 50_000),
    };
    const system = `你是 DemiZ 私人写作台中的中文写作助手。只处理用户提供的材料，不得编造未经材料支持的事实、测试结果、版本号或个人经历。输出应可直接放入 Markdown 正文编辑器。${payload.useSkill && safeContext.collection === 'blog' ? DEMIZ_BLOG_SKILL : ''}`;
    const user = `${tasks[action]}\n\n写作要求：\n${prompt || '未额外提供'}\n\n文章信息：\n${JSON.stringify(safeContext, null, 2)}`;
    const result = await env.AI.run(AI_MODEL, {
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: action === 'outline' ? 1_200 : 3_000,
      temperature: action === 'polish' ? 0.35 : 0.55,
      repetition_penalty: 1.08,
    });
    const text = typeof result === 'string' ? result : result?.response;
    if (!text || typeof text !== 'string') throw new Error('Workers AI returned no text');
    return json({ text, model: AI_MODEL });
  } catch (error) {
    console.error(error);
    const detail = error instanceof Error ? error.message : String(error);
    if (/3036|account limited|daily free allocation|429/i.test(detail)) return json({ message: '今日免费 AI 额度已用完，请明天再试' }, 429);
    return json({ message: 'AI 写作暂时不可用，请稍后重试' }, 503);
  }
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
    if (url.pathname === '/api/assist' && request.method === 'POST') return assist(request, env);
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
