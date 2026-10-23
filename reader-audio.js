/* My Books Player v0.6: free TTS + HTML Audio + Media Session.
 * Real audio selected locally; no paid service, no upload of audio files. */
(() => {
"use strict";
const get=id=>document.getElementById(id);
const panel=document.createElement("aside");
panel.id="mbpAudioPanel";
panel.hidden=true;
panel.setAttribute("aria-label","Audio Player cho sách");
panel.innerHTML='<div class="audio-head"><strong>♫ Nghe sách</strong><button type="button" id="audioClose" aria-label="Đóng">×</button></div>'+
'<p class="audio-help" id="audioChapterLabel">Mở một chương để nghe.</p>'+
'<div class="audio-modes"><button id="audioModeTts" class="active">TTS miễn phí</button><button id="audioModeFile">Audio MP3 / WAV</button></div>'+
'<section id="audioTtsArea"><p class="audio-help">Giọng tiếng Việt mặc định của Chrome/Android; tô sáng đoạn đang đọc. Không bảo đảm chạy nền khi khóa màn hình.</p><button id="audioTtsToggle" class="audio-primary">▶ Đọc từ vị trí đã lưu</button></section>'+
'<section id="audioFileArea" hidden><p class="audio-help">Chọn file audio cho <b>chương đang mở</b>, hoặc tạo WAV tiếng bíp để thử khóa màn hình. Audio chỉ mở trên máy, không tải lên cloud.</p>'+
'<label for="audioChoose">File MP3 / WAV / M4A</label><input id="audioChoose" type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.opus">'+
'<button id="audioSample" class="audio-small">♫ Tạo WAV thử 60 giây</button><audio id="readerAudioElement" controls preload="metadata"></audio>'+
'<div class="audio-actions"><button id="audioBack" class="audio-small">↶ 15 giây</button><button id="audioForward" class="audio-small">15 giây ↷</button><label for="audioSpeed">Tốc độ</label><select id="audioSpeed"><option value="0.8">0.8×</option><option value="1" selected>1×</option><option value="1.2">1.2×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></div>'+
'<label for="audioCues">JSON thời gian (tùy chọn, để tô sáng đúng đoạn)</label><input id="audioCues" type="file" accept=".json,application/json">'+
'<p class="audio-help">Không có JSON thời gian thì không thể biết chính xác câu nào trong MP3 đang phát. Chọn lại file tương ứng khi mở sách trên thiết bị khác.</p></section>'+
'<p class="audio-status" id="audioStatus" role="status">Sẵn sàng.</p><p class="audio-help">Chế độ file thật hỗ trợ Media Session và điều khiển khóa màn hình tùy Android. Không bảo đảm hoạt động nếu Chrome bị hệ thống tắt.</p>';
document.body.appendChild(panel);
const style=document.createElement("style");
style.textContent=".audio-panel,.unused{}#mbpAudioPanel{position:fixed;top:0;right:0;bottom:0;z-index:48;width:min(400px,96vw);padding:20px 17px 45px;overflow:auto;background:var(--surface);color:var(--fg);box-shadow:-6px 0 40px #0005}#mbpAudioPanel[hidden]{display:none}.audio-head{display:flex;justify-content:space-between;align-items:center}.audio-head strong{font-size:20px}.audio-head button{border:0;background:transparent;color:var(--fg);font-size:28px}.audio-help{font-size:12px;line-height:1.7;color:var(--muted)}.audio-modes{display:flex;gap:6px;background:var(--bg);border-radius:12px;padding:5px;margin:14px 0}.audio-modes button{flex:1;background:transparent;border:0;border-radius:9px;padding:11px 6px;color:var(--fg);font-weight:750;font-size:12px}.audio-modes button.active{background:var(--pink);color:white}.audio-primary{width:100%;background:var(--pink);color:white;border:0;border-radius:10px;padding:12px;font-weight:800}.audio-small{background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-weight:700;font-size:12px}.audio-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}#mbpAudioPanel label{display:block;font-size:12px;font-weight:750;margin:11px 0 6px}#mbpAudioPanel input[type=file]{max-width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--fg);display:block;margin-bottom:10px}#mbpAudioPanel audio{width:100%;margin:14px 0}#mbpAudioPanel select{padding:8px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:10px}.audio-status{background:var(--tint);border-radius:10px;padding:12px;font-size:12px;min-height:42px;overflow-wrap:anywhere}";
document.head.appendChild(style);
const audio=get("readerAudioElement");
const adapters=Object.freeze({browserSpeech:{kind:"speechSynthesis",type:"tts",requiresFile:false},fileAudio:{kind:"html-audio",type:"audio",requiresFile:true}});
let mode="tts",url=null,current=null,cues=[],cueIndex=-1,restoreMs=0,lastWrite=0;
function state(){return window.mbpReader?.getState?.()||null;}
function same(s){return !!(s&&current&&s.bookId===current.bookId&&s.chapter===current.chapter);}
function status(s){get("audioStatus").textContent=String(s);}
function modeSelect(m){
 if(m==="file"){window.mbpReader?.stopTts?.();}
 else if(mode==="file")stopFile();
 mode=m;
 get("audioModeTts").classList.toggle("active",m==="tts");
 get("audioModeFile").classList.toggle("active",m==="file");
 get("audioTtsArea").hidden=m!=="tts";
 get("audioFileArea").hidden=m!=="file";
}
function close(){panel.hidden=true;}
function open(){
 const s=state();if(!s)return;
 get("audioChapterLabel").textContent=s.title+" · Chương "+s.chapter;
 panel.hidden=false;
}
function remember(){
 if(!current||!Number.isFinite(audio.currentTime))return;
 const ms=Math.round(audio.currentTime*1000);
 if(current.isImported)window.mbpSaveAudioOffset?.(current.bookId,current.chapter,ms);
 else{
  try{const k="mbp_demo_audio_positions",saved=JSON.parse(localStorage.getItem(k)||"{}");saved[current.bookId]={chapter:current.chapter,ms};localStorage.setItem(k,JSON.stringify(saved));}catch{}
 }
}
function resume(s){
 if(s.isImported)return window.mbpGetAudioResume?.(s.bookId,s.chapter)||0;
 try{const x=JSON.parse(localStorage.getItem("mbp_demo_audio_positions")||"{}")[s.bookId];return x?.chapter===s.chapter?x.ms:0;}catch{return 0;}
}
function stopFile(){
 remember();audio.pause();audio.removeAttribute("src");audio.load();
 if(url)URL.revokeObjectURL(url);
 url=null;current=null;cues=[];cueIndex=-1;restoreMs=0;
 get("audioChoose").value="";get("audioCues").value="";
 if("mediaSession" in navigator)navigator.mediaSession.playbackState="none";
}
function changedChapter(){
 stopFile();window.mbpReader?.stopTts?.();
 const s=state();if(s)get("audioChapterLabel").textContent=s.title+" · Chương "+s.chapter;
 status("Đã đổi chương. Chọn audio mới cho chương này.");
}
function closeReader(){stopFile();close();window.mbpReader?.stopTts?.();}
function mediaSetup(s){
 if(!("mediaSession" in navigator))return;
 if(window.MediaMetadata)navigator.mediaSession.metadata=new MediaMetadata({title:s.title+" — Chương "+s.chapter,artist:"My Books Player",album:"Audio của tôi"});
 const actions={
  play:()=>audio.play().catch(()=>{}),pause:()=>audio.pause(),
  seekbackward:e=>{audio.currentTime=Math.max(0,audio.currentTime-(e.seekOffset||15));},
  seekforward:e=>{audio.currentTime=Math.min(Number.isFinite(audio.duration)?audio.duration:Infinity,audio.currentTime+(e.seekOffset||15));},
  seekto:e=>{if(Number.isFinite(e.seekTime))audio.currentTime=e.seekTime;}
 };
 for(const name of Object.keys(actions))try{navigator.mediaSession.setActionHandler(name,actions[name]);}catch{}
}
function selectFile(blob,label){
 const s=state();if(!s){status("Hãy mở sách trước.");return;}
 if(blob.size>150*1024*1024){status("Audio thử vượt 150 MB.");return;}
 if(!(/^audio\//.test(blob.type)||/\.(mp3|wav|m4a|ogg|opus)$/i.test(label))){status("Chọn file audio hợp lệ.");return;}
 window.mbpReader?.stopTts?.();
 stopFile();url=URL.createObjectURL(blob);
 current={bookId:s.bookId,chapter:s.chapter,isImported:s.isImported};
 audio.src=url;audio.loop=label==="Âm thử 60 giây";audio.playbackRate=Number(get("audioSpeed").value);
 restoreMs=resume(s);mediaSetup(s);
 status("Đã nạp "+label+". Nhấn Play để thử khóa màn hình."+(restoreMs?" Vị trí cũ: "+Math.round(restoreMs/1000)+" giây.":""));
}
function beep(){
 const rate=8000,count=60*rate,buffer=new ArrayBuffer(44+2*count),v=new DataView(buffer);
 function str(pos,s){for(let i=0;i<s.length;i++)v.setUint8(pos+i,s.charCodeAt(i));}
 str(0,"RIFF");v.setUint32(4,36+count*2,true);str(8,"WAVE");str(12,"fmt ");
 v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
 v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);
 str(36,"data");v.setUint32(40,count*2,true);
 for(let i=0;i<count;i++){const t=i/rate,phase=t%2.5,e=phase<.32?Math.sin(Math.PI*phase/.32):0;v.setInt16(44+2*i,Math.round(Math.sin(2*Math.PI*440*t)*e*.19*32767),true);}
 return new Blob([buffer],{type:"audio/wav"});
}
function checkCues(obj,s){
 if(!Array.isArray(obj?.cues)||obj.cues.length>20000)throw Error("JSON cần mảng cues tối đa 20.000 mục.");
 if(obj.chapter!==undefined&&obj.chapter!==s.chapter)throw Error("Sai chương.");
 let end=0;
 return obj.cues.map((row,i)=>{
  const startMs=Number(row.startMs),endMs=Number(row.endMs),paragraph=Number(row.paragraph);
  if(!Number.isFinite(startMs)||!Number.isFinite(endMs)||!Number.isInteger(paragraph)||startMs<end||endMs<=startMs||paragraph<0||paragraph>=s.paragraphs.length||endMs>86400000)throw Error("Cue "+(i+1)+" không hợp lệ.");
  end=endMs;return{startMs,endMs,paragraph};
 });
}
function align(){
 if(audio.paused||!same(state())||!cues.length)return;
 const time=audio.currentTime*1000;
 let lo=0,hi=cues.length-1,found=-1;
 while(lo<=hi){const m=(lo+hi)>>1,q=cues[m];if(time<q.startMs)hi=m-1;else if(time>=q.endMs)lo=m+1;else{found=m;break;}}
 if(found>=0&&found!==cueIndex){cueIndex=found;window.mbpReader?.setAudioParagraph?.(cues[found].paragraph);}
}
get("audioClose").onclick=close;
get("audioModeTts").onclick=()=>modeSelect("tts");
get("audioModeFile").onclick=()=>modeSelect("file");
get("audioTtsToggle").onclick=()=>{modeSelect("tts");window.mbpReader?.toggleTts?.();};
get("audioChoose").onchange=e=>{const f=e.target.files?.[0];if(f)selectFile(f,f.name);};
get("audioSample").onclick=()=>selectFile(beep(),"Âm thử 60 giây");
get("audioBack").onclick=()=>{if(audio.src)audio.currentTime=Math.max(0,audio.currentTime-15);};
get("audioForward").onclick=()=>{if(audio.src)audio.currentTime=Math.min(Number.isFinite(audio.duration)?audio.duration:Infinity,audio.currentTime+15);};
get("audioSpeed").onchange=()=>{audio.playbackRate=Number(get("audioSpeed").value);};
get("audioCues").onchange=async e=>{
 const f=e.target.files?.[0];if(!f)return;
 if(!current||!same(state())){status("Chọn file audio của chương hiện tại trước.");return;}
 if(f.size>1024*1024){status("JSON tối đa 1 MB.");return;}
 try{cues=checkCues(JSON.parse(await f.text()),state());cueIndex=-1;status("Đã nạp "+cues.length+" mốc, sẽ tô sáng theo audio.");}
 catch(err){cues=[];status("Lỗi JSON thời gian: "+(err.message||err));}
};
audio.onloadedmetadata=()=>{if(restoreMs&&Number.isFinite(audio.duration))audio.currentTime=Math.min(restoreMs/1000,Math.max(0,audio.duration-.15));restoreMs=0;};
audio.onplay=()=>{if(!same(state())){audio.pause();status("Bạn đã đổi sách hoặc chương, hãy nạp audio lại.");return;}window.mbpReader?.stopTts?.();if("mediaSession" in navigator)navigator.mediaSession.playbackState="playing";status("Đang phát file audio thật. Thử khóa màn hình Android.");};
audio.onpause=()=>{remember();if("mediaSession" in navigator)navigator.mediaSession.playbackState="paused";};
audio.ontimeupdate=()=>{
 align();
 if(!audio.paused&&Date.now()-lastWrite>=5000){lastWrite=Date.now();remember();}
 if("mediaSession" in navigator&&navigator.mediaSession.setPositionState&&Number.isFinite(audio.duration)){try{navigator.mediaSession.setPositionState({duration:audio.duration,playbackRate:audio.playbackRate,position:Math.min(audio.currentTime,audio.duration)});}catch{}}
};
audio.onseeked=()=>{cueIndex=-1;align();remember();};
audio.onended=()=>{remember();status("Đã hết audio chương này. Chọn file chương sau để tiếp tục.");};
audio.onerror=()=>{status("Không phát được định dạng audio này trên Android/Chrome.");};
window.addEventListener("mbp:auth-change",()=>{if(current?.isImported)closeReader();});
window.addEventListener("pagehide",()=>remember());
window.mbpAudio={adapters,open,close,stopFile,onChapterChange:changedChapter,onReaderClose:closeReader,getMode:()=>mode,getState:()=>({loaded:!!url,chapter:current?.chapter||null,seconds:audio.currentTime,cues:cues.length})};
})();