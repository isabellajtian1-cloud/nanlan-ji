/* Joint consignment: the guild's cash, the family's purse, cargo on the quay
 * and cargo already signed for have separate, persisted owners. */
(function(root,make){const common=typeof module==='object'&&module.exports;
const api=make(common?require('./v4-steps'):root.NanlanV4Steps,common?require('./v4-script'):root.NanlanV4Script,common?require('./rural-model'):root.NanlanRural);
if(common)module.exports=api;else root.NanlanStory4=api;
})(globalThis,function(chapters,script,rural){
'use strict';
const order=chapters.map((_,i)=>'V4_'+String(i+1).padStart(2,'0'));
const titles={},steps={},rewards={},rows={},chapter={},flag=key=>'v4_'+key;
chapters.forEach((group,i)=>{const id=order[i];titles[id]=script[i].title[0];rewards[id]=[0,'公所与家中的新记录已收好。'];steps[id]=group.map(row=>{chapter[row[0]]=i;rows[row[0]]=row;return [flag(row[0]),row[3]];});});
const rates={fineSilk:{sale:32,maker:24,space:1},narrowBasket:{sale:22,maker:16,space:2}};
const parties=['house','farm','lu','makers'];
const day=s=>Math.floor(s.worldTick/1440)+1;
const first=s=>{const n=order.findIndex(id=>s.quests[id]?.status==='ACTIVE');return chapters[n]?.find(([k])=>!s.flags[flag(k)])||null;};
function canStart(s){return !!s.flags.volume3Complete&&!s.story4&&s.quests.V3_18?.status==='COMPLETED';}
function gate(s,id){const gates={anchorage:['v4_look','先到海湾认一认避风的远帆。'],guild:['v4_assemble','先请各家到河埠议妥合办之事。'],backHall:['v4_letter','先和父亲读过京中来信，再收拾后堂。']};return gates[id]?(s.flags[gates[id][0]]?'':gates[id][1]):null;}
const initial=()=>({choices:{},fund:0,advance:0,lots:[],ships:[],ledger:[],trial:null,due:0,mendDue:0,credit:0,settlement:null,letterSent:false,round:1,warehouse:0,upgradeDue:0,cloth:0,lastClose:0,repeat:null,returns:0});
function quote(large){const silk=large?6:4,baskets=large?8:6;return {silk,baskets,gross:silk*32+baskets*22,own:large?2:1};}
function lot(owner,item,qty){return {owner,item,qty,received:false};}
function obligations(s){
 const t=s.story4,{silk,baskets,own}=quote(t.choices.quote===1),lu=(baskets===8?3:2)-(t.choices.remedy===2?1:0);
 return [lot('house','fineSilk',own),lot('house','narrowBasket',own),lot('farm','fineSilk',silk-own),lot('lu','narrowBasket',lu),lot('makers','narrowBasket',baskets-own-lu)];
}
function record(s,text,amount=0){const t=s.story4;t.fund+=amount;t.ledger.push({tick:s.worldTick,text,amount});}
function paid(s,n,label,h){h.requireThat(s.story4.fund>=n,'公匣里的现钱不足。');record(s,label,-n);}
function issued(t,i){return t.ships.reduce((n,b)=>n+b.cargo[i],0);}
function remaining(t){return t.lots.reduce((n,l,i)=>n+l.qty-issued(t,i),0);}
function windAt(s,tick){
 const d=Math.floor(tick/1440)+1,minute=tick%1440,w=rural.weather(s,d);const open=w==='damp'?810:480;
 return {day:d,weather:w,from:(d-1)*1440+open,to:(d-1)*1440+open+180,open:w!=='rain'&&minute>=open&&minute<open+180};
}
function nextWind(s){for(let i=0;i<64;i++){const w=windAt(s,(day(s)-1+i)*1440);if(w.weather!=='rain'&&w.to>s.worldTick)return Math.max(s.worldTick,w.from);}return s.worldTick+1440;}
function sailing(s,h){
 const t=s.story4,small=t.choices.space===1,space=small?11:22,fee=small?5:14;
 h.requireThat(windAt(s,s.worldTick).open,'风窗还没开，先查班牌或等到下一段顺风。');
 h.requireThat(t.lots.length>0&&t.lots.every(l=>l.received)&&remaining(t)>0&&t.ships.every(v=>v.signed),'先清点公库实货和前航回报。');
 const cargo=t.lots.map(()=>0);let free=space;
 // Load bulky baskets first so that silk can fill the last odd space in a split hold.
 for(const item of ['narrowBasket','fineSilk'])t.lots.forEach((l,i)=>{if(l.item!==item)return;const cost=rates[item].space,qty=Math.min(l.qty-issued(t,i),Math.floor(free/cost));cargo[i]=qty;free-=qty*cost;});
 paid(s,fee,'依舱单支付本航船脚',h);const rough=windAt(s,s.worldTick).weather==='damp'||(day(s)+t.round+t.ships.length)%3===0;
 const depart=Math.ceil(s.worldTick),eta=depart+(small?120:180),wet=rough&&t.choices.wrap===1&&cargo.some((n,i)=>n&&t.lots[i].item==='fineSilk');
 t.ships.push({cargo,capacity:space,depart,eta,reportDue:eta+(rough?60:30),rough,wet,signed:false});record(s,'货从公库入舱，船主收存一联');
}
function land(s,h){
 const t=s.story4,b=t.ships.at(-1);h.requireThat(b&&!b.signed&&s.worldTick>=b.reportDue,'对岸的签收单还在路上，可先去做别的事。');
 b.signed=true;record(s,b.wet?'舱外有潮气，一束丝另放待验':b.rough?'避过暗礁，迟到的凭单已核实货齐':'凭单到埠，核实本航货齐');
}
function target(s,key){
 if(key==='resolve'&&s.story4){const t=s.story4;if(t.ships.some(b=>!b.signed))return ['wharf','v3Boatman'];if(remaining(t))return ['anchorage','v4Hold'];}
 return rows[key]?.slice(1,3);
}
function waitUntil(s){
 const t=s.story4;if(!t)return 0;const key=first(s)?.[0];
 if(key==='sampleSale')return t.trial?.due||0;
 if(key==='hold')return t.due;
 if(key==='tally')return Math.max(t.due,t.mendDue);
 if(key==='report'||key==='resolve'&&t.ships.some(b=>!b.signed))return t.ships.at(-1)?.reportDue||0;
 if(key==='launch'||key==='resolve'&&remaining(t)>0)return nextWind(s);
 if(key==='home')return (day(s)-1)*1440+1020;
 return 0;
}
function shares(t){const base=[0,0,0,0],units=[0,0,0,0];for(const l of t.lots){const i=parties.indexOf(l.owner);base[i]+=rates[l.item].maker*l.qty;units[i]+=l.qty;}
 if(t.credit)base[2]-=2;
 for(const [i,a] of (t.prepaid||[]).entries())base[i]-=a;
 const surplus=t.fund-base.reduce((a,b)=>a+b,0),weights=t.choices.charter===1?[1,1,1,1]:units,total=weights.reduce((a,b)=>a+b,0);
 const extra=weights.map(w=>Math.floor(surplus*w/total));let change=surplus-extra.reduce((a,b)=>a+b,0);
 for(let i=0;change>0;i=(i+1)%4)if(weights[i]){extra[i]++;change--;}
 return base.map((n,i)=>({owner:parties[i],principal:n,share:extra[i],total:n+extra[i]}));}
function needGoods(s,item,n,h){h.requireThat(h.available(s,item)>=n,'份额里还有未备齐的货。可另选伙伴代供，或回家备料。');}
function normalise(s,need){
 const t=s.story4;if(t==null){need(!s.flags.volume4Started&&!s.flags.volume4Complete,'帆影账册缺页。');return;}
 const num=n=>Number.isSafeInteger(n)&&n>=0&&n<1e8,when=n=>Number.isFinite(n)&&n>=0&&n<1e9;
 need(s.flags.volume3Complete&&s.flags.volume4Started&&t.choices&&Array.isArray(t.lots)&&Array.isArray(t.ships)&&Array.isArray(t.ledger),'帆影账册缺页。');
 const ix=order.findIndex(id=>s.quests[id]?.status!=='COMPLETED');
 order.forEach((id,i)=>{need(s.quests[id]?.status===(ix<0||i<ix?'COMPLETED':i===ix?'ACTIVE':'LOCKED'),'帆影章节次序有误。');
   if(i<ix||ix<0)need(steps[id].every(([k])=>s.flags[k]),'帆影章节次序有误。');});
 need(!!s.flags.volume4Complete===(ix<0),'帆影章节次序有误。');
 for(const [k,c]of Object.entries(t.choices))need(rows[k]&&num(c)&&c<rows[k].length-4,'帆影账册缺页。');
 need(num(t.fund)&&num(t.advance)&&num(t.credit)&&when(t.due)&&when(t.mendDue)&&num(t.round)&&
   t.ledger.every(e=>when(e.tick)&&typeof e.text==='string'&&Number.isSafeInteger(e.amount))&&t.ledger.reduce((n,e)=>n+e.amount,0)===t.fund,'公所账物不符。');
 const planned=obligations(s);need(t.lots.length===(s.flags.v4_ticket?5:0),'公所账物不符。');
 t.lots.forEach((l,i)=>{const plan=planned[i];need(l.item===plan.item&&l.qty===plan.qty&&typeof l.received==='boolean'&&(l.owner===plan.owner||i<2&&t.choices.liLot===1&&l.owner===(i?'makers':'farm')),'公所账物不符。');});
 for(const b of t.ships)need([11,22].includes(b.capacity)&&Array.isArray(b.cargo)&&b.cargo.length===t.lots.length&&b.cargo.every(num)&&b.cargo.some(q=>q>0)&&b.cargo.reduce((n,q,i)=>n+q*rates[t.lots[i].item].space,0)<=b.capacity&&when(b.depart)&&when(b.eta)&&when(b.reportDue)&&b.reportDue>=b.eta&&b.eta>=b.depart&&typeof b.signed==='boolean','舱单与签收数不符。');
 t.lots.forEach((l,i)=>need(issued(t,i)<=(l.received?l.qty:0),'舱单与签收数不符。'));
 if(t.trial)need(when(t.trial.due)&&typeof t.trial.owned==='boolean'&&typeof t.trial.sold==='boolean','帆影账册缺页。');
 need(num(t.round)&&[0,1].includes(t.warehouse)&&when(t.upgradeDue)&&num(t.cloth)&&t.cloth<=4&&num(t.returns)&&num(t.lastClose),'公所账物不符。');
 if(t.prepaid)need(t.prepaid.length===4&&t.prepaid.every(num),'公所账物不符。');
 if(t.stores)need(num(t.stores.day)&&num(t.stores.silk)&&num(t.stores.bamboo)&&t.stores.silk<=8&&t.stores.bamboo<=24,'公所续单有误。');
 if(t.lastSeason)need(num(t.lastSeason.ships)&&[0,1,2].includes(t.lastPolicy)&&Array.isArray(t.lastSeason.ledger)&&t.lastSeason.ledger.every(e=>when(e.tick)&&typeof e.text==='string'&&Number.isSafeInteger(e.amount))&&Array.isArray(t.lastSeason.settlement)&&t.lastSeason.settlement.length===4&&t.lastSeason.settlement.every((a,i)=>a.owner===parties[i]&&num(a.total)),'公所续单有误。');
 if(t.repeat){
  const b=t.repeat;need(s.flags.volume4Complete&&['await','dispute','consent','recheck','sail','water','close'].includes(b.phase)&&[0,1,2].includes(b.size)&&[0,1,2].includes(b.policy)&&b.choices&&num(b.gross)&&when(b.due)&&num(b.fund)&&num(b.advance)&&num(b.credit),'公所续单有误。');
  need(b.prepaid.length===4&&b.prepaid.every(num)&&b.ledger.every(e=>when(e.tick)&&typeof e.text==='string'&&Number.isSafeInteger(e.amount))&&b.fund===b.ledger.reduce((n,e)=>n+e.amount,0),'公所续单有误。');
  const [silk,baskets]=sizes[b.size];need(b.lots.length===5&&b.lots.every(l=>rates[l.item]&&parties.includes(l.owner)&&num(l.qty)&&typeof l.received==='boolean')&&b.lots.filter(l=>l.item==='fineSilk').reduce((n,l)=>n+l.qty,0)===silk&&b.lots.filter(l=>l.item==='narrowBasket').reduce((n,l)=>n+l.qty,0)===baskets,'公所续单有误。');
  need(Array.isArray(b.ships)&&b.ships.every(ship=>[11,22].includes(ship.capacity)&&ship.cargo.length===5&&ship.cargo.every(num)&&ship.cargo.reduce((n,q,i)=>n+q*rates[b.lots[i].item].space,0)<=ship.capacity&&when(ship.depart)&&when(ship.reportDue)&&typeof ship.signed==='boolean')&&b.lots.every((l,i)=>issued(b,i)<=(l.received?l.qty:0)),'公所续单有误。');
 }
 if(t.settlement)need(s.flags.v4_pay&&Array.isArray(t.settlement)&&t.settlement.length===4&&t.settlement.every((a,i)=>a.owner===parties[i]&&num(a.principal)&&num(a.share)&&a.total===a.principal+a.share)&&t.fund===0,'公所账物不符。');
}
function act(s,name,p,h){
 const {requireThat:need,requireScene:at,spend,give,log}=h;need(p.sequence===s.revision,'这份记录已更新，请重新查看后确认。');
 if(name==='v4Start'){at(s,'coast');need(canStart(s),'先与家人吃过山海归来的那顿晚饭。');s.flags.volume4Started=true;s.story4=initial();order.forEach((id,i)=>s.quests[id]={status:i?'LOCKED':'ACTIVE'});return;}
 const t=s.story4;need(t&&s.flags.volume4Started,'先到海湾看看陌生的帆。');
 if(name.startsWith('v4Guild'))return guildAction(s,name.slice(7),p,h);
 if(name==='v4Wait'){const next=waitUntil(s),night=(day(s)-1)*1440+1320;need(next>s.worldTick,'约定的时辰已经到了。');need(s.worldTick<night,'夜深了，回东厢房睡一夜再来。');s.worldTick=Math.min(next,night);return;}
 const row=first(s);need(name==='v4Step'&&row&&row[0]===p.key,'先办妥帆影手记中眼前的一件事。');const k=row[0],c=p.choice;at(s,target(s,k)[0]);
 if(row.length>4){need(Number.isInteger(c)&&c>=0&&c<row.length-4,'请先选定一种安排。');t.choices[k]=c;}
 const q=quote(t.choices.quote===1);
 switch(k){
 case 'look':record(s,'沈晚渔认出避风信号，引往岸上的跳板');break;
 case 'oldBook':record(s,'原有铺约和留货另记，公所不得动用');break;
 
 case 'sample':{
   if(c===0){needGoods(s,'fineSilk',1,h);needGoods(s,'narrowBasket',1,h);spend(s,{fineSilk:1,narrowBasket:1});}
   t.trial={owned:c===0,due:Math.ceil(s.worldTick)+(c===0?0:40),sold:false};record(s,c===0?'李家两件自货送验':'桑户与竹匠各备一件试样，等候来货');break;}
 case 'sampleSale':need(t.trial&&!t.trial.sold&&s.worldTick>=t.trial.due,'等货主把两件样品亲自送来。');t.trial.sold=true;
   if(t.trial.owned){s.coins+=56;log(s,'seaSample',56,'特级丝与精篓试样当面成交');}record(s,t.trial.owned?'试样款五十六文已入李家私账':'船东当面付清两家试样款，李家仅作见证');break;
 case 'charter':record(s,c===0?'各家签认按件分余':'各家签认四户平分余利');break;
 case 'sign':t.advance=Math.floor(q.gross/3);record(s,'船东预付入公匣，列作待交货款',t.advance);break;
 case 'ticket':t.lots=obligations(s);advanceMakers(s,h);t.due=Math.ceil(s.worldTick)+90;record(s,'各家接下限额，不动南街旧单');break;
 case 'hold':need(s.worldTick>=t.due,'陆家的来货还在路上，货到才能抽检。');record(s,'松耳精篓封存一件，暂缓入库');break;
 case 'trace':record(s,'查对两联架签，轻用篓混入了承重批');break;
 case 'remedy':if(c===0){paid(s,4,'垫付紧篾工钱',h);t.mendDue=Math.ceil(s.worldTick)+20;}else if(c===1)record(s,'轻用篓另架，待船东确认减价');else{paid(s,6,'退货回程与工棚补件运脚',h);t.returns++;refundUnit(s);t.lots[3].qty--;t.lots[4].qty++;t.mendDue=Math.ceil(s.worldTick)+60;record(s,'原物退还陆家，工棚另接一件，按新货主结算');}break;
 case 'consent':if(t.choices.remedy===1){t.credit=6;record(s,'船东同意一件按轻用篓折六文');}else record(s,t.choices.remedy===2?'船东改签替补交期，原件已退回':'船东签收返工办法，旧封签保留');break;
 case 'liLot':{const n=q.own;
   if(c===0){needGoods(s,'fineSilk',n,h);needGoods(s,'narrowBasket',n,h);spend(s,{fineSilk:n,narrowBasket:n});}
   else{t.lots[0].owner='farm';t.lots[1].owner='makers';t.due=Math.max(t.due,Math.ceil(s.worldTick)+60);}
   record(s,c===0?'李家实货已拨给公所':'经双方同意代供，工料款应归实际货主');break;}
 case 'tally':need(s.worldTick>=Math.max(t.due,t.mendDue),'约好的供货或返工还没到时辰。');for(const l of t.lots)l.received=true;record(s,'按五张来源单点收入公库');break;
 case 'wrap':paid(s,c===0?6:2,c===0?'买油布密封丝箱':'买草席隔开丝与竹器',h);break;
 case 'launch':sailing(s,h);break;
 case 'report':land(s,h);break;
 case 'resolve':
   if(t.ships.some(b=>!b.signed)){land(s,h);return;}
   if(remaining(t)>0){sailing(s,h);return;}
   if(t.ships.some(b=>b.wet))paid(s,3,'舱边湿丝摊晾复验，实付三文',h);
   record(s,'对岸回执齐，保留迟报与验货缘由');break;
 case 'count':need(t.ships.length&&t.ships.every(b=>b.signed)&&remaining(t)===0,'还差一联实际签收单。');record(s,'签收实货抵定金，尾款入公匣',q.gross-t.credit-t.advance);break;
 case 'pay':{const payout=shares(t);need(payout.every(a=>a.share>=0),'公所先核清实付费用。');t.settlement=payout;
   for(const a of payout){paid(s,a.total,{house:'李家收本户工料款和分余',farm:'桑户收丝款和分余',lu:'陆家收篓款和分余',makers:'竹匠收工料款和分余'}[a.owner],h);}
   s.coins+=payout[0].total;log(s,'guildShare',payout[0].total,'公所已分清，本户实际领款');break;}
 case 'letter':record(s,'京中只有故交口信，尚无正式召归文书');break;
 case 'room':if(c===0){spend(s,{wood:2,bamboo:1});rural.work(s,10,2,need);}else rural.work(s,20,2,need);break;
 case 'post':t.letterSent=true;s.journal.push({id:'家书',tick:s.worldTick,text:['家书上留下南澜住址。','家书托问省亲的时机与手续。','家书里并列两地通邮的地址。'][t.choices.reply]});break;
 case 'home':need(s.worldTick%1440>=1020,'等日影偏西，再回后堂点灯。');need(t.letterSent&&t.settlement&&t.fund===0,'先寄家书，并把公所账结清。');s.flags.volume4Complete=true;break;
 }
 s.flags[flag(k)]=true;
}
// Once the founding voyage is closed, a new contract has its own cargo and purse.
const sizes=[[4,6],[6,8],[8,12]];
const capacity=t=>t.warehouse?34:22;
function view(s,b){return {story4:b,worldTick:s.worldTick,gender:s.gender};}
function stores(s){const v=s.story4.stores||{day:day(s),silk:8,bamboo:24};const days=Math.max(0,day(s)-v.day);
 return {day:day(s),silk:Math.min(8,v.silk+days*2),bamboo:Math.min(24,v.bamboo+days*4)};}
function guildInfo(s,size){
 const t=s.story4,[silk,baskets]=sizes[size],prior=t.lastPolicy??t.choices.remedy;
 const lu=Math.min(baskets-2,prior===2?1:prior===0?4:3),slots=silk+baskets*2;
 return {silk,baskets,lu,slots,maintenance:4+Math.ceil(slots/4),gross:silk*32+baskets*22,lead:prior===0?140:prior===2?160:120,prior};
}
function advanceMakers(s,h){const v=s.story4;v.prepaid=[0,0,0,0];
 for(const i of [1,2,3]){const quoted=v.lots.filter(l=>l.owner===parties[i]).reduce((n,l)=>n+l.qty*rates[l.item].maker,0);v.prepaid[i]=Math.floor(quoted/4);paid(s,v.prepaid[i],'预付供货工料款，交割时抵扣',h);}}
function refundUnit(s){s.story4.prepaid[2]-=4;record(s,'退回该件已付的四文工料定钱',4);}
function guildDue(s){
 const t=s.story4,b=t.repeat;if(!b)return t.upgradeDue||0;
 if(b.phase==='await'||b.phase==='recheck')return b.due;
 if(b.phase==='sail')return nextWind(s);
 if(b.phase==='water')return b.ships.at(-1).reportDue;
 return 0;
}
function guildAction(s,key,p,h){
 const {requireThat:need,requireScene:at,spend,log}=h,t=s.story4,b=t.repeat;
 need(s.flags.volume4Complete,'先结清第一航，安顿后堂。');
 function privateCost(n,reason){need(s.coins-n>=s.story2.reserve,'家用保留不足，可先接小批或去南街售货。');s.coins-=n;log(s,'guildExpense',-n,reason);}
 if(key==='Wait'){
   const due=guildDue(s),night=(day(s)-1)*1440+1320;need(due>s.worldTick,'约定的时辰已经到了。');need(s.worldTick<night,'夜深了，回东厢房睡一夜再来。');s.worldTick=Math.min(due,night);return;
 }
 if(key==='Build'){at(s,'guild');need(!t.warehouse&&!t.upgradeDue&&!b,'先清空公库再动架。');spend(s,{wood:4,bamboo:3});privateCost(96,'家用实付加造干货架');t.upgradeDue=Math.ceil(s.worldTick)+120;return;}
 if(key==='InspectRack'){at(s,'guild');need(!t.warehouse&&t.upgradeDue&&s.worldTick>=t.upgradeDue,'两小时的工时到后，再来验架。');t.warehouse=1;t.upgradeDue=0;return;}
 if(key==='BuyCloth'){at(s,'guild');need(t.cloth<4,'油布柜已满，先用去一卷。');privateCost(7,'以七文买入一卷干油布');t.cloth++;return;}
 if(key==='Open'){
   at(s,'guild');need(!b&&!t.upgradeDue&&t.lastClose!==day(s),'今天的班次已经安排，或公库正在施工。');
   need(Number.isInteger(p.size)&&sizes[p.size]&&typeof p.own==='boolean','请选定一份派单。');const a=guildInfo(s,p.size);
   need(a.slots<=capacity(t),'仓格不够，缩单或先验收新的干货架。');
   const raw=stores(s),own=Number(p.own),silk=a.silk-own,bamboo=(a.baskets-own)*2;
   need(raw.silk>=silk&&raw.bamboo>=bamboo,'村中可调的丝料或竹篾不够，等下次备料、缩批或以自货分担。');
   t.stores={day:day(s),silk:raw.silk-silk,bamboo:raw.bamboo-bamboo};
   if(p.own){needGoods(s,'fineSilk',1,h);needGoods(s,'narrowBasket',1,h);spend(s,{fineSilk:1,narrowBasket:1});}
   privateCost(a.maintenance,'开仓清扫、垫仓和搬运的实际费用');
   const v=t.repeat={...initial(),round:t.round+1,size:p.size,inputs:{silk,bamboo},phase:'await',due:Math.ceil(s.worldTick)+a.lead,choices:{charter:t.choices.charter},prepaid:[0,0,0,0],defect:a.prior===1?'light':a.prior===0?'sound':'sound',policy:a.prior,gross:a.gross,needsCheck:a.prior===0?1:2};
   const g=view(s,v);v.lots=[lot(p.own?'house':'farm','fineSilk',1),lot(p.own?'house':'makers','narrowBasket',1),lot('farm','fineSilk',a.silk-1),lot('lu','narrowBasket',a.lu),lot('makers','narrowBasket',a.baskets-a.lu-1)];
   // A new receiving pair can misfile an unmarked lot on a later voyage. The
   // double-mark practice is durable; previously graded light baskets stay labelled.
   if(a.prior===2&&v.round%3===0)v.defect='loose';
   v.advance=Math.floor(a.gross/3);record(g,'船东预付入公匣，列作待交货款',v.advance);
   advanceMakers(g,h);
   t.round=v.round;return;
 }
 need(b,'本季还没有续办的派单。');const g=view(s,b);
 if(key==='Check'){at(s,'guild');need(b.phase==='await'&&s.worldTick>=b.due,'约好的供货还没到时辰。');
   need(p.inspected===b.needsCheck,'请把约好的两处样签核完。');for(const l of b.lots)l.received=true;b.phase=b.defect==='sound'?'sail':'dispute';record(g,b.defect==='sound'?'抽验通过，封签进库':'另放一件待验篓，原件未出库');return;}
 if(key==='Fix'){
   at(s,'guild');need(b.phase==='dispute'&&[0,1,2].includes(p.choice),'请先封存待验的一件。');
   b.policy=p.choice;
   if(p.choice===0){paid(g,4,'垫付紧篾工钱',h);b.due=Math.ceil(s.worldTick)+20;b.phase='recheck';}
   if(p.choice===1){b.phase='consent';}
   if(p.choice===2){paid(g,6,'退货回程与工棚补件运脚',h);b.returns++;refundUnit(g);b.lots[3].qty--;b.lots[4].qty++;const materialReady=stores(s).bamboo>=2?s.worldTick:day(s)*1440;b.due=Math.ceil(materialReady)+60;b.phase='recheck';}
   return;
 }
 if(key==='Consent'){at(s,'anchorage');need(b.phase==='consent','先与货主商妥分级。');b.credit=6;b.phase='sail';record(g,'船东同意一件按轻用篓折六文');return;}
 if(key==='Recheck'){at(s,'guild');need(b.phase==='recheck'&&s.worldTick>=b.due,'等返工或替补件到架。');if(b.policy===2&&b.returns){const raw=stores(s);need(raw.bamboo>=2,'替补篓还缺两份竹篾。');t.stores={...raw,bamboo:raw.bamboo-2};b.inputs.bamboo+=2;}b.lots.forEach(l=>l.received=true);b.phase='sail';record(g,'复验通过，替补与原批可追查');return;}
 if(key==='Sail'){
   at(s,'anchorage');need(b.phase==='sail'&&[0,1].includes(p.space)&&typeof p.oil==='boolean','请核对本航舱位与包装。');
   if(p.oil){need(t.cloth>0,'公所油布柜还缺一卷。');t.cloth--;}else paid(g,2,'买草席隔开丝与竹器',h);
   b.choices.wrap=p.oil?0:1;b.choices.space=p.space;sailing(g,h);b.phase='water';return;
 }
 if(key==='Receive'){at(s,'wharf');need(b.phase==='water','先发出这一批货。');land(g,h);if(b.ships.at(-1).wet)paid(g,3,'舱边湿丝摊晾复验，实付三文',h);b.phase=remaining(b)?'sail':'close';return;}
 need(key==='Close'&&b.phase==='close','先核清本季对岸签收。');at(s,'guild');
 record(g,'签收实货抵定金，尾款入公匣',b.gross-b.advance-b.credit);const out=shares(b);
 need(out.every(a=>a.principal>=0&&a.share>=0),'公所先核清实付费用。');
 for(const a of out)paid(g,a.total,householdNote[a.owner],h);
 s.coins+=out[0].total;log(s,'guildShare',out[0].total,'本季本户实际领款');t.lastSeason={round:b.round,policy:b.policy,returns:b.returns,settlement:out,ledger:b.ledger,ships:b.ships.length};t.lastPolicy=b.policy;t.lastClose=day(s);t.repeat=null;
}
const householdNote={house:'李家收本户工料款和分余',farm:'桑户收丝款和分余',lu:'陆家收篓款和分余',makers:'竹匠收工料款和分余'};
return {stores,guildInfo,guildDue,capacity,order,titles,steps,rewards,rows,chapter,chapters,script,flag,first,canStart,gate,target,act,normalise,quote,rates,parties,issued,remaining,windAt,nextWind,waitUntil,shares};
});
