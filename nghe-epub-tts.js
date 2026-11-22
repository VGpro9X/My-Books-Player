/* Nghe Epub TTS client for the public GitHub Pages reader.
 * The private model stays on a user-controlled HTTPS service implementing /api/tts. */
(() => {
"use strict";
const CONFIG_KEY="mbp_nghe_epub_tts_config";
const CATALOG_URL="./nghe-epub-voices.json";
const MAX_AUDIO_BYTES=150*1024*1024;
let catalogPromise=null;

function cleanEndpoint(value){
 const raw=String(value||"").trim().replace(/\/+$/,"");
 if(!raw)return "";
 let url;
 try{url=new URL(raw);}catch{throw Error("Địa chỉ dịch vụ TTS không hợp lệ.");}
 const local=["localhost","127.0.0.1","[::1]"].includes(url.hostname);
 if(url.protocol!=="https:"&&!(url.protocol==="http:"&&local))throw Error("Dịch vụ TTS phải dùng HTTPS (chỉ localhost được phép dùng HTTP).");
 if(location.protocol==="https:"&&url.protocol!=="https:")throw Error("Trang HTTPS không thể gọi dịch vụ HTTP. Hãy dùng endpoint HTTPS.");
 if(url.search||url.hash)throw Error("Endpoint TTS không được chứa query hoặc fragment.");
 return url.href.replace(/\/+$/,"");
}

function getConfig(){
 try{
  const saved=JSON.parse(localStorage.getItem(CONFIG_KEY)||"{}");
  return{endpoint:typeof saved.endpoint==="string"?saved.endpoint:"",voiceId:typeof saved.voiceId==="string"?saved.voiceId:"nghe-epub:1",speakerId:Number.isInteger(saved.speakerId)?saved.speakerId:0,speed:Number.isFinite(saved.speed)?saved.speed:1};
 }catch{return{endpoint:"",voiceId:"nghe-epub:1",speakerId:0,speed:1};}
}

function saveConfig(next){
 const config={...getConfig(),...next};
 config.endpoint=cleanEndpoint(config.endpoint);
 config.speakerId=Number(config.speakerId);
 config.speed=Number(config.speed);
 if(!Number.isInteger(config.speakerId)||config.speakerId<0)throw Error("Speaker ID không hợp lệ.");
 if(!Number.isFinite(config.speed)||config.speed<.5||config.speed>2)throw Error("Tốc độ phải từ 0.5× đến 2×.");
 localStorage.setItem(CONFIG_KEY,JSON.stringify(config));
 return config;
}

function validateCatalog(value){
 if(!value||!Array.isArray(value.voices)||value.voices.length!==10)throw Error("Catalog giọng Nghe Epub không hợp lệ.");
 for(const voice of value.voices){
  if(!voice.voiceId||!voice.displayName||!Array.isArray(voice.speakerNames)||voice.speakerNames.length!==voice.speakerCount)throw Error("Catalog thiếu tên speaker của "+(voice.displayName||voice.voiceId||"một giọng"));
 }
 return value;
}

function loadCatalog(){
 if(!catalogPromise)catalogPromise=fetch(CATALOG_URL,{cache:"no-cache"}).then(response=>{
  if(!response.ok)throw Error("Không tải được catalog giọng ("+response.status+").");
  return response.json();
 }).then(validateCatalog).catch(error=>{catalogPromise=null;throw error;});
 return catalogPromise;
}

async function request(path,options={}){
 const endpoint=cleanEndpoint(options.endpoint||getConfig().endpoint);
 if(!endpoint)throw Error("Hãy nhập và lưu endpoint HTTPS của dịch vụ TTS.");
 const{endpoint:unused,...requestOptions}=options;
 const response=await fetch(endpoint+path,{...requestOptions,credentials:"omit",cache:"no-store"});
 if(response.ok)return response;
 let detail="";
 try{detail=(await response.json())?.error||"";}catch{}
 throw Error(detail||"Dịch vụ TTS trả lỗi "+response.status+".");
}

async function testConnection(endpoint,signal){
 const response=await request("/voices",{endpoint,signal,headers:{Accept:"application/json"}});
 const remote=await response.json();
 if(!remote||(!Array.isArray(remote.voices)&&!Array.isArray(remote)))throw Error("Endpoint /voices không trả catalog hợp lệ.");
 return true;
}

async function synthesize(input){
 const text=String(input.text||"").trim();
 if(!text)throw Error("Chương hiện tại không có nội dung để đọc.");
 const catalog=await loadCatalog();
 const voice=catalog.voices.find(item=>item.voiceId===input.voice_id);
 if(!voice)throw Error("Giọng đã chọn không còn trong catalog.");
 const speaker=Number(input.speaker_id??0);
 if(!Number.isInteger(speaker)||speaker<0||speaker>=voice.speakerCount)throw Error("Speaker ID nằm ngoài phạm vi của giọng đã chọn.");
 const speed=Number(input.speed??1);
 if(!Number.isFinite(speed)||speed<.5||speed>2)throw Error("Tốc độ phải từ 0.5× đến 2×.");
 const response=await request("/synthesize",{
  endpoint:input.endpoint,method:"POST",signal:input.signal,
  headers:{"Content-Type":"application/json",Accept:"audio/wav"},
  body:JSON.stringify({text,voice_id:voice.voiceId,speaker_id:speaker,speed})
 });
 const type=(response.headers.get("content-type")||"").toLowerCase();
 if(!type.includes("audio/")&&!type.includes("application/octet-stream"))throw Error("Dịch vụ không trả về tệp audio.");
 const blob=await response.blob();
 if(!blob.size)throw Error("Dịch vụ trả về tệp audio rỗng.");
 if(blob.size>MAX_AUDIO_BYTES)throw Error("Audio sinh ra vượt giới hạn 150 MB.");
 return{blob,voice,speakerId:speaker,speed};
}

window.mbpNgheEpubTts=Object.freeze({loadCatalog,getConfig,saveConfig,testConnection,synthesize,cleanEndpoint});
})();
