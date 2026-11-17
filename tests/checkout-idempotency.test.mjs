import test from 'node:test';
import assert from 'node:assert/strict';
import {checkoutKeyForPayload} from '../lib/checkout-idempotency.ts';
test('network retry with identical payload reuses original idempotency key',()=>{
 let serial=0;
 const key=()=>`key-${++serial}`;
 const first=checkoutKeyForPayload(null,{items:[{id:'a',quantity:1}],address:{number:'11'}},key);
 const repeated=checkoutKeyForPayload(first,{items:[{id:'a',quantity:1}],address:{number:'11'}},key);
 assert.equal(repeated.key,'key-1');assert.equal(serial,1);
});
test('cart edits, payment edits and address edits rotate idempotency key',()=>{
 let serial=0;const key=()=>`key-${++serial}`;
 const first=checkoutKeyForPayload(null,{items:[{id:'a',quantity:1}],payment:'PIX',address:'A'},key);
 const changedCart=checkoutKeyForPayload(first,{items:[{id:'a',quantity:2}],payment:'PIX',address:'A'},key);
 const changedPayment=checkoutKeyForPayload(changedCart,{items:[{id:'a',quantity:2}],payment:'CASH',address:'A'},key);
 const changedAddress=checkoutKeyForPayload(changedPayment,{items:[{id:'a',quantity:2}],payment:'CASH',address:'B'},key);
 assert.deepEqual([first.key,changedCart.key,changedPayment.key,changedAddress.key],['key-1','key-2','key-3','key-4']);
});
