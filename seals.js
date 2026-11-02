/* UI for physical seals. A draft never changes the engine state. */
(()=>{'use strict';
const M=window.NanlanSealsModel;
let draftSerial=0;
const sealName=k=>k==='stone'?'海磨石印':'坚木铺印';
function art(kind,cls='seal-art'){if(['sealTimber','sealPebble'].includes(kind))return resourceArt(kind==='sealTimber'?'wood':'stone');const boxes={wood:[0,0,627,627],stone:[627,0,627,627],ink:[0,627,627,627],sealTimber:[627,627,314,627],sealPebble:[941,627,313,627]},b=boxes[kind];return '<svg class="'+cls+'" viewBox="'+b.join(' ')+'" aria-hidden="true"><image href="seals-v398.png" width="1254" height="1254"/></svg>';}
function nav(label,scene,id){button(label,()=>{closeDialog();startNavigation(scene,id);},'seal-nav-'+id,true);}
function note(text){const el=document.createElement('p');el.className='seal-note';el.textContent=text;$('panelExtra').append(el);}
function stamp(r,animate=false){const el=document.createElement('div');el.className='seal-impression '+r.seal+(animate?' seal-fall':'');const title=r.shopName||'南澜记';el.textContent=title.slice(0,2)+'\n'+title.slice(2)+'印';el.setAttribute('aria-label',sealName(r.seal)+'印记');return el;}
function receipt(r,again){const [pose,line]=M.response(r);activity(M.names[r.patron]+' · 收下凭单','「'+N.itemNames[r.item]+'」 ×'+r.quantity+' 已交付 · 本次实收 '+r.paid+' 文','seal-receipt');const paper=document.createElement('div');paper.className='seal-paper';const poseEl=document.createElement('p');poseEl.className='seal-pose';poseEl.textContent=pose;const speech=document.createElement('p');speech.textContent=line;paper.append(stamp(r,true),poseEl,speech);$('panelExtra').append(paper);button('收好留底，回到柜台',again,'seal-receipt-back');button('翻看印匣与留底凭单',show,'seal-history',true);}
function prepare(name,p,label,again){const s=state(),z=s.seals||M.fresh(),serial=++draftSerial;let tier=z.stone?'stone':z.wood?'wood':null;
 const draw=()=>{activity('柜台 · 写单落印',label+'\n顾客：'+M.names[M.patron(s,name)]+'。请核对本次交付；确认后才扣货收款。','seal-draft');
 const paper=document.createElement('div');paper.className='seal-paper seal-draft';const copy=document.createElement('p');copy.textContent=tier?'印泥已备，凭单待落印。':'尚未制印，可以照旧手写签收，或先去筹备印材。';paper.append(copy);
 if(tier){const objects=document.createElement('div');objects.className='seal-objects';objects.innerHTML=art(tier)+art('ink');paper.append(objects);}
 $('panelExtra').append(paper);
 for(const k of ['wood','stone'])if(z[k]){const b=button((tier===k?'已选 · ':'改用 · ')+sealName(k),()=>{tier=k;draw();},'seal-select-'+k,true);b.setAttribute('aria-pressed',String(tier===k));}
 const b=button(tier?'在凭单上盖印，交货收款':'手写签收，交货收款',async()=>{if(serial!==draftSerial||dialogKind!=='seal-draft'||$('dialog').hidden)return;b.disabled=true;let success=false;await perform(name,{...p,...(tier?{seal:tier}:{})},()=>{success=true;draftSerial++;if(tier)receipt(state().seals.receipts.at(-1),again);else again();});if(!success&&b.isConnected){b.disabled=false;note('尚未结算。请返回柜台核对货物、营业日或更新后的凭单。');}},'seal-confirm');
 button('暂不落印，回柜台',()=>{draftSerial++;again();},'seal-cancel',true);
 if(!tier)note('制印路线：阿岑问路 → 青岚山取坚木 → 南街柜架找林师傅。旧存档仍可照常营业。');
 };draw();}
function route(){const s=state(),z=s.seals||M.fresh();if(!s.flags.volume2Started){note('请先完成第一卷家宴，回正厅开启第二卷。');return;}
 if(!z.woodRoute){note('先向阿岑打听适合刻印的坚木。他会指认青岚山路旁的落木。');const supplier=N.current(s)==='V2_16';nav('去找阿岑问制印木料',supplier?'village':'foothill',supplier?'v2Supplier':'aCen');}
 else if(!z.wood&&!s.bag.sealTimber){note('阿岑：「沿山脚石阶上去，路旁那截落木，心子细密。带上短柄斧，只取够刻一方印的便是。」');nav('前往青岚山取坚木','mountain','sealTimberNode');}
 else if(!z.wood){note('印材坚木已在行囊。请林师傅按铺号刻印；需先签下南街铺约。');nav('带坚木去找林师傅','generalStore','v2Repair');}
 else if(!z.stoneRoute){note('木印已妥当。沈晚渔新认了一处旧泊岸，可向她打听细密印石。');nav('向沈晚渔询问新泊岸','coast','shenYuCoast');}
 else if(!z.stone&&!s.bag.sealPebble){note('沈晚渔：「新泊岸在海湾东侧，沿干沙地走。取石后照原路回来，不必冒险下滩涂。」');nav('去海湾旧泊岸拾印石','coast','sealPebbleNode');}
 else if(!z.stone){note('海磨印石已收入行囊，带给林师傅磨平、刻上同一个铺号。');nav('带印石去请林师傅打磨','generalStore','v2Repair');}
 else note('两方印都在匣中。结账时可选用，旧木印也会一直保留。');}
function show(){dialogObject=null;activity('铺号印匣','印上刻的是铺号，凭单记的是做过的事。','seal-box');const z=state().seals||M.fresh();const row=document.createElement('div');row.className='seal-owned';for(const k of ['wood','stone'])if(z[k]){const x=document.createElement('div');x.innerHTML=art(k);const t=document.createElement('p');t.textContent=sealName(k);x.append(t);row.append(x);}$('panelExtra').append(row);route();
 if(z.receipts.length){const title=document.createElement('h3');title.textContent='近日留底';$('panelExtra').append(title);for(const r of [...z.receipts].reverse().slice(0,8)){const card=document.createElement('details');card.className='seal-record';const summary=document.createElement('summary');summary.textContent='第'+(Math.floor(r.tick/1440)+1)+'日 · '+M.names[r.patron]+' · '+N.itemNames[r.item]+' ×'+r.quantity;const text=document.createElement('p');text.textContent=sealName(r.seal)+' · 实收 '+r.paid+' 文\n'+M.response(r).join('\n');card.append(summary,text);$('panelExtra').append(card);}}
}
function npc(o){if(!state().flags.volume2Started)return;const z=state().seals||M.fresh();if(['aCen','v2Supplier'].includes(o.id)&&!z.woodRoute)actButton('向阿岑问刻印木料','sealRouteWood',{sequence:state().revision},show,'seal-ask-wood');if(o.id==='shenYuCoast'){if(z.wood&&!z.stoneRoute)actButton('问新泊岸与细密印石','sealRouteStone',{sequence:state().revision},show,'seal-ask-stone');else if(!z.wood)note('沈晚渔：「先把木印做好吧，等铺号定了，我再同你说海边的印石。」');}}
function workshop(){const s=state(),z=s.seals||M.fresh();button('查看制印进度与印匣',show,'seal-box',true);for(const [key,action,item,label]of [['wood','sealCraftWood','sealTimber','交坚木，请林师傅刻铺印'],['stone','sealCraftStone','sealPebble','交海磨印石，请林师傅磨印']])if(!z[key]){const b=actButton(label,action,{sequence:s.revision},()=>{show();note('林师傅：「印面磨平了，落印时手稳些。每一张单，照实写清。」');},action);if(!s.bag[item]||!s.flags.v2Leased||(key==='stone'&&!z.wood)){b.disabled=true;note(key==='wood'?'需要：铺约已签、阿岑指认的印材坚木。':'需要：木印已做好、沈晚渔指路取得的海磨印石。');}}}
function gather(o){const wood=o.action==='sealGatherWood';activity(wood?'青岚山 · 阿岑指认的落木':'海湾旧泊岸 · 细密的印石',wood?'阿岑先前指认过这截落木。断面纹理细密，用短柄斧取下够刻一方印的木心。':'顺着沈晚渔说的干沙地来到旧泊岸，挑出一块细密、没有裂纹的海磨石。','seal-gather');const el=document.createElement('div');el.className='seal-material';el.innerHTML=art(wood?'sealTimber':'sealPebble');$('panelExtra').append(el);actButton(wood?'用短柄斧取下印材':'拾起海磨印石',o.action,{sequence:state().revision},()=>{show();notice('已采得：'+(wood?'印材坚木':'海磨印石')+' ×1 · 已放入行囊');},o.action);dialogObject=o;}
window.NanlanSeals={prepare,show,npc,workshop,gather,art};
})();
