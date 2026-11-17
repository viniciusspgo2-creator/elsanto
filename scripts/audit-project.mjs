/** Offline structural audit. Complements, never replaces, a full Next build. */
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd(),publicPath=resolve(root,'public');
const files=[];
function walk(dir){for(const name of readdirSync(dir)){const f=join(dir,name);if(statSync(f).isDirectory())walk(f);else if(/\.(tsx?|css)$/.test(name))files.push(f)}}
for(const dir of ['app','components','lib','prisma'])walk(resolve(root,dir));
const missing=[];let matches=0;
for(const file of files){const contents=readFileSync(file,'utf8');const pattern=/["'](\/(?:images|icons)\/[^"']+)["']/g;for(const match of contents.matchAll(pattern)){
 matches++;const asset=join(publicPath,match[1]);if(!existsSync(asset))missing.push(`${relative(root,file)}: ${match[1]}`);
}}
for(const f of ['manifest.webmanifest','sw.js','offline.html','og-el-santo.jpg','images/el-santo-logo.png','images/mascote-3d.png','images/cardapio-oficial-1.jpg','images/cardapio-oficial-2.jpg'])if(!existsSync(join(publicPath,f)))missing.push(`Required public asset: ${f}`);
const worker=readFileSync(join(publicPath,'sw.js'),'utf8');
assert.match(worker,/\/\(api\|admin\|entregador\|pedido\|_next\)/,'PWA must exclude private routes');
assert.match(worker,/url\.search/,'PWA must avoid query-bearing QR table routes');
assert.deepEqual(missing,[],`Missing public assets:\n${missing.join('\n')}`);
console.log(`AUDIT OK: ${files.length} source files, ${matches} local asset references, no missing public assets, private PWA routes excluded`);
