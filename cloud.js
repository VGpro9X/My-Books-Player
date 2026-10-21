/* My Books Player v0.4 — Supabase Auth + synced demo state and private TXT/EPUB.
   Public publishable key only: never commit service_role or user passwords. */
(() => {
"use strict";
const URL="https://wdrawjvdppikutzvzoxe.supabase.co";
const PUBLIC_KEY="sb_publishable_au7K9yb-OHbOOI7VwJPJug_3n-iu8g1";
const localKeys=["mbp_demo_progress","mbp_demo_saved","mbp_reader_prefs","mbp_site_dark"];
let client=null,user=null,busy=false,syncTimer=null,loadingCloud=false,firstSync=true;
const root=document.createElement("div");root.className="cloud-auth";root.hidden=true;
root.innerHTML='<div class="cloud-card" role="dialog" aria-modal="true" aria-labelledby="cloudTitle"><div style="display:flex;align-items:center;justify-content:space-between"><h2 id="cloudTitle">☁ Tài khoản My Books</h2><button id="cloudClose" aria-label="Đóng">×</button></div><p id="cloudIntro">Đăng nhập để đồng bộ vị trí đọc, sách mẫu đã lưu và tùy chỉnh giữa các trình duyệt. Hỗ trợ tải TXT/EPUB riêng tư khi đăng nhập.</p><div id="cloudAnon"><label for="cloudEmail">Email</label><input id="cloudEmail" type="email" autocomplete="email" placeholder="Email của bạn"><label for="cloudPassword">Mật khẩu</label><input id="cloudPassword" type="password" autocomplete="current-password" placeholder="Ít nhất 6 ký tự"><div class="cloud-actions"><button class="cloud-primary" id="cloudSignIn">Đăng nhập</button><button id="cloudSignUp">Tạo tài khoản</button></div></div><div id="cloudSigned" hidden><p><strong id="cloudWho"></strong></p><p>Đang sử dụng Supabase Free. Dữ liệu từng tài khoản được bảo vệ bằng RLS.</p><div class="cloud-actions"><button id="cloudSync" class="cloud-primary">Đồng bộ ngay</button><button id="cloudSignOut">Đăng xuất</button></div></div><div id="cloudMessage" class="cloud-message" role="status">Kết nối Cloud đang khởi tạo…</div><p style="font-size:11px">Bước 04: có thể lưu TXT/EPUB riêng tư. Nút Đồng bộ ngay cũng lưu vị trí đang đọc.</p></div>';
document.body.appendChild(root);
const $=(id)=>document.getElementById(id);
function message(s){$("cloudMessage").textContent=s;}
function show(){root.hidden=false;render();$("cloudClose").focus();}
function close(){root.hidden=true;}
window.mbpAuthOpen=show;
window.mbpCloud={
 getClient:()=>client,
 getUser:()=>user
};
let lastNotifiedUserId=null;
function signalLoginChange(){
 const id=user?.id||null;
 if(id!==lastNotifiedUserId){
  lastNotifiedUserId=id;
  window.dispatchEvent(new CustomEvent("mbp:auth-change",{detail:{userId:id}}));
 }
}
$("cloudClose").onclick=close;
root.addEventListener("click",e=>{if(e.target===root)close();});
function render(){
 $("cloudAnon").hidden=!!user;
 $("cloudSigned").hidden=!user;
 $("cloudWho").textContent=user?.email||"Đã đăng nhập";
 const btn=document.getElementById("accountBtn");
 if(btn){btn.innerHTML=user?'☁<span class="cloud-indicator online"></span>':'☁';btn.title=user?"Đã đăng nhập Cloud: "+(user.email||""):"Đăng nhập / Đồng bộ cloud";}
 signalLoginChange();
}
const json=(key,alternative)=>{try{return JSON.parse(localStorage.getItem(key))??alternative;}catch{return alternative;}};
function localSnapshot(){
 const progress=json("mbp_demo_progress",{});
 return {
  progress:Object.entries(progress).filter(([id,p])=>/^[a-z0-9_-]{1,50}$/.test(id)&&Number.isInteger(p.chapter)&&p.chapter>=0&&Number.isInteger(p.para)&&p.para>=0)
  .map(([id,p])=>({owner_id:user.id,demo_book_id:id,chapter_index:p.chapter,paragraph_index:p.para,updated_at:new Date().toISOString()})),
  settings:{owner_id:user.id,reader_options:json("mbp_reader_prefs",{}),app_options:{saved:json("mbp_demo_saved",[]),dark:json("mbp_site_dark",false)},updated_at:new Date().toISOString()}
 };
}
function validProgress(p){return p&&typeof p==="object"&&Object.values(p).every(v=>v&&Number.isInteger(v.chapter)&&Number.isInteger(v.para));}
async function restore(){
 if(!user||loadingCloud)return;
 loadingCloud=true;
 try{
  const uid=user.id;
  const [s,p]=await Promise.all([
   client.from("user_settings").select("reader_options,app_options").eq("owner_id",uid).maybeSingle(),
   client.from("demo_progress").select("demo_book_id,chapter_index,paragraph_index,updated_at").eq("owner_id",uid)
  ]);
  if(s.error)throw s.error;if(p.error)throw p.error;
  let changed=false;
  if(s.data){
   const obj=s.data.reader_options||{},app=s.data.app_options||{};
   for(const [key,value] of [
    ["mbp_reader_prefs",obj],["mbp_demo_saved",Array.isArray(app.saved)?app.saved:[]],["mbp_site_dark",!!app.dark]
   ]){
    if(JSON.stringify(json(key,null))!==JSON.stringify(value)){localStorage.setItem(key,JSON.stringify(value));changed=true;}
   }
  }
  if(p.data?.length){
   const remote=Object.fromEntries(p.data.map(x=>[x.demo_book_id,{chapter:x.chapter_index,para:x.paragraph_index}]));
   if(validProgress(remote)&&JSON.stringify(json("mbp_demo_progress",{}))!==JSON.stringify(remote)){
    localStorage.setItem("mbp_demo_progress",JSON.stringify(remote));changed=true;
   }
  }
  // A newly-created account can import the locally saved demo state once.
  if(!s.data && !p.data?.length)await push();
  message("Đã kết nối Supabase. Cài đặt, sách mẫu và thư viện riêng tư sẽ được tải.");
  window.dispatchEvent(new Event("mbp:cloud-restored"));
  if(changed){setTimeout(()=>location.reload(),200);return;}
 }catch(e){message("Không tải được dữ liệu cloud: "+(e.message||e));}
 finally{loadingCloud=false;}
}
async function push(){
 if(!user||!client)return;
 const data=localSnapshot();
 const s=await client.from("user_settings").upsert(data.settings,{onConflict:"owner_id"});
 if(s.error)throw s.error;
 if(data.progress.length){
  const p=await client.from("demo_progress").upsert(data.progress,{onConflict:"owner_id,demo_book_id"});
  if(p.error)throw p.error;
 }
 message("Đã lưu dữ liệu mẫu và cài đặt lên Cloud.");
}
async function guarded(fn){
 if(busy)return;busy=true;
 for(const id of ["cloudSignIn","cloudSignUp","cloudSignOut","cloudSync"])$(id).disabled=true;
 try{await fn();}catch(e){message("Lỗi: "+(e.message||e));}
 finally{busy=false;for(const id of ["cloudSignIn","cloudSignUp","cloudSignOut","cloudSync"])$(id).disabled=false;}
}
$("cloudSignUp").onclick=()=>guarded(async()=>{
 if(!client){message("Chưa tải được thư viện Supabase. Thử tải lại trang.");return;}
 const email=$("cloudEmail").value.trim(),password=$("cloudPassword").value;
 if(!email||password.length<6){message("Nhập email hợp lệ và mật khẩu tối thiểu 6 ký tự.");return;}
 const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
 if(error)throw error;
 message(data.session?"Đã tạo tài khoản và đăng nhập.":"Đã gửi email xác nhận nếu địa chỉ này được phép đăng ký. Mở email để xác nhận rồi đăng nhập. Nếu link trở về trang khác, cần cấu hình Redirect URLs trong Supabase.");
});
$("cloudSignIn").onclick=()=>guarded(async()=>{
 if(!client){message("Chưa kết nối Supabase.");return;}
 const {error}=await client.auth.signInWithPassword({email:$("cloudEmail").value.trim(),password:$("cloudPassword").value});
 if(error)throw error;
 message("Đã đăng nhập. Đang tải dữ liệu cloud…");
});
$("cloudSignOut").onclick=()=>guarded(async()=>{
 await window.mbpFlushRealProgress?.();
 const {error}=await client.auth.signOut();if(error)throw error;
 message("Đã đăng xuất. Dữ liệu cloud vẫn ở tài khoản; bản sao demo trên thiết bị vẫn còn.");
});
$("cloudSync").onclick=()=>guarded(async()=>{if(!user)return;await push();await window.mbpFlushRealProgress?.();});
window.addEventListener("mbp:local-save",e=>{
 if(!user||!localKeys.includes(e.detail?.key)||loadingCloud)return;
 clearTimeout(syncTimer);
 syncTimer=setTimeout(()=>push().catch(err=>message("Đồng bộ lỗi: "+(err.message||err))),800);
});
async function init(){
 if(!window.supabase?.createClient){message("Không tải được thư viện Supabase từ CDN. Kiểm tra mạng rồi tải lại trang.");return;}
 client=window.supabase.createClient(URL,PUBLIC_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 client.auth.onAuthStateChange((event,session)=>{
  const old=user?.id;
  user=session?.user||null;render();
  if(user&&(!old||old!==user.id))setTimeout(()=>restore(),100);
  if(event==="SIGNED_OUT")message("Đã đăng xuất.");
 });
 const {data,error}=await client.auth.getSession();
 if(error){message("Lỗi xác thực: "+error.message);return;}
 user=data.session?.user||null;render();
 if(user){await restore();}else message("Chưa đăng nhập. Tạo tài khoản miễn phí hoặc đăng nhập để đồng bộ.");
}
init().catch(e=>message("Lỗi Cloud: "+(e.message||e)));
})();
