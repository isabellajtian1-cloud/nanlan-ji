/* 南街灯起：story state and commerce share the engine's atomic save boundary. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;else root.NanlanStoryModel=factory;})(typeof globalThis!=='undefined'?globalThis:this,function(h){
  'use strict';
  const {copy,requireThat:need,requireScene:at,expectQuest:quest,spend,give,once,log,clock}=h;
  const order=['V2_01','V2_02','V2_03','V2_04','M12','V2_06','V2_07','V2_08','V2_09','V2_10','V2_11','M18','V2_13','V2_14','V2_15','V2_16','V2_17','V2_18'];
  const names=['家宴后的一张铺讯','南街三时','两扇铺门','纸上先算一遍','南街有间空铺','林师傅的尺','一车货 两处账','谁站在第一排','开门之前','第一位客人','午后的一笔大单','南街第一盏灯','隔壁也卖竹篮','熟客的一次空手来','县集前的两张订单','南澜来的货','灯下再分一回工','一街灯火'];
  const taskFlags=[
    [['v2Entry','与家人读铺讯'],['v2ReserveSet','商议开店预算与生活保留']],
    [['v2ObserveMorning','亲访南街早市'],['v2ObserveNoon','亲访南街午间'],['v2ObserveAfternoon','亲访南街午后']],
    [['v2InspectEast','查验榕荫铺的窗墙与通路'],['v2InspectWest','查验桥口铺的门面与陈列'],['v2ShopSelected','比较后确定候选铺面']],
    [['v2PlanRecorded','与家人商议主打制品'],['v2BudgetPlan','核对租约、修缮与转运预算']],
    [['v2LeaseSigned','与郑掌柜确认完整条款并签约']],
    [['v2Repaired','请林师傅检修柜架'],['v2Decorated','试走通道，选择货架布局'],['v2Sign','亲手挂好铺号']],
    [['v2PackingDone','在旧宅仓房装好首批实货'],['v2ShipmentSent','选择班次，实际付费发车'],['v2ShipmentReceived','在铺内清点签收到货']],
    [['v2DisplayChosen','确定门前主打陈列'],['v2HoldChosen','安排午后留货或全量可售']],
    [['v2PriceConfirmed','核对成本并确认价格'],['v2Opened','亲手开门迎客']],
    [['v2CustomerHeard','听镇集旧客说起窄篮'],['v2FirstSale','在柜台完成真实成交']],
    [['v2BulkResolved','核对库存并答复行商的大单']],
    [['v2FirstCounted','真实闭店，核对现金与余货'],['v2ShopLamp','走到门前点亮灯笼']],
    [['v2NeighborHeard','与陆掌柜谈相似商品'],['v2CompetitionPlan','确定价格、改良或转介安排']],
    [['v2RegularAgreed','与熟客约好商品和付款'],['v2RegularFulfilled','交付实际预留的货物']],
    [['v2CapacityPlanned','按材料和产能回复两张订单'],['v2BatchDelivered','完成实际生产与订单交付']],
    [['v2SupplyTerms','与村中供货者谈规格和结算'],['v2SupplyReceived','实际验收并支付货款']],
    [['v2RosterPlanned','回家商议接待、补货与记账分工']],
    [['v2Cooperated','兑现一次邻铺互相转介'],['v2ThreeDays','完成三个不同营业日的真实闭账'],['v2FamilyEnd','与家人确定下一阶段方向']]
  ];
  const titles={},steps={},rewards={};
  order.forEach((id,i)=>{titles[id]=names[i];steps[id]=taskFlags[i];rewards[id]=[0,['留下家计安排','客流札记可回看','两铺的缺陷与草图保留','筹备单可回看','租约与铺钥匙保留','柜架和铺号可用','到货凭单入账','陈列与留货可调整','铺面正式迎客','旧日意见得到回应','交期和承诺已记录','首日账目与门灯保留','经营方向留下回响','熟客的约定已履行','交付凭单入账','稳定补货关系建立','家人分工写入存档','第二卷完成 · 日常经营继续'][i]];});
  const products=h.products.concat('narrowBasket');
  const shops={
    east:{name:'榕荫铺',rent:30,deposit:20,repair:{wood:3,bamboo:2,stone:2},text:'街坊多、租金较低；窗脚返潮，柜架要检修。'},
    west:{name:'桥口铺',rent:45,deposit:30,repair:{wood:2,bamboo:1,stone:1},text:'路过客人多、租金较高；门面显眼，通道与取货更要留意。'}
  };
  const slots={morning:{minute:570,flag:'v2ObserveMorning',label:'早市',text:'街坊提着菜篮来往，问的是价钱和装菜是否顺手。'},noon:{minute:780,flag:'v2ObserveNoon',label:'午间',text:'匠工停下来挑耐用的物件；架上拿取是否方便，也会左右选择。'},afternoon:{minute:930,flag:'v2ObserveAfternoon',label:'午后',text:'行商喜欢轻便、能按期带走的货；人多的时候，未必人人都会买。'}};
  const round=n=>Math.round((n+Number.EPSILON)*100)/100;
  const validCount=n=>Number.isInteger(n)&&n>=0&&n<1000000;
  const record=o=>o&&typeof o==='object'&&!Array.isArray(o);
  function emptyShop(){return {stock:{},cost:{},featured:'bambooWare',revenue:0,sold:0,customerDay:0,served:0,tiers:{},holds:{},reserved:{}};}
  function emptyStory(){return {version:1,reserve:0,site:null,contract:null,cargo:{},cargoCosts:{},shipment:null,shipments:[],days:{},closings:[],orders:{},capital:0,observations:[],legacy:null};}
  function baseCost(item){const r=h.recipes[item];return r?.cost?Object.entries(r.cost).reduce((n,[k,q])=>n+(h.prices[k]||1)*q,0):(h.prices[item]||1);}
  function basePrice(s,item){return h.prices[item]+(products.includes(item)?4:1)+(s.flags.v2MotherPlan&&s.shop.featured===item?2:0);}
  function price(s,item){return Math.max(baseCost(item),basePrice(s,item)+([-2,0,3][s.shop?.tiers?.[item]??1]));}
  function stockAvailable(s,item){return Math.max(0,(s.shop.stock[item]||0)-(s.shop.holds[item]||0)-(s.shop.reserved[item]||0));}
  function customers(s){return Math.max(0,6-(s.shop?.customerDay===clock(s).day?s.shop.served:0));}
  function day(s){const id=String(clock(s).day);return s.story2.days[id]??={day:clock(s).day,sales:0,cost:0,quantity:0,expenses:0,closed:false,cashAtOpen:s.coins,rentAtOpen:s.story2.contract?.dailyRent||0,wearAtOpen:s.story2.capital/30};}
  function summary(s,requestedDay=clock(s).day){const d=s.story2.days[String(requestedDay)],rent=d?.rentAtOpen??(s.story2.contract?.dailyRent||0),wear=d?.wearAtOpen??s.story2.capital/30;
    return {day:d||null,rent:round(rent),wear:round(wear),profit:d?round(d.sales-d.cost-d.expenses-rent-wear):0,stockValue:round(Object.entries(s.shop.stock).reduce((n,[k,q])=>n+q*(s.shop.cost[k]??baseCost(k)),0)),closedDays:s.story2.closings.length};}
  function validateMap(m,keys,integers=true){need(record(m),'第二卷记录缺失。');for(const [k,n]of Object.entries(m))need(keys.includes(k)&&Number.isFinite(n)&&n>=0&&n<1e6&&(!integers||Number.isInteger(n)),'第二卷货物或金额无效。');}
  function normalise(s){
    const started=!!s.flags.volume2Started,legacy=started&&s.story2?.version!==1;
    if(!s.shop){need(!started,'铺面库存缺失。');s.shop=emptyShop();}
    const shop=s.shop;
    validateMap(shop.stock,Object.keys(h.prices));
    if(!s.story2){
      s.story2=emptyStory();
      if(legacy){s.story2.legacy={complete:!!s.flags.volume2Complete,quests:copy(Object.fromEntries(['M12','V21','M18','V22','V23','V24'].map(id=>[id,s.quests[id]||null])))};s.flags.volume2Complete=false;
        order.forEach(id=>{s.quests[id]={status:'LOCKED'};});s.quests.V2_01.status='ACTIVE';
        if(s.flags.v2Leased){s.story2.site='east';s.story2.contract={name:'旧版首季租约',rent:40,deposit:0,dailyRent:0,legacy:true,repair:'self'};s.flags.v2LeaseSigned=true;s.flags.v2ShopSelected=true;s.quests.M12.status='COMPLETED';}
        s.journal.push({id:'卷二续篇',text:'旧版租约、库存、营业记录和完成纪念已保留。新增剧情从家议接续，旧租金不重复收取。'});
        s.lastNotice='已接续新版第二卷：旧租金、库存和销售记录保留，新增故事从正厅家议开始。';
      }
    }
    need(s.story2.version===1,'第二卷剧情版本无效。');
    for(const key of ['cost','tiers','holds','reserved'])if(!shop[key])shop[key]={};
    for(const [item,q]of Object.entries(shop.stock))if(q&&!Number.isFinite(shop.cost[item]))shop.cost[item]=baseCost(item);
    validateMap(shop.cost,Object.keys(h.prices),false);validateMap(shop.tiers,Object.keys(h.prices));validateMap(shop.holds,Object.keys(h.prices));validateMap(shop.reserved,Object.keys(h.prices));
    for(const k of Object.keys(h.prices)){need((shop.tiers[k]??1)<=2,'售价档位无效。');need((shop.holds[k]||0)+(shop.reserved[k]||0)<=(shop.stock[k]||0),'铺内预留超出实货。');}
    const t=s.story2;
    need(Number.isFinite(t.reserve)&&t.reserve>=0&&Number.isFinite(t.capital)&&t.capital>=0,'第二卷预算无效。');
    t.cargoCosts??={};validateMap(t.cargoCosts,Object.keys(h.prices),false);validateMap(t.cargo,Object.keys(h.prices));need(record(t.days)&&record(t.orders)&&Array.isArray(t.closings)&&Array.isArray(t.shipments)&&Array.isArray(t.observations),'第二卷账册无效。');
    need(t.site===null||Object.hasOwn(shops,t.site),'铺面选择无效。');
    if(t.contract)need(record(t.contract)&&Number.isFinite(t.contract.rent)&&t.contract.rent>=0&&Number.isFinite(t.contract.deposit)&&t.contract.deposit>=0&&Number.isFinite(t.contract.dailyRent)&&t.contract.dailyRent>=0&&['self','owner'].includes(t.contract.repair),'租约无效。');
    if(t.shipment){need(record(t.shipment)&&Number.isFinite(t.shipment.eta)&&Number.isFinite(t.shipment.fee)&&t.shipment.fee>=0,'转运凭单无效。');validateMap(t.shipment.items,Object.keys(h.prices));if(t.shipment.costs)validateMap(t.shipment.costs,Object.keys(h.prices),false);}
    for(const d of Object.values(t.days)){need(record(d)&&validCount(d.day)&&Number.isFinite(d.sales)&&d.sales>=0&&Number.isFinite(d.cost)&&d.cost>=0&&validCount(d.quantity)&&Number.isFinite(d.expenses)&&d.expenses>=0&&Number.isFinite(d.cashAtOpen)&&typeof d.closed==='boolean','营业日记录无效。');d.rentAtOpen??=t.contract?.dailyRent||0;d.wearAtOpen??=t.capital/30;need(Number.isFinite(d.rentAtOpen)&&d.rentAtOpen>=0&&Number.isFinite(d.wearAtOpen)&&d.wearAtOpen>=0,'营业日分摊记录无效。');}
    need(t.closings.every(n=>validCount(n)&&t.days[n]?.closed)&&new Set(t.closings).size===t.closings.length,'闭店记录无效。');
    for(const o of Object.values(t.orders)){need(record(o)&&Object.hasOwn(h.prices,o.item)&&validCount(o.quantity)&&o.quantity>0&&validCount(o.delivered)&&o.delivered<=o.quantity&&Number.isFinite(o.unitPrice)&&o.unitPrice>=0&&Number.isFinite(o.deposit)&&o.deposit>=0&&o.deposit<=o.quantity*o.unitPrice,'订单记录无效。');}
    const sample=t.orders.silkSample;
    if(sample)need(sample.item==='fineSilk'&&[2,3].includes(sample.quantity)&&validCount(sample.held)&&sample.held<=sample.quantity&&!((shop.reserved.fineSilk||0)<sample.held)&&validCount(sample.expires),'订单记录无效。');
    for(const key of ['revenue','sold','customerDay','served'])need(validCount(shop[key]),'铺面账目无效。');
    need(shop.served<=6&&products.includes(shop.featured),'铺面陈列无效。');
    return s;
  }
  function reconcile(s){if(!s.flags.volume2Started)return;expireSample(s);s.flags.v2ThreeDays=s.story2.closings.length>=3;}
  function leaseQuote(s,choice){const a=shops[s.story2.site||'east'];need(['self','owner','trial'].includes(choice),'请选择完整租约。');const rent=choice==='owner'?a.rent+12:choice==='trial'?a.rent-5:a.rent,period=choice==='trial'?14:30,deposit=s.story2.site==='east'&&h.rural.rank(s)===2?0:a.deposit;return {name:a.name+' · '+({self:'自修低租',owner:'房东修补',trial:'短期试租'}[choice]),rent,deposit,period,dailyRent:rent/period,repair:choice==='owner'?'owner':'self',total:rent+deposit};}
  function advance(s,tick){s.worldTick=Math.max(s.worldTick,tick);if(clock(s).minute>1320)s.worldTick=Math.floor(s.worldTick/1440+1)*1440+360;}
  function addStock(s,item,q,cost){const n=s.shop.stock[item]||0;s.shop.cost[item]=(n*(s.shop.cost[item]??baseCost(item))+q*cost)/(n+q);s.shop.stock[item]=n+q;}
  function sale(s,item,q,unit,kind,reserved=false){
    need(reserved?(s.shop.reserved[item]||0)>=q:stockAvailable(s,item)>=q,'可售实货不足；请补货或查看预留。');const d=day(s);need(!d.closed,'今日已闭店，请回卧房睡一夜，明日再营业。');
    const cost=(s.shop.cost[item]??baseCost(item))*q;s.shop.stock[item]-=q;if(reserved)s.shop.reserved[item]-=q;
    bookSale(s,item,q,unit,cost,kind);
  }
  function bookSale(s,item,q,unit,cost,kind){
    const d=day(s);need(!d.closed,'今日已闭店，请回卧房睡一夜，明日再营业。');
    if(item==='rawSilk'&&kind==='shopSale')d.rawSilkSold=(d.rawSilkSold||0)+q;
    const total=unit*q;
    d.sales=round(d.sales+total);d.cost=round(d.cost+cost);d.quantity+=q;s.shop.revenue+=total;s.shop.sold+=q;s.coins+=total;log(s,kind,total,'南街 '+h.itemNames[item]+' ×'+q+'（单价 '+unit+' 文）',item);give(s,{receipt:1});s.flags.v2FirstSale=true;
  }
  function closeDay(s,requestedDay=clock(s).day){need(Number.isInteger(requestedDay)&&requestedDay>0&&requestedDay<=clock(s).day,'请选择已经发生的营业日。');const d=s.story2.days[String(requestedDay)];need(d&&d.quantity>0,'该日需有真实交付后才能盘点。');need(!d.closed,'这一营业日已经结算。');const result=summary(s,requestedDay);d.rent=result.rent;d.wear=result.wear;d.profit=result.profit;d.closed=true;s.story2.closings.push(d.day);s.flags.v2FirstCounted=true;log(s,'shopClose',0,'第'+d.day+'日闭账：收入'+d.sales+'，商品成本'+round(d.cost)+'，费用分摊'+round(d.rent+d.wear+d.expenses)+'，经营结果'+d.profit+'文；预付租金不重复扣款');if(requestedDay===clock(s).day)advance(s,(clock(s).day-1)*1440+1080);}
  function familyAtShop(s,person){const j=s.story3?.shift;if(j&&s.worldTick>=j.start&&s.worldTick<j.end&&j.person===person)return true;return !!(s.flags.v2RosterPlanned&&s.choices.shopRoster===(person==='mother'?'motherStore':'playerStore')&&clock(s).minute>=540&&clock(s).minute<1080&&!s.story2.days[String(clock(s).day)]?.closed);}
  const farmGoods=['rawSilk','fineSilk','pondFish'];
  function blend(costs,id,old,q,unit){if(farmGoods.includes(id))costs[id]=(old*(costs[id]??baseCost(id))+q*unit)/(old+q);}
  function expireSample(s){
    const t=s.story2,o=t.orders.silkSample;
    if(o&&!o.delivered&&clock(s).day>=o.expires){
      s.shop.reserved.fineSilk=(s.shop.reserved.fineSilk||0)-(o.held||0);delete t.orders.silkSample;
    }
  }
  function cabinetPlan(s){const days=Object.values(s.story2.days).filter(d=>d.rawSilkSold);return !!s.story2.sampleFulfilled&&days.length>=2&&days.reduce((total,d)=>total+d.rawSilkSold,0)>=4;}
  function act(s,name,p){
    const f=s.flags,t=s.story2,shop=s.shop;
    const fresh=()=>need(p.sequence===s.revision,'这份记录已更新，请重新查看后确认。');
    if(name==='v2Start'){at(s,'hall');need(h.done(s,'M20'),'请先完成 M20 岁末家宴。');return once(s,'v2Start',()=>{f.volume2Started=true;f.volume2Complete=false;f.v2Entry=true;order.forEach(id=>s.quests[id]={status:id===order[0]?'ACTIVE':'LOCKED'});s.journal.push({id:'卷二',text:'母亲拿出铺讯：“先看看，什么人会来买。”'});});}
    need(f.volume2Started,'先完成第一卷，再到正厅开启第二卷。');
    expireSample(s);
    if(['v2SampleAccept','v2SampleReserve','v2SampleDeliver','v2SilkCabinet'].includes(name)){
      at(s,'generalStore');fresh();need(f.v2Opened,'铺面开张后再来接样单。');
      const today=clock(s).day;
      if(name==='v2SilkCabinet'){
        need(!t.silkCabinet&&cabinetPlan(s),'再过两日看看售丝记录和交过的样单。');
        need(s.coins-8>=t.reserve,'请留足家用。');spend(s,{wood:2,bamboo:2});s.coins-=8;
        t.capital+=8+2*baseCost('wood')+2*baseCost('bamboo');log(s,'cabinet',-8,'制防潮丝样柜');t.silkCabinet=true;return;
      }
      if(name==='v2SampleAccept'){
        need(!t.lastSampleDay||today>=t.lastSampleDay+3,'行商过几日才再取样。');
        need(!t.orders.silkSample||t.orders.silkSample.delivered,'先了结手中这张样单。');
        need(p.quantity===2||p.quantity===3&&t.silkCabinet,'请按柜上可陈列的数量接单。');
        t.orders.silkSample={item:'fineSilk',quantity:p.quantity,delivered:0,unitPrice:28,deposit:0,expires:today+3,held:0};t.lastSampleDay=today;
      }
      const o=t.orders.silkSample;need(o&&!o.delivered,'没有待交的匀丝样单。');
      const n=Math.min(o.quantity-o.held,stockAvailable(s,'fineSilk'));
      if(name==='v2SampleReserve')need(n>0,'还没有可追加预留的特级丝。');
      o.held+=n;shop.reserved.fineSilk=(shop.reserved.fineSilk||0)+n;
      if(name==='v2SampleDeliver'){
        need(o.held===o.quantity,'先把约好的特级丝运到柜上。');sale(s,o.item,o.quantity,o.unitPrice,'silkSample',true);
        o.held=0;o.delivered=o.quantity;t.sampleFulfilled=true;
      }
      return;
    }
    if(name==='v2ReadNotice'){quest(s,'V2_01');at(s,'hall');f.v2Entry=true;return;}
    if(name==='v2Reserve'){at(s,'hall');need(['cautious','flexible'].includes(p.choice),'请选择家计安排。');t.reserve=p.choice==='cautious'?Math.floor(s.coins*.25):0;f.v2ReserveSet=true;s.choices.shopReserve=p.choice;return;}
    if(name==='v2Observe'){quest(s,'V2_02');at(s,'county');const a=slots[p.slot];need(a,'请选择实际观察时段。');return once(s,a.flag,()=>{let tick=(clock(s).day-1)*1440+a.minute;if(tick<s.worldTick)tick+=1440;advance(s,tick);t.observations.push({slot:p.slot,tick:s.worldTick,text:a.text});f[a.flag]=true;});}
    if(name==='v2Inspect'){quest(s,'V2_03');at(s,'county');need(Object.hasOwn(shops,p.site),'请选择铺面。');f[p.site==='east'?'v2InspectEast':'v2InspectWest']=true;return;}
    if(name==='v2SelectShop'){quest(s,'V2_03');at(s,'county');need(f.v2InspectEast&&f.v2InspectWest,'先亲自查验两间铺子。');need(Object.hasOwn(shops,p.site),'请选择铺面。');need(!f.v2Leased||t.site===p.site,'旧租约继续有效，本次保留已经租用的铺面。');t.site=p.site;f.v2ShopSelected=true;s.choices.shopSite=p.site;return;}
    if(name==='v2Plan'){quest(s,'V2_04');at(s,'hall');need(products.includes(p.product),'请选择熟悉的制品。');shop.featured=p.product;f.v2PlanRecorded=true;return;}
    if(name==='v2Budget'){quest(s,'V2_04');at(s,'hall');need(f.v2PlanRecorded,'先商议主打制品。');f.v2BudgetPlan=true;return;}
    if(name==='v2Lease'){quest(s,'M12');at(s,'county');const c=leaseQuote(s,p.choice);need(s.coins-c.total>=t.reserve,'本次需 '+c.total+' 文，另保留家用 '+t.reserve+' 文；可回家调整预算或先试摊筹钱。');return once(s,'story2Lease',()=>{s.coins-=c.total;t.contract=c;f.v2Leased=true;f.v2LeaseSigned=true;log(s,'lease',-c.rent,c.name+'：首期预付租金');log(s,'deposit',-c.deposit,'可退铺面押金，另列保管');});}
    if(name==='v2Repair'){quest(s,'V2_06');at(s,'generalStore');if(f.v2Repaired)return false;need(f.v2LeaseSigned,'先签租约。');return once(s,'story2Repair',()=>{if(t.contract.repair==='self'){const cost=shops[t.site].repair;spend(s,cost);t.capital+=Object.entries(cost).reduce((n,[id,q])=>n+baseCost(id)*q,0);}f.v2Repaired=true;});}
    if(name==='v2Decorate'){quest(s,'V2_06');at(s,'generalStore');need(f.v2Repaired,'先检修柜架。');need(['practical','herbal'].includes(p.style),'请选择布局。');s.choices.shopStyle=p.style;f.v2Decorated=true;return;}
    if(name==='v2Sign'){quest(s,'V2_06');at(s,'generalStore');if(f.v2Sign)return false;need(f.v2Decorated,'先试走通道并确定布局。');need(s.production?.shopName,'请先回书房，在祖父书案前选定字号。');return once(s,'story2Sign',()=>{spend(s,{wood:1,rope:1});t.capital+=baseCost('wood')+baseCost('rope');f.v2Sign=true;});}
    if(name==='v2Pack'||name==='v2Unpack'){at(s,'store');need(f.v2Sign,'先把铺面收拾好。');fresh();need(Object.hasOwn(h.prices,p.item),'这件物品不能装货。');need(!t.shipment,'已有一批货在途，先到店验收。');const q=p.quantity??1;need(Number.isInteger(q)&&q>0&&q<=20,'装货数量无效。');if(name==='v2Pack'){blend(t.cargoCosts,p.item,t.cargo[p.item]||0,q,s.production.costs[p.item]??baseCost(p.item));spend(s,{[p.item]:q});t.cargo[p.item]=(t.cargo[p.item]||0)+q;}else{need((t.cargo[p.item]||0)>=q,'箱中没有这些货。');blend(s.production.costs,p.item,s.bag[p.item]||0,q,t.cargoCosts[p.item]??baseCost(p.item));t.cargo[p.item]-=q;give(s,{[p.item]:q});}f.v2PackingDone=Object.values(t.cargo).reduce((n,q)=>n+q,0)>=2||f.v2ShipmentReceived;return;}
    if(name==='v2Ship'){at(s,'store');fresh();need(!t.shipment,'前批货还在路上。');need(['shared','regular'].includes(p.method),'请选择承运方式。');const count=Object.values(t.cargo).reduce((n,q)=>n+q,0),space=Object.entries(t.cargo).reduce((n,[id,q])=>n+q*(id==='narrowBasket'?2:1),0),capacity=p.method==='shared'?8:20,fee=p.method==='shared'?8:12;need(count>=(f.v2ShipmentReceived?1:2),f.v2ShipmentReceived?'先装入一件真实补货。':'首批先实际装入至少两件可售货。');need(space<=capacity,'这班车可装 '+capacity+' 格，当前 '+space+' 格；可卸回一部分或改选班次。');need(s.coins-fee>=t.reserve,'运费 '+fee+' 文，家用保留 '+t.reserve+' 文；可调整批量、先出售余货或回家调整预算。');s.coins-=fee;log(s,'freight',-fee,'村中发往南街的'+(p.method==='shared'?'拼车':'定班')+'转运');t.shipment={items:copy(t.cargo),costs:copy(t.cargoCosts),fee,eta:s.worldTick+(p.method==='shared'?90:45),id:'S'+(t.shipments.length+1)};t.cargo={};t.cargoCosts={};f.v2ShipmentSent=true;return;}
    if(name==='v2Receive'){at(s,'generalStore');fresh();need(t.shipment,'没有等待验收的转运。');advance(s,t.shipment.eta);const shipment=t.shipment,n=Object.values(shipment.items).reduce((a,b)=>a+b,0);for(const [id,q]of Object.entries(shipment.items))if(q)addStock(s,id,q,(shipment.costs?.[id]??baseCost(id))+shipment.fee/n);t.shipments.push(shipment);t.shipment=null;f.v2ShipmentReceived=true;f.v2Stocked=true;log(s,'arrival',0,'已按转运凭单签收，货物从在途转入店内');return;}
    if(name==='v2Withdraw'){at(s,'generalStore');fresh();need(stockAvailable(s,p.item)>0,'这件实货已售或已预留。');blend(s.production.costs,p.item,s.bag[p.item]||0,1,shop.cost[p.item]??baseCost(p.item));shop.stock[p.item]--;give(s,{[p.item]:1});return;}
    if(name==='v2Display'){quest(s,'V2_08');at(s,'generalStore');need(['small','signature','use'].includes(p.style),'请选择陈列方式。');s.choices.shopDisplay=p.style;f.v2DisplayChosen=true;return;}
    if(name==='v2Hold'){at(s,'generalStore');need(f.v2Sign,'先完成铺内修整。');fresh();need(Object.hasOwn(h.prices,p.item),'请选择店内商品。');const q=p.quantity??0;need(validCount(q)&&q<=(shop.stock[p.item]||0)-(shop.reserved[p.item]||0),'时段留货不能超过未承诺的实货。');shop.holds[p.item]=q;f.v2HoldChosen=true;return;}
    if(name==='v2NoHold'){at(s,'generalStore');need(f.v2Sign,'先完成铺内修整。');shop.holds={};f.v2HoldChosen=true;return;}
    if(name==='v2Price'){at(s,'generalStore');need(f.v2Sign,'先完成铺内修整。');fresh();need(Object.hasOwn(h.prices,p.item)&&[0,1,2].includes(p.tier),'请选择售价档位。');shop.tiers[p.item]=p.tier;return;}
    if(name==='v2ConfirmPrices'){quest(s,'V2_09');at(s,'generalStore');need(Object.values(shop.stock).some(n=>n>0),'先签收至少一批实货。');f.v2PriceConfirmed=true;return;}
    if(name==='v2Open'){quest(s,'V2_09');at(s,'generalStore');need(f.v2PriceConfirmed,'先核对成本与价格。');need(s.production?.shopName,'请先到书房请祖父题下字号，再开门迎客。');need(Object.values(shop.stock).some(n=>n>0),'货架暂无实货。');f.v2Opened=true;return;}
    if(name==='v2HearCustomer'){quest(s,'V2_10');at(s,'generalStore');f.v2CustomerHeard=true;return;}
    if(name==='v2NextCustomer'){at(s,'generalStore');fresh();need(f.v2Opened&&customers(s)>0,'今日没有待接待的来客。');if(shop.customerDay!==clock(s).day){shop.customerDay=clock(s).day;shop.served=0;}shop.served++;return;}
    if(name==='v2Sell'){at(s,'generalStore');fresh();need(f.v2Opened&&customers(s)>0,'今日来客已散，可备货或回卧房过夜。');need(Object.hasOwn(h.prices,p.item),'这里不能出售这件物品。');const unit=price(s,p.item);need(p.quote===unit,'报价已更新，请重新确认。');const type=shop.customerDay===clock(s).day?shop.served%3:0;need(type!==0||unit<=basePrice(s,p.item)+1||(s.choices.competition==='quality'&&p.item===shop.featured),'街坊觉得这个价偏高，暂缓购买。可以改价、介绍其他货物，或请下一位来客。');if(shop.customerDay!==clock(s).day){shop.customerDay=clock(s).day;shop.served=0;}sale(s,p.item,1,unit,'shopSale');shop.served++;return;}
    if(name==='v2Bulk'){quest(s,'V2_11');at(s,'generalStore');fresh();need(['cash','split','decline'].includes(p.choice),'请选择能兑现的答复。');const item=shop.featured;if(p.choice==='decline'){s.choices.bulk='decline';f.v2BulkResolved=true;return;}const n=Math.min(2,stockAvailable(s,item));need(n>0,'主打暂无可售现货；可先补货、解除自己的时段留货，或婉拒。');const unit=price(s,item);sale(s,item,n,unit,'bulk');s.choices.bulk=p.choice;if(p.choice==='split')t.orders.bulk={item,quantity:1,delivered:0,unitPrice:unit,deposit:0};f.v2BulkResolved=true;return;}
    if(name==='v2DeliverBulk'){at(s,'generalStore');fresh();const o=t.orders.bulk;need(o&&o.delivered<o.quantity,'这张分批单已交清。');sale(s,o.item,1,o.unitPrice,'order');o.delivered++;return;}
    if(name==='v2Close'){at(s,'generalStore');fresh();need(f.v2BulkResolved,'先回复首日行商的大单，再闭店。');closeDay(s,p.day);return;}
    if(name==='v2Lamp'){quest(s,'M18');at(s,'generalStore');need(f.v2FirstCounted,'先核对首日账目。');f.v2ShopLamp=true;s.journal.push({id:'M18灯',text:'母亲把补货单压在砚台下：“她说明日还来，带隔壁一起。”'});return;}
    if(name==='v2Neighbor'){quest(s,'V2_13');at(s,'county');f.v2NeighborHeard=true;return;}
    if(name==='v2Competition'){quest(s,'V2_13');at(s,'county');need(f.v2NeighborHeard,'先听陆掌柜与客人怎么说。');need(['price','quality','refer'].includes(p.choice),'请选择实际经营安排。');s.choices.competition=p.choice;f.v2CompetitionPlan=true;return;}
    if(name==='v2Regular'){quest(s,'V2_14');at(s,'generalStore');fresh();need(['deposit','small'].includes(p.choice),'请选择预订或分次购买。');const item=Object.keys(h.prices).find(k=>stockAvailable(s,k)>0);need(item,'请先补入至少一件可售商品。');need(!day(s).closed,'今日已打烊，明日再与熟客约定。');const unit=price(s,item),deposit=p.choice==='deposit'?Math.floor(unit/2):0;shop.reserved[item]=(shop.reserved[item]||0)+1;t.orders.regular={item,quantity:1,delivered:0,unitPrice:unit,deposit};if(deposit){s.coins+=deposit;log(s,'depositReceived',deposit,'熟客预订定金，交货前仍有履约义务',item);}f.v2RegularAgreed=true;return;}
    if(name==='v2DeliverRegular'){quest(s,'V2_14');at(s,'generalStore');fresh();const o=t.orders.regular;need(o&&o.delivered===0,'这份预订已经交付。');need(!day(s).closed,'今日已打烊，请明日交货。');sale(s,o.item,1,o.unitPrice,'order',true);if(o.deposit){s.coins-=o.deposit;log(s,'depositOffset',-o.deposit,'交货抵扣先前已收定金',o.item);}o.delivered=1;f.v2RegularFulfilled=true;return;}
    if(name==='v2Capacity'){quest(s,'V2_15');at(s,'generalStore');need(['early','split'].includes(p.choice),'请选择交期。');t.orders.batch={item:p.choice==='early'?'bambooWare':'narrowBasket',quantity:p.choice==='early'?2:1,delivered:0,unitPrice:p.choice==='early'?16:24,deposit:0};s.choices.batch=p.choice;f.v2CapacityPlanned=true;return;}
    if(name==='v2DeliverBatch'){quest(s,'V2_15');at(s,'generalStore');fresh();const o=t.orders.batch;need(o&&o.delivered<o.quantity,'这张订单已交清。');sale(s,o.item,1,o.unitPrice,'order');o.delivered++;f.v2BatchDelivered=o.delivered===o.quantity;return;}
    if(name==='v2SupplyTerms'){quest(s,'V2_16');at(s,'village');need(['standard','graded'].includes(p.choice),'请选择验收约定。');s.choices.supply=p.choice;f.v2SupplyTerms=true;return;}
    if(name==='v2SupplyReceive'){quest(s,'V2_16');at(s,'village');need(f.v2SupplyTerms,'先谈清规格和结算。');return once(s,'story2Supply',()=>{const fee=s.choices.supply==='graded'?6:8;need(s.coins-fee>=t.reserve,'这批货需 '+fee+' 文，另有家用保留；可先回款或调整家计。');s.coins-=fee;give(s,{bambooWare:1,herb:1});log(s,'buy',-fee,'按约定验收村中竹器与草木，实际交付两件');f.v2SupplyReceived=true;});}
    if(name==='v2Roster'){quest(s,'V2_17');at(s,'hall');need(['playerStore','motherStore'].includes(p.choice),'请共同商议轮值。');s.choices.shopRoster=p.choice;f.v2RosterPlanned=true;return;}
    if(name==='v2Cooperate'){quest(s,'V2_18');at(s,'county');return once(s,'story2Cooperate',()=>{spend(s,{bambooWare:1});s.coins+=h.prices.bambooWare;log(s,'neighborSale',h.prices.bambooWare,'实际交给邻铺的一件转介竹器','bambooWare');f.v2Cooperated=true;});}
    if(name==='v2FamilyEnd'){quest(s,'V2_18');at(s,'hall');need(f.v2ThreeDays&&f.v2Cooperated,'先兑现邻铺协作，并完成三个不同营业日的闭账。');need(!Object.entries(t.orders).some(([k,o])=>k!=='silkSample'&&o.delivered<o.quantity),'还有已接受订单未交清；先按原报价交付，再结卷。');need(['steady','neighbors','travel'].includes(p.choice),'请选择下一步方向。');s.choices.nextSeason=p.choice;f.v2FamilyEnd=true;return;}
    need(false,'这项南街事务尚未开放。');
  }
  return {sale,bookSale,cabinetPlan,order,titles,steps,rewards,products,shops,slots,emptyShop,emptyStory,normalise,reconcile,act,price,basePrice,baseCost,stockAvailable,customers,summary,leaseQuote,familyAtShop};
});
