import {test} from 'node:test';
import assert from 'node:assert/strict';
import {OFFICIAL_MENU,OFFICIAL_CATEGORIES} from '../lib/official-menu.ts';
test('catálogo transcrito mantém 38 produtos e dez categorias gastronômicas',()=>{
 assert.equal(OFFICIAL_MENU.length,38);
 assert.equal(OFFICIAL_CATEGORIES.length,11); // inclui bebidas sem itens/preços neste anexo
 assert.equal(new Set(OFFICIAL_MENU.map(x=>x.slug)).size,OFFICIAL_MENU.length);
});
test('todos os preços são inteiros e categorias válidas; incógnitas ficam em rascunho',()=>{
 const cats=new Set(OFFICIAL_CATEGORIES.map(x=>x[1]));
 for(const p of OFFICIAL_MENU){assert.ok(cats.has(p.category),p.slug);assert.ok(Number.isSafeInteger(p.priceCents)&&p.priceCents>0,p.slug);}
 assert.equal(OFFICIAL_MENU.filter(p=>p.published===false).length,5);
});
test('preços conferidos de itens principais',()=>{
 const bySlug=Object.fromEntries(OFFICIAL_MENU.map(p=>[p.slug,p.priceCents]));
 assert.equal(bySlug['birria'],4290);
 assert.equal(bySlug['nacho-vidal'],8990);
 assert.equal(bySlug['combo-casal'],15900);
 assert.equal(bySlug['salsa-fuego'],790);
});
