import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
try {
  await page.route("https://cdn.jsdelivr.net/**", route=>route.abort());
  await page.goto("http://127.0.0.1:8765/",{waitUntil:"load"});
  await page.locator("#heroRead").click();
  await page.locator('#readingPage p[data-para="9"]').click();
  await page.locator("#readerBookmarksBtn").click();
  await page.locator("#addReaderBookmark").click();
  await page.waitForTimeout(100);
  if(await page.locator(".bookmark-item").count()!==1)throw Error("First demo bookmark missing");
  await page.locator("#closeReaderBookmarks").click();
  await page.locator('#readingPage p[data-para="5"]').click();
  await page.locator("#readerBookmarksBtn").click();
  await page.locator("#addReaderBookmark").click();
  if(await page.locator(".bookmark-item").count()!==2)throw Error("Second demo bookmark missing");
  await page.locator(".bookmark-item").last().locator('[data-action="jump"]').click();
  const state=await page.evaluate(()=>{
    const t=document.querySelector('#readingPage p[data-para="9"]');
    const p=document.querySelector("#readerScroll").getBoundingClientRect();
    const x=t.getBoundingClientRect();
    return {highlight:t.classList.contains("highlight"),visible:x.top>=p.top&&x.top<p.bottom};
  });
  if(!state.highlight||!state.visible)throw Error("Jump failed: "+JSON.stringify(state));
  await page.reload({waitUntil:"load"});
  await page.locator("#heroRead").click();
  await page.locator("#readerBookmarksBtn").click();
  if(await page.locator(".bookmark-item").count()!==2)throw Error("Demo bookmarks not persisted across reload");
  await page.locator(".bookmark-item").last().locator('[data-action="remove"]').click();
  await page.waitForTimeout(80);
  if(await page.locator(".bookmark-item").count()!==1)throw Error("Delete demo bookmark failed");
  console.log("PASS: multiple local bookmarks, jumps, reload persistence and delete");
  const cloud=await page.evaluate(async()=>{
    const records=[];
    const id="00000000-0000-4000-a000-000000000005";
    const user={id:"00000000-0000-4000-a000-000000000099"};
    const db={from(name){
      if(name!=="bookmarks")throw Error("wrong table");
      return {
        select(){return {eq(){return this;},order(){return this;},limit(){return Promise.resolve({data:records.slice(),error:null});}};},
        insert(payload){records.push({...payload,id:"book-"+records.length});return {select(){return {single(){return Promise.resolve({data:{id:records[records.length-1].id},error:null});}};}};},
        delete(){return {eq(key,value){if(key==="id"){const i=records.findIndex(x=>x.id===value);if(i>=0)records.splice(i,1);}return this;},then(resolve){return Promise.resolve({error:null}).then(resolve);}};}
      };
    }};
    window.mbpCloud={getUser:()=>user,getClient:()=>db};
    const original=window.mbpReader;
    window.mbpReader={getState:()=>({bookId:id,title:"Test imported",isImported:true,chapter:2,para:3,paragraphs:["a","b","c","d"]}),navigate:(ch,para)=>ch===2&&para===3};
    await window.mbpBookmarksOpen();
    document.querySelector("#addReaderBookmark").click();
    await new Promise(res=>setTimeout(res,150));
    const added=records.length===1&&records[0].owner_id===user.id&&records[0].chapter_index===2;
    const listShown=document.querySelectorAll(".bookmark-item").length===1;
    document.querySelector('.bookmark-item [data-action="remove"]').click();
    await new Promise(res=>setTimeout(res,150));
    const removed=records.length===0;
    window.mbpBookmarksClose();window.mbpReader=original;
    return {added,listShown,removed};
  });
  if(!cloud.added||!cloud.listShown||!cloud.removed)throw Error("Cloud API adapter mock test failed: "+JSON.stringify(cloud));
  console.log("PASS: Supabase bookmark adapter insert, list, delete with owner-scoped fields");
} finally {await browser.close();}
