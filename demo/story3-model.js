/* Volume III trades on the same clock, cash, bag and shop inventory as the first two volumes.
 * Only the maker's rack, consignments, and waybills are separate physical containers. */
(function(root,make){const server=typeof module==='object'&&module.exports;
const api=make(server?require('./v3-steps.js'):root.NanlanV3Steps,server?require('./v3-dialogue.js'):root.NanlanV3Dialogue);
if(server)module.exports=api;else root.NanlanStory3=api;})(globalThis,function(chapters,dialogue){
'use strict';
const order=chapters.map((_,i)=>'V3_'+String(i+1).padStart(2,'0'));
const titles={},steps={},rewards={},targets={},rows={},chapterOf={};
const flag=k=>'v3_'+k;
chapters.forEach((chapter,i)=>{const id=order[i];titles[id]=dialogue[i].title[0];steps[id]=chapter.map(([k,sc,obj,zh])=>[flag(k),zh]);rewards[id]=[0,dialogue[i].title[0]+' · 已记入山海手记'];for(const row of chapter){const [k,sc,obj]=row;rows[k]=row;targets[flag(k)]=[sc,obj];chapterOf[k]=i;}});
const prices={retail:13,guest:18,advance:4,shiftWage:5,lotWage:4,workMinutes:40};
const locations={wharf:'v3_return',oldTrail:'v3_supply',workshop:'v3_standard',qingxi:'v3_fill'};
const day=s=>Math.floor(s.worldTick/1440)+1, minute=s=>Math.floor(s.worldTick%1440);
const fresh=()=>({choices:{},book:[],waiting:0,raw:0,ready:0,sample:0,shift:null,job:null,freight:null,remainder:0,contract:null,heldForRegular:0,consign:0,notes:[],side:{},receipts:0});
const first=s=>{const i=order.findIndex(id=>s.quests[id]?.status==='ACTIVE');return chapters[i]?.find(([k])=>!s.flags[flag(k)])||null;};
function target(s,key){if(key==='outing'){const c=s.story3?.choices.handoff;return c===1?['oldTrail','v3Shelter']:c===2?['coast','shenYuCoast']:['village','villager'];}return rows[key]?.slice(1,3);}
function finishAt(tick,mins){let t=tick;while(mins>0){let m=t%1440;if(m<540)t+=540-m;else if(m>=1020)t+=1440-m+540;
const used=Math.min(mins,1020-t%1440);t+=used;mins-=used;}return t;}
function capacity(s){return s.story3?.choices.council===1&&s.flags.v3_capacity?3:2;}
function shopVisit(s,from,to){const j=s.story3?.shift;if(!j)return;if(from==='generalStore'&&to!==from)j.left=true;
 if(j.full&&from!=='generalStore'&&to==='generalStore'&&j.left&&s.flags.v3_outing&&s.worldTick>=j.end)j.returnedAtDusk=true;}
function canStart(s){return !!s.flags.volume2Complete&&order.every(id=>!s.quests[id]||s.quests[id].status==='DEFERRED_V3')&&!s.story3;}
function gate(s,scene){return !locations[scene]?null:s.flags[locations[scene]]?'':'这条路要等前面的约定办妥才开放。';}
function presence(s,person){const shift=s.story3?.shift;if(!shift||s.worldTick<shift.start||s.worldTick>=shift.end)return null;return shift.person===person?'generalStore':null;}
function note(s,zh,amt=0){const v=s.story3;v.book.push({tick:s.worldTick,zh,amt});if(v.book.length>96)v.book.shift();}
function normalise(s,need){if(s.story3==null){need(!s.flags.volume3Started&&!s.flags.volume3Complete,'山海手记缺页。');return;}
 const v=s.story3;need(s.flags.volume2Complete&&s.flags.volume3Started&&typeof v==='object'&&v.choices&&v.side&&Array.isArray(v.book)&&Array.isArray(v.notes),'山海手记缺页。');
 const count=n=>Number.isSafeInteger(n)&&n>=0&&n<1e7,when=n=>Number.isFinite(n)&&n>=0&&n<1e9;
 for(const k of ['raw','ready','sample','consign','remainder','heldForRegular','receipts'])need(count(v[k]),'山海货数有误。');
 need(v.remainder<=v.ready&&v.heldForRegular<=(s.shop.reserved.bambooWare||0),'山海货数有误。');
 if(v.shift?.item)need((s.shop.reserved[v.shift.item]||0)>0&&Number.isFinite(v.shift.price)&&v.shift.price>=0,'轮班记录有误。');
 const a=order.findIndex(id=>s.quests[id]?.status!=='COMPLETED');
 order.forEach((id,i)=>need(s.quests[id]?.status===(a<0||i<a?'COMPLETED':a===i?'ACTIVE':'LOCKED'),'山海章节次序有误。'));
 for(const [key,n] of Object.entries(v.choices))need(rows[key]&&count(n)&&n<rows[key].length-5,'山海手记缺页。');
 if(v.job)need(count(v.job.quantity)&&v.job.quantity>0&&when(v.job.due)&&count(v.job.left),'作坊工单有误。');
 if(v.freight)need(count(v.freight.n)&&v.freight.n>0&&when(v.freight.due),'转运凭单有误。');
 if(v.shift)need(['father','mother','xiaoman'].includes(v.shift.person)&&when(v.shift.start)&&when(v.shift.end)&&v.shift.end>v.shift.start&&typeof v.shift.left==='boolean','轮班记录有误。');
 if(v.contract){const o=v.contract;need(count(o.q)&&count(o.delivered)&&o.delivered<=o.q&&count(o.advance)&&o.advance===(o.q-o.delivered)*prices.advance&&count(o.dueDay),'客栈订单有误。');}
}
function start(s,h){h.requireScene(s,'generalStore');h.requireThat(canStart(s),'请先办完南街铺面的家议。');s.story3=fresh();s.flags.volume3Started=true;order.forEach((id,i)=>s.quests[id]={status:i?'LOCKED':'ACTIVE'});}
function use(s,n,h){const b=s.bag.bambooWare||0,t=s.story3,free=Math.max(0,t.ready-t.remainder),fromRack=Math.min(free,n);h.requireThat(free+Math.min(b,h.available(s,'bambooWare'))>=n,'还缺日用竹器，可在仓房用竹材编制，或去工棚拨料。');t.ready-=fromRack;if(n>fromRack)h.spend(s,{bambooWare:n-fromRack});}
function money(s,n,label,h){if(n<0)h.requireThat(s.coins+n>=s.story2.reserve,'家用不够，先售余货或回正厅调整家用保留。');s.coins+=n;h.log(s,'mountainTrade',n,label);note(s,label,n);}
function work(s,m,e,h){h.rural.work(s,m,e,h.requireThat);}
function beginJob(s,n,left,h){const t=s.story3,total=n+left;h.requireThat(!t.job,'先核清上一批委托。');const fromRack=Math.min(total,t.raw);if(total>fromRack)h.spend(s,{bamboo:total-fromRack});t.raw-=fromRack;
money(s,-prices.lotWage*total,'按批支付小满工钱',h);t.job={quantity:n,left,due:finishAt(Math.floor(s.worldTick),prices.workMinutes*n),start:s.worldTick};}
function collectJob(s,h){const t=s.story3,j=t.job;h.requireThat(j&&s.worldTick>=j.due,'工时还未走完，可先办别的事或等到收工。');t.ready+=j.quantity;t.job=null;note(s,'小满交回已验的成品');if(j.left)t.job={quantity:j.left,left:0,start:s.worldTick,due:finishAt(Math.floor(s.worldTick),prices.workMinutes*j.left)};}
function startShift(s,person,full,h){const t=s.story3;h.requireThat(!t.shift&&!t.job,'伙伴手里还有工单，先去验收。');const today=(day(s)-1)*1440,now=s.worldTick;
 if(full)h.requireThat(minute(s)<=600&&!s.story2.days[day(s)]?.closed,'请在一个尚未打烊的清晨回来交接。');
 let from=full?Math.max(now,today+480):Math.max(now,today+540);if(!full&&(s.story2.days[day(s)]?.closed||from-today+60>(person==='mother'?720:1020)))from=today+1440+540;
 if(full)money(s,-prices.shiftWage,'支付离店一班工钱',h);
 const preferred=s.choices.shopDisplay==='signature'?[s.shop.featured]:s.choices.shopDisplay==='small'?['shellCraft','rope']:['bambooWare','driedHerb'];
 const item=[...preferred,...Object.keys(s.shop.stock)].find(id=>h.shop.stockAvailable(s,id)>(full&&id==='bambooWare'&&t.choices.regular===0?1:0));
 if(item)s.shop.reserved[item]=(s.shop.reserved[item]||0)+1;
 t.shift={person,start:from,end:full?today+1080:from+60,left:false,full,item:item||null,price:item?h.shop.price(s,item):0};note(s,'交接单已签，只准按价售出未预留的现货');}
function settleShift(s,h){const t=s.story3,j=t.shift;h.requireThat(j&&j.left&&s.worldTick>=j.end,'先亲自离店赴约，待这个班次结束再对账。');const tradeDay=Math.floor(j.end/1440)+1;
 if(tradeDay===day(s)&&j.item&&!s.story2.days[tradeDay]?.closed&&h.shop.customers(s)>0){
    if(s.shop.customerDay!==tradeDay){s.shop.customerDay=tradeDay;s.shop.served=0;}h.shop.sale(s,j.item,1,j.price,'shopSale',true);s.shop.served++;note(s,'轮值按价交付一件柜上现货');
 }else{if(j.item)s.shop.reserved[j.item]--;note(s,'轮值盘点了实货，登记问询，预留原样封存');}
 if(j.full)t.notes=['临时大单等掌柜回复','明日取货时辰待回复'];else t.side.motherTime=s.worldTick<=j.end+30;
 t.shift=null;t.receipts++;}
function ship(s,n,fee,mins,h){const t=s.story3;h.requireThat(!t.freight&&t.ready>=n,'请先在工棚验收足数成品。');money(s,-fee,'河埠转运实付运钱',h);t.ready-=n;t.freight={n,due:s.worldTick+mins};}
function receive(s,h){const t=s.story3,f=t.freight;h.requireThat(f&&s.worldTick>=f.due,'货仍在路上，班次到站后才可签收。');money(s,f.n*prices.guest,'客栈签收已到货物',h);t.freight=null;t.receipts++;}
function deliver(s,h){const o=s.story3.contract;h.requireThat(o&&o.delivered<o.q,'这张单已交清。');use(s,1,h);o.delivered++;o.advance-=prices.advance;money(s,prices.guest-prices.advance,'交货抵定金，实收尾款',h);s.story3.receipts++;}
const resources={wood:2,bamboo:4};
function act(s,name,p,h){
 const {requireThat:need,requireScene:at,spend}=h;need(p.sequence===s.revision,'这份记录已更新，请重新查看后确认。');
 if(name==='v3Start'){start(s,h);return;}
 const t=s.story3;need(t&&s.flags.volume3Started,'请先到南街查看门前竹箱。');
 if(name==='v3Wait'){need(!(t.shift?.full&&s.scene==='generalStore'),'小满还在当班，去赴约的地方等到日落，再回店。');const time=nextWait(s);need(time>s.worldTick,'眼下没有需要守候的班期。');const close=(day(s)-1)*1440+1320;need(s.worldTick<close,'夜已深，回卧房睡一夜可继续推进生长。');s.worldTick=Math.min(time,close);return;}
 if(name==='v3Buy'){at(s,'village');need(Object.hasOwn(resources,p.item),'请选择所需材料。');money(s,-resources[p.item],'村口购入工料',h);h.give(s,{[p.item]:1});return;}
 if(name==='v3Work'){at(s,'workshop');need(s.flags.v3_batch,'先验完第一批委托。');need(!t.shift,'伙伴在柜台轮班，回店核清交接后再开工。');beginJob(s,capacity(s),0,h);return;}
 if(name==='v3Collect'){at(s,'workshop');need(s.flags.v3_batch,'先验完第一批委托。');collectJob(s,h);return;}
 if(name==='v3Cover'){at(s,'generalStore');need(s.flags.volume3Complete&&!t.shift,'先核完这次交班。');startShift(s,'xiaoman',true,h);return;}
 if(name==='v3Review'){at(s,'generalStore');need(s.flags.volume3Complete,'先核完这次交班。');settleShift(s,h);t.notes=[];return;}
 if(name==='v3Partner'){at(s,'workshop');need(s.flags.v3_capacity&&t.choices.council===2&&t.partnerDay!==day(s),'伙伴这一班已经交过货。');money(s,-10,'支付联供制作者货款',h);t.ready++;t.partnerDay=day(s);return;}
 if(name==='v3Train'){at(s,'workshop');need(s.flags.v3_roster&&!t.side.crossTrained&&!t.shift&&!t.job,'等双方都有空时再来练习。');spend(s,{bamboo:1});work(s,15,1,h);money(s,-4,'补教另一项工序，按约付工钱',h);t.raw++;t.side.crossTrained=true;return;}
 if(name==='v3Market'){at(s,'qingxi');need(s.flags.v3_trade,'先办成旧埠的第一笔交易。');need(t.marketDay!==day(s),'今日已散集，明日再来。');use(s,1,h);money(s,prices.retail,'旧集实售竹器',h);t.marketDay=day(s);return;}
 if(name==='v3Renew'){at(s,'wharf');need(t.contract&&t.contract.delivered<t.contract.q&&day(s)>=t.contract.dueDay,'按原约定日期交货即可。');t.contract.dueDay=day(s)+2;note(s,'方掌柜收回旧笺，双方另定日期');return;}
 if(name==='v3Balance'){at(s,'wharf');need(s.flags.v3_first,'先交首件。');deliver(s,h);return;}
 if(name==='v3Remainder'){at(s,'wharf');need(t.remainder&&!t.freight,'没有余单待发。');ship(s,t.remainder,3,60,h);t.remainder=0;return;}
 if(name==='v3SignLate'){at(s,'wharf');need(s.flags.v3_receive,'先签首批。');receive(s,h);return;}
 if(name==='v3Consign'){at(s,'qingxi');need(t.consign===1,'这件寄售品已经交代清楚。');t.consign=0;money(s,2,'寄售十二文，货主十文当面结清，留佣二文',h);return;}
 if(name==='v3Side'){
   const k=p.key,side=t.side;
   if(k==='teaching'){at(s,'study');need(s.flags.v3_report&&!side.teaching,'先带回旧路草图。');side.teaching=true;note(s,'祖父在草图背面写下明春的课');}
   else if(k==='handover'){at(s,'workshop');need(s.flags.v3_roster&&!side.handover,'先同小满订好班次。');side.handover=true;note(s,'父亲把简写补全，小满能独自看懂这页账');}
   else if(k==='shoot'){at(s,'oldTrail');need(!side.shoot,'幼竹已经留好了。');side.shoot=true;note(s,'只取成竹，幼株留给下一季');}
   else if(k==='gauge'){at(s,'wharf');const phase=Math.floor(s.worldTick/90);side.tides??=[];need(side.tides.length<3&&!side.tides.includes(phase),'等水位换过一程再来记录。');side.tides.push(phase);note(s,'在班牌旁记下实际潮位');}
   else need(false,'请到对应的物件旁操作。');return;
 }
 need(name==='v3Step','请到对应的物件旁操作。');
 const row=first(s);need(row&&row[0]===p.key,'先办妥手记中眼前的一件事。');const k=row[0],c=p.choice;
 at(s,target(s,k)[0]);if(row.length>5){need(Number.isInteger(c)&&c>=0&&c<row.length-5,'请选定一种安排。');t.choices[k]=c;}
 switch(k){
 case 'tag':t.chest='held';break;
 case 'claim':need(t.chest==='held','先核对竹箱。');t.chest='returned';if(c===1)t.consign=1;break;
 case 'desk':startShift(s,t.choices.family===0?'mother':'father',false,h);break;
 case 'away':need(t.shift&&t.shift.left,'先带着交接单走出铺门。');break;
 case 'return':settleShift(s,h);break;
 case 'water':t.gauge=h.tide(s).low?'low':'rising';break;
 case 'supply':t.supplierLimit=c===0?2:4;break;
 case 'sign':if(c===0)spend(s,{bamboo:1});work(s,c===0?15:10,1,h);break;
 case 'sample':spend(s,{bamboo:c===0?2:1});work(s,c===0?20:15,2,h);t.sample=1;break;
 case 'trial':need(t.sample===1,'先编好一件试样。');t.defect=t.choices.sample===0?'joint':'rim';break;
 case 'mend':need(t.defect,'先试提、叠放。');work(s,10,1,h);break;
 case 'standard':need(t.sample===1,'先编好一件试样。');break;
 case 'lease':money(s,c===0?-4:-6,'按约付工棚使用费',h);break;
 case 'repair':spend(s,{wood:2,bamboo:1});work(s,20,3,h);break;
 case 'teach':spend(s,{bamboo:2});t.raw+=2;work(s,10,1,h);break;
 case 'roster':t.wage=prices.lotWage;break;
 case 'inspect':need(t.raw>=2,'请先将两份实物分架。');break;
 case 'grade':money(s,p.small?-3:c===0?-6:-5,p.small?'先验一捆，余料由货主带回':'两捆来料，照分级当面结算',h);t.raw+=p.small?1:2;t.waiting=c===0?s.worldTick+30:0;break;
 case 'order':need(s.worldTick>=t.waiting,'换来的竹材还在路上。');beginJob(s,c===0?2:1,c===0?0:1,h);break;
 case 'batch':collectJob(s,h);if(t.job)return;break;
 case 'ship':{const a=t.choices.amend;ship(s,a===1?1:2,[8,3,4][a],[30,60,120][a],h);t.remainder=a===1?1:0;break;}
 case 'receive':receive(s,h);break;
 case 'regular':t.pickupDay=day(s)+1;if(c===0&&h.shop.stockAvailable(s,'bambooWare')>0){s.shop.reserved.bambooWare=(s.shop.reserved.bambooWare||0)+1;t.heldForRegular=1;}break;
 case 'fill':{
   if(t.choices.regular===1)need(day(s)>=t.pickupDay,'街坊约了明日取货。');
   const id='bambooWare';if(t.heldForRegular||h.shop.stockAvailable(s,id)>0){h.shop.sale(s,id,1,h.shop.price(s,id),'shopSale',!!t.heldForRegular);t.heldForRegular=0;note(s,'照约交付柜上竹器');}
   else{use(s,1,h);money(s,prices.retail,'补到柜上，熟客取走一件竹器',h);}break;}
 case 'stall':use(s,1,h);t.stall=1;break;
 case 'trade':need(t.stall===1,'摊上还没有实货。');t.stall=0;t.marketDay=day(s);money(s,t.choices.stall===0?12:14,'青溪小集实售竹器',h);break;
 case 'origin':need(t.sample&&s.flags.v3_grade,'先查到确切批次。');t.provenance=t.choices.consent?'village':'zhou';break;
 case 'label':t.sampleOnShelf=true;need(t.provenance&&t.sample,'先确认署名与货权。');break;
 case 'capacity':{const scale=t.choices.council;
   if(scale===1){spend(s,{wood:2,bamboo:1});money(s,-6,'添置第二个工位',h);}
   if(scale===2){money(s,-10,'联供首件按约付给制作者',h);t.ready++;}
   need(t.ready-t.remainder+h.available(s,'bambooWare')>=1,'先编好一件竹器或去工棚安排制作。');break;}
 case 'contract':{const q=2+t.choices.council;t.contract={q,delivered:0,advance:q*prices.advance,dueDay:day(s)+3};money(s,t.contract.advance,'收到预付，记未交义务',h);break;}
 case 'first':deliver(s,h);break;
 case 'handoff':startShift(s,'xiaoman',true,h);break;
 case 'outing':need(t.shift?.left,'先走出南街铺门，再去赴约。');t.side.excursion=1+t.choices.handoff;work(s,30,2,h);break;
 case 'audit':need(t.shift?.returnedAtDusk,'小满还在当班，去赴约的地方等到日落，再回店。');settleShift(s,h);break;
 case 'answer':need(!t.shift&&t.notes.length===2,'先核对离店这一班的流水。');need(!t.freight&&!t.remainder,'河埠还有未签清的分送货。');need(t.contract.delivered===t.contract.q||day(s)<=t.contract.dueDay,'请先去河埠交货，或与方掌柜另约交期。');t.notes=[];note(s,'已回绝临时加单，双方确认余单下次取货日');break;
 case 'meal':spend(s,{hotMeal:1});break;
 }
 s.flags[flag(k)]=true;if(k==='meal')s.flags.volume3Complete=true;
 const person={claim:'zhou',weaver:'zhou',inn:'fang',sail:'boatman',hire:'xiaoman'}[k];if(person)t.side['met_'+person]=true;
}
function nextWait(s){const t=s.story3;if(!t)return 0;const k=first(s)?.[0],choices=[];
 if(t.job)choices.push(t.job.due);if(t.freight)choices.push(t.freight.due);if(t.shift&&t.shift.left)choices.push(t.shift.end);if(k==='order')choices.push(t.waiting);
 if(k==='fill'&&t.choices.regular===1)choices.push((t.pickupDay-1)*1440+540);
 const upcoming=choices.filter(n=>n>s.worldTick);return upcoming.length?Math.min(...upcoming):0;}
return {shopVisit,capacity,chapters,dialogue,order,steps,titles,rewards,rows,targets,flag,first,target,prices,resources,fresh,gate,normalise,act,canStart,presence,nextWait,chapterOf};
});
