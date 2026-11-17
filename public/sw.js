/* El Santo PWA — public assets only. Orders, administration, tables and APIs are never cached. */
const CACHE='el-santo-public-v4';
const OFFLINE='/offline.html';
const SHELL=['/','/cardapio','/sobre','/contato','/icons/icon-192.png',OFFLINE];
const PUBLIC_PAGES=new Set(['/','/cardapio','/sobre','/contato']);
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith('el-santo-public-')&&name!==CACHE).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  // Versioned JavaScript/CSS assets are safe to cache and required for public pages to hydrate offline.
  if(url.pathname.startsWith('/_next/static/')){
    event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response.ok){const copy=response.clone();void caches.open(CACHE).then(cache=>cache.put(request,copy));}
      return response;
    })));
    return;
  }
  // Never cache private routes, order pages, APIs or query strings (QR table tokens).
  if(url.search||/^\/(api|admin|entregador|pedido|_next)\b/.test(url.pathname))return;
  if(PUBLIC_PAGES.has(url.pathname)&&request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{
      if(response.ok){const copy=response.clone();void caches.open(CACHE).then(cache=>cache.put(url.pathname,copy));}
      return response;
    }).catch(async()=>await caches.match(url.pathname)||await caches.match(OFFLINE)));
    return;
  }
  if(/^\/(images|icons)\//.test(url.pathname)){
    event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response.ok){const copy=response.clone();void caches.open(CACHE).then(cache=>cache.put(request,copy));}
      return response;
    })));
  }
});
