/* My Books Player v0.4 — private TXT/EPUB upload, cloud catalogue and reader progress. */
(() => {
"use strict";
const BUCKET="my-books-private";
const $=id=>document.getElementById(id);
let records=[],client=null,uid=null,opening=false,busy=false,savingTimers=new Map(),parsedCache=new Map(),audioResume=new Map(),versions=new Map(),pendingWrites=new Map(),busyWrites=new Map();
const dialog=document.createElement("div");dialog.className="import-overlay";dialog.hidden=true;
dialog.innerHTML='<section class="import-card" role="dialog" aria-modal="true" aria-labelledby="importTitle"><div class="import-heading"><h2 id="importTitle">＋ Thêm sách của tôi</h2><button id="importClose" class="import-close" aria-label="Đóng">×</button></div><p class="import-help">Chỉ TXT hoặc EPUB, tối đa 20 MB. Sách lưu trong kho riêng tư của tài khoản đang đăng nhập.</p><label for="importFile">Chọn tệp từ điện thoại</label><input type="file" id="importFile" accept=".txt,.epub,text/plain,application/epub+zip"><label for="importName">Tên sách</label><input id="importName" type="text" maxlength="180" placeholder="Tên sách"><label for="importAuthor">Tác giả (không bắt buộc)</label><input id="importAuthor" type="text" maxlength="120" placeholder="Tác giả"><p id="importInfo" class="import-help">Chưa chọn tệp.</p><div class="import-actions"><button id="importSubmit" class="import-main" disabled>Tải sách lên cloud</button><button id="importCancel">Đóng</button></div><div id="importStatus" class="import-status" role="status">Tệp sẽ được đọc trong trình duyệt trước khi gửi lên kho riêng tư.</div></section>';
document.body.appendChild(dialog);
const style=document.createElement("style");
style.textContent='.import-overlay{position:fixed;inset:0;z-index:110;background:#090812d0;display:flex;align-items:center;justify-content:center;padding:15px}.import-overlay[hidden]{display:none}.import-card{background:var(--surface);color:var(--fg);width:min(480px,100%);max-height:92dvh;overflow:auto;border-radius:18px;padding:22px;box-shadow:var(--shadow)}.import-heading{display:flex;align-items:center;justify-content:space-between}.import-heading h2{margin:0 0 10px;font-size:20px}.import-close{border:0;background:none;color:var(--muted);font-size:26px}.import-card label{display:block;margin:15px 0 5px;font-size:13px;font-weight:750}.import-card input{width:100%;background:var(--bg);border:1px solid var(--line);color:var(--fg);padding:11px;border-radius:10px}.import-help{font-size:12px;color:var(--muted)}.import-actions{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}.import-actions button{padding:12px 16px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--fg);font-weight:800}.import-actions .import-main{background:var(--pink);border-color:var(--pink);color:white}.import-actions button:disabled{opacity:.5}.import-status{white-space:pre-wrap;overflow-wrap:anywhere;background:var(--tint);border-radius:10px;padding:11px;color:var(--fg);font-size:12px}.import-manage{border:1px solid var(--line);background:var(--surface);border-radius:13px;padding:13px;margin:12px 0}.import-manage-head{font-size:13px;font-weight:800;margin:0 0 8px}.import-row{display:flex;align-items:center;gap:9px;padding:8px 0;border-top:1px solid var(--line)}.import-row-info{flex:1;min-width:0}.import-row-info strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.import-row-info small{color:var(--muted);font-size:11px}.import-delete{color:var(--pink);border:1px solid var(--line);border-radius:9px;background:var(--bg);padding:7px 9px;font-size:11px;font-weight:800}';
document.head.appendChild(style);
const esc=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const msg=s=>{const node=$("importStatus");if(node)node.textContent=s;};
function user(){return window.mbpCloud?.getUser?.()||null;}
function db(){return window.mbpCloud?.getClient?.()||null;}
function signed(){const u=user();if(!u){window.mbpAuthOpen?.();return false;}return true;}
function close(){if(busy)return;dialog.hidden=true;}
$("importClose").onclick=close;$("importCancel").onclick=close;
dialog.addEventListener("click",e=>{if(e.target===dialog)close();});
let pending=null,pendingParsed=null;
function open(){
 if(!signed())return;
 pending=null;pendingParsed=null;
 $("importFile").value="";$("importName").value="";$("importAuthor").value="";
 $("importInfo").textContent="Chưa chọn tệp.";$("importSubmit").disabled=true;msg("Đang chờ chọn file.");dialog.hidden=false;
}
window.mbpImportDialog=open;
$("importFile").onchange=async()=>{
 const file=$("importFile").files?.[0];
 pending=null;pendingParsed=null;$("importSubmit").disabled=true;
 if(!file)return;
 try{
  msg("Đang đọc và kiểm tra cấu trúc "+file.name+"…");
  if(!window.mbpBookParser)throw Error("Chưa tải được bộ xử lý TXT/EPUB.");
  const parsed=await window.mbpBookParser.parseFile(file);
  if(parsed.chapters.length>2500)throw Error("Quá nhiều chương.");
  pending=file;pendingParsed=parsed;
  $("importName").value=parsed.title.slice(0,180);
  $("importAuthor").value=parsed.author.slice(0,120);
  const para=parsed.chapters.reduce((n,c)=>n+c.paragraphs.length,0);
  $("importInfo").textContent=parsed.format.toUpperCase()+" · "+parsed.chapters.length+" chương/phần · "+para+" đoạn · "+(file.size/1024/1024).toFixed(2)+" MB";
  $("importSubmit").disabled=false;msg("Tệp hợp lệ. Bạn có thể sửa tên và tác giả trước khi tải lên.");
 }catch(e){msg("Không thể nhập: "+(e.message||e));}
};
$("importSubmit").onclick=async()=>{
 if(busy||!pending||!pendingParsed)return;
 const session=user();const sb=db();if(!session||!sb){msg("Bạn cần đăng nhập lại.");return;}
 const file=pending,parsed=pendingParsed,ext=parsed.format;
 const title=$("importName").value.trim().slice(0,180),author=$("importAuthor").value.trim().slice(0,120);
 if(!title){msg("Tên sách không được trống.");return;}
 if(file.size>20*1024*1024){msg("Tệp lớn hơn 20 MB.");return;}
 const id=crypto.randomUUID();
 const path=session.id+"/"+id+"/source."+ext;
 busy=true;$("importSubmit").disabled=true;$("importCancel").disabled=true;
 let uploaded=false;
 try{
  msg("Đang tải "+file.name+" lên kho cloud riêng tư…");
  const ct=ext==="epub"?"application/epub+zip":"text/plain";
  const upload=await sb.storage.from(BUCKET).upload(path,file,{contentType:ct,upsert:false,cacheControl:"3600"});
  if(upload.error)throw upload.error;
  uploaded=true;
  const entry={id,owner_id:session.id,title,author,source_format:ext,source_filename:file.name,object_path:path,size_bytes:file.size,
   metadata:{chapter_count:parsed.chapters.length,imported_at:new Date().toISOString(),format_version:1}};
  const row=await sb.from("books").insert(entry).select("*").single();
  if(row.error)throw row.error;
  parsedCache.set(id,parsed);
  pending=null;pendingParsed=null;
  msg("Đã tải lên thành công. Sách thuộc thư viện riêng tư của bạn.");
  await refresh();
  dialog.hidden=true;
  if(window.mbpApp?.openBook)window.mbpApp.openBook(id);
 }catch(e){
  if(uploaded){
   try{await sb.storage.from(BUCKET).remove([path]);}catch{}
  }
  msg("Tải sách thất bại: "+(e.message||e)+". Không xóa file trên thiết bị của bạn.");
 }finally{busy=false;$("importSubmit").disabled=false;$("importCancel").disabled=false;}
};
function mapRow(row){
 return {id:row.id,name:row.title,author:row.author||"Không rõ tác giả",cat:"mine",cover:"sea",symbol:"✦",chapter:0,total:Math.max(1,Number(row.metadata?.chapter_count)||1),
  description:row.source_filename||"",isImported:true,sourceFormat:row.source_format,objectPath:row.object_path,ownerId:row.owner_id};
}
async function refresh(){
 const u=user(),sb=db();
 if(!u||!sb){
  records=[];uid=null;parsedCache.clear();savingTimers.forEach(clearTimeout);savingTimers.clear();
  pendingPositions.clear();audioResume.clear();versions.clear();busyWrites.clear();
  window.mbpApp?.closePrivateReader?.();window.mbpApp?.setRealBooks([],{});
  return;
 }
 if(uid!==u.id){uid=u.id;records=[];parsedCache.clear();audioResume.clear();versions.clear();}
 const owner=u.id;
 const waiting=await window.mbpOffline?.pendingList(owner).catch(()=>[])||[];
 for(const x of waiting){if(!pendingPositions.has(x.bookId))pendingPositions.set(x.bookId,x.entry);}
 try{
  const [b,p]=await Promise.all([
   sb.from("books").select("id,owner_id,title,author,source_format,source_filename,object_path,size_bytes,metadata,created_at").eq("owner_id",owner).order("created_at",{ascending:false}),
   sb.from("reading_progress").select("book_id,chapter_index,paragraph_index,audio_offset_ms,revision").eq("owner_id",owner)
  ]);
  if(b.error)throw b.error;if(p.error)throw p.error;
  if(user()?.id!==owner)return;
  records=b.data||[];
  const state={};
  versions.clear();audioResume.clear();
  for(const row of p.data||[]){
   const ch=Math.max(1,row.chapter_index||1);
   state[row.book_id]={chapter:ch,para:Math.max(0,row.paragraph_index||0)};
   versions.set(row.book_id,Number(row.revision)||1);
   audioResume.set(row.book_id,{chapter:ch,ms:Math.max(0,Number(row.audio_offset_ms)||0)});
  }
  for(const [id,value] of pendingPositions.entries()){
   if(value.userId===owner){
    state[id]={chapter:value.chapter,para:value.para};
    audioResume.set(id,{chapter:value.chapter,ms:value.ms||0});
   }
  }
  window.mbpApp?.setRealBooks(records.map(mapRow),state);
  renderManage();
  if(pendingPositions.size)setTimeout(()=>window.mbpFlushRealProgress?.().catch(()=>{}),800);
 }catch(err){
  if(user()?.id!==owner)return;
  const cached=await window.mbpOffline?.listBooks(owner).catch(()=>[])||[];
  if(!cached.length)throw err;
  records=cached.map(b=>({id:b.id,owner_id:owner,title:b.name,author:b.author,source_format:b.sourceFormat,
   source_filename:"Bản offline",object_path:"",size_bytes:0,metadata:{chapter_count:b.total}}));
  const state={};for(const [id,value] of pendingPositions.entries())if(value.userId===owner)state[id]={chapter:value.chapter,para:value.para};
  window.mbpApp?.setRealBooks(cached,state);
  renderManage();
  window.mbpApp?.notify?.("Không có mạng: đang mở thư viện sách đã lưu offline.");
 }
}
async function syncProgress(bookId,value){
 const sb=db(),owner=value.userId;
 if(!sb||user()?.id!==owner)throw Error("Phiên đăng nhập đã thay đổi.");
 async function remote(){
  const {data,error}=await sb.from("reading_progress").select("book_id,chapter_index,paragraph_index,audio_offset_ms,revision").eq("owner_id",owner).eq("book_id",bookId).maybeSingle();
  if(error)throw error;return data;
 }
 let rev=versions.get(bookId),row=null;
 if(rev==null){row=await remote();rev=row?.revision??null;if(rev!==null)versions.set(bookId,Number(rev));}
 const values={owner_id:owner,book_id:bookId,chapter_index:value.chapter,paragraph_index:value.para,
  audio_offset_ms:value.ms||0,updated_at:new Date().toISOString()};
 async function write(expected){
  const result=await sb.from("reading_progress").update(values).eq("owner_id",owner).eq("book_id",bookId)
   .eq("revision",expected).select("revision");
  if(result.error)throw result.error;
  if(result.data?.length){versions.set(bookId,Number(result.data[0].revision));return true;}
  return false;
 }
 if(rev==null){
  const created=await sb.from("reading_progress").insert(values).select("revision");
  if(!created.error&&created.data?.length){versions.set(bookId,Number(created.data[0].revision));return true;}
  if(created.error&&created.error.code!=="23505")throw created.error;
  row=await remote();
 }else{
  if(await write(rev))return true;
  row=await remote();
 }
 if(!row)throw Error("Không thể đọc phiên bản vị trí trên cloud.");
 // The browser may be offline or another device has advanced independently.
 const chooseLocal=confirm("Phát hiện xung đột vị trí đọc giữa hai thiết bị cho sách này.\n\nVị trí trên cloud: Chương "+
  row.chapter_index+", đoạn "+(row.paragraph_index+1)+".\nVị trí trên máy này: Chương "+
  value.chapter+", đoạn "+(value.para+1)+".\n\nOK: Giữ vị trí máy này.\nHủy: Dùng vị trí cloud.");
 versions.set(bookId,Number(row.revision));
 if(chooseLocal){
  if(!await write(Number(row.revision)))throw Error("Cloud lại thay đổi. Thử đồng bộ lần nữa.");
 }else{
  audioResume.set(bookId,{chapter:row.chapter_index,ms:Number(row.audio_offset_ms)||0});
  window.mbpApp?.applyRemoteProgress?.(bookId,row.chapter_index,row.paragraph_index);
  return "cloud";
 }
 return true;
}
const pendingPositions=new Map();
async function flushPosition(bookId){
 if(busyWrites.has(bookId))return busyWrites.get(bookId);
 const value=pendingPositions.get(bookId);if(!value)return;
 const run=(async()=>{
  await (pendingWrites.get(bookId)||Promise.resolve());
  const result=await syncProgress(bookId,value);
  if(pendingPositions.get(bookId)===value){
   pendingPositions.delete(bookId);
   await window.mbpOffline?.pendingRemove(value.userId,bookId).catch(()=>{});
  }
  return result;
 })();
 busyWrites.set(bookId,run);
 try{return await run;}
 catch(e){
  window.mbpApp?.notify?.("Chưa đồng bộ vị trí: "+(e.message||e)+". Dữ liệu đang chờ trên máy.");
  throw e;
 }finally{busyWrites.delete(bookId);}
}
window.mbpSaveRealProgress=(bookId,chapter,para)=>{
 const u=user();if(!u)return;
 const previous=audioResume.get(bookId),ms=previous?.chapter===chapter?previous.ms:0;
 const value={chapter,para,ms,userId:u.id,recordedAt:Date.now()};
 pendingPositions.set(bookId,value);
 const prior=pendingWrites.get(bookId)||Promise.resolve();
 const write=prior.catch(()=>{}).then(()=>window.mbpOffline?.pendingPut(u.id,bookId,value));
 pendingWrites.set(bookId,write.catch(()=>{}));
 if(savingTimers.has(bookId))clearTimeout(savingTimers.get(bookId));
 savingTimers.set(bookId,setTimeout(()=>{savingTimers.delete(bookId);flushPosition(bookId).catch(()=>{});},1000));
};
window.mbpFlushRealProgress=async()=>{
 await Promise.all([...pendingPositions.keys()].map(id=>flushPosition(id)));
};
window.mbpGetAudioResume=(bookId,chapter)=>{
 const value=audioResume.get(bookId);return value?.chapter===chapter?value.ms:0;
};
window.mbpSaveAudioOffset=(bookId,chapter,ms)=>{
 const u=user(),reader=window.mbpReader?.getState?.();
 if(!u||!reader||!reader.isImported||reader.bookId!==bookId||reader.chapter!==chapter)return;
 const offset=Math.max(0,Math.min(24*3600*1000,Math.round(Number(ms)||0)));
 audioResume.set(bookId,{chapter,ms:offset});
 window.mbpSaveRealProgress(bookId,reader.chapter,reader.para);
};
window.addEventListener("mbp:sync-online",()=>window.mbpFlushRealProgress?.().catch(()=>{}));
window.mbpLoadRealBook=async b=>{
 const sb=db(),u=user();if(!u)throw Error("Hãy đăng nhập để đọc sách riêng tư.");
 if(parsedCache.has(b.id))return parsedCache.get(b.id).chapters;
 const stored=await window.mbpOffline?.getChapters(u.id,b.id).catch(()=>null);
 const row=records.find(r=>r.id===b.id&&r.owner_id===u.id);
 if(!sb||!row||!row.object_path){
  if(stored)return stored;
  throw Error("Sách chưa lưu offline và không có kết nối cloud.");
 }
 try{
  const file=await sb.storage.from(BUCKET).download(row.object_path);
  if(file.error)throw file.error;
  const name=row.source_filename||("book."+row.source_format);
  const parsed=await window.mbpBookParser.parseFile(new File([file.data],name,{type:file.data.type}));
  parsedCache.set(b.id,parsed);return parsed.chapters;
 }catch(err){
  if(stored)return stored;
  throw err;
 }
};
function renderManage(){
 const old=$("manageRealBooks");if(old)old.remove();
 const container=document.querySelector(".content");
 if(!container)return;
 const box=document.createElement("section");box.className="import-manage";box.id="manageRealBooks";
 const u=user();
 box.innerHTML='<div class="import-manage-head">☁ Sách TXT / EPUB của tôi <span style="font-size:11px;color:var(--muted);font-weight:500">'+(u?"(Riêng tư · "+records.length+" cuốn)":"(Đăng nhập để lưu cloud)")+'</span></div>'+
 (u?(records.length?records.map(r=>'<div class="import-row"><div class="import-row-info"><strong>'+esc(r.title)+'</strong><small>'+esc(r.source_format.toUpperCase())+' · '+esc(r.source_filename)+' · '+(r.size_bytes/1048576).toFixed(2)+' MB</small></div><button class="import-delete" data-real-open="'+esc(r.id)+'">Đọc</button><button class="import-delete" data-real-delete="'+esc(r.id)+'">Xóa</button></div>').join(""):'<p class="import-help">Bạn chưa tải sách nào lên. Chạm “＋ Thêm sách” để bắt đầu.</p>'):'<p class="import-help">Chạm biểu tượng ☁ để đăng nhập, sau đó tải sách TXT/EPUB lên.</p>');
 const grid=$("bookGrid");grid?.parentNode?.insertBefore(box,grid);
}
async function deleteBook(id){
 const u=user(),sb=db();if(!u||!sb)return;
 const r=records.find(x=>x.id===id&&x.owner_id===u.id);if(!r)return;
 if(!confirm('Xóa "'+r.title+'" khỏi tài khoản, bao gồm file sách và vị trí đã lưu? Thao tác này không thể hoàn tác.'))return;
 try{
  const result=await sb.from("books").delete().eq("id",id).eq("owner_id",u.id);
  if(result.error)throw result.error;
  parsedCache.delete(id);
  await refresh();
  const remove=await sb.storage.from(BUCKET).remove([r.object_path]);
  if(remove.error)window.mbpApp?.notify?.("Đã xóa mục sách, nhưng file cũ có thể chưa được dọn khỏi Storage.");
  else window.mbpApp?.notify?.("Đã xóa sách và file riêng tư.");
 }catch(e){window.mbpApp?.notify?.("Không xóa được sách: "+(e.message||e));}
}
document.addEventListener("click",e=>{
 const read=e.target.closest("[data-real-open]");
 if(read){window.mbpApp?.openBook(read.dataset.realOpen);return;}
 const del=e.target.closest("[data-real-delete]");
 if(del){deleteBook(del.dataset.realDelete);return;}
});
window.addEventListener("mbp:auth-change",()=>refresh().catch(e=>{msg("Lỗi tải danh sách sách: "+(e.message||e));window.mbpApp?.notify?.("Không tải được thư viện cloud.");}));
window.addEventListener("mbp:cloud-restored",()=>refresh().catch(e=>msg("Lỗi tải thư viện: "+(e.message||e))));
window.mbpRefreshBooks=()=>refresh();
setTimeout(()=>refresh().catch(e=>msg("Lỗi tải thư viện: "+(e.message||e))),150);
})();
