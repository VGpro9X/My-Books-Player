import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
try{
 await page.route("https://cdn.jsdelivr.net/**",r=>r.abort());
 await page.goto("http://127.0.0.1:8765/",{waitUntil:"load"});
 await page.waitForTimeout(200);
 const report=await page.evaluate(async()=>{
  const owner="55555555-5555-4555-a555-555555555555",id="66666666-6666-4666-a666-666666666666";
  const book={id,owner_id:owner,title:"Thử xung đột",author:"Test",source_format:"txt",
   source_filename:"test.txt",object_path:owner+"/"+id+"/source.txt",size_bytes:120,metadata:{chapter_count:10}};
  let server={book_id:id,owner_id:owner,chapter_index:1,paragraph_index:0,audio_offset_ms:0,revision:5};
  let connected=true,chosen=true,conflicts=0;
  const fake={
   from(table){
    return{
     select(){return query({type:"select",table,filters:{}});},
     update(values){return query({type:"update",table,values,filters:{}});},
     insert(values){return query({type:"insert",table,values,filters:{}});}
    };
   }
  };
  function query(q){
   const value=()=>{
    if(!connected)throw Error("Network unavailable");
    if(q.type==="select"){
     if(q.table==="books")return {data:[book],error:null};
     if(q.filters.book_id)return {data:{...server},error:null};
     return {data:[{...server}],error:null};
    }
    if(q.type==="update"){
     if(q.filters.revision!==server.revision)return {data:[],error:null};
     server={...server,...q.values,revision:server.revision+1};
     return {data:[{revision:server.revision}],error:null};
    }
    if(q.type==="insert")return {data:null,error:{code:"23505",message:"already exists"}};
    throw Error("Unknown query");
   };
   return {
    eq(k,v){q.filters[k]=v;return this;},
    order(){return Promise.resolve().then(value);},
    limit(){return Promise.resolve().then(value);},
    maybeSingle(){return Promise.resolve().then(value);},
    single(){return Promise.resolve().then(value);},
    select(){return Promise.resolve().then(value);},
    then(onFulfilled,onRejected){return Promise.resolve().then(value).then(onFulfilled,onRejected);}
   };
  }
  window.mbpCloud={getUser:()=>({id:owner,email:"test@example.invalid"}),getClient:()=>fake};
  window.confirm=()=>{conflicts++;return chosen;};
  await window.mbpRefreshBooks();
  server={...server,chapter_index:2,paragraph_index:8,revision:6};
  window.mbpSaveRealProgress(id,3,6);
  await window.mbpFlushRealProgress();
  const keepDevice=server.chapter_index===3&&server.paragraph_index===6&&server.revision===7&&conflicts===1;
  chosen=false;
  server={...server,chapter_index:7,paragraph_index:1,revision:8};
  window.mbpSaveRealProgress(id,5,3);
  await window.mbpFlushRealProgress();
  const keepCloud=server.chapter_index===7&&server.paragraph_index===1&&server.revision===8&&conflicts===2;
  connected=false;
  window.mbpSaveRealProgress(id,6,5);
  try{await window.mbpFlushRealProgress();}catch{}
  const pending=(await window.mbpOffline.pendingList(owner)).length===1;
  connected=true;chosen=true;
  await window.mbpFlushRealProgress();
  const replay=server.chapter_index===6&&server.paragraph_index===5&&server.revision===9&&(await window.mbpOffline.pendingList(owner)).length===0;
  await window.mbpOffline.clearOwner(owner);
  return {keepDevice,keepCloud,pending,replay,conflicts,serverRev:server.revision};
 });
 for(const key of ["keepDevice","keepCloud","pending","replay"]){
  if(!report[key])throw Error("CAS conflict/queue test: "+JSON.stringify(report));
  console.log("PASS: "+key);
 }
}finally{await browser.close();}
