/* Deterministic, save-compatible Lingnan weather. It adds planning and gentle benefits without new save fields. */
(function(root,make){const api=make();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanWeather=api;})(globalThis,function(){
'use strict';
const TYPES={
 clear:{zh:'晴朗',en:'Clear',icon:'晴',tone:'日光通透'},
 cloud:{zh:'多云',en:'Cloudy',icon:'云',tone:'云层遮日'},
 breeze:{zh:'晴风',en:'Fair breeze',icon:'风',tone:'风过檐角'},
 fog:{zh:'晨雾',en:'Morning mist',icon:'雾',tone:'雾气未散'},
 drizzle:{zh:'细雨',en:'Drizzle',icon:'雨',tone:'雨丝轻落',wet:true},
 shower:{zh:'阵雨',en:'Passing shower',icon:'雨',tone:'一阵急雨',wet:true},
 rain:{zh:'连阴雨',en:'Steady rain',icon:'雨',tone:'檐水不断',wet:true},
 storm:{zh:'午后雷雨',en:'Afternoon storm',icon:'雷',tone:'远雷压山',wet:true},
 hot:{zh:'暑热',en:'Summer heat',icon:'暑',tone:'日头正盛'},
 cold:{zh:'清冷',en:'Cool and clear',icon:'寒',tone:'风里带凉'}
};
const slots=[
 {start:360,end:600,zh:'清晨',en:'Morning'},
 {start:600,end:840,zh:'午前',en:'Late morning'},
 {start:840,end:1080,zh:'午后',en:'Afternoon'},
 {start:1080,end:1320,zh:'入夜',en:'Evening'}
];
const patterns={
 spring:[
  ['fog','cloud','drizzle','cloud'],['drizzle','rain','cloud','breeze'],['fog','clear','shower','clear'],
  ['cloud','drizzle','rain','cloud'],['clear','breeze','cloud','drizzle'],['fog','cloud','clear','breeze']
 ],
 summer:[
  ['clear','hot','storm','breeze'],['cloud','hot','shower','clear'],['breeze','clear','hot','cloud'],
  ['cloud','shower','storm','cloud'],['clear','hot','clear','breeze'],['fog','cloud','shower','clear']
 ],
 autumn:[
  ['fog','clear','breeze','cold'],['clear','breeze','cloud','cold'],['cloud','drizzle','clear','breeze'],
  ['fog','cloud','breeze','clear'],['clear','clear','breeze','cold'],['cloud','rain','cloud','breeze']
 ],
 winter:[
  ['fog','cold','clear','cold'],['cloud','drizzle','cloud','cold'],['fog','cloud','cold','clear'],
  ['cold','clear','breeze','cold'],['cloud','rain','drizzle','cloud'],['fog','clear','cloud','cold']
 ]
};
const outdoor=new Set(['prefDock','prefMarket','homeLane','reedLanding','washingCourt','dryingLoft','gate','yard','village','banyanBrook','market','county','foothill','mountain','mountainside','summit','bambooGrove','coast','tidalflat','wharf','oldTrail','qingxi','anchorage','qPier','qFair','qSalt','qBamboo','qBeacon']);
function dayNumber(s){return Math.floor(Number(s.worldTick||0)/1440)+1;}
function minute(s){const value=Math.floor(Number(s.worldTick||0)%1440);return value<0?value+1440:value;}
function calendar(s){const calendar=globalThis.NanlanClimate||(typeof module==='object'&&module.exports?require('./climate.js'):null);return calendar?.at(s)||{index:1,key:'summer'};}
function plan(s,offset=0){
 const cal=calendar(s),day=dayNumber(s)+offset,list=patterns[cal.key]||patterns.summer;
 const ids=list[((day*7+cal.index*11)%list.length+list.length)%list.length];
 return slots.map((slot,i)=>({...slot,id:ids[i],...TYPES[ids[i]]}));
}
function current(s){
 if(s.mode==='prologue')return {...slots[0],id:'clear',...TYPES.clear,next:0,remaining:0};
 const m=minute(s),index=m<600?0:m<840?1:m<1080?2:3,item=plan(s)[index];
 return {...item,index,next:index<3?slots[index].end:1800,remaining:index<3?Math.max(0,slots[index].end-m):Math.max(0,1440-m+360)};
}
function advice(s,en=false){
 const w=current(s),m=minute(s);let good=[],wait=[];
 if(w.wet){good=en?['indoor crafting','cooking and visiting','watering planted plots with rainwater']:['室内制作','灶台做饭与串门','借雨浇灌已播种地块'];wait=en?['drying herbs or paper','long mountain and shore trips']:['晾晒草药或旧页','远走山路与海湾'];}
 else if(w.id==='fog'){good=en?['sorting the storehouse','nearby visits','cooking']:['整理仓房','近处拜访','灶边做饭'];wait=en?['climbing high paths','going to the tidal flats before the mist lifts']:['登高走山路','雾散前赶往滩涂'];}
 else if(w.id==='hot'){good=en?['shop work','indoor crafting','watering in the evening']:['铺面经营','室内制作','傍晚浇水'];wait=en?['a long climb at midday','heavy outdoor work']:['正午长途登山','曝晒下做重活'];}
 else if(['breeze','cold'].includes(w.id)){good=en?['drying goods','market errands','walking and gathering']:['晾晒物件','赶集办事','走访采集'];wait=en?['leaving fragile paper unattended']:['把轻薄纸页独自留在风口'];}
 else {good=en?['gathering','field work','market errands']:['采集山货','翻土播种','赶集走访'];wait=en?(m>=780&&m<960?['a long climb in the strongest sun']:['no urgent need to delay ordinary work']):(m>=780&&m<960?['烈日最盛时长途登山']:['日常劳作无需特意避开']);}
 return {weather:w,good,wait,summary:(en?'Good for: ':'宜：')+good.join(en?', ':'、')+'；'+(en?'Better later: ':'可缓：')+wait.join(en?', ': '、')+'。'};
}
function helpsWater(s){return !!current(s).wet;}
function dayLine(s,en=false){
 const now=current(s),today=plan(s);
 return today.map((w,i)=>(i===now.index?'● ':'')+(en?slots[i].en+' '+w.en:slots[i].zh+' '+w.zh)).join(' · ');
}
// Earlier versioned game pages use this drawing entry point.
function atmosphere(ctx,scene,s,time,w,h){
 const painter=globalThis.NanlanWeatherPaint;if(!painter)return;
 ctx.save();ctx.scale(w/1100,h/733);painter.draw(ctx,scene,current(s).id,time,matchMedia('(prefers-reduced-motion: reduce)').matches);ctx.restore();
}
return {TYPES,slots,plan,current,advice,helpsWater,dayLine,atmosphere,isOutdoor:scene=>outdoor.has(scene)};
});

