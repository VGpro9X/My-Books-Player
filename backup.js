/* My Books Player v0.8 — portable, private backup/restore of TXT/EPUB.
 * All processing in this browser. ZIP contains original uploaded books, position,
 * bookmarks and optional reader settings. Never includes auth tokens or passwords.
 * Files stored unencrypted inside ZIP: user must keep archive private.
 */
(() => {
"use strict";
const BUCKET="my-books-private";
const FORMAT="my-books-player-backup",VERSION=1;
const MAX_BOOKS=300,MAX_TOTAL=160*1024*1024,MAX_SOURCE=20*1024*1024,MAX_ZIP=190*1024*1024;
const $=id=>document.getElementById(id);
const html=document.createElement("div");html.id="backupOverlay";html.className="backup-overlay";html.hidden=true;
html.innerHTML='<section class="backup-card" role="dialog" aria-modal="true" aria-labelledby="backupTitle">'+
'<div class="backup-heading"><h2 id="backupTitle">Sao lưu & khôi phục thư viện</h2><button type="button" id="backupClose" aria-label="Đóng">×</button></div>'+
'<p class="backup-hint">Tạo tệp ZIP chứa sách TXT/EPUB gốc, dấu trang, tiến độ đọc/nghe và cài đặt. Tệp chỉ tải xuống thiết bị của bạn.</p>'+
'<button id="backupExport" class="backup-primary" type="button">↓ Sao lưu toàn bộ thư viện</button>'+
'<div class="backup-divider"></div>'+
'<label for="backupChoose">Chọn tệp ZIP My Books Player đã sao lưu</label>'+
'<input type="file" id="backupChoose" accept=".zip,application/zip">'+
'<div id="backupPreview" class="backup-hint">Chưa chọn tệp.</div>'+
'<label class="backup-checkbox"><input type="checkbox" id="backupSettings"> Khôi phục cài đặt Reader và giao diện (ghi đè cài đặt hiện tại)</label>'+
'<button id="backupRestore" class="backup-primary" disabled type="button">↑ Khôi phục thành sách mới</button>'+
'<p class="backup-hint"><strong>Quan trọng:</strong> ZIP không có mật khẩu/mã xác thực, nhưng chứa nội dung sách riêng tư dưới dạng chưa mã hóa. Chỉ lưu vào nơi an toàn. Khôi phục tạo các bản sách mới, <strong>không xóa hoặc ghi đè</strong> sách đang có. Cần mạng và đăng nhập.</p>'+
'<p id="backupStatus" class="backup-status" role="status">Sẵn sàng.</p></section>';
document.body.appendChild(html);
const style=document.createElement("style");
style.textContent=".backup-overlay{position:fixed;z-index:121;inset:0;background:#0a0812c9;display:flex;align-items:center;justify-content:center;padding:14px}.backup-overlay[hidden]{display:none}.backup-card{background:var(--surface);color:var(--fg);border-radius:18px;padding:22px;max-height:94dvh;overflow:auto;width:min(510px,100%);box-shadow:var(--shadow)}.backup-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.backup-heading h2{font-size:19px;margin:0}.backup-heading button{background:none;border:0;font-size:26px;color:var(--fg)}.backup-hint{font-size:12px;color:var(--muted);line-height:1.65;overflow-wrap:anywhere;margin:13px 0}.backup-card label{display:block;margin:12px 0 7px;font-size:13px;font-weight:700}.backup-card input[type=file]{display:block;width:100%;padding:10px;border:1px solid var(--line);background:var(--bg);border-radius:9px;color:var(--fg)}.backup-checkbox{display:flex!important;align-items:flex-start;gap:8px;line-height:1.6;font-weight:500!important}.backup-checkbox input{margin-top:4px}.backup-primary{background:var(--pink);border:0;color:white;border-radius:10px;padding:12px 15px;font-weight:800;width:100%;margin:7px 0}.backup-primary:disabled{opacity:.5}.backup-divider{border-top:1px solid var(--line);margin:15px 0}.backup-status{background:var(--tint);padding:12px;border-radius:10px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;min-height:40px}";
document.head.appendChild(style);
const openButton=document.createElement("button");
openButton.id="backupOpen";openButton.type="button";openButton.textContent="Sao lưu / Khôi phục";
openButton.style.marginTop="10px";
$("cloudSigned")?.appendChild(openButton);
let prepared=null,busy=false;
const status=s=>{$("backupStatus").textContent=s;};
const getUser=()=>window.mbpCloud?.getUser?.();
const getClient=()=>window.mbpCloud?.getClient?.();
function session(owner){const user=getUser(),db=getClient();if(!user||!db||owner&&user.id!==owner)throw Error("Bạn cần đăng nhập đúng tài khoản để sao lưu.");return {owner:user.id,db};}
function ready(){
 if(!window.JSZip)throw Error("Không tải được thư viện ZIP. Kiểm tra Internet rồi thử lại.");
}
function setBusy(value){
 busy=value;for(const id of ["backupExport","backupRestore","backupChoose","backupSettings","backupClose"])
 $(id).disabled=value||id==="backupRestore"&&!prepared;
}
function close(){if(busy)return;html.hidden=true;}
function open(){try{session();}catch(e){window.mbpAuthOpen?.();return;}html.hidden=false;status("Sao lưu/khôi phục chỉ sử dụng dữ liệu trong tài khoản đang đăng nhập.");}
openButton.onclick=open;
$("backupClose").onclick=close;
html.addEventListener("click",e=>{if(e.target===html)close();});
function validText(x,max){return typeof x==="string"&&x.length<=max;}
function safeName(x){return String(x||"").replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,100);}
function checkFormat(data){
 if(!data||data.format!==FORMAT||data.version!==VERSION||!Array.isArray(data.books)||data.books.length>MAX_BOOKS)throw Error("Không đúng định dạng ZIP My Books Player v1.");
 let total=0;
 const paths=new Set();
 for(const [i,b] of data.books.entries()){
  if(!b||!["txt","epub"].includes(b.source_format)||!validText(b.title,180)||!b.title.trim()||
     !validText(b.author||"",120)||!validText(b.source_filename||"",250)||
     !validText(b.archivePath,160)||!/^sources\/[a-f0-9-]{36}\.(txt|epub)$/.test(b.archivePath)||
     !Number.isSafeInteger(b.size_bytes)||b.size_bytes<=0||b.size_bytes>MAX_SOURCE)throw Error("Metadata sách thứ "+(i+1)+" không hợp lệ.");
  if(paths.has(b.archivePath))throw Error("Có file sách trùng trong gói sao lưu.");
  paths.add(b.archivePath);
  const progress=b.progress;
  if(progress!=null&&(!Number.isInteger(progress.chapter_index)||progress.chapter_index<1||
      !Number.isInteger(progress.paragraph_index)||progress.paragraph_index<0||
      !Number.isSafeInteger(progress.audio_offset_ms)||progress.audio_offset_ms<0))throw Error("Vị trí đọc không hợp lệ.");
  if(!Array.isArray(b.bookmarks)||b.bookmarks.length>1000)throw Error("Dấu trang của sách không hợp lệ.");
  for(const mark of b.bookmarks){
   if(!Number.isInteger(mark.chapter_index)||mark.chapter_index<1||!Number.isInteger(mark.paragraph_index)||mark.paragraph_index<0||
      !validText(mark.label||"",140))throw Error("Một dấu trang bị lỗi.");
  }
  total+=b.size_bytes;
 }
 if(total>MAX_TOTAL)throw Error("Gói sao lưu quá lớn (giới hạn 160 MB dữ liệu sách).");
 if(data.settings!=null&&(
   typeof data.settings!=="object"||Array.isArray(data.settings)||
   typeof data.settings.reader_options!=="object"||Array.isArray(data.settings.reader_options)||
   typeof data.settings.app_options!=="object"||Array.isArray(data.settings.app_options)
 ))throw Error("Cài đặt trong gói sao lưu không hợp lệ.");
 return total;
}
async function pages(db,table,fields,owner){
 const all=[];
 for(let from=0;from<=10000;from+=100){
  const response=await db.from(table).select(fields).eq("owner_id",owner).range(from,from+99);
  if(response.error)throw response.error;
  const part=response.data||[];
  all.push(...part);
  if(part.length<100)return all;
 }
 throw Error("Quá nhiều bản ghi, hãy liên hệ để xuất theo lô.");
}
async function snapshot(){
 const {db,owner}=session();
 const [books,progress,marks,settings]=await Promise.all([
  pages(db,"books","id,title,author,source_format,source_filename,object_path,size_bytes,metadata",owner),
  pages(db,"reading_progress","book_id,chapter_index,paragraph_index,audio_offset_ms",owner),
  pages(db,"bookmarks","book_id,chapter_index,paragraph_index,label",owner),
  db.from("user_settings").select("reader_options,app_options").eq("owner_id",owner).maybeSingle()
 ]);
 if(settings.error)throw settings.error;
 if(books.length>MAX_BOOKS)throw Error("Tối đa 300 cuốn mỗi tệp ZIP; thư viện hiện lớn hơn giới hạn.");
 const index=new Map(progress.map(p=>[p.book_id,p])), grouped=new Map();
 for(const b of books)grouped.set(b.id,[]);
 for(const m of marks)grouped.get(m.book_id)?.push({
  chapter_index:m.chapter_index,paragraph_index:m.paragraph_index,label:m.label||""
 });
 const bookList=books.map(b=>({
  id:b.id,title:b.title,author:b.author||"",source_format:b.source_format,
  source_filename:b.source_filename||("source."+b.source_format),size_bytes:b.size_bytes,
  archivePath:"sources/"+b.id+"."+b.source_format,
  metadata:{chapter_count:Number(b.metadata?.chapter_count)||0},
  progress:index.has(b.id)?{
   chapter_index:index.get(b.id).chapter_index,
   paragraph_index:index.get(b.id).paragraph_index,
   audio_offset_ms:Number(index.get(b.id).audio_offset_ms)||0
  }:null,
  bookmarks:grouped.get(b.id)||[],
  object_path:b.object_path
 }));
 return {bookList,settings:settings.data?{
  reader_options:settings.data.reader_options||{},
  app_options:settings.data.app_options||{}
 }:null,owner,db};
}
function validateZipEntries(zip,manifest){
 const keys=Object.keys(zip.files);
 if(keys.length>MAX_BOOKS+20)throw Error("ZIP có quá nhiều mục.");
 let size=0;
 for(const entry of Object.values(zip.files)){
  if(entry.dir)continue;
  const length=Number(entry._data?.uncompressedSize);
  if(!Number.isSafeInteger(length)||length<0)throw Error("Tệp ZIP có kích thước không xác định.");
  size+=length;
  if(size>MAX_TOTAL+3*1024*1024)throw Error("ZIP quá lớn sau giải nén.");
 }
 for(const b of manifest.books){
  const file=zip.file(b.archivePath);
  if(!file||file.dir||file._data.uncompressedSize!==b.size_bytes)
   throw Error("ZIP thiếu sách hoặc kích thước file không đúng: "+b.title);
 }
}
async function createBackup(){
 ready();const {bookList,settings,owner,db}=await snapshot();
 let total=0;
 const zip=new JSZip();
 const manifest={format:FORMAT,version:VERSION,createdAt:new Date().toISOString(),books:[],settings};
 for(const [i,b] of bookList.entries()){
  session(owner);
  total+=b.size_bytes;
  if(total>MAX_TOTAL)throw Error("Dữ liệu sách vượt 160 MB. Chưa tạo file, vui lòng liên hệ để sao lưu thành nhiều phần.");
  status("Đang tải "+(i+1)+"/"+bookList.length+": "+b.title);
  const {data,error}=await db.storage.from(BUCKET).download(b.object_path);
  if(error)throw error;
  if(data.size!==b.size_bytes)throw Error("Kích thước sách đã thay đổi, hãy thử sao lưu lại: "+b.title);
  zip.file(b.archivePath,data,{binary:true});
  const {object_path,...publicData}=b;
  manifest.books.push(publicData);
 }
 checkFormat(manifest);
 zip.file("manifest.json",JSON.stringify(manifest,null,2));
 status("Đang đóng gói ZIP, không đóng trang…");
 const blob=await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:1}});
 if(blob.size>MAX_ZIP)throw Error("ZIP tạo ra quá lớn cho lần sao lưu này.");
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="my-books-player-backup-"+new Date().toISOString().slice(0,10)+".zip";
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),45000);
 status("Đã chuẩn bị tải ZIP: "+bookList.length+" cuốn ("+(blob.size/1048576).toFixed(2)+" MB). Giữ tệp tại nơi an toàn.");
 return {count:bookList.length,size:blob.size};
}
async function inspect(file){
 ready();if(!file||file.size>MAX_ZIP)throw Error("File ZIP vượt giới hạn 190 MB.");
 const zip=await JSZip.loadAsync(file,{checkCRC32:false});
 const f=zip.file("manifest.json");
 if(!f||Number(f._data.uncompressedSize)>2*1024*1024)throw Error("Thiếu manifest.json hoặc manifest quá lớn.");
 const parsed=JSON.parse(await f.async("text"));
 const bytes=checkFormat(parsed);
 validateZipEntries(zip,parsed);
 return {zip,manifest:parsed,bytes};
}
async function restore(preview,withSettings){
 ready();
 const {owner,db}=session();
 const books=preview.manifest.books;
 if(!confirm("Khôi phục "+books.length+" cuốn vào tài khoản này?\n\nCác cuốn sẽ được tạo thành BẢN MỚI, có thể xuất hiện trùng tên. Không xóa sách hiện có."))return {cancelled:true};
 let count=0;
 for(const [i,b] of books.entries()){
  session(owner);
  status("Đang khôi phục "+(i+1)+"/"+books.length+": "+b.title);
  const src=preview.zip.file(b.archivePath);
  const raw=await src.async("blob");
  if(raw.size!==b.size_bytes)throw Error("Kích thước tệp trong ZIP không khớp.");
  const file=new File([raw],b.source_filename||"source."+b.source_format,{
   type:b.source_format==="epub"?"application/epub+zip":"text/plain"
  });
  const parsed=await window.mbpBookParser.parseFile(file);
  if(!parsed.chapters.length)throw Error("Không đọc được nội dung sách: "+b.title);
  const id=crypto.randomUUID(),path=owner+"/"+id+"/source."+b.source_format;
  let uploaded=false,inserted=false;
  try{
   const u=await db.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false});
   if(u.error)throw u.error;uploaded=true;
   session(owner);
   const saved=await db.from("books").insert({
    id,owner_id:owner,title:b.title,author:b.author,source_format:b.source_format,
    source_filename:b.source_filename,object_path:path,size_bytes:file.size,
    metadata:{chapter_count:parsed.chapters.length,format_version:1,restoredAt:new Date().toISOString()}
   });
   if(saved.error)throw saved.error;inserted=true;
   if(b.progress){
    const p=b.progress;
    const res=await db.from("reading_progress").upsert({
     owner_id:owner,book_id:id,chapter_index:Math.min(p.chapter_index,parsed.chapters.length),
     paragraph_index:p.paragraph_index,audio_offset_ms:p.audio_offset_ms,
     updated_at:new Date().toISOString()
    },{onConflict:"owner_id,book_id"});
    if(res.error)throw res.error;
   }
   if(b.bookmarks.length){
    const data=b.bookmarks.map(m=>({
     owner_id:owner,book_id:id,chapter_index:Math.min(m.chapter_index,parsed.chapters.length),
     paragraph_index:m.paragraph_index,label:m.label
    }));
    for(let j=0;j<data.length;j+=100){
     const res=await db.from("bookmarks").insert(data.slice(j,j+100));
     if(res.error)throw res.error;
    }
   }
   count++;
  }catch(err){
   // Roll back only newly created resources; never modify existing user books.
   if(inserted)await db.from("books").delete().eq("owner_id",owner).eq("id",id).then(()=>{}).catch(()=>{});
   if(uploaded)await db.storage.from(BUCKET).remove([path]).catch(()=>{});
   throw new Error("Đã khôi phục "+count+" cuốn. Sách tiếp theo bị lỗi: "+(err.message||err));
  }
 }
 if(withSettings&&preview.manifest.settings){
  const s=preview.manifest.settings;
  const result=await db.from("user_settings").upsert({
   owner_id:owner,reader_options:s.reader_options,app_options:s.app_options,updated_at:new Date().toISOString()
  },{onConflict:"owner_id"});
  if(result.error)throw new Error("Sách đã khôi phục nhưng cài đặt lỗi: "+result.error.message);
 }
 await window.mbpRefreshBooks?.();
 return {restored:count,settings:!!(withSettings&&preview.manifest.settings)};
}
async function execute(fn){
 if(busy)return;
 setBusy(true);
 try{await fn();}
 catch(e){status("Lỗi: "+(e.message||e));}
 finally{setBusy(false);}
}
$("backupExport").onclick=()=>execute(createBackup);
$("backupChoose").onchange=async e=>{
 prepared=null;$("backupRestore").disabled=true;
 const file=e.target.files?.[0];if(!file)return;
 await execute(async()=>{
  status("Đang kiểm tra gói ZIP…");
  const data=await inspect(file);
  prepared=data;
  $("backupPreview").textContent="Đã kiểm tra: "+data.manifest.books.length+
   " cuốn; "+(data.bytes/1048576).toFixed(2)+" MB sách. Ngày tạo: "+
   String(data.manifest.createdAt||"không rõ")+". Khôi phục sẽ tạo sách mới, không ghi đè.";
  status("Gói ZIP hợp lệ. Có thể khôi phục.");
 });
};
$("backupRestore").onclick=()=>execute(async()=>{
 if(!prepared)throw Error("Hãy chọn ZIP hợp lệ.");
 const result=await restore(prepared,$("backupSettings").checked);
 if(result.cancelled){status("Bạn đã hủy thao tác.");return;}
 status("Khôi phục xong "+result.restored+" cuốn."+(result.settings?" Tải lại trang để cập nhật cài đặt.":"")+
  " Nếu sách trùng tên, bạn có thể xóa riêng bản trùng trong thư viện.");
});
window.addEventListener("mbp:auth-change",()=>{prepared=null;$("backupChoose").value="";$("backupRestore").disabled=true;close();});
window.mbpBackup={createBackup,inspect,restore,validateManifest:checkFormat,isBusy:()=>busy};
})();