/* Permit Quest service worker (template: build.js fills in the hash and the asset list below).
   Atomic versioned precache: all assets or nothing. Cache-first from this version's cache only, no revalidation,
   so a page can never see files from two builds. A new version waits until the user taps "Update ready"
   (SKIP_WAITING message) or the app is closed and reopened. */
const V='pq-e5e7263b';
const ASSETS=["./","index.html","style.css","questions.js","signs.js","app.js","games.js","avatar.js","cars.js","town.js","fx.js","fx3d.js","x.js","manifest.webmanifest","apple-touch-icon.png","icon-192.png","icon-512.png","icon-maskable-512.png"];
self.addEventListener('install',e=>e.waitUntil((async()=>{
  await caches.delete(V);                       // drop any half-built cache from an earlier failed attempt
  const c=await caches.open(V);
  try{
    await Promise.all(ASSETS.map(async a=>{
      const req=new Request(a,{cache:'reload'}); // bypass the HTTP cache so a max-age host cannot feed us the previous build
      const r=await fetch(req);
      if(!r.ok)throw new Error(a+' '+r.status);
      if(!/\.html$/.test(a)&&a!=='./'&&/text\/html/.test(r.headers.get('content-type')||''))throw new Error(a+' came back as HTML');
      await c.put(req,r);
    }));
  }catch(err){await caches.delete(V);throw err}  // install fails, the previous worker and cache stay in charge
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k.startsWith('pq-')&&k!==V)await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('message',e=>{
  const d=e.data||{};
  if(d.type==='SKIP_WAITING')self.skipWaiting();
  else if(d.type==='GET_VERSION'&&e.source)e.source.postMessage({type:'VERSION',v:V});
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    let hit=await caches.match(r,{cacheName:V,ignoreSearch:true});
    if(hit)return hit;
    if(r.mode==='navigate'){hit=await caches.match('index.html',{cacheName:V});if(hit)return hit}
    try{return await fetch(r)}catch(_){return Response.error()}
  })());
});
