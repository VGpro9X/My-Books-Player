/* My Books Player v0.7: opt-in offline private book text cache.
 * No private data is stored in the Service Worker HTTP cache.
 * Book contents are plaintext in per-account IndexedDB on THIS device. */
(() => {
"use strict";
const DB="my-books-offline-v1", VERSION=1;
let opened=null;
function dbOpen(){
 if(!("indexedDB" in window))return Promise.reject(Error("Trình duyệt không hỗ trợ IndexedDB."));
 if(opened)return opened;
 opened=new Promise((resolve,reject)=>{
  const r=indexedDB.open(DB,VERSION);
  r.onupgradeneeded=()=>{const db=r.result;
   if(!db.objectStoreNames.contains("books"))db.createObjectStore("books",{keyPath:"key"});
   if(!db.objectStoreNames.contains("pending"))db.createObjectStore("pending",{keyPath:"key"});
  };
  r.onsuccess=()=>resolve(r.result);
  r.onerror=()=>reject(r.error||Error("Không mở được bộ nhớ offline."));
 }).catch(e=>{opened=null;throw e;});
 return opened;
}
async function transact(store,mode,operate){
 const db=await dbOpen();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(store,mode),bucket=tx.objectStore(store);
  let value,request;
  try{request=operate(bucket);if(request){request.onsuccess=()=>{value=request.result;};request.onerror=()=>{reject(request.error);};}}
  catch(e){reject(e);return;}
  tx.oncomplete=()=>resolve(value);
  tx.onerror=()=>reject(tx.error||Error("Bộ nhớ offline bị lỗi."));
  tx.onabort=()=>reject(tx.error||Error("Giao dịch offline bị hủy."));
 });
}
const key=(owner,id)=>owner+":"+id;
const currentOwner=()=>window.mbpCloud?.getUser?.()?.id||null;
async function putBook(owner,book,chapters){
 if(!owner||!book?.id||!Array.isArray(chapters)||!chapters.length)throw Error("Sách chưa có nội dung để lưu offline.");
 if(chapters.length>2500)throw Error("Quá nhiều chương.");
 const info={
  id:book.id,name:book.name,author:book.author,cat:"mine",cover:book.cover||"sea",
  symbol:"✦",chapter:0,total:chapters.length,isImported:true,
  sourceFormat:book.sourceFormat||"txt",ownerId:owner,
  description:"Bản đọc đã lưu trên thiết bị"
 };
 // Bound the serialized chapter content to avoid accidental very large writes.
 if(JSON.stringify(chapters).length>28*1024*1024)throw Error("Nội dung vượt 28MB, chưa thể lưu offline.");
 const reading=window.mbpReader?.getState?.();
 const position=reading?.bookId===book.id?{chapter:reading.chapter,para:reading.para}:{chapter:1,para:0};
 await transact("books","readwrite",s=>s.put({key:key(owner,book.id),owner,book:info,chapters,position,savedAt:Date.now()}));
 return info;
}
const getBook=(owner,id)=>transact("books","readonly",s=>s.get(key(owner,id)));
async function listBooks(owner){
 if(!owner)return [];
 const all=await transact("books","readonly",s=>s.getAll());
 return (all||[]).filter(x=>x.owner===owner).map(x=>({...x.book,offlinePosition:x.position||{chapter:1,para:0}}));
}
async function getChapters(owner,id){
 const item=await getBook(owner,id);return item?.chapters||null;
}
const removeBook=(owner,id)=>transact("books","readwrite",s=>s.delete(key(owner,id)));
async function savePosition(owner,id,chapter,para){
 if(!owner||!Number.isInteger(chapter)||chapter<1||!Number.isInteger(para)||para<0)return;
 const cached=await getBook(owner,id);
 if(!cached)return;
 cached.position={chapter,para};
 await transact("books","readwrite",s=>s.put(cached));
}

const pendingPut=(owner,id,payload)=>transact("pending","readwrite",s=>s.put({key:key(owner,id),owner,bookId:id,entry:payload,savedAt:Date.now()}));
const pendingRemove=(owner,id)=>transact("pending","readwrite",s=>s.delete(key(owner,id)));
const pendingList=async owner=>{
 const rows=await transact("pending","readonly",s=>s.getAll());
 return (rows||[]).filter(x=>x.owner===owner);
};
async function clearOwner(owner){
 if(!owner)return;
 for(const store of ["books","pending"]){
  const rows=await transact(store,"readonly",s=>s.getAll());
  await Promise.all((rows||[]).filter(x=>x.owner===owner).map(x=>transact(store,"readwrite",s=>s.delete(x.key))));
 }
}
const btn=document.createElement("button");
btn.type="button";btn.id="readerOfflineBtn";btn.className="reader-icon";
btn.textContent="↓";btn.title="Lưu sách để đọc offline";btn.setAttribute("aria-label","Lưu sách offline");
const title=document.getElementById("readerTitle");
title?.parentNode?.insertBefore(btn,title.nextSibling);
let working=false;
async function refreshButton(){
 const s=window.mbpReader?.getState?.();
 if(!s||!s.isImported){btn.hidden=true;return;}
 btn.hidden=false;
 const owner=currentOwner();if(!owner){btn.textContent="↓";return;}
 try{const cached=await getBook(owner,s.bookId);
  if(window.mbpReader?.getState?.()?.bookId!==s.bookId)return;
  btn.textContent=cached?"✓":"↓";btn.title=cached?"Bỏ bản offline trên thiết bị":"Lưu nội dung sách offline";
 }catch{btn.textContent="↓";}
}
async function toggle(){
 const s=window.mbpReader?.getState?.(),owner=currentOwner();
 if(!s||!s.isImported||!owner||working)return;
 working=true;btn.disabled=true;
 try{
  const cached=await getBook(owner,s.bookId);
  if(cached){
   if(!confirm("Xóa bản sách offline khỏi điện thoại này? Sách trên Supabase sẽ không bị xóa."))return;
   await removeBook(owner,s.bookId);
   window.mbpApp?.notify?.("Đã xóa bản offline trên điện thoại.");
  }else{
   const info=window.mbpApp?.getBook?.(s.bookId);
   const chapters=window.mbpReader?.getChapters?.();
   if(!info||!chapters)throw Error("Chưa mở được nội dung sách để lưu.");
   await putBook(owner,info,chapters);
   window.mbpApp?.notify?.("Đã lưu sách offline trên điện thoại này. Hãy thử bật chế độ máy bay.");
  }
 }catch(e){window.mbpApp?.notify?.("Offline: "+(e.message||e));}
 finally{working=false;btn.disabled=false;refreshButton();}
}
btn.onclick=toggle;
window.addEventListener("mbp:book-open",refreshButton);
window.addEventListener("mbp:auth-change",e=>{
 const current=e.detail?.userId||null;
 const old=window.__mbpOfflineOwner||null;
 if(old&&old!==current)clearOwner(old).catch(()=>{});
 window.__mbpOfflineOwner=current;
});
document.addEventListener("visibilitychange",()=>{if(!document.hidden)refreshButton();});
window.addEventListener("online",()=>window.dispatchEvent(new Event("mbp:sync-online")));
window.mbpOffline={
 saveBook:putBook,getBook,getChapters,listBooks,removeBook,savePosition,clearOwner,
 pendingPut,pendingRemove,pendingList,refreshButton,isSupported:()=>!!window.indexedDB
};
if("serviceWorker" in navigator&&(location.protocol==="https:"||["localhost","127.0.0.1"].includes(location.hostname))){
 navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(()=>{});
}
})();