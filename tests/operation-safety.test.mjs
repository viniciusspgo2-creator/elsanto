import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canChangeDelivery,mayReassignDelivery,isClosedDelivery} from '../lib/delivery-state.ts';
import {addRecentOrder,parseRecentOrders} from '../lib/recent-orders.ts';
import {restaurantPeriodStarts} from '../lib/business-time.ts';
import {canUpload,validatedImageUrl,presignUpload} from '../lib/media.ts';

test('entrega não pode avançar de atribuída direto para entregue',()=>{
 assert.equal(canChangeDelivery('ASSIGNED','DELIVERED'),false);
 assert.equal(canChangeDelivery('ASSIGNED','ACCEPTED'),true);
 assert.equal(canChangeDelivery('ON_ROUTE','ARRIVED'),true);
 assert.equal(canChangeDelivery('DELIVERED','ON_ROUTE'),false);
 assert.equal(mayReassignDelivery('ON_ROUTE'),false);
 assert.equal(mayReassignDelivery('ACCEPTED'),true);
 assert.equal(isClosedDelivery('FAILED'),true);
});
test('pedido recente persiste sem nome, telefone ou endereço',()=>{
 const token='A'.repeat(43);
 let list=addRecentOrder([],{token,number:12,createdAt:'2026-11-14T10:00:00Z'});
 list=addRecentOrder(list,{token,number:12,createdAt:'2026-11-14T11:00:00Z'});
 assert.equal(list.length,1);
 assert.equal(parseRecentOrders(JSON.stringify(list))[0].number,12);
 assert.equal(parseRecentOrders('not-json').length,0);
 assert.equal(addRecentOrder(list,{token:'bad',number:1,createdAt:'x'}).length,1);
});
test('dia do restaurante muda em 03:00 UTC em 14/11/2026',()=>{
 const a=restaurantPeriodStarts(new Date('2026-11-14T02:59:00Z'));
 const b=restaurantPeriodStarts(new Date('2026-11-14T03:01:00Z'));
 assert.equal(a.day.toISOString(),'2026-11-13T03:00:00.000Z');
 assert.equal(b.day.toISOString(),'2026-11-14T03:00:00.000Z');
 assert.equal(b.month.toISOString(),'2026-11-01T03:00:00.000Z');
});
test('upload valida tipo e tamanho, sem aceitar scripts ou URL insegura',()=>{
 assert.equal(canUpload('image/png',300_000),true);
 assert.equal(canUpload('image/svg+xml',3000),false);
 assert.equal(canUpload('image/png',10*1024*1024),false);
 assert.equal(validatedImageUrl('/images/nachos.jpg'),'/images/nachos.jpg');
 assert.throws(()=>validatedImageUrl('javascript:alert(1)'));
 assert.throws(()=>validatedImageUrl('http://example.com/photo.jpg'));
});
test('URL S3/R2 é assinada com prazo limitado sem enviar credenciais secretas',()=>{
 const saved={...process.env};
 try{
  Object.assign(process.env,{S3_ENDPOINT:'https://account.r2.cloudflarestorage.com',S3_ACCESS_KEY_ID:'AKIAEXAMPLE',S3_SECRET_ACCESS_KEY:'NOT_A_REAL_SECRET',S3_BUCKET:'elsanto',S3_PUBLIC_BASE_URL:'https://static.example.com',S3_REGION:'auto'});
  const data=presignUpload({filename:'foto.jpg',mime:'image/jpeg'},new Date('2026-11-14T12:00:00Z'));
  const url=new URL(data.uploadUrl);
  assert.equal(url.hostname,'account.r2.cloudflarestorage.com');
  assert.match(url.pathname,/^\/elsanto\/uploads\/2026\/11\/[0-9a-f]{32}\.jpg$/);
  assert.equal(url.searchParams.get('X-Amz-Expires'),'300');
  assert.equal(url.searchParams.get('X-Amz-Signature')?.length,64);
  assert.ok(!data.publicUrl.includes('NOT_A_REAL_SECRET'));
 }finally{for(const key of ['S3_ENDPOINT','S3_ACCESS_KEY_ID','S3_SECRET_ACCESS_KEY','S3_BUCKET','S3_PUBLIC_BASE_URL','S3_REGION']){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key];}}
});

import {checkLimit} from '../lib/request-limiter.ts';
test('limite por janela é aplicado e liberado quando a janela termina',()=>{
 const id='test-2026-example';
 assert.equal(checkLimit('login-test',id,2,60_000,1000).allowed,true);
 assert.equal(checkLimit('login-test',id,2,60_000,1100).allowed,true);
 assert.equal(checkLimit('login-test',id,2,60_000,1200).allowed,false);
 assert.equal(checkLimit('login-test',id,2,60_000,62_000).allowed,true);
});
