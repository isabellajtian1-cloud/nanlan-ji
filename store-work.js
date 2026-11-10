(()=>{'use strict';
const items=[{id:'chest',name:'木货箱',en:'Wooden chest',rect:[526,459,240,216],dest:[350,230,210,200],foot:[645,641,70,24]},{id:'sack',name:'布货袋',en:'Cloth sack',rect:[817,584,190,180],dest:[1025,245,190,180],foot:[918,731,57,22]},{id:'basket',name:'竹货篮',en:'Cargo basket',rect:[988,466,200,153],dest:[1100,460,215,210],foot:[1090,596,60,20]}];
const L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh;
DATA.assets.storeBefore='store-before-v6922.webp';DATA.assets.storeAfter='store-after-v6922.webp';
for(const i of items)world.store.objects.push({id:'crateMove-'+i.id,label:i.name+' · 架高存货',type:'activity',action:'crateMove',item:i.id,x:i.foot[0]*W/1536,y:i.foot[1]*H/1024});
function active(s){return N.current(s)==='M14'&&!s.flags.cratesRaised;}
function moved(s,i){return !!(s.flags.cratesRaised||s.flags['crateRaised:'+i.id]);}
function patches(ctx,image,r){ctx.drawImage(image,...r,r[0]*W/1536,r[1]*H/1024,r[2]*W/1536,r[3]*H/1024);}
function draw(ctx,s){if(s.scene!=='store'||(!active(s)&&!s.flags.cratesRaised))return;const before=images.storeBefore,after=images.storeAfter;if(!before?.naturalWidth||!after?.naturalWidth)return;
 ctx.drawImage(NanlanClimate.picture(s.flags.cratesRaised?after:before,'store',s),0,0,W,H);
 if(!s.flags.cratesRaised)for(const i of items)if(moved(s,i)){const art=NanlanClimate.picture(after,'store',s);patches(ctx,art,i.rect);patches(ctx,art,i.dest);}
}
function show(){
 const s=state();activity(L('仓房 · 让货物离地','Storehouse · Lift Goods off the Floor'),L('先铺稳仓房原有的垫木，再将木箱、布袋和竹篮分开架高。逐件安放，留出通风与行走的空隙。','Lay the existing timber supports, then raise the chest, sack and basket separately. Leave room for air and passage.'),'hall-work');$('dialogPortraits').hidden=true;
 const box=document.createElement('div');box.className='hands-plate hall-work';const img=document.createElement('img');img.className='hands-backdrop';img.src=DATA.assets[s.flags.cratesRaised?'storeAfter':'storeBefore'];img.alt=L(s.flags.cratesRaised?'架高后：货物离地，中央通道畅通':'架高前：木箱、布袋与竹篮直接落在地上',s.flags.cratesRaised?'After: all loads rest on timber supports above the floor':'Before: a chest, sack and basket stand on the floor');box.append(img);$('panelExtra').append(box);
 const progress=document.createElement('p');progress.className='hands-instruction';progress.setAttribute('role','status');progress.textContent=L('已安放 '+items.filter(i=>moved(s,i)).length+' / 3 件 · 点图中的货物，搬上垫木。',items.filter(i=>moved(s,i)).length+' / 3 moved · Select an object in the picture to place it by the wall.');$('panelExtra').append(progress);
 for(const i of items){if(moved(s,i)){if(!s.flags.cratesRaised)for(const r of [i.rect,i.dest]){const patch=document.createElement('img');patch.src=DATA.assets.storeAfter;patch.alt='';patch.className='hands-backdrop hall-patch';patch.style.clipPath=`inset(${r[1]/1024*100}% ${100-(r[0]+r[2])/1536*100}% ${100-(r[1]+r[3])/1024*100}% ${r[0]/1536*100}%)`;box.append(patch);}continue;}if(!active(s))continue;
  const b=document.createElement('button');b.type='button';b.className='hall-item';b.textContent=L('架高'+i.name,'Move '+i.en);b.style.left=(i.rect[0]/1536*100)+'%';b.style.top=(i.rect[1]/1024*100)+'%';b.style.width=(i.rect[2]/1536*100)+'%';b.style.height=(i.rect[3]/1024*100)+'%';b.onclick=async()=>{b.disabled=true;const r=await perform('raiseStoreItem',{item:i.id},()=>{});if(r.ok)show();else b.disabled=false;};box.append(b);
 }
 const compare=document.createElement('button');compare.type='button';compare.className='secondary';compare.textContent=L('看看整理前','View before tidying');compare.setAttribute('aria-pressed','false');compare.onclick=()=>{const before=compare.getAttribute('aria-pressed')!=='true';compare.setAttribute('aria-pressed',String(before));compare.textContent=L(before?'回到现在':'看看整理前',before?'Back to now':'View before tidying');img.src=DATA.assets[before?'storeBefore':s.flags.cratesRaised?'storeAfter':'storeBefore'];box.querySelectorAll('.hall-patch,.hall-item').forEach(n=>n.hidden=before);};$('panelExtra').append(compare);
 if(s.flags.cratesRaised){progress.textContent=L('三批货物已架好，仓房留出了通风与走动的空隙。','All three loads are raised, leaving room for air and passage.');if(N.current(s)==='M14')navButton(L('回正厅安置家人与邻里','Return to the hall to settle the guests'),()=>{closeDialog();startNavigation('hall','hallway');},'store-next');}
 navButton(L('回到仓房，看看架好的货物','Return to the storehouse'),closeDialog,'hall-return');
}
function position(s,o){if(o.action!=='crateMove')return o;const i=items.find(i=>i.id===o.item),r=moved(s,i)?i.dest:i.rect;const solid={x:r[0]*W/1536,y:r[1]*H/1024,w:r[2]*W/1536,h:r[3]*H/1024};return {...o,x:solid.x+solid.w/2,y:solid.y+solid.h,solid};}window.NanlanStoreWork={items,active,moved,show,draw,position};
})();
