/* Shared, save-compatible seasonal presentation. No harvest or quest gates depend on it. */
(function(root,make){const api=make();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanClimate=api;})(globalThis,function(){
'use strict';
const seasons=[['春','Spring'],['夏','Summer'],['秋','Autumn'],['冬','Winter']];
const length=28;
function at(s){
 const day=Math.floor(s.worldTick/1440)+1;
 const phase=s.flags.voyageStarted?'spring':s.flags.season5Started?'autumn':s.flags.volume2Started?'spring':'summer';
 const baseline={autumn:2,spring:0,summer:1}[phase],pattern=phase==='autumn'?/^S5_/:phase==='spring'?(s.flags.voyageStarted?/^V6_/:/^V2_/):/^M0[1-4]$/;
 const ticks=(s.journal||[]).filter(r=>(pattern.test(r.id||'')||(!s.flags.voyageStarted&&phase==='spring'&&r.id==='卷二'))&&Number.isFinite(r.tick)).map(r=>r.tick);
 const anchor=phase==='summer'?1:ticks.length?Math.floor(Math.min(...ticks)/1440)+1:1;
 const elapsed=Math.max(0,day-anchor),index=(baseline+Math.floor(elapsed/length))%4;
 return {index,key:['spring','summer','autumn','winter'][index],zh:seasons[index][0],en:seasons[index][1],day:elapsed%length+1,length};
}
const outdoor=new Set(['gate','yard','village','market','county','foothill','mountain','mountainside','summit','bambooGrove','coast','tidalflat','wharf','oldTrail','qingxi','anchorage','qPier','qFair','qSalt','qBamboo','qBeacon','prefDock','prefMarket']);
const gardens=new Set(['yard','village','foothill','mountain','mountainside','summit','bambooGrove','oldTrail','qBamboo']);
const cache=new Map();
function picture(image,scene,s){
 if(!image?.naturalWidth||typeof document==='undefined')return image;
 const season=at(s),key=image.src+'|'+scene+'|'+season.key;
 if(cache.has(key)){const c=cache.get(key);cache.delete(key);cache.set(key,c);return c;}
 const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
 const c=canvas.getContext('2d',{willReadFrequently:true});if(!c)return image;
 c.drawImage(image,0,0);
 try{
  const data=c.getImageData(0,0,canvas.width,canvas.height),p=data.data,original=new Uint8ClampedArray(p),stride=canvas.width*4;
  // Modest bounded detail contrast keeps every original scene readable without bright edge halos.
  for(let y=1;y<canvas.height-1;y++)for(let x=1;x<canvas.width-1;x++){
    const i=y*stride+x*4;
    for(let channel=0;channel<3;channel++){
      const j=i+channel,detail=original[j]-(original[j-4]+original[j+4]+original[j-stride]+original[j+stride])/4;
      p[j]=original[j]+Math.max(-10,Math.min(10,detail*.42));
    }
  }
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
 cache.set(key,canvas);while(cache.size>8)cache.delete(cache.keys().next().value);return canvas;
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
return {at,picture,atmosphere,preview,note,length};
});

