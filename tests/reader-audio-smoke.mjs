import { chromium } from "playwright";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
try {
 await page.route("https://cdn.jsdelivr.net/**",r=>r.abort());
 await page.goto("http://127.0.0.1:8765/",{waitUntil:"load"});
 await page.locator("#heroRead").click();
 await page.locator("#readerAudioBtn").click();
 await page.locator("#audioModeFile").click();
 if(!await page.locator("#audioFileArea").isVisible())throw Error("Missing HTML Audio controls");
 await page.locator("#audioSample").click();
 await page.waitForFunction(()=>document.getElementById("readerAudioElement").readyState>=1);
 const audioMeta=await page.evaluate(()=>{
  const a=document.getElementById("readerAudioElement");
  return {duration:a.duration,src:a.src,chapter:window.mbpAudio.getState().chapter,adapters:Object.keys(window.mbpAudio.adapters),loaded:window.mbpAudio.getState().loaded};
 });
 if(!audioMeta.loaded||!audioMeta.duration||audioMeta.duration<59||audioMeta.chapter!==26)throw Error("WAV audio adapter not initialized: "+JSON.stringify(audioMeta));
 console.log("PASS: Reader local WAV audio adapter, chapter metadata and 60s duration");
 await page.locator("#audioCues").setInputFiles({
  name:"chapter.json",mimeType:"application/json",
  buffer:Buffer.from(JSON.stringify({chapter:26,cues:[{startMs:0,endMs:60000,paragraph:9}]}))
 });
 await page.waitForFunction(()=>window.mbpAudio.getState().cues===1);
 await page.locator("audio#readerAudioElement").evaluate(async a=>{
  try{await a.play();}catch{}
  a.currentTime=4;
  a.dispatchEvent(new Event("timeupdate"));
 });
 await page.waitForTimeout(150);
 const aligned=await page.evaluate(()=>{
  const p=document.querySelector('#readingPage p[data-para="9"]');
  return {highlight:p.classList.contains("highlight"),current:window.mbpReader.getState().para};
 });
 if(!aligned.highlight||aligned.current!==9)throw Error("Timecoded highlight missing: "+JSON.stringify(aligned));
 console.log("PASS: audio cue highlights paragraph 9 and advances reading position");
 await page.locator("#audioPanelClose").click();
 await page.locator("#nextChapter").click();
 const state=await page.evaluate(()=>({chapter:window.mbpReader.getState().chapter,audio:window.mbpAudio.getState()}));
 if(state.chapter!==27||state.audio.loaded)throw Error("Chapter switch did not unload previous audio: "+JSON.stringify(state));
 console.log("PASS: changing chapter stops previous audio file and preserves chapter navigation");
 await page.locator("#readerAudioBtn").click();
 await page.locator("#audioModeTts").click();
 const mode=await page.evaluate(()=>window.mbpAudio.getMode());
 if(mode!=="tts"||!await page.locator("#audioTtsArea").isVisible())throw Error("Free TTS mode unavailable");
 console.log("PASS: free browser TTS adapter remains available");
 await page.locator("#exitReader").click();
 const closed=await page.evaluate(()=>window.mbpAudio.getState());
 if(closed.loaded)throw Error("Reader close failed to unload audio");
 console.log("PASS: audio resources cleaned on Reader close");
}finally{await browser.close();}
