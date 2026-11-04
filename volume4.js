/* All routes use scene doors and walking. Dialogs only settle the object the
 * player reached; the paper ledger can be consulted anywhere. */
(()=>{'use strict';
const V=N.v4,households={house:'李家',farm:'桑户',lu:'陆家',makers:'竹作工棚'};
const cast={seaMerchant:'苏茂',visitor:'京中故交',father:'父亲',mother:'母亲',grandfather:'祖父',neighbor:'陆掌柜',boatman:'何行舟',yu:'沈晚渔',xiaoman:'罗小满',zhou:'周成',player:'你',narrator:'帆影手记'};
const endings=[
 ['南澜长住','母亲把写着南澜住址的信封念了一遍，打开后堂的窗。祖父指着院里的桑树：「他们若来，树下摆得开一桌。」'],
 ['托问探亲','父亲把探亲要问的几件事誊了副本，收进旧匣。「等来信再作打算。明早我还是到铺里替你开门。」'],
 ['两地通书','祖父在家书案的两边各放一叠纸。「这边是海风，那边是京里的雪。以后两头都有话写。」']
];
const moments={
 sampleSale:['试提篓耳，看看提手有无晃动','将丝绞在样板上轻轻展开'],
 thread:['摊开样丝，查看匀细和接头','把合格丝样系到相应货签上'],
 gauge:['用样尺核对篓口','提起样篓再落稳'],
 hold:['检查提手与篓身交接的竹篾','另系待验签，封存松耳的那件'],
 voices:['让父亲讲完京中旧友的消息','听母亲说铺面、桑塘和街坊','请祖父说说旧匣和眼前这座宅子']
};
let useOriginal=false;
function visible(s,o){
 if(o.id==='v4Bell')return !!s.flags.volume3Complete;
 if(o.id==='v4ToShip')return !!s.flags.v4_look;
 if(o.id==='v4ToGuild')return !!s.flags.v4_assemble;
 if(o.id==='v4ToBackHall')return !!s.flags.v4_letter;
 if(o.id==='v4Visitor')return !!s.flags.v4_pay&&!s.flags.v4_post;
 if(o.id==='v4Letter')return !!s.flags.v4_visitor;
 return true;
}
function note(txt){const n=document.createElement('p');n.className='production-note';n.textContent=txt;$('panelExtra').append(n);}
function sheet(lines){const dl=document.createElement('dl');dl.className='v4-accounts';for(const [label,value]of lines){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=String(value);dl.append(dt,dd);}$('panelExtra').append(dl);}
function stamp(t){const m=Math.floor(t)%1440;return '第 '+(Math.floor(t/1440)+1)+' 日 '+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function go(sc,id){closeDialog();startNavigation(sc,id);}
function route(label,sc,id){navButton(label,()=>go(sc,id),'v4-route-'+id);}
function objectAction(label,name,p,again){return actButton(label,name,{sequence:state().revision,...p},again,'sails-'+(p.key||name)+(p.choice??''));}
function objective(){
 const s=state(),r=V.first(s);if(!r)return null;const [sc,id]=V.target(s,r[0]);return {sc,id,r};
}
function nextRoute(o){const to=objective();if(!to)return;if(o&&to.sc===state().scene&&to.id===o.id)button(to.r[3],()=>panel(o),'v4-continue');
 else route(to.r[3],to.sc,to.id);}
function holdings(s){
 const fmt=id=>N.available(s,id)+' / '+N.story2.stockAvailable(s,id);
 sheet([['丝 · 行囊可交 / 铺内可提',fmt('fineSilk')],['精篓 · 行囊可交 / 铺内可提',fmt('narrowBasket')],['旧单待交竹器',Math.max(0,(s.story3.contract?.q||0)-(s.story3.contract?.delivered||0))]]);
}
function ledger(){
 const s=state(),t=s.story4;if(!t)return;activity('行商公所 · 分户总账','货分五张来源单，钱分公匣与私账。装船只改货的位置，取得签收才抵订金。','v4-ledger');
 const q=V.quote(t.choices.quote===1);sheet([['公匣余钱',t.fund+' 文'],['本契订金',t.advance+' 文'],['两样约货',t.choices.quote===undefined?'尚未立单':q.silk+' 束 / '+q.baskets+' 件'],['轻用篓折让',t.credit+' 文']]);
 if(t.lots.length){
  const table=document.createElement('table');table.className='v4-lots';const body=document.createElement('tbody');table.append(body);
  const row=(data,header=false)=>{const tr=document.createElement('tr');data.forEach(c=>{const cell=document.createElement(header?'th':'td');cell.textContent=String(c);tr.append(cell);});body.append(tr);};
  row(['货主','货目','待入库','在库','在途','已签收'],true);
  t.lots.forEach((l,i)=>{const out=V.issued(t,i),received=t.ships.filter(b=>b.signed).reduce((n,b)=>n+b.cargo[i],0);row([households[l.owner],N.itemNames[l.item],l.received?0:l.qty,l.received?l.qty-out:0,out-received,received]);});$('panelExtra').append(table);
 }
 for(const [i,b]of t.ships.entries())note('航次 '+(i+1)+' · '+(b.signed?'对岸已签收':'回报约在 '+stamp(b.reportDue))+' · '+b.cargo.reduce((n,v,j)=>n+v*V.rates[t.lots[j].item].space,0)+' / '+b.capacity+' 格');
 if(t.settlement)sheet(t.settlement.map(a=>[households[a.owner],a.principal+' 文工料款 ＋ '+a.share+' 文分余']));
 if(s.flags.volume4Complete)button('查下一航的公所派单',window.NanlanGuild.show,'v4-season');
 const history=document.createElement('details'),summary=document.createElement('summary');summary.textContent='逐笔翻看收支与交接';history.append(summary);
 for(const item of t.ledger){const p=document.createElement('p');p.textContent=stamp(item.tick)+' · '+item.text+(item.amount?'　'+(item.amount>0?'+':'')+item.amount+' 文':'');history.append(p);}$('panelExtra').append(history);nextRoute(null);
}
function waits(o){
 const s=state(),due=V.waitUntil(s);if(due<=s.worldTick)return;
 note('下一次约定 · '+stamp(due));const night=(Math.floor(s.worldTick/1440))*1440+1320;
 if(s.worldTick<night)objectAction('守候至 '+stamp(Math.min(due,night)),'v4Wait',{},()=>panel(o));
 route('回东厢房过夜，再来看班期','bed','bedRest');
}
function details(k){
 const s=state(),t=s.story4,q=V.quote(t.choices.quote===1),ready=t.fund;
 if(['quote','oldBook','sample','liLot'].includes(k)){holdings(s);note('可用铺货先在南街货架取回。原来预留的货继续留给原来的客人。');}
 if(['sign','ticket','count','pay'].includes(k))sheet([['买价 · 特级丝 / 精篓','32 / 22 文'],['实约价款',q.gross+' 文'],['公匣余钱',ready+' 文'],['订金与本次尾款',Math.floor(q.gross/3)+' / '+(q.gross-t.credit-Math.floor(q.gross/3))+' 文']]);
 if(k==='sample')note('试样买价合计五十六文。若用乡里样品，等四十分钟，试样款由船东直接交给货主。');
 if(k==='hold'&&s.worldTick<t.due)note('陆家的来货还在路上，货到才能抽检。');
 if(k==='remedy')note('返工后陆家添复验签；分级会留下轻用货标，船东减六文、陆家少取二文；退换则退还原篓，陆家下航只先接一件。');
 if(k==='charter')note('各家先取丝款每束二十四文、篓款每件十六文，实际垫付的工费、船脚、防潮费从公匣扣除，最后才分余利。');
 if(k==='liLot')note('本户约定各 '+q.own+' 件。若不便自供，补单交给桑户与工棚，并补留一个时辰。');
 if(k==='pay'){const p=V.shares(t);sheet(p.map(a=>[households[a.owner],a.principal+' ＋ '+a.share+' ＝ '+a.total+' 文']));}
 if(['space','launch','wind','resolve','report'].includes(k)){
 const w=V.windAt(s,s.worldTick);note(w.open?'风向合宜，可以解缆。':w.weather==='rain'?'今日有风雨，船在泊岸等候。':'风窗未开，木牌上写着下一次可行时辰。');
 if(k==='space')note('精篓占两格，丝束占一格。按货主装舱，先放篓再填丝；分航时留在公库的货仍能逐件核对。');
 if(t.lots.length)note('尚待发运 · '+V.remaining(t)+' 件');
 if(k==='resolve'&&t.ships.every(b=>b.signed)&&!V.remaining(t))note(t.ships.some(b=>b.wet)?'潮气湿了一束外层丝。与收货方约好摊晾复验，公匣付三文。':'封签齐全，逐联保管，公所没有新增损耗。');
 }
 if(k==='reply')note('京里的口信只供一家人商量。先写什么，由你决定；已立的约仍会履行。');
}
function reader(i,o,pos=0){
 const ch=V.script[i],b=ch.beats[pos];activity(cast[b[0]]||'帆影手记',b[1],'v4-voices');$('dialogKicker').textContent=ch.title[0]+' · '+(pos+1)+' / '+ch.beats.length;$('next').hidden=true;
 if(b[0]==='player')portraitPlayer();
 button(pos+1<ch.beats.length?'听下一句':'回到手边的事',()=>pos+1<ch.beats.length?reader(i,o,pos+1):panel(o),'v4-voices-next');
}
function portraitPlayer(){const img=document.createElement('img'),fig=document.createElement('figure'),frame=document.createElement('div');frame.className='portrait-frame';img.src=DATA.assets['npc_'+(state().gender==='male'?'playerMale':'playerFemale')];img.alt='你';frame.append(img);fig.append(frame);const el=$('dialogPortraits');el.replaceChildren(fig);el.hidden=false;}
function prologue(o){const m=state().story3?.choices.meal;
 activity('海湾 · 风雨泊帆','船没有进港叫卖。它放下的是避风信号。沈晚渔站在石岸边，等你走近才把望帆的地方让开。','v4-intro');
 note(['你给熟客留过货，知道先看看别人手上的旧约。','你曾守着工棚等第一件成品，也知道慢工有它的时辰。','你几次试过小批班期，认得寻常来往的船。今日这面帆很陌生。'][m]||'海风里传来两声收缆的吆喝。');
 objectAction('到石岸上，陪晚渔看看这面帆','v4Start',{},()=>panel(o));button('先回去过自己的日子',closeDialog,'v4-later',true,false);
}
function outcome(o,k,i){
 const s=state(),t=s.story4;let message=t.ledger.at(-1)?.text||'手记已收好。';
 if(k==='reply')message=endings[t.choices.reply][0];
 if(k==='room')message='桌子安下了，旧匣旁正好还能放一本南澜的新簿。';
 if(k==='home')message=endings[t.choices.reply][1];
 if(k==='pay')message='各家当面收好本户的钱。公匣归零，最后一张签收单仍夹在册里。';
 if(!['look','sample','sampleSale','sign','ticket','remedy','liLot','tally','launch','report','resolve','count','pay','reply','post','room','home','charter','oldBook','hold','trace','consent','letter','wrap'].includes(k))message='这一页已由当事人核过。';
 activity(k==='home'?'此处也有归人':V.titles[V.order[i]],message,'v4-result');
 nextRoute(o);if(k==='home'||k==='pay')button('翻开公所总账',ledger,'v4-read-ledger',true);
 button('合上手记，沿路走走',closeDialog,'v4-close',true,false);
}
function panel(o,stage=0){
 const s=state(),t=s.story4,to=objective(),r=to?.r;
 if(!to||to.sc!==s.scene||to.id!==o.id){activity(o.label,s.flags.volume4Complete?endings[t.choices.reply][1]:'手边的货、已答应的交期和每一笔船脚，都可以在总账里找到。','v4-place');nextRoute(o);}
 else{
  const k=r[0],i=V.chapter[k],ch=V.script[i],idx=V.chapters[i].indexOf(r),preferred={v4Merchant:'seaMerchant',v2Neighbor:'neighbor',v3Boatman:'boatman',v3Bench:'xiaoman',v4Visitor:'visitor',v4Letter:'father',v4Lamp:'grandfather',v4Bell:'yu'}[o.id];
  const line=ch.beats.find(b=>b[0]===preferred)||ch.beats[Math.min(idx,ch.beats.length-1)];
  activity(cast[line[0]]||ch.title[0],line[1],'v4-story');$('next').hidden=true;$('dialogKicker').textContent=ch.title[0];if(line[0]==='player')portraitPlayer();
  note(r[3]);details(k);const parts=moments[k];
  if(k==='hold'&&stage>0&&s.worldTick>=t.due)note('负重一提，接口滑了一线。');
  if(parts&&stage<parts.length){if(k!=='hold'||s.worldTick>=t.due)button(parts[stage],()=>panel(o,stage+1),'v4-hands-'+stage,false,false);}
  else if(r.length>4){for(let c=0;c<r.length-4;c++)objectAction(r[c+4],'v4Step',{key:k,choice:c},()=>outcome(o,k,i));}
  else{const label=k==='resolve'?(t.ships.some(b=>!b.signed)?'核对另班回报并签收':V.remaining(t)?'装上另班余货，付本航船脚':'核清全航损耗和回执'):r[3];objectAction(label,'v4Step',{key:k},()=>outcome(o,k,i));}
  waits(o);
  if(['sample','liLot'].includes(k)){route('去南街货架提取可用实货','generalStore','v2Shelf');route('回桑塘备丝','yard','silkPond');route('到仓房编窄口竹篓','store','workbench');}
  if(k==='room'){route('回卧房歇脚','bed','bedRest');}
  button('听这一章的前后对白',()=>reader(i,o),'v4-read-chapter',true,false);
 }
 if(s.flags.volume4Complete)button('查下一航的公所派单',window.NanlanGuild.show,'v4-next-order');
 button('翻开公所总账',ledger,'v4-book',true,false);
 if(o.action!=='v4Scene')button('照常使用这个地点',()=>{useOriginal=true;void interact(o);},'v4-usual',true,false);
}
function offer(o){
 if(useOriginal){useOriginal=false;return false;}const s=state();
 if(o.id==='v4Bell'&&V.canStart(s)){prologue(o);return true;}
 if(!s.story4||o.type==='door')return false;const to=objective();
 if(o.action==='v4Scene'||to&&to.sc===s.scene&&to.id===o.id){panel(o);return true;}return false;
}
window.NanlanV4={offer,visible,ledger};
})();
