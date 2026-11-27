const CACHE="vetprep-ccc2ebbf48";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon-192-v2.png","./icon-512-v2.png","./apple-touch-icon-v2.png"];
self.addEventListener("install", e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())); });
const PHOTOS="vetprep-breeds", PHOTO_HOSTS=["images.dog.ceo"];
self.addEventListener("activate", e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==PHOTOS).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch", e=>{
  if(e.request.method!=="GET") return;
  const u=new URL(e.request.url);
  if(PHOTO_HOSTS.indexOf(u.hostname)>=0){ e.respondWith(caches.open(PHOTOS).then(c=>c.match(e.request.url)).then(hit=>hit||fetch(e.request)).catch(()=>fetch(e.request))); return; }
  // the photo review page changes often: always try the network first
  if(u.origin===self.location.origin && /\/fotos-gatos\.html$/.test(u.pathname)){ e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreSearch:true}))); return; }
  // the cat photos shipped with the app: kept in the photo cache (which survives app updates), fetched once
  if(u.origin===self.location.origin && u.pathname.indexOf("/breeds/")>=0){ e.respondWith(caches.open(PHOTOS).then(c=>c.match(e.request.url).then(hit=>hit||fetch(e.request).then(r=>{ if(r&&r.ok) c.put(e.request.url,r.clone()); return r; }))).catch(()=>fetch(e.request))); return; }
  if(u.origin!==self.location.origin) return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(r=>{ if(r&&r.ok){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); } return r; }).catch(()=>hit);
    return hit||net;
  }));
});
