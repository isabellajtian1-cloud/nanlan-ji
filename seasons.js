/* Enduring Seasons: negotiated projects, hand-tested prototypes, finite shop authority. */
(()=>{'use strict';
const V=N.season5,L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh,P=p=>p[window.NanlanI18n?.language==='en'?1:0];
window.NanlanI18n?.configure(window.NANLAN_EN||{});
let original=false;
const costs={motherDo:{herb:2},apprenticePlan:{bamboo:3,rope:1},xiaomanDo:{bamboo:2},maintenance:{wood:1},reserve:{ingredient:1}};
const things={duckStone:['石鸭','Stone duck'],grassHopper:['草蚂蚱','Grass hopper'],ledgerCopy:['借灯簿副本','Lantern ledger copy'],teachingSample:['学徒第一件留样','Apprentice’s first sample'],prototype:['亲手验过的食盒','Hand-tested food box']};
const memories=[['师徒合做','Teaching together'],['食盒试样','Testing the food box'],['伙伴共事','Working with friends'],['秋日小集','The autumn fair'],['一家出游','The family outing'],['后堂陈设','A place in the back hall']];
const routes=[['山脚听溪','The foothill stream'],['海湾看潮','The bay and its tide'],['村中慢行','A village stroll']];
const notes={
select:['竹纹通直的留下，短裂口另放。学徒把手里的两根对着光，自己认出了差别。','Keep straight grain, set splits aside. The apprentice holds two strips to the light and sees the difference.'],
teach:['你先放慢收口的那一圈，让对方看清篾尾怎样压住。做完才交还工具。','Slow the final binding so the apprentice can see how the end is held. Pass over the tool only when it is clear.'],
correct:['试提时先托住篓底。松处重扎，留样签仍写原来的经手人。','Support the base while testing the handle. Retie the loose part and keep the original maker’s tag.'],
tripActivity:['母亲把食盒放稳，父亲终于不用看交期。祖父坐下，等你说先走哪一边。','Mother steadies the food box. Father puts away delivery dates. Grandfather sits and waits for you to choose the next turn.']
};
function note(text){const p=document.createElement('p');p.className='production-note';p.textContent=text;$('panelExtra').append(p);}
function route(label,sc,id){navButton(label,()=>{closeDialog(true);startNavigation(sc,id);},'season-route-'+id);}
function next(){const s=state(),r=V.first(s);if(!r)return;const [sc,id]=V.target(s,r.key);route(P(r.label),sc,id);}
function job(label,name,p,refresh){return actButton(label,name,{...p,sequence:state().revision},refresh,'season-'+name+'-'+(p.key||''));}
function blocked(k,extra){
 const s=state(),cost=extra||costs[k]||{},missing=Object.entries(cost).filter(([id,n])=>N.available(s,id)<n);
 return missing.length?L('还需：','Still needed: ')+missing.map(([id,n])=>N.itemNames[id]+' ×'+(n-N.available(s,id))).join(' / '):'';
}
function controls(label,k,p={}){
 const b=job(label,'seasonStep',{key:k,...p},()=>result(k));
 const why=blocked(k);if(why){b.disabled=true;note(why);navButton(L('查看材料与来源','Check materials and sources'),showBag,'season-materials');}
 return b;
}
function ledger(){
 const s=state(),t=s.season5;activity(L('岁序长青 · 共事簿','Enduring Seasons · Shared Work'),L('材料、工时、工钱、成品与暂停缘由，逐项留在同一本簿里。','Materials, time, wages, ownership and reasons for pauses remain together in this book.'),'season-book');
 if(!t)return;
 for(const [k,j]of Object.entries(V.jobs))if(t.plans[k])note((k==='mother'?L('母亲','Mother'):k==='xiaoman'?L('罗小满','Xiaoman'):L('何行舟','Xingzhou'))+' · '+j.minutes+L(' 分钟 · ',' minutes · ')+j.fee+L(' 文 · ',' coins · ')+(t.plans[k].done?L('已当面结清','Settled'):L('待共同开工','Awaiting shared work')));
 if(t.apprentice)note(L('师徒合做：竹三、绳一，师傅工钱四文；实做 ','Teaching: three bamboo, one rope, four coins in wages; ')+t.apprentice.minutes+L(' 分钟。留样不售，合格篓归李家。',' minutes worked. Practice sample stays off sale; the sound basket belongs to the household.'));
 if(t.prototype){note(L('食盒四项验记：','Food-box test record: ')+Object.entries(t.prototype.tests).map(([k,v])=>P(V.rows[k].label)+' · '+(v==='passed'?L('合用','Sound'):L('待加固','Needs reinforcement'))).join(' / '));}
 if(t.fair)note(L('秋集：','Fair: ')+N.itemNames[t.fair.item]+' · '+t.fair.held+L(' 件待售 / ',' held / ')+t.fair.sold+L(' 件已交 · 实收 ',' delivered · receipts ')+t.fair.gross+L(' 文',' coins'));
 if(t.trip)note(P(routes[t.trip.route])+' · '+(t.trip.delegate?L('只许售一份授权干药，其余货不动','One authorised dried-herb parcel only; all other goods untouched'):L('歇铺，不动货','Shop rests; no stock used'))+' · '+(t.trip.returned?L('已核账','Reconciled'):L('尚待回铺核对','Awaiting return')));
 if(t.display){note(L('后堂陈列：','Back-hall display: ')+P(things[t.display.item]));if(s.scene==='backHall')job(L('把这件纪念物收回','Put the keepsake away'),'seasonTakeDisplay',{},ledger);}
 const d=document.createElement('details'),h=document.createElement('summary');h.textContent=L('翻看逐笔记录','Read the record');d.append(h);
 for(const row of t.ledger){const p=document.createElement('p');p.textContent=P([row.zh,row.en]);d.append(p);}$('panelExtra').append(d);
 next();navButton(L('回到场景','Return to the scene'),()=>closeDialog(true),'season-leave');
}
function prototypeForm(k){
 const cfg={thick:true,divider:true,handle:false,motif:false};
 const box=document.createElement('div');box.className='season-work-card';$('panelExtra').append(box);
 const summary=document.createElement('p');box.append(summary);
 const submit=job(L('照此做一件试样','Make one sample'),'seasonStep',{key:k,config:cfg},()=>result(k));
 function refresh(){const n=2+Number(cfg.thick)+Number(cfg.divider)+Number(cfg.handle);summary.textContent=L('用竹 ','Bamboo ')+n+L('、草绳一；三十分钟，三点体力。试样留在案上，不会直接出售。','; one rope; thirty minutes and three stamina. The sample stays on the bench, off sale.');submit.disabled=!!blocked(k,{bamboo:n,rope:1});}
 for(const [id,zh,en]of [['thick','加厚盒底','Thick base'],['divider','加隔层','Divider'],['handle','可拆提手','Removable handle'],['motif','南澜纹样','Nanlan motif']]){
  const b=navButton('',()=>{cfg[id]=!cfg[id];b.setAttribute('aria-pressed',String(cfg[id]));b.textContent=(cfg[id]?'✓ ':'○ ')+L(zh,en);refresh();},'season-config-'+id);
  b.setAttribute('aria-pressed',String(cfg[id]));b.textContent=(cfg[id]?'✓ ':'○ ')+L(zh,en);
 }refresh();note(L('若缺料，请从行囊查看来源。纹样只改变纪念文字，不增加收益。','Check the satchel for material sources. The motif changes the keepsake description, not its selling price.'));
}
function tripForm(k,replan=false){
 const old=state().season5.trip,cfg={route:old?.route||0,delegate:old?.delegate||false};
 const label=document.createElement('p');$('panelExtra').append(label);
 function refresh(){label.textContent=P(routes[cfg.route])+' · '+(cfg.delegate?L('留守只售一份干药，工钱二文；必须自备米一、木一','One dried-herb parcel may be sold; two coins in wages. Bring one rice and one wood.'):L('歇铺同游；只备米一、木一，不动铺货','Shop closed for the outing. Bring one rice and one wood; no shop goods used.'));}
 for(let i=0;i<routes.length;i++)navButton(P(routes[i]),()=>{cfg.route=i;refresh();},'season-trip-route-'+i);
 navButton(L('切换：歇铺 / 一份干药留守','Toggle: closed / one-parcel shop watch'),()=>{cfg.delegate=!cfg.delegate;refresh();},'season-trip-delegate');
 job(replan?L('改约，暂不扣料或付钱','Revise terms; no payment yet'):L('确认这次安排','Agree on this outing'),replan?'seasonTripReplan':'seasonStep',{key:k,...cfg},()=>panelForCurrent()); 
 // Keep the payload live when a route is changed before confirming.
 const b=$('choices').lastElementChild;b.onclick=()=>perform(replan?'seasonTripReplan':'seasonStep',{key:k,...cfg,sequence:state().revision},()=>replan?panelForCurrent():result(k));refresh();
}
function panelForCurrent(){const r=V.first(state());if(!r){ledger();return;}const [sc,id]=V.target(state(),r.key);if(sc!==state().scene){ledger();return;}const o=world[sc].objects.find(o=>o.id===id);panel(o);}
function panel(o,stage=0){
 const s=state(),r=V.first(s);if(!r){ledger();return;}
 const [sc,id]=V.target(s,r.key);if(sc!==s.scene||id!==o.id){ledger();return;}
 const c=V.chapters.find(c=>c.steps.some(x=>x.key===r.key)),k=r.key;
 activity(P(c.title),P(c.text),'season-story');note(P(r.label));
 if(costs[k])note(L('本次用料：','Materials: ')+Object.entries(costs[k]).map(([id,n])=>N.itemNames[id]+' ×'+n).join(' / '));
 if(['motherPlan','xiaomanPlan','boatPlan'].includes(k)){const who=k==='motherPlan'?'mother':k==='xiaomanPlan'?'xiaoman':'boat',j=V.jobs[who];note(j.minutes+L(' 分钟，报酬 ',' minutes, wages ')+j.fee+L(' 文；共同开工时才扣料结算。只办约定的这一件，不能接新单或挪用留货。',' coins; materials and payment settle when shared work starts. Only this task is authorised; no new orders or reserved goods.'));}
 if(k==='prototype')prototypeForm(k);
 else if(k==='tripPlan')tripForm(k);
 else if(k==='tripDepart'){
  note(L('家中已留一份食材。出门再扣米一、木一；留守若开，只能售指定的一份干药。','One ingredient is reserved at home. Departure uses one rice and wood. A shop watch may sell only the designated dried-herb parcel.'));
  controls(L('照约备饭，一起出门','Prepare the meal and depart'),k);
  navButton(L('出门前改约','Revise the outing before departure'),()=>{activity(L('重新约好这一日','Revise this day'),L('尚未动料，改成歇铺也能成行。','Nothing has been used. Closing the shop is a valid plan.'));tripForm(k,true);},'season-replan');
 }
 else if(k==='tripActivity'){
  const activities=[['坐下来分饭','Sit and share the meal'],['陪祖父辨草木','Study plants with Grandfather'],['陪父亲慢慢走','Take a slow walk with Father']];
  note(P(notes.tripActivity));activities.forEach((a,i)=>controls(P(a),k,{activity:i}));
 }
 else if(k==='marketPack'){
  for(const item of ['driedHerb','narrowBasket','bambooWare','shellCraft','travelBox']){const n=N.available(s,item);if(item==='travelBox'&&!s.flags.travelBoxPattern)continue;const b=controls(N.itemNames[item]+' ×1 · '+L('可用 ','available ')+n,k,{item});b.disabled=n<1;}
 }
 else if(k==='decorate'){
  for(const [id,names]of Object.entries(things)){const owned=id==='teachingSample'?s.season5.teachingSample:id==='prototype'?!!s.season5.prototype:N.available(s,id)>0;if(owned)controls(P(names),k,{item:id});}
  note(L('放入陈设的物件会离开可售行囊。试样与教具原本就不在售货库存中。','Displayed objects leave sellable satchel stock. Samples and teaching pieces were already off sale.'));
 }
 else if(k==='year'){memories.forEach((m,i)=>controls(P(m),k,{memory:i}));}
 else if(r.options)r.options.forEach((m,i)=>controls(P(m),k,{choice:i}));
 else if(notes[k]&&stage===0){note(P(notes[k]));navButton(L('走近些，亲手试一遍','Come closer and try by hand'),()=>panel(o,1),'season-hand-'+k);}
 else{
  const sample=s.season5.prototype,isTest=['loadTest','carryTest','stackTest','openTest'].includes(k);
  if(isTest){
   const labels={loadTest:['把装物压到盒底，察看弯曲','Load the base and inspect its bend'],carryTest:['扣紧提手，提起再落稳','Secure the handle; lift and set down'],stackTest:['叠好两层，轻推看重心','Stack the layers and test the balance'],openTest:['取出小物，重新合盖','Take out a small object and close the lid']};
   note(P(labels[k]));
   if(sample.tests[k]==='adjust'){
    note(L('这一处需要加固。试样仍完整地留在案上；补一根竹材再试，不会再扣整份试样用料。','This part needs reinforcement. The sample remains intact. Add one bamboo and retry; the full sample cost is not charged again.'));
    const patch=job(L('补一根竹材加固 · 十分钟','Reinforce with one bamboo · ten minutes'),'seasonPatch',{},()=>panel(o));patch.disabled=N.available(s,'bamboo')<1;
   }
  }
  controls(P(r.label),k);
 }
 navButton(L('翻开共事簿','Open the shared-work book'),ledger,'season-book');
 if(o.action!=='seasonScene')navButton(L('照常使用这个地点','Use this place as usual'),()=>{original=true;void interact(o);},'season-usual');
}
function result(k){
 const s=state(),t=s.season5,r=V.rows[k];
 if(!s.flags['season5_'+k]){panelForCurrent();return;}
 activity(s.flags.season5Complete?L('岁序长青 · 来年有约','Enduring Seasons · A Promise for Next Year'):P(r.label),P([t.ledger.at(-1)?.zh||'已记下。',t.ledger.at(-1)?.en||'Recorded.']),'season-result');
 if(k==='motherDo')note(L('母亲把药包的折角压平：「你看，这一包是我们一起做的。」','Mother smooths the parcel’s corner. “Look. We made this one together.”'));
 if(k==='tripActivity')note(P(notes.tripActivity));
 if(k==='year')note(L('一家人翻到空白的新页。桌上的纪念物还在，来年不必从头证明彼此。','The family turns to a blank page. The keepsake remains on the table. Next year, trust need not begin again.'));
 next();navButton(L('回到场景','Return to the scene'),()=>closeDialog(true),'season-result-back');
}
function intro(){
 activity(L('后堂 · 秋风翻账','Back Hall · Autumn Turns the Ledger'),L('第四卷那盏家灯仍亮着。母亲空出一天，小满带来三张交接纸，林师傅问你愿不愿意一起教个新手。日子已经能过下去，接下来要学的是怎样一起长久过。','The family lamp still burns. Mother sets aside a day, Xiaoman brings three handover slips, and Master Lin asks whether you will help teach a beginner. You have learned to live here. Now comes learning to live here together.'),'season-intro');
 job(L('和家人翻开岁序簿','Open the season book with the family'),'seasonStart',{},()=>{ledger();});
 navButton(L('今日先做别的事','Leave it for another day'),()=>closeDialog(true),'season-later');
}
function offer(o){
 if(original){original=false;return false;}const s=state();
 if(o.id==='seasonBook'){V.canStart(s)?intro():ledger();return true;}
 if(!s.flags.season5Started||s.flags.season5Complete||o.type==='door')return false;
 const r=V.first(s),to=r&&V.target(s,r.key);
 if(to&&to[0]===s.scene&&to[1]===o.id){panel(o);return true;}return false;
}
window.NanlanSeasons={offer,ledger,intro};
})();
