import {test} from 'node:test';
import assert from 'node:assert/strict';
import {currency,publicOrderNumber,cleanPhone,whatsAppLink,mapsUrl,wazeUrl,safeAddressText} from '../lib/format.ts';
import {ORDER_TRANSITIONS} from '../lib/order-states.ts';
test('money uses integer cents formatted as BRL',()=>{
 assert.match(currency(12345),/123,45/);
 assert.match(currency(0),/0,00/);
});
test('safe public numbering and phone formatting',()=>{
 assert.equal(publicOrderNumber(12),'ES-00012');
 assert.equal(cleanPhone('(17) 99999-9999'),'17999999999');
});
test('WhatsApp links always encode text instead of injecting URL separators',()=>{
 const url=new URL(whatsAppLink('Teste & link /pedido/abc'));
 assert.equal(url.hostname,'wa.me');
 assert.equal(url.searchParams.get('text'),'Teste & link /pedido/abc');
});
test('navigation links use correct destination parameters',()=>{
 const a=safeAddressText({street:'Rua Saldanha Marinho',number:'4011',city:'São José do Rio Preto',state:'SP'});
 assert.ok(mapsUrl(a).includes('api=1'));
 assert.equal(new URL(mapsUrl(a)).searchParams.get('destination'),a);
 assert.equal(new URL(wazeUrl(a)).searchParams.get('q'),a);
});
test('lifecycle does not allow completed orders to reopen',()=>{
 assert.deepEqual(ORDER_TRANSITIONS.COMPLETED,[]);
 assert.ok(ORDER_TRANSITIONS.RECEIVED.includes('CONFIRMED'));
 assert.ok(!ORDER_TRANSITIONS.RECEIVED.includes('COMPLETED'));
});
