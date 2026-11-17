import test from 'node:test';
import assert from 'node:assert/strict';
import {acceptsOrder} from '../lib/order-acceptance.ts';
test('online pause blocks web and QR but leaves internal POS available',()=>{
 assert.equal(acceptsOrder(false,'WEB'),false);
 assert.equal(acceptsOrder(false,'TABLE'),false);
 assert.equal(acceptsOrder(false,'POS'),true);
});
test('store with no manual pause can accept all channels',()=>{
 for(const override of [true,null])for(const source of ['WEB','TABLE','POS'])assert.equal(acceptsOrder(override,source),true);
});
