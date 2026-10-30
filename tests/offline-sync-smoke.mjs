import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const page=await context.newPage();
try{
  await page.route("https://cdn.jsdelivr.net/**",r=>r.abort());
  await page.goto("http://127.0.0.1:8765/",{waitUntil:"load"});
  const id="11111111-1111-4111-a111-111111111111",owner="22222222-2222-4222-a222-222222222222";
  const stored=await page.evaluate(async({id,owner})=>{
    const app=window.mbpOffline;
    if(!app)throw Error("Offline adapter not registered");
    const book={id,name:"Offline thử nghiệm",author:"Tác giả",sourceFormat:"txt",isImported:true};
    const chapters=[{title:"Chương 1",paragraphs:["Đoạn thứ nhất","Đoạn thứ hai"]},{title:"Chương 2",paragraphs:["Nội dung cuối"]}];
    await app.saveBook(owner,book,chapters);
    const b=await app.getBook(owner,id);
    const list=await app.listBooks(owner);
    const content=await app.getChapters(owner,id);
    await app.savePosition(owner,id,2,0);
    const position=(await app.getBook(owner,id)).position;
    await app.pendingPut(owner,id,{chapter:2,para:0,ms:4000,userId:owner});
    const pending=await app.pendingList(owner);
    return {cached:!!b&&b.book.id===id,listed:list.length===1,chapters:content?.length,localPosition:position.chapter===2&&position.para===0,pending:pending.length,privacy:(await app.listBooks("33333333-3333-4333-a333-333333333333")).length===0};
  },{id,owner});
  for(const [k,v] of Object.entries(stored)){
   if(k==="chapters"?v!==2:v!==true&&k!=="pending"||k==="pending"&&v!==1)throw Error("Offline IndexedDB test failed: "+JSON.stringify(stored));
  }
  console.log("PASS: opted-in private book chapters persist in IndexedDB per account");
  console.log("PASS: pending reading position queued offline in per-account store");
  await page.reload({waitUntil:"load"});
  const persist=await page.evaluate(async({id,owner})=>{
   const snapshot=await window.mbpOffline.getBook(owner,id);
   return {book:!!snapshot,position:snapshot?.position?.chapter===2&&snapshot?.position?.para===0,pending:(await window.mbpOffline.pendingList(owner)).length};
  },{id,owner});
  if(!persist.book||!persist.position||persist.pending!==1)throw Error("Cache did not survive reload: "+JSON.stringify(persist));
  console.log("PASS: offline cache and queued position survive page reload");
  // Simulate an authenticated account whose Supabase calls fail while a saved book exists.
  await page.evaluate(async({id,owner})=>{
    window.mbpCloud={
      getUser:()=>({id,email:"offline-test@example.invalid"}),
      getClient:()=>({from:()=>{throw Error("Network offline");}})
    };
    const before=await window.mbpOffline.listBooks(owner);
    try{await window.mbpRefreshBooks();}catch(e){throw Error("refresh fallback failed; cached before="+before.length+" user="+window.mbpCloud.getUser()?.id+" error="+e.message);}
    if(!window.mbpApp.getBook(id))throw Error("Cached library book not listed when cloud fails.");
    window.mbpApp.openBook(id);
  },{id,owner});
  await page.waitForFunction(()=>!document.querySelector("#reader").hidden&&document.querySelector("#readingPage").textContent.includes("Nội dung cuối"));
  const positionRestored=await page.evaluate(()=>window.mbpReader.getState().chapter===2);
  if(!positionRestored)throw Error("Integrated Reader didn't restore cached chapter 2.");
  await page.locator("#exitReader").click();
  console.log("PASS: private offline book opens in actual Reader at saved chapter without Supabase");
  // A real browser offline re-navigation must be served by the app-shell Service Worker.
  await page.evaluate(()=>navigator.serviceWorker?.ready);
  await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,{timeout:15000});
  await context.setOffline(true);
  await page.goto("http://127.0.0.1:8765/?airplane-test=1",{waitUntil:"domcontentloaded",timeout:15000});
  if(!await page.locator("#heroRead").count())throw Error("Offline shell did not load");
  console.log("PASS: URL website app shell opens with internet disabled, no APK needed");
  await context.setOffline(false);
  await page.evaluate(async({owner})=>{
   await window.mbpOffline.clearOwner(owner);
  },{owner});
  const erased=await page.evaluate(async({owner})=>({books:(await window.mbpOffline.listBooks(owner)).length,pending:(await window.mbpOffline.pendingList(owner)).length}),{owner});
  if(erased.books!==0||erased.pending!==0)throw Error("User offline data purge failed");
  console.log("PASS: private offline books and pending records can be cleared");
}finally{await browser.close();}
