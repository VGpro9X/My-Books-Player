import { chromium } from "playwright";

function wavTone(){
 const rate=24000,samples=rate,buffer=Buffer.alloc(44+samples*2);
 buffer.write("RIFF",0);buffer.writeUInt32LE(36+samples*2,4);buffer.write("WAVEfmt ",8);
 buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);
 buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*2,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);
 buffer.write("data",36);buffer.writeUInt32LE(samples*2,40);
 for(let i=0;i<samples;i++)buffer.writeInt16LE(Math.round(Math.sin(2*Math.PI*220*i/rate)*5000),44+i*2);
 return buffer;
}

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
let synthesisRequest=null;
try{
 await page.route("https://cdn.jsdelivr.net/**",route=>route.abort());
 await page.route("https://tts.example.test/api/tts/**",async route=>{
  const request=route.request();
  if(request.url().endsWith("/voices"))return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({voices:[{voiceId:"nghe-epub:12"}]})});
  synthesisRequest=request.postDataJSON();
  return route.fulfill({status:200,contentType:"audio/wav",body:wavTone()});
 });
 await page.goto("http://127.0.0.1:8765/",{waitUntil:"load"});
 await page.locator("#heroRead").click();
 await page.locator("#readerAudioBtn").click();
 await page.locator("#audioModeCustom").click();
 await page.waitForFunction(()=>document.getElementById("audioCustomVoice").options.length===10);
 const catalog=await page.evaluate(()=>({voices:document.getElementById("audioCustomVoice").options.length,adapters:Object.keys(window.mbpAudio.adapters)}));
 if(catalog.voices!==10||!catalog.adapters.includes("ngheEpub"))throw Error("Nghe Epub catalog/adapter missing: "+JSON.stringify(catalog));
 console.log("PASS: Nghe Epub catalog exposes 10 packages and the custom adapter");

 await page.locator("#audioEndpoint").fill("https://tts.example.test/api/tts");
 await page.locator("#audioCustomVoice").selectOption("nghe-epub:12");
 await page.locator("#audioCustomSpeaker").selectOption("6");
 await page.locator("#audioCustomSpeed").selectOption("1.2");
 await page.locator("#audioEndpointTest").click();
 await page.waitForFunction(()=>document.getElementById("audioStatus").textContent.includes("Kết nối thành công"));
 console.log("PASS: HTTPS endpoint is saved and /voices connectivity is verified");

 await page.locator("#audioGenerate").click();
 await page.waitForFunction(()=>window.mbpAudio.getState().generated===true);
 if(!synthesisRequest?.text||synthesisRequest.voice_id!=="nghe-epub:12"||synthesisRequest.speaker_id!==6||synthesisRequest.speed!==1.2)throw Error("Invalid synthesis request: "+JSON.stringify(synthesisRequest));
 const result=await page.evaluate(()=>({state:window.mbpAudio.getState(),label:document.getElementById("audioPlaybackLabel").textContent,visible:!document.getElementById("audioPlaybackArea").hidden}));
 if(!result.state.loaded||!result.visible||!result.label.includes("Phố Minh Đức"))throw Error("Generated WAV not loaded: "+JSON.stringify(result));
 console.log("PASS: remaining chapter text is synthesized and loaded into the Media Session player");
}finally{await browser.close();}
