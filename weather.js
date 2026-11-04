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
const outdoor=new Set(['gate','yard','village','market','county','foothill','mountain','mountainside','summit','bambooGrove','coast','tidalflat','wharf','oldTrail','qingxi','anchorage','qPier','qFair','qSalt','qBamboo','qBeacon']);
function dayNumber(s){return Math.floor(Number(s.worldTick||0)/1440)+1;}
function minute(s){const value=Math.floor(Number(s.worldTick||0)%1440);return value<0?value+1440:value;}
function calendar(s){return globalThis.NanlanClimate?.at?.(s)||{index:1,key:'summer'};}
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
function atmosphere(ctx,scene,s,time,w,h){
 if(!outdoor.has(scene))return;const weather=current(s),reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches,t=reduced?0:time/1000;ctx.save();
 if(weather.id==='cloud'||weather.wet||weather.id==='storm'){const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,weather.id==='storm'?'rgba(36,56,57,.18)':'rgba(66,78,74,.09)');shade.addColorStop(1,'rgba(45,55,50,0)');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);}
 if(weather.id==='fog'){const mist=ctx.createLinearGradient(0,h*.08,0,h*.72);mist.addColorStop(0,'rgba(223,232,219,.2)');mist.addColorStop(1,'rgba(223,232,219,0)');ctx.fillStyle=mist;ctx.fillRect(0,0,w,h*.78);}
 if(weather.id==='hot'){const glow=ctx.createRadialGradient(w*.72,h*.08,10,w*.72,h*.08,w*.6);glow.addColorStop(0,'rgba(255,226,151,.12)');glow.addColorStop(1,'rgba(255,226,151,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);}
 if(weather.wet){
  const count=weather.id==='drizzle'?28:weather.id==='shower'?50:64;ctx.strokeStyle=weather.id==='drizzle'?'rgba(219,229,224,.28)':'rgba(213,226,224,.38)';ctx.lineWidth=weather.id==='drizzle'?1:1.2;ctx.beginPath();
  for(let i=0;i<count;i++){const seed=i*97.31,x=(seed+t*(weather.id==='drizzle'?34:92))%(w+80)-40,y=(i*61.7+t*(weather.id==='drizzle'?120:235))%(h+80)-40,len=weather.id==='drizzle'?9:15;ctx.moveTo(x,y);ctx.lineTo(x-3,y+len);}
  ctx.stroke();
 }
 ctx.restore();
}
return {TYPES,slots,plan,current,advice,helpsWater,dayLine,atmosphere};
});