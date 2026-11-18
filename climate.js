/* One persisted calendar for the clock and festivals. Story passages never age inventory or crops. */
(function(root,make){const api=make();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanClimate=api;})(globalThis,function(){
'use strict';
const seasons=[['春','Spring'],['夏','Summer'],['秋','Autumn'],['冬','Winter']];
const length=28;
const travelDay=s=>Math.floor(s.worldTick/1440)+1;
const phase=s=>s.flags.voyageStarted?'voyage':s.flags.season5Started?'season5':s.flags.volume2Started?'volume2':'arrival';
const phaseSeason={arrival:1,volume2:0,season5:2,voyage:0};
function nextSeason(ordinal,index){let next=Math.floor(ordinal/(length*4))*length*4+index*length;if(next<=ordinal)next+=length*4;return next;}
function date(ordinal){const index=Math.floor(ordinal/length)%4;return {ordinal,year:Math.floor(ordinal/(length*4))+1,index,key:['spring','summer','autumn','winter'][index],zh:seasons[index][0],en:seasons[index][1],day:ordinal%length+1,length};}
function infer(s){
 let c={version:1,phase:'arrival',anchorDay:1,ordinal:length};
 for(const [key,enabled,pattern]of [['volume2',s.flags.volume2Started,/^(卷二$|V2_)/],['season5',s.flags.season5Started,/^S5_/],['voyage',s.flags.voyageStarted,/^V6_/]]){
  if(!enabled)continue;
  const ticks=(s.journal||[]).filter(r=>pattern.test(r.id||'')&&Number.isFinite(r.tick)&&r.tick<=s.worldTick).map(r=>r.tick);
  const day=Math.max(c.anchorDay,ticks.length?Math.floor(Math.min(...ticks)/1440)+1:travelDay(s));
  const from=date(c.ordinal+day-c.anchorDay);
  c={version:1,phase:key,anchorDay:day,ordinal:nextSeason(from.ordinal,phaseSeason[key]),from:{year:from.year,index:from.index,day:from.day}};
 }
 return c;
}
function at(s){const c=s.calendar?.version===1&&s.calendar.phase===phase(s)?s.calendar:infer(s);return date(c.ordinal+Math.max(0,travelDay(s)-c.anchorDay));}
function normalise(s,need){
 if(s.calendar===undefined)s.calendar=infer(s);
 const c=s.calendar;
 need(c&&c.version===1&&Object.hasOwn(phaseSeason,c.phase)&&Number.isInteger(c.anchorDay)&&c.anchorDay>=1&&c.anchorDay<=travelDay(s)&&Number.isInteger(c.ordinal)&&c.ordinal>=0,'日历记录无效。');
 if(c.from)need(Number.isInteger(c.from.year)&&c.from.year>0&&Number.isInteger(c.from.index)&&c.from.index>=0&&c.from.index<4&&Number.isInteger(c.from.day)&&c.from.day>=1&&c.from.day<=length,'换季记录无效。');
 if(c.phase!==phase(s))s.calendar=infer(s);
 return s;
}
function sync(before,after){
 if(phase(before)===phase(after))return;
 const from=at(before),key=phase(after);
 after.calendar={version:1,phase:key,anchorDay:travelDay(after),ordinal:nextSeason(from.ordinal,phaseSeason[key]),from:{year:from.year,index:from.index,day:from.day}};
}
function label(s,english=false){const c=at(s);return english?'Year '+c.year+' · '+c.en+' day '+c.day:'第 '+c.year+' 年 · '+c.zh+'第 '+c.day+' 日';}
const outdoor=new Set(['banyanBrook','gate','yard','village','market','county','foothill','mountain','mountainside','summit','bambooGrove','coast','tidalflat','wharf','oldTrail','qingxi','anchorage','qPier','qFair','qSalt','qBamboo','qBeacon','prefDock','prefMarket']);
const gardens=new Set(['banyanBrook','yard','village','foothill','mountain','mountainside','summit','bambooGrove','oldTrail','qBamboo']);
const cache=new Map(),resolution=new Map();
let cachedPixels=0;
// Reconstruct magnified paintings once, rather than soften the same low resolution
// image on every frame. A pixel budget bounds retained canvases on tablets.
function setResolution(scene,ratio){resolution.set(scene,ratio>1.15?2:1);}
function detail(canvas,factor){
 const c=canvas.getContext('2d',{willReadFrequently:true});
 const data=c.getImageData(0,0,canvas.width,canvas.height),p=data.data;
 const w=canvas.width,h=canvas.height,luma=new Float32Array(w*h);
 for(let i=0,j=0;i<p.length;i+=4,j++)luma[j]=p[i]*.2126+p[i+1]*.7152+p[i+2]*.0722;
 const fine=factor,wide=4*factor;
 for(let y=wide;y<h-wide;y++)for(let x=wide;x<w-wide;x++){
  const j=y*w+x,i=j*4;if(p[i+3]<250)continue;
  const a=luma[j]-(luma[j-fine]+luma[j+fine]+luma[j-fine*w]+luma[j+fine*w])*.25;
  const b=luma[j]-(luma[j-wide]+luma[j+wide]+luma[j-wide*w]+luma[j+wide*w])*.25;
  // Ignore near-flat paint and compression noise; bound the lift to avoid halos.
  const delta=Math.max(-13,Math.min(13,(Math.abs(a)>1?a*.82:0)+b*.20));
  for(let k=0;k<3;k++)p[i+k]+=delta;
 }
 c.putImageData(data,0,0);
}
function picture(image,scene,s){
 if(!image?.naturalWidth||typeof document==='undefined')return image;
 const factor=(resolution.get(scene)||1)===2&&image.naturalWidth*image.naturalHeight<=3200000?2:1;
 const season=at(s),key=image.src+'|'+scene+'|'+season.key+'|'+factor;
 if(cache.has(key)){const c=cache.get(key);cache.delete(key);cache.set(key,c);return c;}
 const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
 const c=canvas.getContext('2d',{willReadFrequently:true});if(!c)return image;
 c.drawImage(image,0,0);
 try{
  const data=c.getImageData(0,0,canvas.width,canvas.height),p=data.data;
  if(outdoor.has(scene)){
  for(let i=0;i<p.length;i+=4){
   const r=p[i],g=p[i+1],b=p[i+2],green=(gardens.has(scene)?1:0)*Math.max(0,Math.min(1,(g-b-6)/35))*Math.max(0,Math.min(1,(g-r+18)/45));
   if(season.index===0){p[i]=r+green*7;p[i+1]=g+green*11;p[i+2]=b+green*2;}
   if(season.index===1){p[i]=r-green*3;p[i+1]=g+green*4;p[i+2]=b-green*2;}
   if(season.index===2){p[i]=r+green*24;p[i+1]=g+green*3;p[i+2]=b-green*6;}
   if(season.index===3){const grey=r*.28+g*.53+b*.19;p[i]=r*.88+grey*.12;p[i+1]=g*.88+grey*.12;p[i+2]=b*.87+grey*.13+2;}
  }
  }
  c.putImageData(data,0,0);
 }catch{ /* A cross-origin image still renders; only the fine vegetation grading is skipped. */ }
 if(outdoor.has(scene)){c.fillStyle=['rgba(232,239,198,.02)','rgba(243,214,139,.015)','rgba(239,202,143,.025)','rgba(193,213,218,.04)'][season.index];c.fillRect(0,0,canvas.width,canvas.height);}
 let result=canvas;
 if(factor===2){
  result=document.createElement('canvas');result.width=canvas.width*2;result.height=canvas.height*2;
  const expanded=result.getContext('2d',{willReadFrequently:true});
  expanded.imageSmoothingEnabled=true;expanded.imageSmoothingQuality='high';
  expanded.drawImage(canvas,0,0,result.width,result.height);
 }
 try{detail(result,factor);}catch{ /* Keep painting if pixel access is unavailable. */ }
 const pixels=result.width*result.height;
 while(cache.size&&(cache.size>=6||cachedPixels+pixels>26000000)){
  const first=cache.keys().next().value,old=cache.get(first);cachedPixels-=old.width*old.height;cache.delete(first);
 }
 cache.set(key,result);cachedPixels+=pixels;return result;
}
function atmosphere(c,scene,s,time,w,h){
 if(!outdoor.has(scene)){
  if(['hall','study','backHall','qLodge'].includes(scene)){c.save();const a=at(s),beam=c.createLinearGradient(w*.75,0,w*.35,h);beam.addColorStop(0,a.index===3?'rgba(211,225,231,.055)':'rgba(244,214,155,.045)');beam.addColorStop(1,'rgba(244,214,155,0)');c.fillStyle=beam;c.fillRect(0,0,w,h);c.restore();}return;
 }
 const season=at(s),reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 c.save();
 if(season.index===3){const fog=c.createLinearGradient(0,0,0,h*.68);fog.addColorStop(0,'rgba(216,229,224,.12)');fog.addColorStop(1,'rgba(216,229,224,0)');c.fillStyle=fog;c.fillRect(0,0,w,h*.68);}
 if(gardens.has(scene)&&[0,2].includes(season.index)){
  for(let i=0;i<9;i++){const tick=reduced?0:time/1000,seed=(i+1)*173.37,x=(seed+tick*(season.index===0?6:4))%w,y=h*.16+(i*73.1+tick*9)%(h*.64);c.save();c.translate(x,y);c.rotate(seed+tick*.16);c.globalAlpha=.22;c.fillStyle=season.index===0?'#eddbc1':'#b89152';c.beginPath();c.ellipse(0,0,season.index===0?2:3,1.1,.4,0,Math.PI*2);c.fill();c.restore();}
 }
 c.restore();
}
const notes={
spring:['嫩叶与细雨，竹林添新笋；旧约所需的物资仍可照常采买。','Tender leaves and fine rain; new shoots in the bamboo. Supplies for existing promises remain available.'],
summer:['浓荫与骤雨，出门记住归路；果树与菜畦仍按原来的周期生长。','Deep shade and passing rain. Remember the road home; fruit and plots keep their usual growth cycles.'],
autumn:['光线清透，适合晾晒与小集；一家出游也可以慢些走。','Clear light for drying goods and visiting the fair. A family walk can take its time.'],
winter:['晨雾与清冷日光，草木仍留绿意；回家有热饭，不会因换季损失作物。','Morning mist and cool light, with green still in the trees. A hot meal waits at home; crops are not lost to the season.']
};
function note(s,en){return notes[at(s).key][en?1:0];}
function preview(img,scene,s){
 const src=img.dataset.seasonOriginal||img.getAttribute('src');if(!src)return;img.dataset.seasonOriginal=src;
 const request=src+'|'+scene+'|'+at(s).key;img.dataset.seasonRequest=request;
 const raw=new Image();raw.onload=()=>{const result=picture(raw,scene,s);if(img.dataset.seasonRequest!==request)return;if(result!==raw)try{img.src=result.toDataURL('image/webp',.82);}catch{}};
 raw.src=src;
 img.dataset.season=at(s).key;
}
return {at,label,normalise,sync,infer,picture,setResolution,atmosphere,preview,note,length};
});

