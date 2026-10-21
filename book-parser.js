/* My Books Player 0.4: client-side TXT and EPUB text extractor.
   EPUB chapter XHTML is converted to TEXT ONLY, never injected as executable HTML. */
(function(){
"use strict";
const MAX_BYTES=20*1024*1024;
const MAX_UNCOMPRESSED=80*1024*1024;
const MAX_CHAPTERS=2500;
function normalize(s){return String(s||"").replace(/\u0000/g,"").replace(/\s+/g," ").trim();}
function safeParts(text){
  const lines=String(text||"").replace(/\r\n?/g,"\n").split(/\n\s*\n/).map(normalize).filter(Boolean);
  if(lines.length===1&&lines[0].length>1500){return String(text).split("\n").map(normalize).filter(Boolean).flatMap(splitLong);}
  return lines.flatMap(splitLong);
}
function splitLong(s){
 if(s.length<=2400)return[s];
 const out=[];let rest=s;
 while(rest.length>2400){let split=rest.lastIndexOf(" ",2200);if(split<800)split=2200;out.push(rest.slice(0,split).trim());rest=rest.slice(split).trim();}
 if(rest)out.push(rest);return out;
}
function parseTxt(text,filename){
 text=String(text||"").replace(/^\uFEFF/,"").replace(/\r\n?/g,"\n").replace(/\u0000/g,"");
 if(!text.trim())throw Error("Tệp TXT không có nội dung.");
 const lines=text.split("\n");let chapters=[],title="",pieces=[],currentSize=0;
 const chapterRe=/^\s*(?:chương|chapter|hồi|quyển)\s*(?:\d+|[ivxlcdm]+)\b.{0,100}$/i;
 function flush(){
  const segments=safeParts(pieces.join("\n"));
  if(segments.length)chapters.push({title:title||"Phần "+(chapters.length+1),paragraphs:segments});
  title="";pieces=[];currentSize=0;
 }
 for(const line of lines){
  if(chapterRe.test(line)&&line.trim().length<130){if(pieces.length)flush();title=normalize(line);continue;}
  pieces.push(line);currentSize+=line.length+1;
  if(currentSize>=28000){flush();}
  if(chapters.length>MAX_CHAPTERS)throw Error("Sách có quá nhiều chương.");
 }
 flush();
 if(!chapters.length)throw Error("Không tìm thấy đoạn văn có thể đọc trong TXT.");
 return {title:normalize(filename.replace(/\.txt$/i,"").replace(/[_-]+/g," "))||"Sách TXT",author:"",chapters,format:"txt"};
}
function parseXml(value,label){
 const doc=new DOMParser().parseFromString(value,"application/xml");
 if(doc.getElementsByTagName("parsererror").length||doc.getElementsByTagNameNS("*","parsererror").length)throw Error("EPUB có XML không hợp lệ: "+label);
 return doc;
}
function findTag(parent,name){return [...parent.getElementsByTagName("*")].find(n=>n.localName===name);}
function findTags(parent,name){return [...parent.getElementsByTagName("*")].filter(n=>n.localName===name);}
function resolvePath(opfPath,href){
 const clean=decodeURIComponent(String(href||"").split("#")[0]).replace(/\\/g,"/");
 if(!clean||/^(?:[a-z]+:|\/\/)/i.test(clean))return null;
 const parts=opfPath.split("/").slice(0,-1).concat(clean.split("/")),out=[];
 for(const part of parts){if(!part||part===".")continue;if(part===".."){if(!out.length)return null;out.pop();}else out.push(part);}
 return out.join("/");
}
function nodeToParagraphs(body){
 for(const el of [...body.querySelectorAll("script,style,nav,aside,svg")])el.remove();
 const elements=[...body.querySelectorAll("p,h1,h2,h3,h4,h5,h6,li,blockquote,pre")];
 let paragraphs=elements.map(e=>normalize(e.textContent)).filter(Boolean);
 if(!paragraphs.length){
  const divs=[...body.querySelectorAll("div")].filter(e=>!e.querySelector("div,p,li"));
  paragraphs=divs.map(e=>normalize(e.textContent)).filter(Boolean);
 }
 if(!paragraphs.length)paragraphs=safeParts(body.textContent);
 return paragraphs.flatMap(splitLong).slice(0,20000);
}
async function parseEpub(blob,filename){
 if(!window.JSZip)throw Error("Chưa tải được thư viện EPUB. Kiểm tra kết nối Internet rồi thử lại.");
 const zip=await window.JSZip.loadAsync(blob,{checkCRC32:false});
 let bytes=0;const all=Object.values(zip.files);
 if(all.length>15000)throw Error("EPUB chứa quá nhiều thành phần.");
 for(const f of all){if(f._data?.uncompressedSize){bytes+=f._data.uncompressedSize;if(bytes>MAX_UNCOMPRESSED)throw Error("EPUB quá lớn sau khi giải nén.");}}
 const container=zip.file("META-INF/container.xml");
 if(!container)throw Error("EPUB thiếu META-INF/container.xml.");
 const rootXml=parseXml(await container.async("text"),"container.xml");
 const root=findTag(rootXml,"rootfile"),opfPath=root?.getAttribute("full-path");
 if(!opfPath||!zip.file(opfPath))throw Error("EPUB thiếu tệp thông tin OPF.");
 const opf=parseXml(await zip.file(opfPath).async("text"),"package.opf");
 const title=normalize(findTag(findTag(opf,"metadata")||opf,"title")?.textContent)||normalize(filename.replace(/\.epub$/i,""))||"EPUB";
 const author=normalize(findTag(findTag(opf,"metadata")||opf,"creator")?.textContent);
 const manifest=new Map(findTags(opf,"item").map(e=>[e.getAttribute("id"),{href:e.getAttribute("href"),type:e.getAttribute("media-type")}]));
 const spine=findTag(opf,"spine");
 if(!spine)throw Error("EPUB không có spine để đọc.");
 const order=findTags(spine,"itemref");
 if(!order.length)throw Error("EPUB không liệt kê chương.");
 const chapters=[];
 for(const ref of order){
  if(ref.getAttribute("linear")==="no")continue;
  const entry=manifest.get(ref.getAttribute("idref"));
  if(!entry||!/xhtml|html/i.test(entry.type||""))continue;
  const path=resolvePath(opfPath,entry.href);
  if(!path||!zip.file(path))continue;
  const raw=await zip.file(path).async("text");
  if(raw.length>8*1024*1024)throw Error("Một chương EPUB có dung lượng quá lớn.");
  const doc=new DOMParser().parseFromString(raw,entry.type==="application/xhtml+xml"?"application/xhtml+xml":"text/html");
  const body=doc.querySelector("body")||findTag(doc,"body");if(!body)continue;
  const paragraphs=nodeToParagraphs(body);
  if(!paragraphs.length)continue;
  const heading=normalize(body.querySelector("h1,h2,h3")?.textContent);
  chapters.push({title:heading||"Chương "+(chapters.length+1),paragraphs});
  if(chapters.length>MAX_CHAPTERS)throw Error("EPUB có quá nhiều chương.");
 }
 if(!chapters.length)throw Error("Không đọc được nội dung chương EPUB. Tệp có thể dùng DRM hoặc định dạng đặc biệt.");
 return {title,author,chapters,format:"epub"};
}
async function parseFile(file){
 if(!file||typeof file.name!=="string")throw Error("Vui lòng chọn một tệp sách.");
 if(file.size>MAX_BYTES)throw Error("Tệp vượt giới hạn 20 MB của bản thử.");
 if(!file.size)throw Error("Tệp rỗng.");
 const ext=file.name.toLowerCase().split(".").pop();
 if(ext==="epub")return parseEpub(file,file.name);
 if(ext==="txt"){
  const buffer=await file.arrayBuffer();
  let text=new TextDecoder("utf-8").decode(buffer);
  const bad=(text.match(/\uFFFD/g)||[]).length;
  if(bad>Math.max(4,text.length*.002)){
   try {const alt=new TextDecoder("windows-1258").decode(buffer);if((alt.match(/\uFFFD/g)||[]).length<bad)text=alt;}catch{}
  }
  return parseTxt(text,file.name);
 }
 throw Error("Chỉ hỗ trợ TXT hoặc EPUB.");
}
window.mbpBookParser={parseFile,parseTxt,parseEpub};
})();