if(typeof window!=='undefined'&&typeof document!=='undefined'){
/* Atmospheric details are painted in world space, below the figures. The same
   surface model is used by the two close-up work views. Units are painting pixels. */
window.NanlanWeatherPaint=(()=>{
  'use strict';
  const W=1100,H=733,tau=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
  const mix=(a,b,f)=>a+(b-a)*f;
  function hash(n){let a=Math.imul(n^(n>>>15),0x2c1b3c6d);a=Math.imul(a^(a>>>12),0x297a2d39);return ((a^(a>>>15))>>>0)/4294967296;}
  function noise(x,y){
    const i=Math.floor(x),j=Math.floor(y),sx=x-i,sy=y-j;
    const u=sx*sx*(3-2*sx),v=sy*sy*(3-2*sy),p=i+239*j;
    return mix(mix(hash(p),hash(p+1),u),mix(hash(p+239),hash(p+240),u),v);
  }
  function sprite(width,height,paint){const c=document.createElement('canvas');c.width=width;c.height=height;paint(c.getContext('2d'));return c;}
  // Alpha textures have soft, irregular edges. Generate them once at low resolution.
  function bank(rgb,offset){
    return sprite(192,90,g=>{const img=g.createImageData(192,90);
      for(let y=0;y<90;y++)for(let x=0;x<192;x++){
        const u=(x-96)/96,v=(y-45)/45;
        const n=.57*noise(x*.034+offset,y*.079)+.30*noise(x*.077,y*.14+offset)+.13*noise(x*.18+offset,y*.28);
        const edge=clamp(1-u*u-v*v),p=(y*192+x)*4;
        img.data[p]=rgb[0];img.data[p+1]=rgb[1];img.data[p+2]=rgb[2];
        img.data[p+3]=Math.round(255*clamp((n-.22)*1.7)*edge*edge);
      }g.putImageData(img,0,0);
    });
  }
  function drop(){
    return sprite(16,56,g=>{
      const fade=g.createLinearGradient(0,1,0,55);
      fade.addColorStop(0,'rgba(191,216,223,0)');fade.addColorStop(.48,'rgba(207,225,228,.26)');fade.addColorStop(.83,'rgba(230,238,233,.83)');fade.addColorStop(1,'rgba(213,229,232,.26)');
      g.fillStyle=fade;g.beginPath();g.moveTo(7,1);g.bezierCurveTo(9,14,12,37,12,47);g.bezierCurveTo(12,57,4,57,4,47);g.bezierCurveTo(4,35,7,16,7,1);g.fill();
    });
  }
  let atlas;
  function textures(){return atlas||(atlas={drop:drop(),mist:bank([221,232,227],17),cloud:bank([35,51,59],42),light:bank([255,232,175],76),silver:bank([190,215,225],151)});}
  // x, y, horizontal/vertical extent of a patch of paving, water or open earth.
  const surfaces={
    yard:{stone:[[527,289,55,11],[528,363,66,16],[483,337,29,8],[562,319,23,6],[827,664,58,14],[619,644,61,20]],water:[[291,457,29,12],[256,438,20,8]],drips:[[477,129,489,228],[598,114,609,211]]},
    gate:{stone:[[517,447,95,33],[638,530,91,49],[467,602,111,21]],drips:[[529,222,536,374]]},
    village:{stone:[[476,355,64,16],[595,417,105,28],[532,524,84,27]]},
    homeLane:{stone:[[525,579,120,56],[785,472,82,22],[364,461,39,16]]},
    washingCourt:{stone:[[451,467,133,54],[707,549,150,59],[280,615,111,37]],water:[[359,241,46,5]],drips:[[245,83,248,355],[862,112,869,412]]},
    dryingLoft:{stone:[[535,414,143,34],[679,575,187,61]]},
    eavesGallery:{outside:[[0,458],[236,500],[470,539],[752,574],[1100,601],[1100,733],[0,733]],
      distance:[[52,126],[125,129],[125,347],[62,383]],stone:[[532,623,126,32],[758,668,102,38]],water:[[851,496,11,3]],drips:[[843,95,851,496],[139,101,147,517]]},
    serviceKitchen:{openings:[[[43,152],[135,124],[135,327],[43,389]],[[989,116],[1064,112],[1064,302],[989,298]]]},
    reedLanding:{stone:[[187,441,82,54],[288,551,49,23]],water:[[915,456,95,39],[775,553,120,63],[537,493,61,21]]},
    banyanBrook:{water:[[520,495,57,17],[579,524,65,17]],stone:[[522,330,31,6]]},
    market:{soil:[[490,405,63,18],[593,551,76,25],[467,579,40,11]],stone:[[552,350,41,9],[376,639,62,17],[681,618,50,13]]},
    county:{stone:[[555,373,48,13],[524,473,89,26],[650,581,110,36],[400,624,63,22]]},
    prefMarket:{stone:[[609,399,58,19],[534,510,82,25],[652,607,88,30],[423,565,49,17]]},
    qingxi:{stone:[[527,382,52,14],[604,463,78,21],[471,550,83,24],[612,617,76,24]]},
    foothill:{soil:[[472,435,62,19],[548,534,69,26],[424,602,58,18]]},
    mountain:{soil:[[546,405,53,15],[500,491,67,21]],stone:[[601,536,38,10],[458,607,46,15]]},
    mountainside:{soil:[[562,416,53,18],[506,550,62,20]],stone:[[609,485,38,10]]},
    summit:{stone:[[550,421,45,13],[597,512,51,13],[454,597,49,14]],soil:[[611,406,29,9]]},
    bambooGrove:{soil:[[537,405,59,14],[501,501,69,20],[592,595,83,23]]},
    coast:{soil:[[517,487,82,21],[686,543,67,17],[414,605,74,20]]},
    tidalflat:{soil:[[406,487,53,13],[536,604,73,21],[749,478,39,10]]},
    wharf:{stone:[[554,422,59,15],[662,514,86,24],[486,602,90,26]]},
    prefDock:{stone:[[508,425,69,20],[665,484,77,21],[545,601,99,29]]},
    anchorage:{stone:[[555,463,76,18],[702,546,69,18],[480,605,58,18]]},
    oldTrail:{soil:[[507,452,59,19],[573,564,69,23]],stone:[[591,358,39,8],[620,328,31,6]]},
    gardenClose:{soil:[[291,292,113,32],[730,286,134,30],[269,472,118,41],[769,474,105,38]],stone:[[545,585,15,82]]},
    pondClose:{water:[[537,387,233,107]]}
  };
  // The voyage returns to the same painted jetty, fair, coast, grove and beacon.
  for(const [stop,source] of Object.entries({qPier:'wharf',qFair:'qingxi',qSalt:'coast',qBamboo:'bambooGrove',qBeacon:'summit'}))surfaces[stop]=surfaces[source];
  const rainTypes={
    drizzle:{count:58,speed:270,wind:.12,length:4,wet:.45,veil:.14},
    shower:{count:122,speed:435,wind:.30,length:10,wet:.81,veil:.23},
    rain:{count:145,speed:370,wind:.17,length:8,wet:.97,veil:.34},
    storm:{count:176,speed:575,wind:.45,length:14,wet:1,veil:.46}
  };
  const layers=new WeakMap(),layouts=new Map();
  function path(points){const p=new Path2D();points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath();return p;}
  function layout(scene){
    if(layouts.has(scene))return layouts.get(scene);
    const spec=surfaces[scene]||{},plate=window.NanlanDepth?.plates[scene],world=window.NANLAN_DATA?.world[scene];
    const open=NanlanWeather.isOutdoor(scene)||scene==='gardenClose'||scene==='pondClose';
    const stone=spec.stone||[],water=spec.water||(plate?.water||[]).map(([x,y,r])=>[x,y,r*.64,r*.17]);
    const soil=spec.soil||[],spots=[];
    for(const [material,zones] of Object.entries({stone,water,soil}))for(const z of zones)spots.push({material,z});
    if(!spots.length&&open&&world){const [x,y]=world.spawn;spots.push({material:'soil',z:[x,y,32,12]});}
    const clip=new Path2D();
    if(spec.openings)for(const part of spec.openings)clip.addPath(path(part));
    if(spec.outside){clip.addPath(path(spec.outside));clip.addPath(path(spec.distance));}
    let salt=121;for(const c of scene)salt=(Math.imul(salt,31)+c.charCodeAt(0))>>>0;
    const seeds=Array.from({length:180},(_,i)=>{const h=salt+i*131,s=Array.from({length:9},(_,k)=>hash(h+k*3109));return s;});
    const field={...spec,stone,water,soil,spots,clip,masked:!!(spec.outside||spec.openings),indoor:!open&&!spec.outside&&!spec.openings,seeds};
    layouts.set(scene,field);return field;
  }
  function stamp(ctx,img,x,y,w,h,strength){
    const a=ctx.globalAlpha;ctx.globalAlpha=a*clamp(strength);ctx.drawImage(img,x-w/2,y-h/2,w,h);ctx.globalAlpha=a;
  }
  function tint(ctx,top,bottom,end=H){
    const g=ctx.createLinearGradient(0,0,0,end);g.addColorStop(0,top);g.addColorStop(1,bottom);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  const reflections=new WeakMap();
  function reflectedStone(image,f){
    if(!image||!f.stone.length)return null;
    let map=reflections.get(image);if(!map){map=new Map();reflections.set(image,map);}
    if(map.has(f))return map.get(f);
    const sw=image.naturalWidth||image.width,sh=image.naturalHeight||image.height;
    if(!sw||!sh)return null;
    const result=f.stone.map(([x,y,rx,ry],i)=>sprite(152,52,g=>{
      // A short, broken mirror of the actual painted wall or foliage above the paving.
      const sx=Math.max(0,(x-rx*1.2)/W*sw),sy=Math.max(0,(y-154)/H*sh);
      g.save();g.translate(0,52);g.scale(1,-1);g.drawImage(image,sx,sy,Math.min(sw-sx,2.4*rx/W*sw),Math.min(sh-sy,140/H*sh),0,0,152,52);g.restore();
      g.fillStyle='rgba(126,163,176,.26)';g.fillRect(0,0,152,52);
      const mask=sprite(152,52,m=>{const p=m.createImageData(152,52);
        for(let v=0;v<52;v++)for(let u=0;u<152;u++){
          const a=(u-76)/76,b=(v-26)/26;
          const edge=1-a*a-b*b+.52*(noise(u*.037+i*8,v*.072)-.54);
          const splits=noise(u*.025+3*i,v*.21);
          p.data[(v*152+u)*4+3]=Math.round(255*clamp(edge*3.2)*clamp((splits-.24)*2.1));
        }m.putImageData(p,0,0);
      });
      g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0);
    }));
    map.set(f,result);return result;
  }
  function ring(ctx,x,y,r,age,water,opacity){
    if(age<=0||age>=1)return;
    const radius=(1-(1-age)**2)*r+1,alpha=Math.sin(Math.PI*age)**.65*(1-age*.62)*opacity;
    ctx.strokeStyle='rgba(224,237,232,'+alpha+')';ctx.lineWidth=water?.85:.70;ctx.beginPath();
    ctx.ellipse(x,y,radius,radius*(water?.26:.21),-.04,.1,2.98);ctx.stroke();
    ctx.strokeStyle='rgba(45,69,73,'+(alpha*.7)+')';ctx.beginPath();ctx.ellipse(x,y+.55,radius,radius*.23,-.04,3.28,6.05);ctx.stroke();
  }
  function splash(ctx,x,y,phase,size,water,opacity){
    ring(ctx,x,y,size,phase,water,opacity);
    if(water&&phase>.19)ring(ctx,x,y,size*.79,(phase-.19)/.81,true,opacity*.62);
    if(phase>.33)return;
    const q=phase/.33,lift=Math.sin(q*Math.PI)*size*.48;
    ctx.fillStyle='rgba(229,239,234,'+(opacity*(1-q))+')';ctx.beginPath();
    ctx.ellipse(x-1-q*size*.28,y-lift,.75,1.08,-.35,0,tau);ctx.ellipse(x+q*size*.38,y-lift*.65,.65,.93,.46,0,tau);ctx.fill();
  }
  const footfalls=[];
  function footstep(s,dx,dy,side,time){
    if(!NanlanWeather.current(s).wet)return;
    const f=layout(s.scene),x=s.player.x,y=s.player.y;
    if(!f.stone.some(([cx,cy,rx,ry])=>((cx-x)/rx)**2+((cy-y)/ry)**2<1))return;
    const length=Math.hypot(dx,dy)||1;
    footfalls.push({scene:s.scene,x:x-side*dy/length*2.8,y:y+side*dx/length*1.8,start:time});
    if(footfalls.length>8)footfalls.shift();
  }
  function driftDrops(ctx,f,r,t,quiet,day){
    if(quiet)return;
    const image=textures().drop,wind=r.wind*(.91+.29*Math.sin(t*.63)+.16*Math.sin(t*.23)),angle=Math.atan(wind);
    const base=ctx.globalAlpha;
    for(let i=0;i<r.count;i++){
      const [a,b,c,d,e,g,k]=f.seeds[i],depth=.39+.85*c;
      const period=(H+65)/(r.speed*depth),v=t/period+b,cycle=Math.floor(v);
      const y=(v-cycle)*(H+65)-32;
      const x=((a*1330+wind*y+hash(cycle+i*577)*115+121)%1340)-117;
      const len=r.length*depth*(.50+e*1.25),width=(1.45+d*2.1)*depth;
      ctx.save();ctx.globalAlpha=base*(.42+.46*g)*(.8+.2*day);ctx.translate(x,y);ctx.rotate(-angle-.05*(k-.5));
      ctx.drawImage(image,-width*.5,-len,width,len);
      if(k>.76&&r.wet>.7){ctx.globalAlpha*=.56;ctx.drawImage(image,3.3+8*a,-len*(1.1+d),width*.65,len*.75);}
      ctx.restore();
    }
  }
  function contacts(ctx,f,r,t,quiet,image){
    const img=textures(),base=ctx.globalAlpha;
    const gloss=reflectedStone(image,f);
    for(const [x,y,rx,ry] of f.soil)stamp(ctx,img.cloud,x,y,rx*2.5,ry*2.1,.64*r.wet);
    for(const [i,[x,y,rx,ry]] of f.stone.entries()){
      stamp(ctx,img.cloud,x,y,rx*2.8,ry*1.9,.30*r.wet);
      if(gloss)stamp(ctx,gloss[i],x,y,rx*2.1,ry*1.6,.66*r.wet);
      stamp(ctx,img.silver,x+rx*.13,y-ry*.06,rx*2.5,ry*.84,.50*r.wet);
    }
    if(quiet||!f.spots.length)return;
    const n=Math.min(43,Math.ceil(f.spots.length*(3+3*r.wet)));
    for(let i=0;i<n;i++){
      const {z,material}=f.spots[i%f.spots.length],[a,b,c,d,e,g]=f.seeds[177-i];
      const speed=(.60+b*.55)*(r.count/105)**.45,tick=t*speed+a*15,lap=Math.floor(tick),phase=tick-lap;
      const rad=Math.sqrt(hash(lap+913*i+31)),arg=tau*hash(lap*13+i*73+45);
      const x=z[0]+Math.cos(arg)*rad*z[2],y=z[1]+Math.sin(arg)*rad*z[3],water=material==='water';
      const size=water?Math.min(z[2]*.55,5+9*e):material==='soil'?2.4+c*2:3.2+d*5;
      ctx.globalAlpha=base*(.77+.23*g);
      if(phase<.23){
        const h=(1-phase/.23)**1.15*(21+23*d),w=1.4+e;
        ctx.drawImage(img.drop,x-r.wind*h-w/2,y-h-4,w,4+c*3);
      }else if(material==='soil'){
        // Earth absorbs the blow. A momentary fleck settles into a damp mark.
        const age=(phase-.23)/.77;
        ctx.fillStyle='rgba(53,44,34,'+(.43*(1-age))+')';
        ctx.beginPath();ctx.ellipse(x,y,1+size*age,.6+.50*age,0,0,tau);ctx.fill();
        if(age<.27){ctx.fillStyle='rgba(202,207,185,'+(.65-age*2)+')';ctx.fillRect(x+.6,y-1-Math.sin(age/.27*Math.PI)*2,1.1,1.1);}
      }else splash(ctx,x,y,(phase-.23)/.77,size,water,.49+.25*r.wet);
    }
    ctx.globalAlpha=base;
  }
  function eaves(ctx,f,r,t,quiet){
    if(quiet)return;
    for(const [i,[x,y,ex,ey]] of (f.drips||[]).entries()){
      const u=(t*(.62+.35*r.wet+i*.083)+i*.47)%1;
      if(u<.55){const a=u/.55,fall=a*a;
        const xx=mix(x,ex,fall),yy=mix(y,ey,fall),w=2.5+1.1*a;
        ctx.drawImage(textures().drop,xx-w/2,yy-4,w,4+6*a);
      }else splash(ctx,ex,ey,(u-.55)/.45,7.3,true,.85);
    }
  }
  function wet(ctx,f,r,t,quiet,day,image){
    const img=textures();
    ctx.save();if(f.masked)ctx.clip(f.clip);
    tint(ctx,'rgba(38,54,72,'+(.15+.26*r.wet)+')','rgba(41,59,69,'+(.07+.12*r.wet)+')');
    const sweep=t*r.wind*8;
    stamp(ctx,img.mist,491+122*Math.sin(sweep*.057),H*.32,1210,430,r.veil);
    stamp(ctx,img.silver,810+83*Math.sin(t*.21),H*.42,666,260,r.veil*.74);
    if(r===rainTypes.storm&&!quiet){
      const u=(t+3)%17;const glow=u<1.6?Math.sin(u/1.6*Math.PI)**3:0;
      if(glow)stamp(ctx,img.mist,765,89,1000,316,glow*.65);
    }
    contacts(ctx,f,r,t,quiet,image);driftDrops(ctx,f,r,t,quiet,day);ctx.restore();
    eaves(ctx,f,r,t,quiet);
  }
  function weatherLight(ctx,id,f,t,quiet,day,scene){
    const img=textures(),sun=clamp(day);
    if(id==='fog'){
      tint(ctx,'rgba(201,215,211,.20)','rgba(206,221,215,0)',490);
      for(let i=0;i<4;i++){
        const x=95+i*328+Math.sin(t*(.04+i*.008)+i)*92;
        stamp(ctx,img.mist,x,164+i%2*90,880-i*58,205+i*17,.73-i*.065);
      }
    }else if(id==='cloud'){
      tint(ctx,'rgba(64,80,90,.11)','rgba(57,66,72,0)');
      stamp(ctx,img.cloud,370+Math.sin(t*.066)*326,357,1150,730,.49);
      stamp(ctx,img.light,850-Math.sin(t*.052)*131,398,565,296,.24*sun);
    }else if(id==='hot'){
      tint(ctx,'rgba(245,212,149,.15)','rgba(247,218,160,0)',516);
      stamp(ctx,img.light,622,281,1060,380,.51*sun);
      for(let i=0;i<4;i++)stamp(ctx,img.light,172+i*239+Math.sin(t*.61+i)*5,297+i%2*31+Math.sin(t*.81+i)*1.9,270,12+i, .36*sun);
    }else if(id==='cold'){
      tint(ctx,'rgba(146,179,201,.18)','rgba(133,167,187,.025)');
      stamp(ctx,img.silver,540+Math.sin(t*.046)*55,203,1220,255,.54);
      for(const [x,y,rx,ry] of f.water)stamp(ctx,img.mist,x+Math.sin(t*.12)*rx*.12,y-ry*.36,rx*2.1,Math.max(6,ry),.36);
      stamp(ctx,img.light,315,402,540,150,.14*sun);
    }else{
      stamp(ctx,sun>.18?img.light:img.silver,622+Math.sin(t*.047)*45,325,880,430,sun>.18?.24*sun:.12);
      if(id==='breeze'){
        stamp(ctx,img.cloud,500+Math.sin(t*.14)*163,455,710,365,.30);
        if(!quiet&&window.NanlanDepth?.plates[scene]?.kind==='leaves'){
          for(let i=0;i<7;i++){const [a,b,c,d]=f.seeds[i],u=(t*(.035+.028*b)+a)%1;
            const x=mix(-38,W+38,u),y=112+356*c+u*55+Math.sin(t*1.45+i*4)*10;
            ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(u*17+i)*.95);ctx.fillStyle='rgba(125,134,79,'+(.50*Math.sin(Math.PI*u))+')';
            ctx.beginPath();ctx.moveTo(-3-d,0);ctx.quadraticCurveTo(-.4,-2.5,3.5+d,-.3);ctx.quadraticCurveTo(.9,2.5,-3-d,0);ctx.fill();ctx.restore();
          }
        }
      }
    }
  }
  function layer(ctx,id,f,t,quiet,day,scene,alpha,image){
    if(alpha<=.001)return;ctx.save();ctx.globalAlpha*=alpha;
    if(rainTypes[id])wet(ctx,f,rainTypes[id],t,quiet,day,image);
    else{if(f.masked)ctx.clip(f.clip);weatherLight(ctx,id,f,t,quiet,day,scene);}
    ctx.restore();
  }
  function draw(ctx,scene,id,time,quiet,day=1,image=null){
    const f=layout(scene);if(f.indoor){layers.delete(ctx);return;}
    let state=layers.get(ctx);
    if(!state||state.scene!==scene){state={scene,id,from:null,start:time};layers.set(ctx,state);}
    else if(state.id!==id){state.from=state.id;state.id=id;state.start=time;}
    const v=quiet?1:clamp((time-state.start)/2100),k=v*v*(3-2*v),t=quiet?8:time/1000;
    if(state.from&&k<1)layer(ctx,state.from,f,t,quiet,day,scene,1-k,image);
    else state.from=null;
    layer(ctx,id,f,t,quiet,day,scene,state.from?k:1,image);
    if(!quiet&&rainTypes[id])for(const mark of footfalls){
      const age=(time-mark.start)/650;
      if(mark.scene===scene&&age>=0&&age<1)splash(ctx,mark.x,mark.y,age,9.2,false,.86);
    }
  }
  // The existing game render loop owns close-up canvases, so closing a panel
  // or hiding the game never leaves a second animation loop running.
  let closeup=null;
  function attach(host,scene,width,height){
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    canvas.setAttribute('aria-hidden','true');canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    host.append(canvas);closeup={canvas,scene,last:-Infinity};
  }
  function panel(s,id,time,quiet,day){
    if(!closeup)return;
    const {canvas,scene,last}=closeup;
    if(!canvas.isConnected){closeup=null;return;}
    if(document.hidden||canvas.offsetWidth===0||time-last<(quiet?350:42))return;
    const g=canvas.getContext('2d');g.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);g.clearRect(0,0,W,H);
    draw(g,scene,id,time,quiet,day);closeup.last=time;
  }
  return {draw,attach,panel,footstep};
})();

}
