/* Static offline shell for My Books Player v0.7.
 * Never cache Supabase API, user audio, or private book content.
 * Books themselves are opt-in in IndexedDB via reader-offline.js.
 */
const CACHE="my-books-shell-0.7.0";
const root=new URL("./",self.location).pathname;
const files=["","index.html","cloud.js","book-parser.js","book-library.js",
 "reader-bookmarks.js","reader-audio.js","reader-offline.js"];
const cdn=[
 "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/dist/umd/supabase.min.js",
 "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"
];
const localFiles=new Set(files.map(p=>root+p));
const knownCdn=new Set(cdn);
self.addEventListener("install",e=>{
 e.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(files.map(p=>new URL(p,self.registration.scope).toString()));
  // CDN availability must never prevent offline shell activation.
  await Promise.allSettled(cdn.map(url=>fetch(url,{mode:"no-cors"})
    .then(response=>cache.put(url,response))));
  await self.skipWaiting();
 })());
});
self.addEventListener("activate",e=>{
 e.waitUntil((async()=>{
  for(const key of await caches.keys()){
   if(key.startsWith("my-books-shell-")&&key!==CACHE)await caches.delete(key);
  }
  await self.clients.claim();
 })());
});
self.addEventListener("fetch",e=>{
 const req=e.request,url=new URL(req.url);
 if(req.method!=="GET")return;
 // Supabase auth, storage, metadata and personalized responses must never enter SW cache.
 if(url.hostname.endsWith("supabase.co"))return;
 if(knownCdn.has(url.href)){
  e.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   const hit=await cache.match(req);
   if(hit)return hit;
   try{const res=await fetch(req);if(res.ok||res.type==="opaque")cache.put(req,res.clone()).catch(()=>{});return res;}
   catch{ return Response.error(); }
  })());
  return;
 }
 if(url.origin!==self.location.origin||!url.pathname.startsWith(root))return;
 const navigation=req.mode==="navigate";
 const isShell=localFiles.has(url.pathname)||(navigation&&url.pathname===root);
 if(!isShell)return;
 e.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(navigation){
   try{const network=await fetch(req);if(network.ok)cache.put(new URL("./index.html",self.registration.scope).toString(),network.clone()).catch(()=>{});return network;}
   catch{return await cache.match(new URL("./index.html",self.registration.scope).toString())||Response.error();}
  }
  const cached=await cache.match(url.origin+url.pathname);
  if(cached)return cached;
  try{const network=await fetch(req);if(network.ok)cache.put(url.origin+url.pathname,network.clone()).catch(()=>{});return network;}
  catch{return Response.error();}
 })());
});
