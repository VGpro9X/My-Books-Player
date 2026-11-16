import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});
const page=await context.newPage();
try{
 await page.route("https://cdn.jsdelivr.net/**",route=>route.abort());
 await page.goto("http://127.0.0.1:8765/",{waitUntil:"load"});
 await page.addScriptTag({path:"./node_modules/jszip/dist/jszip.min.js"});
 const initial=await page.evaluate(async()=>{
  const owner="22222222-2222-4222-a222-222222222222";
  const id="11111111-1111-4111-a111-111111111111";
  const text="Chương 1: Mở đầu\n\nĐoạn đầu của cuốn sách.\n\nMột đoạn tiếp theo.";
  const original=new File([text],"sample.txt",{type:"text/plain"});
  const objectPath=owner+"/"+id+"/source.txt";
  const records={
   books:[{id,owner_id:owner,title:"Sách kiểm thử sao lưu",author:"Tác giả",source_format:"txt",
     source_filename:"sample.txt",size_bytes:original.size,object_path:objectPath,metadata:{chapter_count:1}}],
   reading_progress:[{owner_id:owner,book_id:id,chapter_index:1,paragraph_index:1,audio_offset_ms:15000}],
   bookmarks:[{id:"33333333-3333-4333-a333-333333333333",owner_id:owner,book_id:id,
     chapter_index:1,paragraph_index:1,label:"Một đoạn tiếp theo."}],
   user_settings:[{owner_id:owner,reader_options:{fontSize:20},app_options:{saved:[]}}]
  };
  const objects=new Map([[objectPath,original]]);
  const counts={uploads:0,downloads:0,restoreBooks:0};
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function filtered(table,filters){
   return records[table].filter(r=>Object.entries(filters).every(([k,v])=>r[k]===v));
  }
  const db={
   from(table){
    if(!records[table])throw Error("Unknown table: "+table);
    return {
     select(){
      const filters={};let sorted=null;
      return{
       eq(k,v){filters[k]=v;return this;},
       order(field){sorted=field;return this;},
       range(from,to){
        const rows=filtered(table,filters);
        if(sorted)rows.sort((a,b)=>String(a[sorted]).localeCompare(String(b[sorted])));
        return Promise.resolve({data:clone(rows.slice(from,to+1)),error:null});
       },
       maybeSingle(){return Promise.resolve({data:clone(filtered(table,filters)[0]||null),error:null});}
      };
     },
     insert(value){
      const array=Array.isArray(value)?value:[value];
      for(const obj of array){records[table].push(clone(obj));if(table==="books")counts.restoreBooks++;}
      return Promise.resolve({error:null});
     },
     upsert(value){
      const rows=records[table],fields=table==="reading_progress"?["owner_id","book_id"]:["owner_id"];
      const old=rows.find(row=>fields.every(k=>row[k]===value[k]));
      if(old)Object.assign(old,clone(value));else rows.push(clone(value));
      return Promise.resolve({error:null});
     },
     delete(){
      const filters={};
      const chain={
       eq(k,v){filters[k]=v;return this;},
       then(onOk,onFail){
        records[table]=records[table].filter(r=>!Object.entries(filters).every(([k,v])=>r[k]===v));
        return Promise.resolve({error:null}).then(onOk,onFail);
       }
      };return chain;
     }
    };
   },
   storage:{from(bucket){
    if(bucket!=="my-books-private")throw Error("Wrong storage bucket");
    return{
     download(path){counts.downloads++;return Promise.resolve(objects.has(path)?{data:objects.get(path),error:null}:{error:new Error("Missing file")});},
     upload(path,file){counts.uploads++;if(objects.has(path))return Promise.resolve({error:new Error("Overwrite attempt")});objects.set(path,file);return Promise.resolve({data:{path},error:null});},
     remove(paths){for(const path of paths)objects.delete(path);return Promise.resolve({error:null});}
    };
   }}
  };
  window.mbpCloud={getUser:()=>({id:owner,email:"test@example.invalid"}),getClient:()=>db};
  window.mbpRefreshBooks=async()=>{};
  window.confirm=()=>true;
  window.__backupTest={records,objects,owner,counts,originalText:text};
  const originalUrl=URL.createObjectURL.bind(URL);
  URL.createObjectURL=blob=>{window.__lastBackupBlob=blob;return originalUrl(blob);};
  return {account:true,ui:!!document.querySelector("#backupOpen")};
 });
 if(!initial.ui)throw Error("Backup UI not present");
 const report=await page.evaluate(async()=>{try{return await window.mbpBackup.createBackup();}catch(e){return {error:String(e),stack:String(e.stack)};}});
 if(report.error)throw Error("Backup export error: "+report.error+" "+report.stack);
 const hasBlob=await page.evaluate(()=>window.__lastBackupBlob instanceof Blob);
 if(!hasBlob)throw Error("Backup ZIP was not created in browser");
 if(report.count!==1||report.size<=0)throw Error("ZIP export failed: "+JSON.stringify(report));
 console.log("PASS: Exported portable ZIP with original TXT via private Supabase storage");
 const parsed=await page.evaluate(async()=>{
  const archive=new File([window.__lastBackupBlob],"backup.zip",{type:"application/zip"});
  const preview=await window.mbpBackup.inspect(archive);
  const manifest=preview.manifest;
  window.__backupTest.preview=preview;
  const source=await preview.zip.file(manifest.books[0].archivePath).async("text");
  return {format:manifest.format,version:manifest.version,books:manifest.books.length,
   marks:manifest.books[0].bookmarks.length,
   progress:manifest.books[0].progress.paragraph_index,
   textMatches:source===window.__backupTest.originalText,
   settings:!!manifest.settings,
   leakedCredentials:JSON.stringify(manifest).includes("sb_publishable_")||JSON.stringify(manifest).includes("access_token")};
 });
 if(parsed.format!=="my-books-player-backup"||parsed.version!==1||parsed.books!==1||parsed.marks!==1||
    parsed.progress!==1||!parsed.textMatches||!parsed.settings||parsed.leakedCredentials)
   throw Error("Backup content validation failed: "+JSON.stringify(parsed));
 console.log("PASS: Source book, bookmark, reading progress, and settings in ZIP without account secrets");
 const invalid=await page.evaluate(()=>{
  const broken={format:"my-books-player-backup",version:1,books:[{
   title:"Danger",author:"",source_format:"txt",source_filename:"bad.txt",
   size_bytes:10,archivePath:"../../evil.txt",bookmarks:[],progress:null
  }]};
  try{window.mbpBackup.validateManifest(broken);return false;}catch{return true;}
 });
 if(!invalid)throw Error("Traversal in backup manifest accepted");
 console.log("PASS: Rejects unsafe backup paths");
 const restored=await page.evaluate(()=>window.mbpBackup.restore(window.__backupTest.preview,false));
 const result=await page.evaluate(()=>{
  const {records,objects,owner,counts}=window.__backupTest;
  const original=records.books.find(b=>b.id==="11111111-1111-4111-a111-111111111111");
  const copy=records.books.find(b=>b.id!==original.id);
  return {bookCount:records.books.length,restoredIdNew:!!copy&&copy.id!==original.id,
   ownerCorrect:copy?.owner_id===owner&&copy?.object_path.startsWith(owner+"/"),
   bookmarksForCopy:records.bookmarks.filter(b=>b.book_id===copy?.id).length,
   progressForCopy:records.reading_progress.find(p=>p.book_id===copy?.id)?.paragraph_index,
   sourceCopied:objects.has(copy?.object_path),settingsUnchanged:records.user_settings[0].reader_options.fontSize===20,
   uploads:counts.uploads,downloads:counts.downloads};
 });
 if(restored.restored!==1||result.bookCount!==2||!result.restoredIdNew||!result.ownerCorrect||
   result.bookmarksForCopy!==1||result.progressForCopy!==1||!result.sourceCopied||!result.settingsUnchanged)
  throw Error("Non-destructive restore failed: "+JSON.stringify(result));
 console.log("PASS: Restore creates new book, remaps bookmarks/progress, and preserves original book");
 console.log("PASS: Existing user settings unchanged unless restore option selected");
}finally{await browser.close();}
