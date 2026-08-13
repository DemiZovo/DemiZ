import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const root = join(process.cwd(), 'dist');
const base = (process.env.BASE_PATH ?? '/').replace(/\/$/, '');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.xml':'application/xml'};
createServer(async (request,response)=>{
  try {
    let pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    if(base && pathname.startsWith(base)) pathname=pathname.slice(base.length)||'/';
    let file=join(root,pathname.replace(/^\//,''));
    if((await stat(file).catch(()=>null))?.isDirectory()) file=join(file,'index.html');
    const body=await readFile(file); response.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream'}); response.end(body);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(Number(process.env.PORT??4321),'127.0.0.1');
