/* Two saved hanging and lighting actions; replay never spends time or grants rewards. */
(()=>{'use strict';
const L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh;
DATA.assets.yearLamp='year-lamp-v6922.webp';
const lamps=[{id:'left',name:'左檐',en:'Left eave',x:534,y:135},{id:'right',name:'右檐',en:'Right eave',x:828,y:96}];
const hung=(s,id)=>s.flags.festivalLamps||s.flags['festivalLampHang:'+id],lit=(s,id)=>s.flags.festivalLamps||s.flags['festivalLampLit:'+id];
function show(){const s=state(),done=s.flags.festivalLamps;
 activity(L('庭院 · 亲手留一盏灯','Courtyard · A Light for Home'),L(done?'两盏灯已经挂稳、点亮。白日看得见纸上的梅枝，入夜便有暖光落在门前。':'在檐下添上两盏家中备好的岁末纸灯，再逐盏点亮。每挂好一盏都会留下，不必一次做完。',done?'Both lanterns are hung and lit. Their plum branches show by day; warm light falls by the doorway at night.':'Hang the two household lanterns from the eave hooks, then light each one. Your work is saved after every step.'),'lantern-work');$('dialogPortraits').hidden=true;
 const box=document.createElement('div');box.className='hands-plate lamp-work';const bg=document.createElement('img');bg.src=DATA.assets.yard;bg.alt=L('自家正厅檐下','The eaves of your hall');bg.className='lamp-yard';box.append(bg);$('panelExtra').append(box);
 let count=0;for(const [i,l]of lamps.entries()){const isHung=hung(s,l.id),isLit=lit(s,l.id);if(isLit)count++;
 const b=document.createElement('button');b.type='button';b.className='lamp-piece'+(isHung?' hung':' waiting')+(isLit?' lit':'');b.style.left=(isHung?(l.x-470)/420*100:25+i*43)+'%';b.style.top=(isHung?(l.y-70)/300*100:69)+'%';
 const label=L((isLit?'已点亮 · ':isHung?'点亮':'挂稳')+l.name+'纸灯',(isLit?'Lit · ':isHung?'Light ':'Hang ')+l.en+' lantern');b.setAttribute('aria-label',label);b.title=label;const img=document.createElement('img');img.src=DATA.assets.yearLamp;img.alt='';b.append(img);b.disabled=!!isLit||N.current(s)!=='M20';b.onclick=async()=>{b.disabled=true;const r=await perform(isHung?'lightFestivalLamp':'placeFestivalLamp',{side:l.id},()=>{});if(r.ok)show();else b.disabled=false;};box.append(b);}
 const p=document.createElement('p');p.className='hands-instruction';p.setAttribute('role','status');p.textContent=L('已点亮 '+count+' / 2 盏 · '+(done?'回到院中看灯，夜里更暖。':'点下方纸灯挂起，再点檐下纸灯点亮。'),count+' / 2 lit · '+(done?'Return to the courtyard; the light warms after dusk.':'Select a waiting lantern to hang it, then select it beneath the eaves to light it.'));$('panelExtra').append(p);
 navButton(L('回院中看看灯火','See the lanterns in the courtyard'),closeDialog,'lamp-return');
 if(done&&N.current(s)==='M20')navButton(L('灯已备好 · 回正厅团圆','The lamps are ready · Return to the hall'),()=>{closeDialog();startNavigation('hall','mealTable');},'lamp-feast');
}
function draw(ctx,s){if(s.scene!=='yard'||!lamps.some(l=>hung(s,l.id)))return;const im=images.yearLamp;if(!im?.naturalWidth){loadImage('yearLamp');return;}const darkness=N.daylight(s).darkness;
 for(const l of lamps){if(!hung(s,l.id))continue;const x=l.x*W/1536,y=l.y*H/1024,w=46*W/1536,h=69*H/1024;ctx.save();
 if(lit(s,l.id)&&darkness>.1){const g=ctx.createRadialGradient(x,y+h*.55,0,x,y+h*.55,30);g.addColorStop(0,'rgba(255,196,100,'+Math.min(.45,darkness*.5)+')');g.addColorStop(1,'rgba(255,196,100,0)');ctx.fillStyle=g;ctx.fillRect(x-30,y-10,60,70);}
 ctx.filter=lit(s,l.id)?'brightness(1.12) saturate(.85)':'brightness(.72) saturate(.65)';ctx.drawImage(im,x-w/2,y,w,h);ctx.restore();}
}
window.NanlanLanternWork={show,draw};
})();
