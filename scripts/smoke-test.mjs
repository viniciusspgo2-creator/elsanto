/**
 * Smoke test of a running deployment. Does not place orders or mutate the database.
 * Usage: BASE_URL=https://your-deployment.vercel.app node scripts/smoke-test.mjs
 */
import assert from 'node:assert/strict';
const base=process.env.BASE_URL;
if(!base||!/^https?:\/\//.test(base))throw Error('Defina BASE_URL com o endereço do ambiente de testes');
const pages=['/','/cardapio','/sobre','/contato','/pedido','/blog'];
let failed=0;
for(const page of pages){
 try{
  const result=await fetch(new URL(page,base),{signal:AbortSignal.timeout(12000),redirect:'manual'});
  assert.ok(result.status===200,`${page} retornou HTTP ${result.status}`);
  const text=await result.text();
  assert.ok(/EL SANTO|El Santo/i.test(text),`${page} não apresenta identidade El Santo`);
  console.log('OK',page,result.status);
 }catch(error){failed++;console.error('FALHOU',page,error.message)}
}
for(const page of ['/api/admin/menu','/api/admin/orders','/api/admin/ai-models?provider=gemini','/api/driver/deliveries']){
 try{
  const result=await fetch(new URL(page,base),{signal:AbortSignal.timeout(12000)});
  assert.ok(result.status===401||result.status===403,`${page} expôs endpoint (HTTP ${result.status})`);
  console.log('PROTEGIDO',page,result.status);
 }catch(error){failed++;console.error('FALHOU SEGURANÇA',page,error.message)}
}
if(failed)process.exitCode=1;
