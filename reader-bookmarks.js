/* My Books Player v0.5 — multiple bookmarks, cloud for imported books / local for demo.
   User-scoped bookmarks use Supabase Row Level Security. */
(() => {
"use strict";
const byId=id=>document.getElementById(id);
const drawer=document.createElement("aside");
drawer.id="readerBookmarksDrawer";
drawer.className="reader-bookmarks-drawer";
drawer.hidden=true;
drawer.setAttribute("aria-label","Dấu trang");
drawer.innerHTML='<div class="bookmark-header"><h2>🔖 Dấu trang</h2><button type="button" id="closeReaderBookmarks" aria-label="Đóng dấu trang">×</button></div><p id="bookmarkContext" class="bookmark-hint"></p><button type="button" class="bookmark-primary" id="addReaderBookmark">＋ Lưu vị trí hiện tại</button><div id="bookmarkMessage" class="bookmark-message" role="status"></div><div id="readerBookmarksList"></div>';
document.body.appendChild(drawer);
const css=document.createElement("style");
css.textContent='.reader-bookmarks-drawer{position:fixed;z-index:46;top:0;right:0;bottom:0;width:min(380px,94vw);overflow:auto;background:var(--surface);color:var(--fg);box-shadow:-7px 0 40px #0005;padding:20px max(16px,env(safe-area-inset-right)) 40px}.reader-bookmarks-drawer[hidden]{display:none}.bookmark-header{display:flex;justify-content:space-between;align-items:center;gap:10px}.bookmark-header h2{margin:0;font-size:19px}.bookmark-header button{border:0;background:transparent;color:var(--muted);font-size:27px;padding:4px 9px}.bookmark-hint{font-size:12px;color:var(--muted)}.bookmark-primary{border:0;background:var(--pink);border-radius:10px;padding:12px 16px;color:#fff;font-weight:800;width:100%}.bookmark-message{min-height:25px;font-size:12px;color:var(--muted);margin:12px 0;overflow-wrap:anywhere}.bookmark-item{border:1px solid var(--line);background:var(--bg);padding:13px;border-radius:12px;margin:0 0 10px}.bookmark-item-title{font-size:13px;font-weight:800;color:var(--fg)}.bookmark-item-excerpt{font-size:12px;color:var(--muted);margin:7px 0;line-height:1.65;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.bookmark-item-actions{display:flex;gap:8px}.bookmark-item-actions button{border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--fg);padding:8px 12px;font-size:12px;font-weight:750}.bookmark-item-actions button.remove{color:var(--pink)}.bookmark-empty{border:1px dashed var(--line);border-radius:12px;text-align:center;color:var(--muted);padding:22px 10px;font-size:13px}';
document.head.appendChild(css);
let rows=[],currentKey="",generation=0,busy=false;
function session(){return window.mbpCloud?.getUser?.()||null;}
function client(){return window.mbpCloud?.getClient?.()||null;}
function state(){return window.mbpReader?.getState?.()||null;}
function note(message){byId("bookmarkMessage").textContent=message;}
function close(){drawer.hidden=true;generation++;}
function storageKey(id){return "mbp_demo_bookmarks_"+id;}
function demoRead(bookId){try{const d=JSON.parse(localStorage.getItem(storageKey(bookId)));return Array.isArray(d)?d.filter(v=>Number.isInteger(v.chapter)&&Number.isInteger(v.para)):[];}catch{return[];}}
function demoWrite(bookId,data){localStorage.setItem(storageKey(bookId),JSON.stringify(data));}
function sameState(s){const latest=state();return latest&&s&&latest.bookId===s.bookId&&latest.isImported===s.isImported;}
function item(chapter,para,label,id){return{id,chapter,para,label:String(label||"").slice(0,140)};}
async function getAll(s){
 if(!s.isImported)return demoRead(s.bookId);
 const u=session(),sb=client();
 if(!u||!sb)throw Error("Đăng nhập để quản lý dấu trang của sách riêng tư.");
 const r=await sb.from("bookmarks").select("id,chapter_index,paragraph_index,label,created_at").eq("owner_id",u.id).eq("book_id",s.bookId).order("created_at",{ascending:false}).limit(400);
 if(r.error)throw r.error;
 return (r.data||[]).map(x=>item(x.chapter_index,x.paragraph_index,x.label,x.id));
}
function empty(){
 const container=byId("readerBookmarksList");
 container.replaceChildren();
 if(!rows.length){const n=document.createElement("div");n.className="bookmark-empty";n.textContent="Chưa có dấu trang. Hãy lưu vị trí bạn muốn quay lại.";container.appendChild(n);return;}
 for(const [i,r] of rows.entries()){
  const wrap=document.createElement("section");wrap.className="bookmark-item";
  const title=document.createElement("div");title.className="bookmark-item-title";title.textContent="Chương "+r.chapter+" · Đoạn "+(r.para+1);wrap.appendChild(title);
  const excerpt=document.createElement("div");excerpt.className="bookmark-item-excerpt";excerpt.textContent=r.label||"Dấu trang đã lưu";wrap.appendChild(excerpt);
  const acts=document.createElement("div");acts.className="bookmark-item-actions";
  const jump=document.createElement("button");jump.type="button";jump.textContent="↗ Đến đoạn";jump.dataset.action="jump";jump.dataset.index=String(i);acts.appendChild(jump);
  const del=document.createElement("button");del.type="button";del.textContent="Xóa dấu";del.className="remove";del.dataset.action="remove";del.dataset.index=String(i);acts.appendChild(del);
  wrap.appendChild(acts);container.appendChild(wrap);
 }
}
async function loadBookmarks(s){
 const token=++generation;note("Đang tải dấu trang…");
 try{
  const list=await getAll(s);
  if(token!==generation||!sameState(s))return;
  rows=list;empty();note(s.isImported?"Dấu trang được đồng bộ trong tài khoản Supabase.":"Dấu trang sách mẫu chỉ lưu trên thiết bị này.");
 }catch(e){if(token===generation){rows=[];empty();note("Không thể tải dấu trang: "+(e.message||e));}}
}
async function open(){
 const s=state();if(!s)return;
 currentKey=s.bookId;drawer.hidden=false;
 byId("bookmarkContext").textContent=s.title+" · "+(s.isImported?"Sách cloud":"Sách mẫu");
 await loadBookmarks(s);
}
async function add(){
 if(busy)return;
 const s=state();if(!s||!sameState(s))return;
 const chapter=s.chapter,para=s.para;
 if(!Number.isInteger(chapter)||chapter<1||!Number.isInteger(para)||para<0)return;
 if(rows.some(x=>x.chapter===chapter&&x.para===para)){note("Đoạn này đã có trong dấu trang.");return;}
 busy=true;byId("addReaderBookmark").disabled=true;
 try{
  const label=String(s.paragraphs?.[para]||"Đoạn đã lưu").trim().slice(0,140);
  if(s.isImported){
   const u=session(),sb=client();if(!u||!sb)throw Error("Bạn cần đăng nhập.");
   const r=await sb.from("bookmarks").insert({owner_id:u.id,book_id:s.bookId,chapter_index:chapter,paragraph_index:para,label}).select("id").single();
   if(r.error)throw r.error;
  }else{
   const existing=demoRead(s.bookId);
   existing.unshift(item(chapter,para,label,crypto.randomUUID()));demoWrite(s.bookId,existing);
  }
  note("Đã lưu dấu trang chương "+chapter+", đoạn "+(para+1)+".");
  await loadBookmarks(s);
 }catch(e){note("Lưu dấu trang thất bại: "+(e.message||e));}
 finally{busy=false;byId("addReaderBookmark").disabled=false;}
}
async function remove(index){
 const s=state(),b=rows[index];if(!s||!b||busy)return;
 busy=true;
 try{
  if(s.isImported){
   const u=session(),sb=client();if(!u||!sb)throw Error("Bạn cần đăng nhập.");
   const result=await sb.from("bookmarks").delete().eq("id",b.id).eq("book_id",s.bookId).eq("owner_id",u.id);
   if(result.error)throw result.error;
  }else{
   demoWrite(s.bookId,demoRead(s.bookId).filter(x=>x.id!==b.id));
  }
  await loadBookmarks(s);
  note("Đã xóa dấu trang.");
 }catch(e){note("Không xóa được dấu trang: "+(e.message||e));}
 finally{busy=false;}
}
byId("readerBookmarksList").addEventListener("click",e=>{
 const button=e.target.closest("button[data-action]");
 if(!button||busy)return;
 const i=Number(button.dataset.index),record=rows[i];if(!record)return;
 if(button.dataset.action==="remove"){remove(i);return;}
 if(button.dataset.action==="jump"){
  const ok=window.mbpReader?.navigate?.(record.chapter,record.para);
  if(ok){close();}else note("Không thể mở vị trí dấu trang này.");
 }
});
byId("addReaderBookmark").onclick=add;
byId("closeReaderBookmarks").onclick=close;
window.mbpBookmarksOpen=open;
window.mbpBookmarksClose=close;
window.addEventListener("mbp:auth-change",()=>{close();rows=[];});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!drawer.hidden){e.stopPropagation();close();}});
})();
