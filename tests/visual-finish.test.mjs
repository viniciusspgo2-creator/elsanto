import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const text=(name)=>readFileSync(new URL(`../${name}`,import.meta.url),'utf8');

test('premium stylesheet is loaded after the existing design foundation',()=>{
  const layout=text('app/layout.tsx');
  assert.ok(layout.indexOf("import './premium.css'")>layout.indexOf("import './globals.css'"));
});
test('admin light/dark controls remain persistent and accessible',()=>{
  const admin=text('components/AdminFrame.tsx');
  assert.match(admin,/localStorage\.setItem\('elsanto-admin-theme'/);
  assert.match(admin,/aria-pressed=\{theme==='light'\}/);
  assert.match(admin,/aria-pressed=\{theme==='dark'\}/);
  for(const page of ['/admin/cozinha','/admin/pdv','/admin/entregas','/admin/cardapio'])assert.ok(admin.includes(page));
});
test('mobile header has explicit order lookup and menu accessibility',()=>{
  const shell=text('components/ClientShell.tsx');
  assert.match(shell,/className="mobile-track"/);
  assert.match(shell,/aria-controls="public-main-navigation"/);
  assert.match(shell,/aria-expanded=\{mobile\}/);
  assert.match(shell,/Acompanhar pedido/);
});
test('editorial cards support focus and first-touch expansion',()=>{
  const cards=text('components/RevealCards.tsx');
  assert.match(cards,/:focus-visible/);
  assert.match(cards,/event\.preventDefault\(\)/);
  assert.match(cards,/reveal-explore/);
});
test('microanimations respect reduced motion and do not add yellow scroll overlay',()=>{
  const css=text('app/premium.css');
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.hero-background/);
  assert.doesNotMatch(css,/scroll.*yellow.*overlay/i);
});
