(()=>{'use strict';
const items=[{id:'basket',name:'竹篓',en:'Bamboo basket',rect:[558,530,155,128],dest:[175,575,130,122],foot:[628,630,42,18]},{id:'bundle',name:'铺盖包袱',en:'Bedding bundle',rect:[737,567,188,116],dest:[1210,601,163,107],foot:[833,659,58,19]},{id:'stool',name:'矮凳',en:'Low stool',rect:[947,518,136,131],dest:[1190,472,139,121],foot:[1016,623,38,18]}];
const L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh;
DATA.assets.hallBefore='hall-before-v6922.webp';DATA.assets.hallAfter='hall-after-v6922.webp';
for(const i of items)world.hall.objects.push({id:'hallMove-'+i.id,label:i.name+' · 整理通道',type:'activity',action:'hallMove',item:i.id,x:i.foot[0]*W/1536,y:i.foot[1]*H/1024});
function active(s){return N.current(s)==='M14'&&!s.flags.hallwayCleared;}
function moved(s,i){return !!(s.flags.hallwayCleared||s.flags['hallMoved:'+i.id]);}
function patches(ctx,image,r){ctx.drawImage(image,...r,r[0]*W/1536,r[1]*H/1024,r[2]*W/1536,r[3]*H/1024);}
function draw(ctx,s){if(s.scene!=='hall'||window.NanlanEstate?.furnished(s)||(!active(s)&&!s.flags.hallwayCleared))return;const before=images.hallBefore,after=images.hallAfter;if(!before?.naturalWidth||!after?.naturalWidth)return;
 ctx.drawImage(NanlanClimate.picture(s.flags.hallwayCleared?after:before,'hall',s),0,0,W,H);
 if(!s.flags.hallwayCleared)for(const i of items)if(moved(s,i)){const art=NanlanClimate.picture(after,'hall',s);patches(ctx,art,i.rect);patches(ctx,art,i.dest);}
}
function show(){
 const s=state();activity(L('正厅 · 把通道留出来','Hall · Make Room to Pass'),L('竹篓靠左收好，铺盖包袱挪到右边，矮凳贴着边柜。每安放一件，脚下就多一块空地。','Set the basket to the left, bedding to the right and stool beside the cabinet. Each moved object opens more floor.'),'hall-work');$('dialogPortraits').hidden=true;
 const box=document.createElement('div');box.className='hands-plate hall-work';const img=document.createElement('img');img.className='hands-backdrop';img.src=DATA.assets[s.flags.hallwayCleared?'hallAfter':'hallBefore'];img.alt=L(s.flags.hallwayCleared?'整理后：物品靠墙，中间的通道已空出':'整理前：竹篓、铺盖与矮凳占着过道',s.flags.hallwayCleared?'After: belongings are by the wall; the passage is clear':'Before: a basket, bedding and stool obstruct the passage');box.append(img);$('panelExtra').append(box);
 const progress=document.createElement('p');progress.className='hands-instruction';progress.setAttribute('role','status');progress.textContent=L('已安放 '+items.filter(i=>moved(s,i)).length+' / 3 件 · 点图中的物品，安放到墙边。',items.filter(i=>moved(s,i)).length+' / 3 moved · Select an object in the picture to place it by the wall.');$('panelExtra').append(progress);
 for(const i of items){if(moved(s,i)){if(!s.flags.hallwayCleared)for(const r of [i.rect,i.dest]){const patch=document.createElement('img');patch.src=DATA.assets.hallAfter;patch.alt='';patch.className='hands-backdrop hall-patch';patch.style.clipPath=`inset(${r[1]/1024*100}% ${100-(r[0]+r[2])/1536*100}% ${100-(r[1]+r[3])/1024*100}% ${r[0]/1536*100}%)`;box.append(patch);}continue;}if(!active(s))continue;
  const b=document.createElement('button');b.type='button';b.className='hall-item';b.textContent=L('收好'+i.name,'Move '+i.en);b.style.left=(i.rect[0]/1536*100)+'%';b.style.top=(i.rect[1]/1024*100)+'%';b.style.width=(i.rect[2]/1536*100)+'%';b.style.height=(i.rect[3]/1024*100)+'%';b.onclick=async()=>{b.disabled=true;const r=await perform('moveHallItem',{item:i.id},()=>{});if(r.ok)show();else b.disabled=false;};box.append(b);
 }
 const compare=document.createElement('button');compare.type='button';compare.className='secondary';compare.textContent=L('看看整理前','View before tidying');compare.setAttribute('aria-pressed','false');compare.onclick=()=>{const before=compare.getAttribute('aria-pressed')!=='true';compare.setAttribute('aria-pressed',String(before));compare.textContent=L(before?'回到现在':'看看整理前',before?'Back to now':'View before tidying');img.src=DATA.assets[before?'hallBefore':s.flags.hallwayCleared?'hallAfter':'hallBefore'];box.querySelectorAll('.hall-patch,.hall-item').forEach(n=>n.hidden=before);};$('panelExtra').append(compare);
 if(s.flags.hallwayCleared){progress.textContent=L('通道已经空出来，竹篓、铺盖和矮凳都在墙边。','The passage is clear. All three belongings rest by the walls.');if(s.flags.cratesRaised&&N.current(s)==='M14'){actButton('先照应家人，再安置邻里','settleGuests',{choice:'family'},show);actButton('按到达顺序安排铺位','settleGuests',{choice:'neighbors'},show);}else if(N.current(s)==='M14')navButton(L('接着去仓房架高货箱','Next, raise the storehouse crates'),()=>{closeDialog();startNavigation('store','goodsCrates');},'hall-next');}
 navButton(L('回到正厅，看看空出的通道','Return to the hall'),closeDialog,'hall-return');
}
function position(s,o){if(o.action!=='hallMove')return o;const i=items.find(i=>i.id===o.item),r=moved(s,i)?i.dest:i.rect;const solid={x:r[0]*W/1536,y:r[1]*H/1024,w:r[2]*W/1536,h:r[3]*H/1024};return {...o,x:solid.x+solid.w/2,y:solid.y+solid.h,solid};}window.NanlanHallWork={items,active,moved,show,draw,position};
})();
