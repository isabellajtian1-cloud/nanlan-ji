/* Volume V: Enduring Seasons. Projects have explicit owners, inputs, limits and receipts. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanSeason5=api;})(globalThis,function(){
'use strict';
const pair=(zh,en)=>[zh,en],step=(key,scene,object,zh,en,options)=>({key,scene,object,label:pair(zh,en),options});
const chapters=[
{title:pair('秋风翻过旧账','Autumn Turns the Ledger'),text:pair('父亲将几卷旧账放在一起。「日日有钱进，并不等于每张约都有余力去守。」','Father opens the old ledgers. “Daily receipts do not mean we have room for every promise.”'),steps:[step('review','generalStore','v3Desk','逐页分开家用、铺货与公所货','Separate household, shop and guild accounts')]},
{title:pair('愿意常来的买家','A Buyer Who Returns'),text:pair('邱管事没有催你开价，只问往后每次来，是否仍见得到做货的人。','Manager Qiu asks whether the makers will still be there each time he returns.'),steps:[step('buyer','market','qiu','商定长期合作只以实货逐批确认','Agree that each delivery needs its own goods and consent')]},
{title:pair('一份安稳，几家忙碌','Steady Work, Many Hands'),text:pair('母亲把未完工的丝放在案边。「这几束还在等，新的约不能把它们挤掉。」','Mother lays unfinished silk beside the book. “A new promise must leave room for the old.”'),steps:[step('capacity','guild','v4Ledger','核对在制品，给各家留出歇工日','Check work in progress and leave days of rest')]},
{title:pair('样品之外的一行字','The Line Beneath the Sample'),text:pair('周成指着留样签。「字号可以是你家的，做这道口的人，也该有名字。」','Zhou points at the tag. “Your shop may own the name; the hand that bound the rim has a name too.”'),steps:[step('signature','workshop','v3Racks','将师傅与学徒署名列在样签旁','Put maker and apprentice names beside the sample')]},
{title:pair('母亲留出的那一天','A Day Mother Kept Free'),text:pair('母亲带来两只竹匾。「今天我陪你看药色。不是替你掌柜，是看看你的日子。」','Mother brings two trays. “Today I shall look at the herbs with you. Not to run your shop, but to share your day.”'),steps:[step('motherPlan','generalStore','v2MotherCounter','约母亲一起选品，写明用料与工钱','Agree on materials, time and wages with Mother'),step('motherDo','generalStore','v2MotherCounter','与母亲摊药、拣色、封一份干药','Sort and pack one dried herb parcel with Mother')]},
{title:pair('留出一部分不卖','Some Things Stay Home'),text:pair('一篮好菜也能换钱。母亲仍把一小份留在灶边：「卖的是余物，饭桌上的不算。」','Mother leaves greens by the hearth. “We sell what is spare. Supper is not spare.”'),steps:[step('reserve','yard','stove','留一份食材在家，暂不出售','Set aside one ingredient for the family')]},
{title:pair('来问工的人','Someone Asks to Learn'),text:pair('学徒站在门外，先问坏了的竹篾算谁的。林师傅把人请进来：「这话，开工前就该问。」','The apprentice asks who pays for a spoiled strip. Master Lin waves them inside. “A question for before the work begins.”'),steps:[step('apprenticePlan','workshop','v3Bench','定师徒合做的材料、工时与成品归属','Agree on teaching time, materials and ownership')]},
{title:pair('林师傅收起的尺','Master Lin Puts Away the Rule'),text:pair('林师傅把尺收进袖中。「先让他自己说哪里不平，再把你的手放上去。」','Master Lin slips away his rule. “Let them find the uneven edge before you guide their hand.”'),steps:[step('select','workshop','v3Bench','选篾，剔出带裂纹的材料','Pick sound strips and set cracked ones aside'),step('teach','workshop','v3Bench','示范收口，让学徒亲手跟做','Demonstrate the rim and let the apprentice follow')]},
{title:pair('第一件不能卖的成品','The First Piece We Keep'),text:pair('篓口歪了一线。学徒想拆，林师傅拦住：「留着。下次拿来比，比夸你一句有用。」','The rim is uneven. Master Lin stops the apprentice from unpicking it. “Keep it. Next time it will tell you more than praise.”'),steps:[step('correct','workshop','v3Racks','一起复验篓耳，补紧松处','Recheck the handle and tighten the loose binding'),step('claim','workshop','v3Racks','将首件留作教具，另收合格成品','Keep the first piece as a teaching sample and collect the sound basket')]},
{title:pair('罗小满写的三张纸','Xiaoman’s Three Slips'),text:pair('小满写下「能做」「须问」「先停」三张纸。「你不在时，我照这个办；越过这条，就等你回来。」','Xiaoman writes three slips: May Do, Must Ask, Stop Here. “These are my limits while you are away.”'),steps:[step('xiaomanPlan','generalStore','v3XiaomanCounter','约定小满改铺的费用、材料与权限','Set Xiaoman’s materials, wages and authority'),step('xiaomanDo','generalStore','v3XiaomanCounter','共同试摆货架，留下原有留货签','Rearrange the display together and preserve reservation tags')]},
{title:pair('河埠边少了一个熟面孔','An Empty Place at the Landing'),text:pair('行舟说要回家一趟，先带你认支汊。「认路不是记一条线，是知道何时不该走。」','Xingzhou must visit home. Before leaving, he shows you the branches. “Knowing a route includes knowing when to stay ashore.”'),steps:[step('boatPlan','wharf','v3Boatman','约好认河路的工时与报酬','Agree on the river walk and the boatman’s pay'),step('boatDo','wharf','v3Boatman','同行认桩与支汊，留下停航界限','Read posts and branches together and record when to halt')]},
{title:pair('缺了半页的旧簿','The Ledger’s Missing Half-Page'),text:pair('程婉获准让你看旧样的另一页。那不是欠账，是一只出行食盒的改样记号。','Cheng Wan permits you to see another sample page: revisions to a travelling food box, not a debt.'),steps:[step('prototype','store','workbench','按旧样选盒底、隔层、提手与纹样','Choose the base, divider, handle and motif'),step('loadTest','store','workbench','装物测试：看盒底承重','Load test: check the base'),step('carryTest','store','workbench','提行测试：看提手与接缝','Carry test: check handle and joints'),step('stackTest','store','workbench','叠放测试：看重心与盒盖','Stack test: check balance and lid'),step('openTest','store','workbench','开合测试：取用后仍能合拢','Opening test: close the box after use')]},
{title:pair('雨前看一遍','A Check Before Rain'),text:pair('旧物并非修过一次便不会再坏。小满拿出旧楔，先请你摸摸磨薄的一面。','A repair does not last forever. Xiaoman hands you the old wedge, worn thin on one side.'),steps:[step('maintenance','store','workbench','更换一枚木楔，擦干留样架','Replace a wedge and dry the sample rack')]},
{title:pair('谁家的方便，谁出的工','Whose Ease, Whose Labour'),text:pair('陈伯先问搬架的人何时吃饭，才问棚子能多摆几张桌。','Before asking how many tables the shed can hold, Chen asks when the porters will eat.'),steps:[step('workShare','guild','v4Table','把共用设施的用工与照管人写清','Record who works and who tends the shared facilities')]},
{title:pair('买家临时改了主意','A Buyer Changes Their Mind'),text:pair('买家想把已做的货换成另一种。小满没有替你答应，只留下原单与新话。','A buyer wants different goods. Xiaoman leaves the old order and the new request for you to decide.'),steps:[step('changeOrder','generalStore','v3Desk','先清原单，再决定是否另接新约','Settle the original promise before accepting a change', [pair('保留原约，下一批再改','Keep this batch; change the next'),pair('双方确认取消，实货仍归原货主','Cancel by consent; retain the owners’ goods')]),step('marketPack','market','playerStall','为秋日小集拨出一件可售实货','Set aside one real item for the autumn fair'),step('marketDisplay','market','playerStall','摆好摊位，选陈列与招呼方式','Arrange the stall and choose how to welcome visitors', [pair('留空让客人试提','Leave room for hands-on inspection'),pair('把工艺留样放在前排','Put the craft sample at the front')]),step('marketSell','market','playerStall','当面交货，收回秋集货款','Deliver the item and receive the fair payment'),step('marketClose','market','playerStall','核收条与售后约定，结清班费','Check the receipt, aftercare and shift fee')]},
{title:pair('后堂留下的灯','The Lamp Left in the Back Hall'),text:pair('母亲提起那只食盒。「路都认得许多了，有没有一条，是一家人不赶交期走的？」','Mother lifts the food box. “We know so many roads. Is there one we might walk without a delivery deadline?”'),steps:[step('tripPlan','hall','mealTable','约一天出游，选路线与留守权限','Choose a family outing and limits for the shop'),step('tripDepart','hall','mealTable','点清食物与托管上限，再出门','Check the meal and the finite shop allowance'),step('tripActivity','foothill','shelter','与家人停一停，做一件闲事','Linger with the family and do something without a price'),step('tripReturn','generalStore','v3Desk','回铺核对留守记录与余货','Return to check the shop record and remaining goods')]},
{title:pair('不是所有事都要等你','Not Everything Must Wait for You'),text:pair('小满把三张纸摊开。能做的一件已办好；须问的仍夹在中间；先停的那页没有被撕掉。','Xiaoman lays out the three slips. One permitted task is done. The question awaits you. The stopped task remains recorded.'),steps:[step('handover','guild','v4Ledger','由伙伴复述授权边界，再交接','Have each partner repeat their limits before handover'),step('settle','generalStore','v3Desk','当面结清工时，保留暂停原因','Settle the work and retain reasons for pauses')]},
{title:pair('来年的那一页','The Page for Next Year'),text:pair('祖父把新簿留了一页空白。「今年写得满，不必急着把来年也写满。」','Grandfather leaves a blank page. “This year is full. We need not fill next year tonight.”'),steps:[step('decorate','backHall','v4Desk','从真正在家中的物件选一件陈列','Display an object the family truly owns'),step('year','backHall','v4Lamp','挑一段经历，与家人翻到来年','Choose a memory and turn to next year together')]}
];
const order=chapters.map((_,i)=>'S5_'+String(i+1).padStart(2,'0')),titles={},steps={},rewards={},rows={};
chapters.forEach((c,i)=>{const id=order[i];titles[id]=c.title[0];steps[id]=c.steps.map(r=>{rows[r.key]=r;return ['season5_'+r.key,r.label[0]]});rewards[id]=[0,'这段共事与家人的经历已记入岁序簿。'];});
const fresh=()=>({choices:{},ledger:[],plans:{},apprentice:null,prototype:null,fair:null,trip:null,display:null});
const first=s=>{const i=order.findIndex(id=>s.quests[id]?.status==='ACTIVE');return chapters[i]?.steps.find(r=>!s.flags['season5_'+r.key])||null;};
const canStart=s=>!!s.flags.volume4Complete&&!s.season5;
const record=(s,zh,en)=>s.season5.ledger.push({tick:s.worldTick,zh,en});
const target=(s,k)=>{const r=rows[k];if(!r)return null;if(k==='tripActivity'&&s.season5?.trip)return routes[s.season5.trip.route];return [r.scene,r.object];};
const routes=[['foothill','shelter'],['coast','coastBoard'],['village','villager']];
const jobs={mother:{cost:{herb:2},minutes:30,fee:2,out:{driedHerb:1}},xiaoman:{cost:{bamboo:2},minutes:30,fee:3,out:null},boat:{cost:{},minutes:45,fee:3,out:null}};
function act(s,name,p,h){
 const {requireThat:need,requireScene:at,spend,give,available,log}=h;
 need(p.sequence===s.revision,'记录已更新，请重新查看。');
 function work(minutes,energy){need(s.stamina>=energy,'体力不足，先去卧房休息。');need(s.worldTick%1440+minutes<=1320,'这一段工时会越过夜深，请明日再来。');s.stamina-=energy;s.worldTick+=minutes;}
 function pay(n,why){need(s.coins-n>=(s.story2?.reserve||0),'保留家用后现钱不足，可先售余货再来。');s.coins-=n;log(s,'seasonWork',-n,why);}
 if(name==='seasonStart'){at(s,'backHall');need(canStart(s),'先完成第四卷后堂家书。');s.season5=fresh();s.flags.season5Started=true;order.forEach((id,i)=>s.quests[id]={status:i?'LOCKED':'ACTIVE'});record(s,'秋风翻过旧账，李家开始商量怎样把日子长久过下去。','Autumn turns the ledger; the family begins planning a lasting life.');return;}
 const t=s.season5;need(t,'先到后堂翻开岁序簿。');
 if(name==='seasonTakeDisplay'){
  at(s,'backHall');need(t.display?.placed,'这里还没有陈列物件。');const id=t.display.item;
  if(!['teachingSample','prototype'].includes(id)){give(s,{[id]:1});if(['duckStone','grassHopper'].includes(id)&&s.children)delete s.children.places[id];}
  t.display=null;record(s,'把陈设物收好，仍由原来的主人保管。','The keepsake is put away and remains with its owner.');return;
 }
 const r=first(s);need(r,'本卷已经写完，可以回看共事记录。');const key=r.key;
 at(s,target(s,key)[0]);
 if(name==='seasonTripReplan'){
   need(key==='tripDepart'&&t.trip&&!t.trip.departed,'已出门的安排不能追改。');
   need(Number.isInteger(p.route)&&routes[p.route]&&typeof p.delegate==='boolean','先选路线与留守安排。');t.trip.route=p.route;t.trip.delegate=p.delegate;
   record(s,'出门前改约，尚未支取食物、货物或工钱。','The outing is revised before departure; no food, goods or wages have been taken.');return;
 }
 if(name==='seasonPatch'){
   need(['loadTest','carryTest','stackTest','openTest'].includes(key)&&t.prototype,'先做出试样。');
   need(!t.prototype.patched,'这件试样已加固，可重新试验。');spend(s,{bamboo:1});work(10,1);t.prototype.patched=true;record(s,'试样添一根竹材加固，保留原来未过的验记。','One bamboo reinforces the sample; the earlier failed test remains in the record.');return;
 }
 need(name==='seasonStep'&&p.key===key,'先完成岁序簿中眼前的事项。');
 if(r.options){need(Number.isInteger(p.choice)&&r.options[p.choice],'先选一种安排。');t.choices[key]=p.choice;}
 const person={motherPlan:'mother',motherDo:'mother',xiaomanPlan:'xiaoman',xiaomanDo:'xiaoman',boatPlan:'boat',boatDo:'boat'}[key];
 if(person){
   const j=jobs[person];
   if(key.endsWith('Plan')){t.plans[person]={approved:true,done:false};record(s,'双方约好工时、报酬和权限，未开工前仍可改约。','Time, wages and authority are agreed; terms may be revised before work.');}
   else{need(t.plans[person]?.approved&&!t.plans[person].done,'先当面确认共事安排。');spend(s,j.cost);pay(j.fee,'伙伴共事 · '+person);work(j.minutes,2);if(j.out)give(s,j.out);t.plans[person].done=true;record(s,'约好的共事已完成，工钱实付、材料实扣，成品归李家。','The agreed work is done: wages paid, materials used, output owned by the Li household.');}
 }else switch(key){
 case 'review':need(!s.story4?.repeat,'公所还有未结续单，请先结清再翻年度账。');break;
 case 'reserve':spend(s,{ingredient:1});t.familyFood=1;record(s,'一份食材留给出游饭食，从行囊转入家中留食。','One ingredient moves from the satchel to the family meal reserve.');break;
 case 'apprenticePlan':spend(s,{bamboo:3,rope:1});pay(4,'师傅合做工钱');t.apprentice={materials:{bamboo:3,rope:1},minutes:0,fee:4,stage:0,claimed:false};break;
 case 'select':work(10,1);t.apprentice.stage=1;t.apprentice.minutes+=10;break;
 case 'teach':work(15,2);t.apprentice.stage=2;t.apprentice.minutes+=15;break;
 case 'correct':work(10,1);t.apprentice.stage=3;t.apprentice.minutes+=10;break;
 case 'claim':need(t.apprentice?.stage===3&&!t.apprentice.claimed,'先选料、示范并复验。');t.apprentice.claimed=true;t.teachingSample=true;give(s,{narrowBasket:1});record(s,'首件练习留样不售；合做的合格篓一件交还李家。','The first practice sample stays off sale; one sound jointly made basket returns to the household.');break;
 case 'prototype':{
  const c=p.config;need(c&&['thick','divider','handle','motif'].every(k=>typeof c[k]==='boolean'),'请确认食盒四处做法。');
  const cost={bamboo:2+Number(c.thick)+Number(c.divider)+Number(c.handle),rope:1};spend(s,cost);work(30,3);
  t.prototype={config:{...c},cost,tests:{},patched:false,owner:'household'};break;
 }
 case 'loadTest':case 'carryTest':case 'stackTest':case 'openTest':{
  const b=t.prototype;need(b,'先做一件试样。');work(5,1);
  const passed=b.patched||key==='openTest'||key==='loadTest'&&b.config.thick||key==='carryTest'&&!b.config.handle||key==='stackTest'&&(!b.config.divider||b.config.thick);
  b.tests[key]=passed?'passed':'adjust';
  record(s,passed?'食盒这一项实测合用，验记留底。':'食盒试验发现松动，原物仍在，添一根竹材便可加固再试。',passed?'This test passes; its record is retained.':'The sample needs adjustment. It remains intact; reinforce with one bamboo and retry.');
  if(!passed)return;
  if(key==='openTest'){s.flags.travelBoxPattern=true;record(s,'四项实测全部通过，出行食盒做法可用于制作。','All four tests pass; the travelling food-box pattern is ready for production.');}
  break;
 }
 case 'maintenance':spend(s,{wood:1});work(15,2);break;
 case 'marketPack':{
  if(p.item==='skip'){t.fair={item:null,held:0,sold:0,gross:0,closed:false,skipped:true};record(s,'本次不办小集，改为熟客试样与家人回顾，不拨货、不虚构成交。','This fair is deferred in favour of sample discussion; no goods or sales are invented.');break;}
  const item=p.item;need(['driedHerb','narrowBasket','bambooWare','shellCraft','travelBox'].includes(item)&&available(s,item)>=1,'先带一件可出售实货。');spend(s,{[item]:1});t.fair={item,held:1,sold:0,gross:0,closed:false};break;
 }
 case 'marketDisplay':if(t.fair?.skipped){t.fair.display=p.choice;break;}need(t.fair?.held===1,'先拨一件实货到秋集摊位。');work(10,1);t.fair.display=p.choice;break;
 case 'marketSell':{const f=t.fair;if(f?.skipped){record(s,'只听熟客试用意见，样品不出售。','Only sample feedback is recorded; no sale takes place.');break;}need(f&&f.held===1&&!f.sold,'这件货已经交付。');const price=h.prices[f.item];need(Number.isInteger(price)&&price>0,'货目价格尚待核对。');f.held=0;f.sold=1;f.gross=price;s.coins+=price;log(s,'autumnFair',price,'秋日小集实物售出',f.item);break;}
 case 'marketClose':if(t.fair?.skipped){t.fair.closed=true;break;}need(t.fair?.sold===1&&!t.fair.closed,'先完成这件实货买卖。');pay(2,'秋日小集一班摊务费用');t.fair.closed=true;break;
 case 'tripPlan':{
  need(Number.isInteger(p.route)&&routes[p.route]&&typeof p.delegate==='boolean','请选择出游路线与留守安排。');
  t.trip={route:p.route,delegate:p.delegate,departed:false,returned:false,escrow:0,proceeds:0,activity:false};break;
 }
 case 'tripDepart':{
  const v=t.trip;need(v&&!v.departed&&t.familyFood===1,'先约好路线并留一份家中食材。');
  spend(s,{rice:1,wood:1});t.familyFood=0;v.meal=true;
  if(v.delegate){need(available(s,'driedHerb')>=1,'委托只售一份干药，行囊不足；可回家议约，改成歇铺。');spend(s,{driedHerb:1});pay(2,'出游留守一班工钱');v.escrow=1;}
  v.departed=true;record(s,v.delegate?'只授权售出这一份干药；不接新单，不动其他货。':'今日歇铺，不支取任何铺货。',v.delegate?'Only this one dried-herb parcel is authorised for sale. No new orders or other stock.':'The shop rests today; no stock may be taken.');break;
 }
 case 'tripActivity':need(t.trip?.departed,'先与家人一起出门。');need(Number.isInteger(p.activity)&&p.activity>=0&&p.activity<3,'挑一件想同家人一起做的闲事。');work(30,0);t.trip.activity=true;t.trip.activityChoice=p.activity;t.trip.meal=false;record(s,['一家人坐下来分饭，慢慢说完一顿闲话。','与祖父认路边草木，母亲把叶形描在纸角。','陪父亲沿路慢走，不谈交期，也不急着折返。'][p.activity],['The family shares a quiet meal and an unhurried conversation.','You study roadside plants with Grandfather as Mother sketches a leaf.','You walk with Father without delivery dates or a rush to turn back.'][p.activity]);break;
 case 'tripReturn':{
  const v=t.trip;need(v?.activity&&!v.returned,'先走到选定地方，陪家人停一停。');
  if(v.delegate){need(v.escrow===1,'留守货物记录不符，先暂停核对。');v.escrow=0;v.proceeds=h.prices.driedHerb;s.coins+=v.proceeds;log(s,'familyTrip',v.proceeds,'留守只售出授权的一份干药');}
  v.returned=true;record(s,'出游归来，授权货、余货、工钱与待问事项逐项核清。','On return, authorised goods, untouched stock, wages and pending questions are reconciled.');break;
 }
 case 'decorate':{
  const id=p.item;
  need(['duckStone','grassHopper','ledgerCopy','teachingSample','prototype'].includes(id),'请选择已有纪念物。');
  need(id==='teachingSample'?t.teachingSample:id==='prototype'?!!t.prototype:available(s,id)>=1,'这件物件还未在家中，不能凭空陈列。');
  if(!['teachingSample','prototype'].includes(id))spend(s,{[id]:1});
  if(['duckStone','grassHopper'].includes(id)){need(s.children?.gifts[id]&&!s.children.places[id],'先把这件童物从原来的地方收回。');s.children.places[id]='backHall';}
  t.display={item:id,placed:true};record(s,'一件真实经历留下的物件安放在后堂。','An object from a real shared experience finds a place in the back hall.');break;
 }
 case 'year':need(Number.isInteger(p.memory)&&p.memory>=0&&p.memory<6,'选一段想回看的经历。');t.memory=p.memory;s.flags.season5Complete=true;break;
 }
 if(!['loadTest','carryTest','stackTest','openTest'].includes(key))record(s,r.label[0],r.label[1]);
 s.flags['season5_'+key]=true;
}
function normalise(s,need){
 const t=s.season5;if(!t){need(!s.flags.season5Started&&!s.flags.season5Complete,'岁序簿缺页。');return;}
 need(s.flags.volume4Complete&&s.flags.season5Started&&t.choices&&t.plans&&Array.isArray(t.ledger),'岁序簿缺页。');
 const ix=order.findIndex(id=>s.quests[id]?.status!=='COMPLETED');
 order.forEach((id,i)=>{need(s.quests[id]?.status===(ix<0||i<ix?'COMPLETED':i===ix?'ACTIVE':'LOCKED'),'岁序章节次序有误。');if(ix<0||i<ix)need(steps[id].every(([k])=>s.flags[k]),'岁序章节步骤缺页。');});
 need(!!s.flags.season5Complete===(ix<0),'岁序结卷记录无效。');
 need(t.ledger.every(e=>Number.isFinite(e.tick)&&typeof e.zh==='string'&&typeof e.en==='string'),'岁序记录无效。');
 if(t.trip)need(routes[t.trip.route]&&typeof t.trip.delegate==='boolean'&&[0,1].includes(t.trip.escrow),'出游托管记录无效。');
 if(t.fair)need([0,1].includes(t.fair.held)&&[0,1].includes(t.fair.sold)&&(t.fair.skipped?t.fair.held+t.fair.sold===0:t.fair.held+t.fair.sold===1),'秋集实货记录不符。');
}
return {chapters,order,titles,steps,rewards,rows,first,target,canStart,act,normalise,jobs,routes};
});

if(typeof window!=='undefined'){
 const dictionary=window.NANLAN_EN||(window.NANLAN_EN={});
 for(const c of window.NanlanSeason5.chapters){dictionary[c.title[0]]=c.title[1];dictionary[c.text[0]]=c.text[1];for(const r of c.steps){dictionary[r.label[0]]=r.label[1];for(const o of r.options||[])dictionary[o[0]]=o[1];}}
 Object.assign(dictionary,{'岁序长青':'Enduring Seasons','岁序簿 · 家人与伙伴':'Season Book · Family and Friends','出行食盒':'Travelling Food Box','制作出行食盒':'Make a Travelling Food Box','快速抵达 · 已走过的地方':'Travel Quickly · Visited Place','这次怎样前往？':'How Will You Travel?','沿路走去 · 可随时采集':'Walk the Road · Stop to Gather','点击选择沿路行走或快行':'Choose Walking or Quick Travel','第一次请沿路走到，之后就能快行。':'Walk there once to unlock quick travel.','已选择：':'Selected: ','岁序长青 · 查看共事与试样':'Enduring Seasons · Work and Samples','回后堂，与家人翻开岁序簿':'Return to the back hall and open the season book','后堂秋风翻账，母亲和伙伴们等你商量下一年的日子。':'Family and friends are waiting in the back hall to plan the coming year.'});
}
