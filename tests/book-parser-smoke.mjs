import { chromium } from "playwright";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
try {
  await page.goto("about:blank");
  await page.addScriptTag({path:"./node_modules/jszip/dist/jszip.min.js"});
  await page.addScriptTag({path:"./book-parser.js"});
  const result=await page.evaluate(async()=>{
    const parser=window.mbpBookParser;
    const checks=[];
    const txt="Chương 1: Mở đầu\n\nXin chào chương một.\n\nĐoạn hai.\n\nChương 2: Tiếp theo\n\nLời cuối.";
    const t=await parser.parseFile(new File([txt],"demo.txt"));
    checks.push(["TXT hai chương",t.chapters.length===2]);
    checks.push(["TXT giữ văn bản",t.chapters[0].paragraphs.some(p=>p.includes("Đoạn hai"))]);
    const zip=new JSZip();
    zip.file("META-INF/container.xml",'<container><rootfiles><rootfile full-path="OPS/content.opf"/></rootfiles></container>');
    zip.file("OPS/content.opf",'<package xmlns="http://www.idpf.org/2007/opf"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>EPUB Thử</dc:title><dc:creator>Tác Giả</dc:creator></metadata><manifest><item id="a" href="chapters/a.xhtml" media-type="application/xhtml+xml"/><item id="b" href="chapters/b.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="a"/><itemref idref="b"/></spine></package>');
    zip.file("OPS/chapters/a.xhtml",'<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Chương A</h1><p>Nội dung chương A.</p><script>window.epubInjected=true</script></body></html>');
    zip.file("OPS/chapters/b.xhtml",'<html xmlns="http://www.w3.org/1999/xhtml"><body><p>Nội dung chương B.</p></body></html>');
    const b=await zip.generateAsync({type:"blob"});
    const e=await parser.parseFile(new File([b],"demo.epub"));
    checks.push(["EPUB hai chương",e.chapters.length===2]);
    checks.push(["EPUB metadata",e.title==="EPUB Thử"&&e.author==="Tác Giả"]);
    checks.push(["EPUB đoạn",e.chapters[1].paragraphs.some(p=>p.includes("chương B"))]);
    checks.push(["Không thực thi script trong EPUB",!window.epubInjected&&!e.chapters.flatMap(c=>c.paragraphs).join(" ").includes("window.epubInjected")]);
    let blocked=false;try{await parser.parseFile(new File(["hello"],"bad.pdf"));}catch{blocked=true;}
    checks.push(["Chặn PDF",blocked]);
    let rejected=false;try{await parser.parseFile(new File([""],"empty.txt"));}catch{rejected=true;}
    checks.push(["Chặn TXT rỗng",rejected]);
    return checks;
  });
  for(const [name,ok] of result){console.log((ok?"PASS: ":"FAIL: ")+name);if(!ok)throw Error(name);}
}finally{await browser.close();}
