import worker from '../writer-worker/src/index.js';

const env = { GITHUB_CLIENT_ID: 'client-id' };
const login = await worker.fetch(new Request('https://writer.example/login'), env);
if (login.status !== 302 || !login.headers.get('location')?.startsWith('https://github.com/login/oauth/authorize')) throw new Error('Login redirect is invalid');
const loginTarget = new URL(login.headers.get('location'));
if (!loginTarget.searchParams.get('state') || loginTarget.searchParams.get('code_challenge_method') !== 'S256' || !loginTarget.searchParams.get('code_challenge')) throw new Error('OAuth state or PKCE is missing');

const page = await worker.fetch(new Request('https://writer.example/'), env);
if (page.status !== 302 || page.headers.get('location') !== '/login') throw new Error('Anonymous page access is not protected');

const api = await worker.fetch(new Request('https://writer.example/api/publish', { method: 'POST' }), env);
if (api.status !== 401) throw new Error('Anonymous publish access is not protected');

console.log('Verified writer OAuth redirect, PKCE, private page gate and private publish gate.');
