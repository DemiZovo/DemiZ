import worker from '../writer-worker/src/index.js';

let aiInvocation;
const env = {
  GITHUB_CLIENT_ID: 'client-id',
  SESSION_SECRET: 'test-session-secret',
  ALLOWED_GITHUB_USER_ID: '42',
  AI: {
    run: async (model, input) => {
      aiInvocation = { model, input };
      return { response: '## 测试大纲' };
    },
  },
};
const login = await worker.fetch(new Request('https://writer.example/login'), env);
if (login.status !== 302 || !login.headers.get('location')?.startsWith('https://github.com/login/oauth/authorize')) throw new Error('Login redirect is invalid');
const loginTarget = new URL(login.headers.get('location'));
if (!loginTarget.searchParams.get('state') || loginTarget.searchParams.get('code_challenge_method') !== 'S256' || !loginTarget.searchParams.get('code_challenge')) throw new Error('OAuth state or PKCE is missing');

const page = await worker.fetch(new Request('https://writer.example/'), env);
if (page.status !== 302 || page.headers.get('location') !== '/login') throw new Error('Anonymous page access is not protected');

const api = await worker.fetch(new Request('https://writer.example/api/publish', { method: 'POST' }), env);
if (api.status !== 401) throw new Error('Anonymous publish access is not protected');

const encoder = new TextEncoder();
const expires = Date.now() + 60_000;
const value = `42.${expires}`;
const key = await crypto.subtle.importKey('raw', encoder.encode(env.SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
const signed = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
const signature = btoa(String.fromCharCode(...signed)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const assistant = await worker.fetch(new Request('https://writer.example/api/assist', {
  method: 'POST',
  headers: {
    origin: 'https://writer.example',
    cookie: `demiz_writer_session=${value}.${signature}`,
    'content-type': 'application/json',
  },
  body: JSON.stringify({ action: 'outline', prompt: '整理学习笔记', useSkill: true, context: { collection: 'blog', title: '测试' } }),
}), env);
const assistantBody = await assistant.json();
if (assistant.status !== 200 || assistantBody.text !== '## 测试大纲') throw new Error('Authenticated AI assistant is unavailable');
if (!aiInvocation?.model?.startsWith('@cf/') || !aiInvocation.input?.messages?.[0]?.content?.includes('DemiZ 博客写作 Skill')) throw new Error('DemiZ skill was not passed to Workers AI');

console.log('Verified writer OAuth, private gates and authenticated DemiZ Skill AI assistance.');
