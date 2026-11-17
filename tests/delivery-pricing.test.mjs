import {test} from 'node:test';
import assert from 'node:assert/strict';
import {neighborhoodKey,priceByDistance,applyFreeDelivery} from '../lib/delivery-pricing-core.ts';
test('neighborhood key disregards accents, punctuation and case',()=>{
 assert.equal(neighborhoodKey(' Vila Santo Antônio '),'vila santo antonio');
 assert.equal(neighborhoodKey('VILA  SANTO-ANTONIO'),'vila santo antonio');
});
test('distance price uses exact meters-derived km and integer cents rounded up',()=>{
 assert.equal(priceByDistance(400,150,4.2),1030);
 assert.equal(priceByDistance(0,199,1.5),299);
 assert.throws(()=>priceByDistance(400,-20,2));
});
test('free delivery threshold only applies once reached',()=>{
 assert.equal(applyFreeDelivery(690,8999,9000),690);
 assert.equal(applyFreeDelivery(690,9000,9000),0);
 assert.equal(applyFreeDelivery(690,9000,null),690);
});
