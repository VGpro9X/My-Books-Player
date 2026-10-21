import { chromium } from "playwright";

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
try{
 await page.goto("http://127.0.0.1:8765/",{waitUntil:"load"});
 await page.locator("#heroRead").click();
 await page.locator('#readingPage p[data-para="9"]').click();
 await page.locator("#exitReader").click();
 await page.locator("#heroRead").click();
 await page.waitForTimeout(150);
 await assertRestored("reopen without pressing Play");
 await page.locator("#exitReader").click();
 await page.reload({waitUntil:"load"});
 await page.locator("#heroRead").click();
 await page.waitForTimeout(150);
 await assertRestored("reload/reopen after persisted marker");
 console.log("PASS: reader scrolls to paragraph 9 on reopen and after reload.");
}finally{await browser.close();}

async function assertRestored(label){
 const state=await page.evaluate(()=>{
  const reader=document.getElementById("readerScroll");
  const target=document.querySelector('#readingPage p[data-para="9"]');
  const r=reader.getBoundingClientRect(),t=target.getBoundingClientRect();
  return {
   scrollTop:reader.scrollTop,
   scrollHeight:reader.scrollHeight,
   viewportHeight:reader.clientHeight,
   targetTop:t.top,readerTop:r.top,readerBottom:r.bottom,
   visible:t.top>=r.top&&t.top<r.bottom,
   marked:target.classList.contains("highlight")
  };
 });
 console.log(label,state);
 if(!state.marked||!state.visible||state.scrollTop<100){
  throw new Error("Reader did not restore marked paragraph: "+JSON.stringify(state));
 }
}
