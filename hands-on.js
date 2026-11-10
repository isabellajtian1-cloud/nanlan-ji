/* Tangible actions use the same engine transactions as their ordinary controls. */
(()=>{'use strict';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
const en=()=>window.NanlanI18n?.language==='en',L=(zh,english)=>en()?english:zh;
function control(label,fn,cls=''){const b=el('button',cls,label);b.type='button';b.onclick=fn;return b;}
function plate(kind,alt){const box=el('div','hands-plate '+kind),img=el('img','hands-backdrop');img.src=kind==='paper-desk'?'study-desk-v6922.webp':'market-cloth-v6922.webp';img.alt=alt;box.append(img);$('panelExtra').append(box);return box;}
function paper(o){
 const s=state(),f=s.flags,allowed=N.current(s)==='M08'&&f.ledgerPermission;
 activity(L('书房窗下 · 让旧页透透气','At the Study Window · Airing the Pages'),allowed?L('程婉只托付了这两页。托住纸背，放上晾板，再轻轻展平、压住两角。','Cheng Wan entrusted these two pages to you. Support each sheet, lay it on the board, smooth it and secure both corners.'):L(f.pagesDried?'两页已经妥善晾好，原簿仍按程婉的托付保管。':'先登记书箱，再征得程婉同意，才能碰这些旧页。',f.pagesDried?'Both pages are safely aired; the ledger remains in your care.':'Register the chest and ask Cheng Wan’s permission before handling these pages.'),'paper-work');dialogObject=o;$('dialogPortraits').hidden=true;
 const box=plate('paper-desk',L('窗下书案：原簿在左，晾板在右','A window desk, the original ledger on the left and drying board on the right'));
 const live=el('p','hands-instruction',L('先点旧页，再点晾板；也可把纸拖到晾板。','Select a sheet, then the board, or drag the sheet onto it.'));live.setAttribute('role','status');$('panelExtra').append(live);
 const stages=[0,0],weights=[0,0];let selected=null,busy=false;
 for(let i=0;i<2;i++)if(f['driedPage'+i])stages[i]=4;
 function paint(){
  box.querySelectorAll('.paper-sheet,.paper-drop,.paper-weight').forEach(n=>n.remove());
  for(let i=0;i<2;i++){
   const done=!!state().flags['driedPage'+i],stage=stages[i],sheet=control(L((i?'小花旧页':'借灯旧页')+(done?' · 已晾好':stage>=2?' · 轻轻展平':' · 托起'),(i?'Flower page':'Borrowed-lamp page')+(done?' · Aired':stage>=2?' · Smooth':' · Lift')),()=>{if(!allowed||done||busy)return;if(stage<2){selected=i;stages[i]=1;paint();live.textContent=L('托稳了。把它放在右边的晾板上。','Supported. Place it on the drying board.');}else if(stage===2){stages[i]=3;paint();live.textContent=L('纸已展平，轻放两枚小镇纸，压住上下纸角。','Smoothed. Place the two small weights at the corners.');}},'paper-sheet sheet-'+i+(stage>=2?' laid':'')+(stage>=3?' flat':'')+(done?' aired':''));
   sheet.setAttribute('aria-label',sheet.textContent);sheet.title=sheet.textContent;sheet.textContent='';sheet.setAttribute('aria-pressed',String(selected===i));sheet.disabled=!allowed||done;const ink=el('span','paper-ink',i?'小花\n旧页留香':'借灯\n归还时再叙');ink.setAttribute('aria-hidden','true');sheet.append(ink);box.append(sheet);
   if(allowed&&!done&&stage<2){let from=null,dragged=false;sheet.onpointerdown=e=>{from=[e.clientX,e.clientY];dragged=false;sheet.setPointerCapture(e.pointerId);};sheet.onpointermove=e=>{if(!from)return;const dx=e.clientX-from[0],dy=e.clientY-from[1];if(Math.hypot(dx,dy)>8){dragged=true;sheet.style.transform=`translate(${dx}px,${dy}px)`;}};sheet.onpointerup=e=>{if(!from)return;from=null;sheet.style.transform='';if(dragged){const r=box.getBoundingClientRect();if(e.clientX>r.left+r.width*.28&&e.clientX<r.right&&e.clientY>r.top+r.height*.28&&e.clientY<r.top+r.height*.84){selected=i;stages[i]=2;paint();live.textContent=L('旧页已落在晾板，轻点纸面，把卷边展平。','The page rests on the board. Tap it to smooth the curled edge.');}sheet.onclick=()=>{};}};sheet.onpointercancel=()=>{from=null;sheet.style.transform='';};}
   if(stage===3&&!done)for(let corner=0;corner<2;corner++){
    const w=control(L((corner?'下':'上')+'角镇纸'+(weights[i]&(1<<corner)?' · 已放好':''),(corner?'Lower':'Upper')+' paperweight'),async()=>{if(busy||weights[i]&(1<<corner))return;weights[i]|=1<<corner;if(weights[i]===3){busy=true;const r=await perform('dryPage',{index:i},()=>{});busy=false;if(r.ok){stages[i]=4;selected=null;live.textContent=L(i?'小花露出来了，这一页也已安放好。':'“借灯”两字慢慢显出来了，这一页已安放好。',i?'The ink flower is visible; this page is safely placed.':'“Borrowed lamp” emerges; this page is safely placed.');}else weights[i]=1<<corner;}paint();},'paper-weight weight-'+i+' corner-'+corner);w.disabled=!!(weights[i]&(1<<corner));box.append(w);
   }
   if(done)for(let c=0;c<2;c++){const w=el('span','paper-weight weight-'+i+' corner-'+c+' resting');w.setAttribute('aria-hidden','true');box.append(w);}
  }
  if(selected!==null&&stages[selected]===1){const drop=control(L('放在晾板上','Place on the board'),()=>{stages[selected]=2;paint();live.textContent=L('纸已放稳。轻点纸面，把卷边展平。','The sheet rests safely. Tap it to smooth the curled edge.');},'paper-drop');box.append(drop);drop.focus({preventScroll:true});}
  if(state().flags.pagesDried){live.textContent=L('两页都已晾好。原簿、纸页与托付，一样不少。','Both pages are aired. Ledger, pages and trust remain together.');if(!$('choices').querySelector('[data-action="paper-next"]'))navButton(L('收好书案 · 看下一件事','Leave the desk · See the next task'),()=>{closeDialog();showQuest();},'paper-next');}
 }
 paint();navButton(L('暂且放下，回到书房','Pause and return to the study'),closeDialog,'paper-pause');
}
let receipt=null;
function market(mode='trade'){
 const s=state(),q=N.current(s),booked=s.stallUntil>s.worldTick,open=N.clock(s).minute>=540&&N.clock(s).minute<1020;
 activity(L(mode==='book'?'镇集 · 留一张摊布':'镇集 · 亲手摆摊',mode==='book'?'Market · Reserve a Cloth':'Market · Your Own Stall'),L('留位、铺布、摆货，再把实货交到客人手里。','Reserve a place, spread the cloth, lay out your goods and hand them to a customer.'),'market-work');$('dialogPortraits').hidden=true;
 const box=plate('market-desk',L('木摊上展开的蓝布，旁边是留位竹签与收条竹盘','Blue cloth spread on a wooden stall, with a tally and receipt tray'));
 const tag=el('div','stall-tag',booked?L('已留位 · '+Math.ceil(s.stallUntil-s.worldTick)+' 分钟后收摊','Reserved · '+Math.ceil(s.stallUntil-s.worldTick)+' min left'):L('尚未留位','Not reserved'));box.append(tag);box.classList.toggle('not-booked',!booked);
 const live=el('p','hands-instruction');live.setAttribute('role','status');$('panelExtra').append(live);
 if(mode==='book'){
  live.textContent=L('初次试摊可随时预约；以后镇集开市为 09:00—17:00。每次留位六小时，可免费重约。','The first trial may be booked at any time; later market hours are 09:00–17:00. Each booking lasts six hours and can be renewed free.');
  const reserve=control(L(booked?'抚平摊布 · 开始摆货':'放下留位竹签 · 预约摊布',booked?'Smooth the cloth · Arrange goods':'Place the tally · Reserve the cloth'),async()=>{if(booked){market();return;}reserve.disabled=true;const r=await perform('bookStall',{},()=>{});if(r.ok)market();else reserve.disabled=false;},'cloth-unfold');reserve.disabled=!booked&&(!(q==='M10'||s.flags.stallBooked)||(!open&&q!=='M10'));box.append(reserve);
  if(!open&&q!=='M10')live.textContent+=L('此刻已经散集，明日开市再来。','The market is closed; return tomorrow.');
  if(booked)actButton(L('重新留位 · 不收钱','Renew reservation · Free'),'bookStall',{},()=>market('book'),'stall-renew');return;
 }
 if(!booked){live.textContent=L('摊位还未约好，先向摊主留一张布。','Reserve a cloth before displaying goods.');navButton(L('去预约摊布','Reserve a cloth'),()=>market('book'),'trade-book');return;}
 const tray=el('div','market-stock');$('panelExtra').append(tray);let pending=null,busy=false;
 const placing=control(L('先从行囊挑一件货','Choose a good from the satchel'),async()=>{if(!pending||busy)return;busy=true;placing.disabled=true;const p=pending,old=state().coins;const r=await perform(p.name,p.args,()=>{});if(r.ok){receipt=p.name==='displayProduct'?{text:L('摊布铺好了，主打货已摆在眼前。','Your featured good is now on the cloth.'),sale:false}:state().coins>old?{text:L('货款 '+N.prices[p.item]+' 文'+(state().coins-old>N.prices[p.item]?'，另得本段谢礼 '+(state().coins-old-N.prices[p.item])+' 文':'')+' · '+N.itemNames[p.item]+' ×1 已交付','Sale '+N.prices[p.item]+' coins · '+N.itemNames[p.item]+' ×1 delivered'),sale:true}:null;market();}else{busy=false;placing.disabled=false;live.textContent=r.message;}},'cloth-place');placing.disabled=true;box.append(placing);
 const seen=new Set();function offer(item,name,args,count,first=false){
  const card=control('',()=>{if(busy)return;pending={item,name,args};tray.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===card)));placing.disabled=false;placing.innerHTML=inventoryArt(item)+'<span>'+clean(name==='displayProduct'?L('放上摊布','Place on the cloth'):L('交给客人 · 收 '+N.prices[item]+' 文','Hand over · Receive '+N.prices[item]+' coins'))+'</span>';live.textContent=L(name==='displayProduct'?'选好了。放到布上才算摆好，不会扣除库存。':'客人等你递货。确认交付后才扣一件实货、记一笔收入。',name==='displayProduct'?'Place the selected good on the cloth. This does not consume stock.':'Confirm the handover to deduct one good and record the payment.');},'market-good');card.innerHTML=inventoryArt(item)+'<strong>'+clean(N.itemNames[item])+'</strong><small>'+L(first?'可摆':'可售',first?'To display':'For sale')+' ×'+count+'</small>';card.disabled=count<1;card.setAttribute('aria-pressed','false');tray.append(card);seen.add(item);
 }
 if(q==='M10'&&!s.flags.productDisplayed)N.products.forEach(item=>offer(item,'displayProduct',{product:item},N.available(s,item),true));
 else{
  if(s.flags.productDisplayed){offer(s.featured,'sell',{sequence:s.transactions.length},N.saleAvailable(s,s.featured));const goods=el('div','cloth-goods');goods.innerHTML=(N.saleAvailable(s,s.featured)>0?inventoryArt(s.featured):'')+'<small>'+clean(N.itemNames[s.featured])+' · '+L('可售','For sale')+' ×'+N.saleAvailable(s,s.featured)+'</small>';box.append(goods);}
  for(const item of Object.keys(N.prices)){if(seen.has(item))continue;const count=N.saleAvailable(s,item,true);if(count>0)offer(item,'sellExtra',{item,sequence:s.transactions.length},count);}
 }
 live.textContent=L('货物按真实可用库存显示。订单留货不在可售数内。点一件货，再在摊面确认。','Goods show actual available stock, excluding order reservations. Select a good, then confirm on the cloth.');
 if(receipt){const note=el('div','market-receipt'+(receipt.sale?' sold':''),receipt.text);note.setAttribute('role','status');box.append(note);receipt=null;}
 if(q==='M11'&&!s.order)actButton(L('接下两件主打制品的小批单','Accept an order for two featured goods'),'acceptOrder',{},()=>market());
 if(q==='M11'&&s.order){tradeStockNote(L('小批单：已交 '+s.order.delivered+'/2，预留 '+s.order.reserved+'。','Order: '+s.order.delivered+'/2 delivered; '+s.order.reserved+' reserved.'));const reserve=actButton(L('为承诺预留现有库存','Reserve stock for the promise'),'reserveOrder',{},()=>market());reserve.disabled=N.available(s,s.order.product)<1||s.order.delivered+s.order.reserved>=s.order.total;const deliver=actButton(L('交付一件订单货','Deliver one reserved good'),'deliverOrder',{expected:s.order.delivered},()=>market());deliver.disabled=s.order.reserved<1||N.quantity(s,s.order.product)<1;}
 if(s.flags.volume3Started)globalThis.NanlanV3?.stallDisplay();navButton(L('核对留位时间 / 重新预约','Review / Renew reservation'),()=>market('book'),'trade-renew');
}
window.NanlanHands={paper,market};
})();
