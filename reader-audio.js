/* My Books Player v0.9: browser TTS + Nghe Epub API + local audio/Media Session. */
(() => {
"use strict";
const get=id=>document.getElementById(id);
const panel=document.createElement("aside");
panel.id="mbpAudioPanel";
panel.hidden=true;
panel.setAttribute("aria-label","Audio Player cho sách");
panel.innerHTML='<div class="audio-head"><strong>♫ Nghe sách</strong><button type="button" id="audioClose" aria-label="Đóng">×</button></div>'+
'<p class="audio-help" id="audioChapterLabel">Mở một chương để nghe.</p>'+
'<div class="audio-modes"><button id="audioModeTts" class="active" aria-pressed="true">TTS máy</button><button id="audioModeCustom" aria-pressed="false">Nghe Epub</button><button id="audioModeFile" aria-pressed="false">File audio</button></div>'+
'<section id="audioTtsArea"><p class="audio-help">Giọng tiếng Việt mặc định của Chrome/Android; tô sáng đoạn đang đọc. Không bảo đảm chạy nền khi khóa màn hình.</p><button id="audioTtsToggle" class="audio-primary">▶ Đọc từ vị trí đã lưu</button></section>'+
'<section id="audioCustomArea" hidden aria-busy="false"><p class="audio-help" id="audioPrivacyNote">Tạo WAV bằng bộ giọng Nghe Epub. Nội dung từ đoạn đang đọc đến hết chương sẽ được gửi tới endpoint HTTPS do bạn quản lý; không nhập API key vào đây.</p>'+
'<label for="audioEndpoint">Endpoint TTS</label><input id="audioEndpoint" type="url" inputmode="url" autocomplete="off" spellcheck="false" aria-describedby="audioPrivacyNote" placeholder="https://tts.example.com/api/tts">'+
'<div class="audio-config-actions"><button id="audioEndpointSave" class="audio-small">Lưu địa chỉ</button><button id="audioEndpointTest" class="audio-small">Kiểm tra kết nối</button></div>'+
'<label for="audioCustomVoice">Gói giọng</label><select id="audioCustomVoice" aria-label="Chọn gói giọng Nghe Epub"></select>'+
'<label for="audioCustomSpeaker">Giọng đọc</label><select id="audioCustomSpeaker" aria-label="Chọn speaker Nghe Epub"></select>'+
'<label for="audioCustomSpeed">Tốc độ sinh giọng</label><select id="audioCustomSpeed"><option value="0.8">0.8×</option><option value="1" selected>1×</option><option value="1.2">1.2×</option><option value="1.5">1.5×</option><option value="2">2×</option></select>'+
'<button id="audioGenerate" class="audio-primary">♫ Tạo audio phần còn lại của chương</button></section>'+
'<section id="audioFileArea" hidden><p class="audio-help">Chọn file audio cho <b>chương đang mở</b>, hoặc tạo WAV tiếng bíp để thử khóa màn hình. Audio chỉ mở trên máy, không tải lên cloud.</p>'+
'<label for="audioChoose">File MP3 / WAV / M4A</label><input id="audioChoose" type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.opus">'+
'<button id="audioSample" class="audio-small">♫ Tạo WAV thử 60 giây</button>'+
'<label for="audioCues">JSON thời gian (tùy chọn, để tô sáng đúng đoạn)</label><input id="audioCues" type="file" accept=".json,application/json">'+
'<p class="audio-help">Không có JSON thời gian thì không thể biết chính xác câu nào trong MP3 đang phát. Chọn lại file tương ứng khi mở sách trên thiết bị khác.</p></section>'+
'<section id="audioPlaybackArea" hidden><p class="audio-help" id="audioPlaybackLabel"></p><audio id="readerAudioElement" controls preload="metadata"></audio>'+
'<div class="audio-actions"><button id="audioBack" class="audio-small">↶ 15 giây</button><button id="audioForward" class="audio-small">15 giây ↷</button><label for="audioSpeed">Tốc độ phát</label><select id="audioSpeed"><option value="0.8">0.8×</option><option value="1" selected>1×</option><option value="1.2">1.2×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></div></section>'+
'<p class="audio-status" id="audioStatus" role="status">Sẵn sàng.</p><p class="audio-help">Chế độ file thật hỗ trợ Media Session và điều khiển khóa màn hình tùy Android. Không bảo đảm hoạt động nếu Chrome bị hệ thống tắt.</p>';
document.body.appendChild(panel);
const style=document.createElement("style");
style.textContent=".audio-panel,.unused{}#mbpAudioPanel{position:fixed;top:0;right:0;bottom:0;z-index:48;width:min(400px,96vw);padding:20px 17px 45px;overflow:auto;background:var(--surface);color:var(--fg);box-shadow:-6px 0 40px #0005}#mbpAudioPanel[hidden]{display:none}.audio-head{display:flex;justify-content:space-between;align-items:center}.audio-head strong{font-size:20px}.audio-head button{border:0;background:transparent;color:var(--fg);font-size:28px}.audio-help{font-size:12px;line-height:1.7;color:var(--muted)}.audio-modes{display:flex;gap:6px;background:var(--bg);border-radius:12px;padding:5px;margin:14px 0}.audio-modes button{flex:1;min-height:44px;background:transparent;border:0;border-radius:9px;padding:9px 5px;color:var(--fg);font-weight:750;font-size:11px}.audio-modes button.active{background:var(--pink);color:white}.audio-primary{width:100%;min-height:44px;background:var(--pink);color:white;border:0;border-radius:10px;padding:12px;font-weight:800;margin-top:12px}.audio-primary:disabled,.audio-small:disabled{opacity:.55}.audio-small{min-height:40px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-weight:700;font-size:12px}.audio-actions,.audio-config-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.audio-config-actions .audio-small{flex:1}#mbpAudioPanel label{display:block;font-size:12px;font-weight:750;margin:11px 0 6px}#mbpAudioPanel input[type=file],#audioEndpoint{box-sizing:border-box;width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--fg);display:block;margin-bottom:10px}#mbpAudioPanel audio{width:100%;margin:8px 0 14px}#mbpAudioPanel select{padding:9px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:10px}#audioCustomArea>select{box-sizing:border-box;width:100%}.audio-status{background:var(--tint);border-radius:10px;padding:12px;font-size:12px;min-height:42px;overflow-wrap:anywhere}";
document.head.appendChild(style);
const audio=get("readerAudioElement");
const adapters=Object.freeze({browserSpeech:{kind:"speechSynthesis",type:"tts",requiresFile:false},ngheEpub:{kind:"http-audio",type:"tts",requiresEndpoint:true},fileAudio:{kind:"html-audio",type:"audio",requiresFile:true}});
let mode="tts",url=null,current=null,cues=[],cueIndex=-1,restoreMs=0,lastWrite=0,customCatalog=null,customAbort=null;
function state(){return window.mbpReader?.getState?.()||null;}
function same(s){return !!(s&&current&&s.bookId===current.bookId&&s.chapter===current.chapter);}
function status(s){get("audioStatus").textContent=String(s);}
function modeSelect(m){
 if(mode==="custom"&&m!=="custom"&&customAbort){customAbort.abort();customAbort=null;}
 if(m==="tts")stopFile();
 else window.mbpReader?.stopTts?.();
 mode=m;
 get("audioModeTts").classList.toggle("active",m==="tts");
 get("audioModeCustom").classList.toggle("active",m==="custom");
 get("audioModeFile").classList.toggle("active",m==="file");
 get("audioModeTts").setAttribute("aria-pressed",String(m==="tts"));
 get("audioModeCustom").setAttribute("aria-pressed",String(m==="custom"));
 get("audioModeFile").setAttribute("aria-pressed",String(m==="file"));
 get("audioTtsArea").hidden=m!=="tts";
 get("audioCustomArea").hidden=m!=="custom";
 get("audioFileArea").hidden=m!=="file";
 if(m==="custom")initCustom();
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
 if(customAbort){customAbort.abort();customAbort=null;}
 remember();audio.pause();audio.removeAttribute("src");audio.load();
 if(url)URL.revokeObjectURL(url);
 url=null;current=null;cues=[];cueIndex=-1;restoreMs=0;
 get("audioChoose").value="";get("audioCues").value="";
 get("audioPlaybackArea").hidden=true;
 get("audioGenerate").disabled=false;get("audioCustomArea").setAttribute("aria-busy","false");
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
 if(window.MediaMetadata)navigator.mediaSession.metadata=new MediaMetadata({title:s.title+" — Chương "+s.chapter,artist:current?.generated?current.voiceName:"My Books Player",album:current?.generated?"Nghe Epub TTS":"Audio của tôi"});
 const actions={
  play:()=>audio.play().catch(()=>{}),pause:()=>audio.pause(),
  seekbackward:e=>{audio.currentTime=Math.max(0,audio.currentTime-(e.seekOffset||15));},
  seekforward:e=>{audio.currentTime=Math.min(Number.isFinite(audio.duration)?audio.duration:Infinity,audio.currentTime+(e.seekOffset||15));},
  seekto:e=>{if(Number.isFinite(e.seekTime))audio.currentTime=e.seekTime;}
 };
 for(const name of Object.keys(actions))try{navigator.mediaSession.setActionHandler(name,actions[name]);}catch{}
}
function selectFile(blob,label,extra={}){
 const s=state();if(!s){status("Hãy mở sách trước.");return;}
 if(blob.size>150*1024*1024){status("Audio thử vượt 150 MB.");return;}
 if(!(/^audio\//.test(blob.type)||/\.(mp3|wav|m4a|ogg|opus)$/i.test(label))){status("Chọn file audio hợp lệ.");return;}
 window.mbpReader?.stopTts?.();
 stopFile();url=URL.createObjectURL(blob);
 current={bookId:s.bookId,chapter:s.chapter,isImported:s.isImported,...extra};
 audio.src=url;audio.loop=label==="Âm thử 60 giây";audio.playbackRate=Number(get("audioSpeed").value);
 restoreMs=extra.generated?0:resume(s);mediaSetup(s);
 get("audioPlaybackArea").hidden=false;get("audioPlaybackLabel").textContent=label;
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
function chosenVoice(){return customCatalog?.voices.find(voice=>voice.voiceId===get("audioCustomVoice").value)||null;}
function syncCustomSpeakers(preferred){
 const voice=chosenVoice(),select=get("audioCustomSpeaker");select.replaceChildren();
 if(!voice)return;
 voice.speakerNames.forEach((name,index)=>select.add(new Option(name,String(index))));
 const speaker=Number(preferred);select.value=Number.isInteger(speaker)&&speaker>=0&&speaker<voice.speakerCount?String(speaker):"0";
}
async function initCustom(){
 const api=window.mbpNgheEpubTts;
 if(!api){status("Thiếu adapter Nghe Epub TTS.");return;}
 if(customCatalog)return;
 get("audioCustomArea").setAttribute("aria-busy","true");status("Đang tải danh sách giọng Nghe Epub…");
 try{
  customCatalog=await api.loadCatalog();
  const config=api.getConfig(),voices=get("audioCustomVoice");voices.replaceChildren();
  customCatalog.voices.forEach(voice=>voices.add(new Option(voice.displayName+(voice.premium?" · premium":""),voice.voiceId)));
  voices.value=customCatalog.voices.some(voice=>voice.voiceId===config.voiceId)?config.voiceId:customCatalog.voices[0].voiceId;
  get("audioEndpoint").value=config.endpoint;get("audioCustomSpeed").value=String(config.speed);
  syncCustomSpeakers(config.speakerId);status("Đã nạp "+customCatalog.counts.speakerProfiles+" giọng. Nhập endpoint để tạo audio.");
 }catch(error){status("Không tải được catalog: "+(error.message||error));}
 finally{get("audioCustomArea").setAttribute("aria-busy","false");}
}
function customConfig(){
 return{endpoint:get("audioEndpoint").value,voiceId:get("audioCustomVoice").value,speakerId:Number(get("audioCustomSpeaker").value),speed:Number(get("audioCustomSpeed").value)};
}
function saveCustom(){
 const api=window.mbpNgheEpubTts;
 if(!api)throw Error("Thiếu adapter Nghe Epub TTS.");
 const config=api.saveConfig(customConfig());get("audioEndpoint").value=config.endpoint;return config;
}
async function testCustom(){
 const button=get("audioEndpointTest");button.disabled=true;status("Đang kiểm tra endpoint TTS…");
 try{const config=saveCustom();await window.mbpNgheEpubTts.testConnection(config.endpoint);status("Kết nối thành công. Endpoint đã sẵn sàng sinh audio.");}
 catch(error){status("Không kết nối được: "+(error.message||error));}
 finally{button.disabled=false;}
}
async function generateCustom(){
 const s=state();if(!s){status("Hãy mở sách trước.");return;}
 const text=s.paragraphs.slice(s.para).join("\n\n").trim();
 if(!text){status("Phần còn lại của chương không có nội dung.");return;}
 if(text.length>50000){status("Phần còn lại vượt 50.000 ký tự. Hãy bắt đầu gần cuối chương hơn.");return;}
 const button=get("audioGenerate"),area=get("audioCustomArea");
 stopFile();
 button.disabled=true;area.setAttribute("aria-busy","true");customAbort=new AbortController();
 try{
  const config=saveCustom(),voice=chosenVoice();
  status("Đang gửi "+text.length.toLocaleString("vi-VN")+" ký tự tới dịch vụ TTS…");
  const result=await window.mbpNgheEpubTts.synthesize({endpoint:config.endpoint,text,voice_id:config.voiceId,speaker_id:config.speakerId,speed:config.speed,signal:customAbort.signal});
  const latest=state();if(!latest||latest.bookId!==s.bookId||latest.chapter!==s.chapter)throw Error("Bạn đã đổi sách hoặc chương trong lúc tạo audio.");
  const speaker=result.voice.speakerNames[result.speakerId];
  selectFile(result.blob,"Nghe Epub · "+speaker,{generated:true,voiceName:speaker,startPara:s.para});
 }catch(error){if(error.name!=="AbortError")status("Không tạo được audio: "+(error.message||error));}
 finally{customAbort=null;button.disabled=false;area.setAttribute("aria-busy","false");}
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
get("audioModeCustom").onclick=()=>modeSelect("custom");
get("audioModeFile").onclick=()=>modeSelect("file");
get("audioTtsToggle").onclick=()=>{modeSelect("tts");window.mbpReader?.toggleTts?.();};
get("audioEndpointSave").onclick=()=>{try{saveCustom();status("Đã lưu endpoint và lựa chọn giọng trên thiết bị này.");}catch(error){status("Không lưu được: "+(error.message||error));}};
get("audioEndpointTest").onclick=testCustom;
get("audioCustomVoice").onchange=()=>syncCustomSpeakers(0);
get("audioGenerate").onclick=generateCustom;
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
audio.onplay=()=>{if(!same(state())){audio.pause();status("Bạn đã đổi sách hoặc chương, hãy nạp audio lại.");return;}window.mbpReader?.stopTts?.();if("mediaSession" in navigator)navigator.mediaSession.playbackState="playing";status(current?.generated?"Đang phát giọng Nghe Epub. Có thể điều khiển qua Media Session.":"Đang phát file audio thật. Thử khóa màn hình Android.");};
audio.onpause=()=>{remember();if("mediaSession" in navigator)navigator.mediaSession.playbackState="paused";};
audio.ontimeupdate=()=>{
 align();
 if(!audio.paused&&Date.now()-lastWrite>=5000){lastWrite=Date.now();remember();}
 if("mediaSession" in navigator&&navigator.mediaSession.setPositionState&&Number.isFinite(audio.duration)){try{navigator.mediaSession.setPositionState({duration:audio.duration,playbackRate:audio.playbackRate,position:Math.min(audio.currentTime,audio.duration)});}catch{}}
};
audio.onseeked=()=>{cueIndex=-1;align();remember();};
audio.onended=()=>{remember();status(current?.generated?"Đã đọc hết phần được tạo của chương này.":"Đã hết audio chương này. Chọn file chương sau để tiếp tục.");};
audio.onerror=()=>{status("Không phát được định dạng audio này trên Android/Chrome.");};
window.addEventListener("mbp:auth-change",()=>{if(current?.isImported)closeReader();});
window.addEventListener("pagehide",()=>remember());
window.mbpAudio={adapters,open,close,stopFile,onChapterChange:changedChapter,onReaderClose:closeReader,getMode:()=>mode,getState:()=>({loaded:!!url,generated:!!current?.generated,chapter:current?.chapter||null,seconds:audio.currentTime,cues:cues.length})};
})();
