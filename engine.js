/* 南澜记 V2.0. One state, one clock, atomic actions and recoverable saves. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NanlanEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SAVE_KEY = 'nanlan_v20';
  const conversations=typeof module==='object'&&module.exports?require('./conversations.js'):globalThis.NanlanConversations;
  const rural=typeof module==='object'&&module.exports?require('./rural-model.js'):globalThis.NanlanRural;
  const production=typeof module==='object'&&module.exports?require('./production-model.js'):globalThis.NanlanProductionModel;
  const seals=typeof module==='object'&&module.exports?require('./seals-model.js'):globalThis.NanlanSealsModel;
  const copy = value => JSON.parse(JSON.stringify(value));
  const titles = {
    M01:'门外的行李', M02:'今夜睡在哪里', M03:'后院见光', M04:'南澜的第一顿饭',
    M05:'村口那碗茶', M06:'竹林里的借路人', M07:'等它慢慢长', M08:'雨声里的书箱',
    M09:'潮退以后', M10:'镇上的第一张摊布', M11:'一单生意两种打算',
    M12:'南街有间空铺', M13:'山雨未到', M14:'灯火借人', M15:'父亲没有按时回来',
    M16:'原来这些不是欠账', M17:'水痕上的账', M18:'南街第一盏灯',
    M19:'京中来信', M20:'岁末满庭'
  };
  const ORDER = Object.keys(titles).filter(id => !['M12','M18'].includes(id));
  const steps = {
    M01:[['handover','交接文书与行李'],['keyTaken','接过院门钥匙'],['gateOpen','亲手打开院门']],
    M02:[['windowInspected','检查卧房（东厢房）窗格'],['leakInspected','检查卧房（东厢房）漏雨处'],['firstRepair','选择先修窗或先补漏'],['bedReady','搬入床褥，安顿卧房（东厢房）']],
    M03:[['farmTools','在仓房领取农具'],['toolsRepaired','修好旧农具'],['pathCleared','清理通路杂草 3 处'],['smallBed','整理一小块种植区']],
    M04:[['stoveClean','清理灶边'],['bucketFilled','在院中水缸取水'],['drainClear','清理宅外水口'],['firstCooked','亲手做一锅热饭'],['firstShared','回正厅与家人分享']],
    M05:[['metChen','与陈伯打招呼'],['metDoctor','认识许青禾'],['letterRead','替乡邻读一封家信']],
    M06:[['metCen','在山脚认识阿岑'],['bambooIdentified','拾取一份可用落竹'],['bambooChoice','安排借竹或自家晾架'],['bridgeReady','铺通竹林小径']],
    M07:[['fullGarden','扩整自家药圃'],['dryRack','在仓房做好晾架'],['medicinalPlanted','种下首批药草'],['medicinalWatered','给药草浇水'],['medicinalHarvested','成熟后亲手采收']],
    M08:[['boxFound','在仓房发现旧书箱'],['ledgerPermission','联系程婉，获准查看'],['pagesDried','在书房晾好两页旧纸']],
    M09:[['metYu','向沈晚渔确认归路'],['coastVisited','走到南澜海湾'],['tideRead','读懂潮线木牌'],['tidalCollected','在低潮滩涂拾取物资']],
    M10:[['stallBooked','预约第一张摊布'],['productDisplayed','带一件制品摆上摊布'],['firstSale','完成一次真实买卖']],
    M11:[['orderAccepted','接下两件货物的小批单'],['orderReserved','为承诺预留库存'],['orderDelivered','分批交付两件制品']],
    M13:[['gutterChecked','检查宅院沟渠与屋檐'],['goodsStored','把晾晒物收回仓房'],['stormWarned','与陈伯确认风雨准备']],
    M14:[['hallwayCleared','腾出正厅通道'],['cratesRaised','架高仓房货物'],['guestsSettled','在正厅安排临时铺位']],
    M15:[['fatherClue','向陈伯询问父亲去向'],['guideReady','请阿岑带路到高地'],['waterChecked','在山腰确认水位'],['fatherFound','找到父亲并结伴返家'],['fatherHome','回正厅与父亲说清约定']],
    M16:[['bookReturned','把原簿交还程婉'],['historyConfirmed','请当事人核对旧事'],['copyApproved','经同意留下誊写副本']],
    M17:[['receiptsReviewed','在镇集核对凭单'],['accountResolved','协商重算或请陈伯代呈'],['fairFeePaid','结清双方确认的合理费用']],
    M19:[['letterFamily','分别与三位家人谈来信'],['giftChosen','选一件本地小物随信'],['replyWritten','请祖父写好回信'],['replySent','托陈伯寄出回信']],
    M20:[['seatingChosen','安排家宴座次'],['feastCooked','在灶边准备家宴'],['festivalLamps','在庭院挂好灯'],['feastShared','回正厅完成岁末家宴']]
  };
  const rewards = {
    M01:[0,'院门钥匙归入钥匙串 · 庭院可进入'], M02:[0,'卧房（东厢房）床榻可临时休息 · 保留家人的回应'],
    M03:[0,'小畦与仓房可用 · 清草回收的枯枝可做饭'], M04:[10,'家用结余 10 文 · 村庄与日常时钟开放'],
    M05:[5,'邻里信任 · 字纸小事增加'], M06:[8,'竹林小径与基础竹作开放'],
    M07:[10,'药草可晾晒 · 回收种子，能继续种植'], M08:[5,'获准整理旧页，仍代为保管原簿'],
    M09:[8,'镇集试摊路线开放'], M10:[8,'一张真实买卖凭单 · 小批单开放'],
    M11:[12,'交付凭单 · 风雨准备开启'], M13:[6,'高地引路开放'], M14:[6,'家人与邻里得到安置'],
    M15:[8,'父亲平安返家 · 留下往后报信的约定'], M16:[5,'获准誊写的副本 · 原簿由程婉带回'],
    M17:[10,'账目结清 · 接续京中来信'], M19:[5,'回信寄出 · 岁末家宴开启'],
    M20:[20,'第一卷完成 · 保留全部选择，继续日常生活']
  };
  const itemNames = {
    mulberrySapling:'桑苗',mulberryLeaf:'桑叶',silkwormEgg:'蚕种',fishFry:'鱼苗',fishFeed:'鱼食',pondFish:'塘鱼',rawSilk:'普通生丝',fineSilk:'特级生丝',silkwormCompost:'蚕沙',pondMud:'塘泥',wetLeaf:'带露桑叶',
    sealTimber:'印材坚木',sealPebble:'海磨印石',yardKey:'院门钥匙',bedroll:'床褥',repair:'修补材料',rice:'米粮',ingredient:'食材',seed:'种子',
    lychee:'荔枝',longan:'龙眼',mandarin:'柑橘',ginseng:'人参',agarwood:'沉香',huali:'海南黄花梨',wood:'枯枝',weed:'杂草',herb:'鲜草药',bamboo:'竹材',stone:'山石',mushroom:'蘑菇',shoot:'竹笋',duckStone:'不会凫水的小石鸭',grassHopper:'听门的草蚂蚱',shootRice:'笋香焖饭',crustRice:'笋香焖饭（薄脆锅巴）',
    shell:'贝壳',seaweed:'海藻',clam:'蛤蜊',vegetable:'菜蔬',hotMeal:'一锅热饭',feast:'家宴饭菜',
    driedHerb:'干药草',bambooWare:'竹制小器',shellCraft:'贝壳小饰',rope:'草绳',
    ledgerOriginal:'代管的借灯簿',ledgerCopy:'获准誊写的副本',receipt:'买卖凭单',reply:'家书回信'
  };
  const products = ['driedHerb','bambooWare','shellCraft'];
  const prices = {mulberryLeaf:1,pondFish:7,rawSilk:12,fineSilk:22,lychee:4,longan:4,mandarin:3,ginseng:28,agarwood:22,huali:26,driedHerb:14,bambooWare:12,shellCraft:10,rope:5,wood:2,herb:3,bamboo:4,stone:2,mushroom:3,shoot:3,shell:2,seaweed:2,clam:3,vegetable:3};
  const supplyPrices={rice:3,ingredient:3,seed:4,repair:5,rope:6};
  const rareResources={ginseng:{cooldown:4320,stamina:5,tool:'hoe'},agarwood:{cooldown:2880,stamina:6,tool:'axe'},huali:{cooldown:4320,stamina:8,tool:'axe'}};
  const fruitResources=['lychee','longan','mandarin'];
  function resourceCooldown(type){if(fruitResources.includes(type))return 1440;return rareResources[type]?.cooldown||240;}
  function resourceRequirement(s,type){const r=rareResources[type];if(!r)return '';if(!s.flags.toolsRepaired)return '请先在 M03「后院见光」修好农具，再采集珍稀物资。';if(!s.tools[r.tool])return '请先到仓房领取木柄斧，再处理这段枯木。';if(s.selected!==r.tool)return '请先在工具栏选中'+(r.tool==='axe'?'木柄斧':'长柄锄')+'，再'+(r.tool==='axe'?'劈取木料。':'挖取人参。');return '';}
  const recipes = {
    driedHerb:{label:'晾晒干药草',cost:{herb:2},out:{driedHerb:1}},
    bambooWare:{label:'制作竹制小器',cost:{bamboo:1},out:{bambooWare:1}},
    shellCraft:{label:'串贝壳小饰',cost:{shell:2},out:{shellCraft:1}},
    rope:{label:'搓一条草绳',cost:{weed:2},out:{rope:1}},
    rack:{label:'制作晾架',cost:{wood:1,bamboo:1},flag:'dryRack'}
  };

  itemNames.narrowBasket='窄口竹篓';prices.narrowBasket=18;
  recipes.narrowBasket={label:'编制改良窄口竹篓',cost:{bamboo:2,rope:1},out:{narrowBasket:1}};
  const storyFactory=typeof module==='object'&&module.exports?require('./story2-model.js'):globalThis.NanlanStoryModel;
  const storyV2=storyFactory({rural,copy,requireThat,requireScene,expectQuest,spend,give,once,log,clock,done,available,prices,recipes,products,itemNames});
  const children=typeof module==='object'&&module.exports?require('./children-model.js'):globalThis.NanlanChildrenModel;
  const scholar=typeof module==='object'&&module.exports?require('./scholar-model.js'):globalThis.NanlanScholarModel;
  const v3=typeof module==='object'&&module.exports?require('./story3-model.js'):globalThis.NanlanStory3;
  const v4=typeof module==='object'&&module.exports?require('./story4-model.js'):globalThis.NanlanStory4;
  const v5=typeof module==='object'&&module.exports?require('./story5-model.js'):globalThis.NanlanStory5;
  const season5=typeof module==='object'&&module.exports?require('./season5-model.js'):globalThis.NanlanSeason5;
  const SEASON5_ORDER=season5.order,V5_ORDER=v5.order,V4_ORDER=v4.order,V3_ORDER=v3.order;
  const V2_ORDER=storyV2.order;
  Object.assign(titles,storyV2.titles);Object.assign(steps,storyV2.steps);Object.assign(rewards,storyV2.rewards);
  Object.assign(titles,v3.titles);Object.assign(steps,v3.steps);Object.assign(rewards,v3.rewards);
  Object.assign(titles,v4.titles);Object.assign(steps,v4.steps);Object.assign(rewards,v4.rewards);
  Object.assign(titles,v5.titles);Object.assign(steps,v5.steps);Object.assign(rewards,v5.rewards);
  Object.assign(titles,season5.titles);Object.assign(steps,season5.steps);Object.assign(rewards,season5.rewards);
  itemNames.travelBox='出行食盒';prices.travelBox=24;
  recipes.travelBox={label:'制作出行食盒',cost:{bamboo:2,rope:1},out:{travelBox:1}};
  const shopPrice=storyV2.price,shopCustomers=storyV2.customers;
  function volume2Action(s,name,p){return seals.settle(s,name,p,()=>storyV2.act(s,name,p),requireThat);}

  function initial(gender='female') {
    const s = {
      schemaVersion:2,revision:0,gender,scene:'gate',player:{x:550,y:530},worldTick:570,
      mode:'prologue',storyBeat:'抵达',stamina:100,coins:80,
      bag:{bedroll:1,repair:2,rice:2,ingredient:1,seed:1,wood:0,weed:0},
      tools:{hand:true},selected:'hand',keyring:[],flags:{},choices:{},collected:{},nodes:{},
      quests:{},claimed:{},actions:{},garden:{kind:null,plantedAt:null,watered:false,duration:120},
      rural:rural.fresh(),production:production.fresh(),actorState:production.freshActors(),seals:seals.fresh(),shop:storyV2.emptyShop(),story2:storyV2.emptyStory(),practice:{},pages:{},visits:{gate:true},familyTalks:{},order:null,transactions:[],journal:[],
      tideAnchor:null,tideTutorialUsed:false,stallUntil:null,featured:null,lastNotice:'先和家人完成门前交接。'
    };
    for(const id of Object.keys(titles).filter(id=>!V3_ORDER.includes(id)&&!V4_ORDER.includes(id)&&!V5_ORDER.includes(id)&&!SEASON5_ORDER.includes(id))) s.quests[id]={status:V2_ORDER.includes(id)?'DEFERRED_V2':id==='M01'?'ACTIVE':'LOCKED'};
    return s;
  }
  function activeOrder(s){return s.flags.season5Started&&SEASON5_ORDER.some(id=>s.quests[id]?.status==='ACTIVE')?SEASON5_ORDER:s.flags.volume5Started?V5_ORDER:s.flags.season5Started?SEASON5_ORDER:s.flags.volume4Started?V4_ORDER:s.flags.volume3Started?V3_ORDER:s.flags.volume2Started?V2_ORDER:ORDER;}
  function current(s) { return activeOrder(s).find(id => s.quests[id]?.status==='ACTIVE') || null; }
  function done(s,id) { return s.quests[id]?.status==='COMPLETED'; }
  function reached(s,id) { return done(s,id) || current(s)===id; }
  function fail(message) { const error = new Error(message); error.userMessage=message; throw error; }
  function requireThat(ok,msg) { if(!ok)fail(msg); }
  function quantity(s,id) { return s.bag[id]||0; }
  function available(s,id) {
    return quantity(s,id)-rural.held(s,id)-(s.order && s.order.product===id ? s.order.reserved : 0);
  }
  function spend(s,cost) {
    for(const [id,n] of Object.entries(cost)) requireThat(available(s,id)>=n,'还需要 '+(itemNames[id]||id)+' ×'+Math.max(0,n-available(s,id))+'。可在背包查看来源。');
    for(const [id,n] of Object.entries(cost)) s.bag[id]=quantity(s,id)-n;
  }
  function give(s,items) { for(const [id,n] of Object.entries(items))s.bag[id]=quantity(s,id)+n; }
  function once(s,key,fn) { if(s.actions[key])return false;fn();s.actions[key]=true;return true; }
  function expectQuest(s,id) { requireThat(current(s)===id,'当前先完成 '+(current(s)||'日常生活')+' '+(titles[current(s)]||'')+'。'); }
  function requireScene(s,scene) { requireThat((Array.isArray(scene)?scene:[scene]).includes(s.scene),'请先到'+(Array.isArray(scene)?scene.join(' / '):scene)+'对应的物件旁操作。'); }
  function log(s,type,amount,note,item) {
    s.transactions.push({id:'T'+(s.transactions.length+1),tick:s.worldTick,type,amount,note,item:item||null});
  }
  function reconcile(s) {
    production.reconcile(s);
    storyV2.reconcile(s);
    s.flags.pathCleared=['weed1','weed2','weed3'].every(id=>s.collected[id]);
    s.flags.letterFamily=['grandfather','father','mother'].every(id=>s.familyTalks[id]);
    let id=current(s);
    while(id && steps[id].every(([flag])=>s.flags[flag])) {
      s.quests[id].status='COMPLETED';
      if(!s.claimed[id]) {
        const [coins,description]=rewards[id];
        s.claimed[id]=true;s.coins+=coins;
        if(coins)log(s,'reward',coins,id+' '+titles[id]);
        s.journal.push({id,tick:s.worldTick,text:description});
        s.lastNotice=id+' 完成 · '+description;
      }
      if(id==='M04'){s.mode='daily';s.worldTick=1080;s.storyBeat='入夜';for(const g of [s.garden,...(s.extraPlots||[])])if(g.plantedAt!==null){g.plantedAt=1080;if(g.wateredAt!==undefined)g.wateredAt=1080;}}
      const order=id.startsWith('S5_')?SEASON5_ORDER:activeOrder(s);
      const next=order.slice(order.indexOf(id)+1).find(k=>!done(s,k));
      if(next)s.quests[next].status='ACTIVE';
      id=current(s);
    }
    if(s.mode==='prologue')s.storyBeat=reached(s,'M04')?'入夜':reached(s,'M02')?'傍晚':'抵达';
    if(done(s,'M20'))s.flags.volumeComplete=true;
    if(s.flags.volume2Started&&!current(s))s.flags.volume2Complete=true;
  }
  function sceneGate(s,to) {
    const clearRoad=v5.gate(s,to);if(clearRoad!==null)return clearRoad;
    const seaRoad=v4.gate(s,to);if(seaRoad!==null)return seaRoad;
    const road=v3.gate(s,to);if(road!==null)return road;
    if(['county','pharmacy','generalStore','teahouse'].includes(to))return s.flags.volume2Started?'':'请先完成 M20「岁末满庭」，再到正厅的「新春家议」开启第二卷。';
    if(to==='gate')return '';
    if(!s.flags.gateOpen)return '先在门前完成交接、接过钥匙，再亲手打开院门。';
    if(['yard','hall','study','bed','store'].includes(to))return '';
    if(!done(s,'M04'))return '先安顿卧房、清理后院，再和家人吃第一顿热饭。M04 完成后可出村认路。';
    if(to==='village')return '';
    if(['foothill','mountain','bambooGrove'].includes(to))return reached(s,'M06')?'':'先在南澜村认识陈伯与许青禾，完成 M05。';
    if(['mountainside','summit'].includes(to))return done(s,'M13')?'':'高地要等 M13 风雨准备完成，再由阿岑引路；眼下可去竹林采集。';
    if(['coast','tidalflat'].includes(to))return reached(s,'M09')?'':'先完成 M08 书箱任务，再请沈晚渔指路。';
    if(to==='market')return reached(s,'M10')?'':'先完成 M09 潮线教学，再带着首批制品来镇集。';
    return '这条路暂未开放。';
  }
  function clock(s) {
    const tick=Math.floor(s.worldTick),day=Math.floor(tick/1440)+1,minute=tick%1440;
    return {day,minute,hour:Math.floor(minute/60),story:s.mode==='prologue'?s.storyBeat:null};
  }
  function daylight(s) {
    const minute=s.mode==='prologue'?({抵达:600,傍晚:1020,入夜:1200}[s.storyBeat]||600):clock(s).minute;
    const clamp=n=>Math.max(0,Math.min(1,n));
    return {minute,label:minute<540?'清晨':minute<660?'上午':minute<840?'午间':minute<1020?'下午':minute<1140?'黄昏':'夜晚',
      progress:clamp((minute-360)/960),darkness:clamp((minute-1020)/180),
      warmth:Math.max(0,1-Math.abs(minute-1050)/120),morning:clamp((540-minute)/180)};
  }
  function tide(s) {
    const phase=((s.worldTick-(s.tideAnchor||0))%480+480)%480;
    return {low:phase<180,remaining:phase<180?180-phase:480-phase};
  }
  function emptyPlot(){return {kind:null,plantedAt:null,watered:false,duration:120,tilled:false};}
  function gardenPlot(s,index=0){return index===0?s.garden:(s.extraPlots?.[index-1]||emptyPlot());}
  function crop(s,index=0) {
    const g=gardenPlot(s,index),elapsed=g.watered?s.worldTick-(g.wateredAt??g.plantedAt):0;
    return {planted:g.plantedAt!==null,ready:g.plantedAt!==null&&g.watered&&elapsed>=g.duration,
      remaining:g.plantedAt===null?0:Math.max(0,g.duration-elapsed)};
  }
  function sleepToMorning(s) {
    s.worldTick=(Math.floor(s.worldTick/1440)+1)*1440+360;s.stamina=100;
  }
  function normaliseLoaded(value) {
    requireThat(value && value.schemaVersion===2,'这个存档不属于当前剧情版本，原数据已保留。');
    requireThat(['female','male'].includes(value.gender),'存档角色资料不完整。');
    requireThat(typeof value.scene==='string'&&value.player&&Number.isFinite(value.player.x)&&Number.isFinite(value.player.y),'存档位置无效。');
    requireThat(Number.isFinite(value.worldTick)&&value.worldTick>=0&&value.worldTick<1e9,'存档时间无效。');
    requireThat(Number.isFinite(value.coins)&&value.coins>=0&&Number.isFinite(value.stamina)&&value.stamina>=0&&value.stamina<=100,'存档数值无效。');
    for(const key of ['bag','tools','flags','choices','quests','claimed','actions','collected','nodes','practice','pages','visits','familyTalks'])requireThat(value[key]&&typeof value[key]==='object'&&!Array.isArray(value[key]),'存档缺少 '+key+'。');
    for(const [id,n] of Object.entries(value.bag))requireThat(Object.hasOwn(itemNames,id)&&Number.isInteger(n)&&n>=0&&n<1e6,'存档物品数量无效。');
    requireThat(['prologue','daily'].includes(value.mode)&&value.garden&&Number.isFinite(value.garden.duration)&&value.garden.duration>0,'存档生活状态无效。');
    requireThat(value.garden.plantedAt===null||(Number.isFinite(value.garden.plantedAt)&&value.garden.plantedAt>=0&&value.garden.plantedAt<=value.worldTick),'存档种植时间无效。');
    if(value.extraPlots===undefined)value.extraPlots=Array.from({length:5},emptyPlot);
    requireThat(Array.isArray(value.extraPlots)&&value.extraPlots.length===5,'种植地块资料无效。');
    for(const g of [value.garden,...value.extraPlots]){
      requireThat(g&&[null,'herb','vegetable'].includes(g.kind)&&Number.isFinite(g.duration)&&g.duration>0&&typeof g.watered==='boolean','地块作物资料无效。');
      requireThat(g.plantedAt===null||(Number.isFinite(g.plantedAt)&&g.plantedAt>=0&&g.plantedAt<=value.worldTick),'地块种植时间无效。');
      if(g.wateredAt!==undefined)requireThat(Number.isFinite(g.wateredAt)&&g.wateredAt>=0&&g.wateredAt<=value.worldTick,'地块浇水时间无效。');
    }
    for(const id of ORDER)requireThat(['ACTIVE','LOCKED','COMPLETED'].includes(value.quests[id]?.status),'存档任务状态无效。');
    rural.normalise(value,requireThat);
    storyV2.normalise(value);
    seals.normalise(value,requireThat);
    production.normalise(value,requireThat);
    for(const id of V2_ORDER){
      if(!value.quests[id])value.quests[id]={status:'DEFERRED_V2'};
      requireThat(value.flags.volume2Started?['ACTIVE','LOCKED','COMPLETED'].includes(value.quests[id].status):value.quests[id].status==='DEFERRED_V2','第二卷任务状态无效。');
    }
    if(value.flags.volume2Started){
      requireThat(done(value,'M20'),'先完成第一卷。');
      const firstV2=V2_ORDER.findIndex(id=>!done(value,id));
      V2_ORDER.forEach((id,i)=>{const legacyLease=id==='M12'&&value.story2.contract?.legacy&&done(value,id);
        requireThat(legacyLease||value.quests[id].status===(firstV2<0||i<firstV2?'COMPLETED':i===firstV2?'ACTIVE':'LOCKED'),'第二卷任务顺序无效。');});
    }
    const first=ORDER.findIndex(id=>value.quests[id].status!=='COMPLETED');
    for(let n=0;n<ORDER.length;n++)requireThat(value.quests[ORDER[n]].status===(first<0||n<first?'COMPLETED':n===first?'ACTIVE':'LOCKED'),'存档任务顺序无效。');
    requireThat(Array.isArray(value.transactions)&&Array.isArray(value.journal)&&Array.isArray(value.keyring),'存档账目无效。');
    if(value.order)requireThat(products.includes(value.order.product)&&Number.isInteger(value.order.delivered)&&value.order.delivered>=0&&value.order.delivered<=2&&Number.isInteger(value.order.reserved)&&value.order.reserved>=0&&value.order.reserved<=2-value.order.delivered&&value.order.reserved<=quantity(value,value.order.product),'存档预留库存无效。');
    children.normalise(value,requireThat);
    scholar.normalise(value,requireThat);
    v3.normalise(value,requireThat);
    v4.normalise(value,requireThat);
    v5.normalise(value,requireThat);
    season5.normalise(value,requireThat);
    return copy(value);
  }
  class Engine {
    constructor(storage,world) {this.storage=storage;this.world=world||{};this.state=initial();this.memoryOnly=false;}
    write(next) {if(!this.memoryOnly)this.storage.setItem(SAVE_KEY,JSON.stringify(next));}
    reset(gender) {const next=initial(gender);this.write(next);this.state=next;return next;}
    save() {try{this.write(this.state);return {ok:true};}catch(e){return {ok:false,message:'保存失败。当前进度仍在，请检查浏览器存储后重试。'};}}
    load(raw) {const next=normaliseLoaded(JSON.parse(raw));requireThat(this.world[next.scene],'存档场景不存在。');requireThat(!sceneGate(next,next.scene),'存档位置尚未开放。');
      const b=this.world[next.scene].bounds;
      if(next.player.x<b[0]||next.player.x>b[2]||next.player.y<b[1]||next.player.y>b[3])next.player={x:this.world[next.scene].spawn[0],y:this.world[next.scene].spawn[1]};
      this.state=next;return next;}
    near(object) {return object&&Math.hypot(object.x-this.state.player.x,object.y-this.state.player.y)<=94;}
    move(x,y) {const b=this.world[this.state.scene].bounds;if(x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3]){this.state.player.x=x;this.state.player.y=y;}}
    tick(dt) {if(this.state.mode!=='daily')return;const s=this.state,c=clock(s);if(c.minute>=1320)return;
      s.worldTick+=Math.min(Math.max(dt,0),.1);if(clock(s).minute>=1320)s.worldTick=Math.floor(s.worldTick/1440)*1440+1320;
      if(s.production?.clothesReadyAt!==null&&s.worldTick>=s.production.clothesReadyAt&&s.actorState.outfit==='old')this.commit('newClothes',()=>{});}
    enter(to) {
      const blocked=sceneGate(this.state,to);if(blocked)return {ok:false,message:blocked};
      return this.commit('enter:'+to,(s)=>{
        requireThat(this.world[to],'这个地点不存在。');
        if(to==='tidalflat')requireThat(tide(s).low,'潮水正在上涨。可以先在海边与沈晚渔交谈、整理笔记，低潮还会再来。');
        v3.shopVisit(s,s.scene,to);
        s.scene=to;s.player={x:this.world[to].spawn[0],y:this.world[to].spawn[1]};s.visits[to]=true;
        if(to==='coast'){s.flags.coastVisited=true;if(!s.tideTutorialUsed){s.tideAnchor=s.worldTick;s.tideTutorialUsed=true;}}
      });
    }
    commit(key,change) {
      const next=copy(this.state),previous=current(next);
      try{const changed=change(next);if(changed===false)return {ok:true,duplicate:true,message:'这件事已经办好了。'};
        reconcile(next);next.revision++;this.write(next);this.state=next;
        return {ok:true,completed:previous!==current(next)?previous:null,message:next.lastNotice};}
      catch(e){return {ok:false,message:e.userMessage||'保存失败，本次动作未结算。原有进度与物品已保留，请重试。'};}
    }
    act(name,p={}) {
      return this.commit(name,(s)=>{
        const f=s.flags, q=current(s), quest=id=>expectQuest(s,id);
        if(name==='chat'){
          const role=conversations.roles[p.object],person=conversations.cast[role],o=this.world[s.scene].objects.find(o=>o.id===p.object);
          requireThat(person&&o&&Math.hypot(o.x-s.player.x,o.y-s.player.y)<=94,'请先走到这位人物身旁。');
          requireThat(p.choice===0||p.choice===1,'请选择一句回应。');
          const count=s.choices['chatCount:'+role]||0;
          requireThat(p.expected===count,'这段话已经记下，请重新打开闲谈。');
          s.choices['chatCount:'+role]=count+1;s.choices['chatLast:'+role]=p.choice;
          return;
        }
        if(name.startsWith('kids'))return children.act(s,name,p,{requireThat,requireScene,spend,give});
        if(name.startsWith('liang'))return scholar.act(s,name,p,{requireThat,requireScene,spend,give,log,prices,supplyPrices,bookSale:storyV2.bookSale});
        if(name.startsWith('season'))return season5.act(s,name,p,{requireThat,requireScene,spend,give,available,log,prices});
        if(name.startsWith('v5'))return v5.act(s,name,p,{requireThat,requireScene,spend,give,available,log});
        if(name.startsWith('v4'))return v4.act(s,name,p,{requireThat,requireScene,spend,give,available,log});
        if(name.startsWith('v3'))return seals.settle(s,name,p,()=>v3.act(s,name,p,{requireThat,requireScene,spend,give,available,log,rural,shop:storyV2,tide}),requireThat);
        if(name.startsWith('neighbor'))return rural.act(s,name,p,{requireThat,requireScene,spend,give,available,log});
        if(name.startsWith('silk'))return production.act(s,name,p,{requireThat,requireScene,spend,give,log,familyAtShop:storyV2.familyAtShop});
        if(name.startsWith('seal'))return seals.act(s,name,p,{requireThat,requireScene,spend,give});
        if(name.startsWith('v2'))return volume2Action(s,name,p);
        if(name==='handover'){quest('M01');requireScene(s,'gate');return once(s,'handover',()=>{requireThat(['grandfather','luggage'].includes(p.choice),'先选好怎样帮忙。');f.handover=true;s.choices.arrival=p.choice;});}
        if(name==='takeKey'){quest('M01');requireScene(s,'gate');requireThat(f.handover,'先完成文书与行李交接。');return once(s,'takeKey',()=>{give(s,{yardKey:1});f.keyTaken=true;});}
        if(name==='openGate'){quest('M01');requireScene(s,'gate');return once(s,'openGate',()=>{spend(s,{yardKey:1});s.keyring.push('yardKey');f.gateOpen=true;s.scene='yard';s.player={x:this.world.yard.spawn[0],y:this.world.yard.spawn[1]};s.visits.yard=true;});}
        if(name==='inspectWindow'||name==='inspectLeak'){quest('M02');requireScene(s,'bed');f[name==='inspectWindow'?'windowInspected':'leakInspected']=true;return;}
        if(name==='firstRepair'){quest('M02');requireScene(s,'bed');requireThat(f.windowInspected&&f.leakInspected,'先查看窗格和漏点。');return once(s,'firstRepair',()=>{requireThat(['window','leak'].includes(p.choice),'先选一处修补。');spend(s,{repair:1});s.choices.repair=p.choice;f.firstRepair=true;f[p.choice==='window'?'windowPatched':'leakPatched']=true;});}
        if(name==='setBed'){quest('M02');requireScene(s,'bed');requireThat(f.firstRepair,'先修补最急的一处。');return once(s,'setBed',()=>{spend(s,{bedroll:1});f.bedReady=true;});}
        if(name==='finishRoomRepair'){requireScene(s,'bed');requireThat(done(s,'M04'),'请先完成 M04「灶火与热饭」，再补修剩余部分，先把材料留给农具。');requireThat(f.firstRepair,'请先完成 M02 的首次修缮。');requireThat(['window','leak'].includes(p.part),'请选择修缮位置。');const flag=p.part==='window'?'windowPatched':'leakPatched';requireThat(!f[flag],'这里已经修好了。');spend(s,{repair:1});f[flag]=true;return;}
        if(name==='farmTools'){requireScene(s,'store');requireThat(reached(s,'M03'),'先把卧房安顿好。');return once(s,'farmTools',()=>{f.farmTools=true;s.tools.sickle=true;s.tools.hoe=true;s.tools.basket=true;});}
        if(name==='repairTools'){quest('M03');requireScene(s,'store');requireThat(f.farmTools,'先领取仓房里的农具。');return once(s,'repairTools',()=>{spend(s,{repair:1});f.toolsRepaired=true;});}
        if(name==='takeAxe'){requireScene(s,'store');requireThat(reached(s,'M03'),'请在完成 M02「今夜睡在哪里」后，再来仓房领取木柄斧。');return once(s,'takeAxe',()=>{s.tools.axe=true;});}
        if(name==='bucket'){requireScene(s,'store');requireThat(reached(s,'M03'),'先安顿卧房。');return once(s,'bucket',()=>{s.tools.water=true;});}
        if(name==='clearWeed'){requireThat(f.toolsRepaired&&s.selected==='sickle','先修好农具，再选第 2 格镰刀。');
          const id=p.id;requireThat(['weed1','weed2','weed3','villageWeed'].includes(id),'这处不能清理。');
          requireScene(s,id==='villageWeed'?'village':'yard');
          return once(s,'weed:'+id,()=>{requireThat(s.stamina>=2,'体力不足。可到床榻小憩。');s.collected[id]=true;give(s,{weed:1,...(['weed1','weed2'].includes(id)?{wood:1}:{})});s.stamina-=2;});}
        if(name==='smallBed'){quest('M03');requireScene(s,'yard');requireThat(f.pathCleared,'先清完通路上 3 处杂草。');return once(s,'smallBed',()=>{requireThat(['vegetable','herb'].includes(p.choice),'先选一小畦的用途。');f.smallBed=true;s.choices.firstBed=p.choice;});}
        if(name==='cleanStove'){quest('M04');requireScene(s,'yard');f.stoveClean=true;return;}
        if(name==='fillWater'){requireScene(s,'yard');requireThat(s.tools.water,'先在仓房领取水桶。');requireThat(reached(s,'M04'),'先清理后院通路。');s.bucketWater=1;f.bucketFilled=true;return;}
        if(name==='clearDrain'){quest('M04');requireScene(s,'yard');f.drainClear=true;return;}
        if(name==='cookMeal'||name==='cookFeast'){
          requireScene(s,'yard');const feast=name==='cookFeast';if(feast)requireThat(reached(s,'M20'),'先办完京中来信。');else requireThat(reached(s,'M04'),'先整理后院。');
          requireThat(f.stoveClean&&f.drainClear,'先清灶边和宅外水口。');requireThat(s.bucketWater>=1,'先到水缸取水。');
          const food=quantity(s,'vegetable')?'vegetable':'ingredient';
          spend(s,{rice:1,wood:1,[food]:1});s.bucketWater--;give(s,feast?{feast:1}:{hotMeal:1});f[feast?'feastCooked':'firstCooked']=true;log(s,'cook',0,feast?'准备家宴':'煮一锅热饭');return;}
        if(name==='shareFirst'){quest('M04');requireScene(s,'hall');return once(s,'shareFirst',()=>{requireThat(['family','chen'].includes(p.choice),'先选怎样分饭。');spend(s,{hotMeal:1});s.choices.firstMeal=p.choice;f.firstShared=true;f.stableLights=true;});}
        if(name==='nap'){requireScene(s,'bed');requireThat(f.bedReady,'先搬入床褥。');s.stamina=100;if(s.mode==='daily')s.worldTick=Math.min(s.worldTick+30,Math.floor(s.worldTick/1440)*1440+1320);return;}
        if(name==='sleep'){requireScene(s,'bed');requireThat(done(s,'M04'),'请在完成 M04「南澜的第一顿饭」后再睡一夜；现在可临时休息恢复体力。');sleepToMorning(s);return;}
        if(name==='eat'){spend(s,{hotMeal:1});s.stamina=Math.min(100,s.stamina+35);return;}
        if(name==='meetChen'){requireScene(s,'village');requireThat(reached(s,'M05'),'先完成家宴。');f.metChen=true;return;}
        if(name==='meetDoctor'){quest('M05');requireScene(s,'village');f.metDoctor=true;return;}
        if(name==='readLetter'){quest('M05');requireScene(s,'village');requireThat(f.metChen,'先和陈伯打招呼。');f.letterRead=true;return;}
        if(name==='meetCen'){requireScene(s,'foothill');requireThat(reached(s,'M06'),'先认识村里的街坊。');f.metCen=true;return;}
        if(name==='collect'){
          const o=this.world[s.scene]?.objects.find(o=>o.id===p.id);
          requireThat(o&&['herb','wood','bamboo','stone','mushroom','shoot','shell','seaweed','clam','ginseng','agarwood','huali',...fruitResources].includes(o.type),'这里没有可拾取的物资。');
          if(s.scene==='tidalflat')requireThat(tide(s).low,'潮水已涨，先退回海边，下一轮低潮还会再来。');
          const last=s.nodes[o.id];requireThat(last===undefined||s.worldTick-last>=resourceCooldown(o.type),'这处刚刚采过，可在舆图查看剩余刷新时间。');
          if(o.id==='neighbor-windfall')requireThat(s.rural.gifts.cen,'先请阿岑带路。');
          const why=resourceRequirement(s,o.type);requireThat(!why,why);
          const cost=rareResources[o.type]?.stamina||1;requireThat(s.stamina>=cost,'体力不足，本次需要 '+cost+' 点体力，可回卧房休息。');
          give(s,{[o.type]:fruitResources.includes(o.type)?2:1});s.nodes[o.id]=s.worldTick;s.collected[o.id]=true;s.stamina-=cost;
          if(o.type==='bamboo'&&reached(s,'M06'))f.bambooIdentified=true;
          if(s.scene==='tidalflat'&&reached(s,'M09'))f.tidalCollected=true;return;}
        if(name==='bambooChoice'){quest('M06');requireScene(s,'foothill');requireThat(f.metCen&&f.bambooIdentified,'先认识阿岑，再拾一份可用落竹。');return once(s,'bambooChoice',()=>{requireThat(['lend','rack'].includes(p.choice),'先选竹料怎样安排。');spend(s,{bamboo:1});s.choices.bamboo=p.choice;f.bambooChoice=true;if(p.choice==='rack')f.dryRack=true;});}
        if(name==='repairBridge'){quest('M06');requireScene(s,'mountain');requireThat(f.bambooChoice,'先回山脚和阿岑安排竹料。');return once(s,'repairBridge',()=>{spend(s,{wood:1,...(s.choices.bamboo==='rack'?{bamboo:1}:{})});f.bridgeReady=true;});}
        if(name==='expandGarden'){quest('M07');requireScene(s,'yard');f.fullGarden=true;return;}
        if(['tillPlot','plant','waterCrop','harvest'].includes(name)){
          requireScene(s,'yard');requireThat(f.smallBed,'请先完成 M03「后院见光」，整理第一块菜畦。');
          const index=p.plot??0;requireThat(Number.isInteger(index)&&index>=0&&index<6,'请选择有效地块。');
          requireThat(index<4||f.fullGarden,'请在 M07「药圃」扩整完成后，再整理药田。');
          s.extraPlots??=Array.from({length:5},emptyPlot);
          const g=gardenPlot(s,index),setPlot=v=>{if(index===0)s.garden=v;else s.extraPlots[index-1]=v;};
          if(name==='tillPlot'){
            requireThat(index>0&&!g.tilled&&g.plantedAt===null,'这块地已经松好土了。');
            requireThat(s.tools.hoe&&s.selected==='hoe','请先选中工具栏的长柄锄，再点击翻土。');
            requireThat(s.stamina>=2,'体力不足，翻土需要 2 点体力。');g.tilled=true;s.stamina-=2;return;
          }
          requireThat(index===0||g.tilled,'请先用长柄锄给这块地翻土。');
          if(name==='plant'){
            requireThat(g.plantedAt===null,'这块地已有作物，先采收再种。');
            const kind=p.kind??(f.fullGarden?'herb':s.choices.firstBed);
            requireThat(['herb','vegetable'].includes(kind),'请先选择种子。');
            requireThat(index<4||kind==='herb','药田请播种药草。');
            requireThat(kind!=='herb'||f.fullGarden||s.choices.firstBed==='herb','请在 M07 扩整药圃后，再播种药草。');
            spend(s,{seed:1});setPlot({kind,plantedAt:s.worldTick,watered:false,duration:kind==='herb'&&f.fullGarden?240:120,tilled:true});
            if(kind==='herb'&&f.fullGarden)f.medicinalPlanted=true;return;
          }
          if(name==='waterCrop'){
            requireThat(g.plantedAt!==null,'先选种，再点击土地播种。');requireThat(!g.watered,'泥土仍然湿润，无需重复浇水。');
            requireThat(s.bucketWater>=1,'木桶没有水了，请先到庭院水缸装水。');s.bucketWater--;g.watered=true;g.wateredAt=s.worldTick;
            if(g.duration===240&&g.kind==='herb')f.medicinalWatered=true;return;
          }
          requireThat(crop(s,index).ready,g.watered?'作物还没长成，回到场景让时间推进，或到卧房休息。':'土还干着，请先浇水，作物才会生长。');
          const herb=g.kind==='herb';give(s,{seed:1,[herb?'herb':'vegetable']:3});
          if(g.duration===240&&herb)f.medicinalHarvested=true;
          if(!herb)f.neighborVegetables=true;
          setPlot({...emptyPlot(),tilled:true,harvestedKind:g.kind});return;
        }
        if(name==='craft'){if(p.recipe==='travelBox')requireThat(f.travelBoxPattern,'先亲手通过食盒四项试验。');if(p.recipe==='narrowBasket')requireThat(f.volume2Started,'窄口竹篓在第二卷看铺后制作。');requireScene(s,'store');const r=recipes[p.recipe];requireThat(r,'尚未学会这个配方。');
          requireThat(p.recipe==='rack'?reached(s,'M07'):p.recipe==='driedHerb'?done(s,'M07'):p.recipe==='shellCraft'?done(s,'M09'):done(s,'M06'),'这个配方要等对应主线完成。');
          if(r.flag&&f[r.flag])return false;spend(s,r.cost);if(r.out)give(s,r.out);if(r.flag)f[r.flag]=true;log(s,'craft',0,r.label);return;}
        if(name==='findBox'){quest('M08');requireScene(s,'store');return once(s,'findBox',()=>{give(s,{ledgerOriginal:1});f.boxFound=true;});}
        if(name==='ledgerPermission'){quest('M08');requireScene(s,'village');requireThat(f.boxFound,'先查看仓房旧书箱。');f.ledgerPermission=true;return;}
        if(name==='dryPage'){quest('M08');requireScene(s,'study');requireThat(f.ledgerPermission,'先征得程婉同意，再晾晒旧页。');requireThat([0,1].includes(p.index),'请选择要晾晒的页。');return once(s,'dryPage:'+p.index,()=>{f['driedPage'+p.index]=true;f.pagesDried=!!(f.driedPage0&&f.driedPage1);});}
        if(name==='meetYu'){requireScene(s,['village','coast']);requireThat(reached(s,'M09'),'先完成书箱的事。');f.metYu=true;return;}
        if(name==='readTide'){quest('M09');requireScene(s,['coast','tidalflat']);requireThat(f.metYu,'先请沈晚渔讲清归路。');f.tideRead=true;return;}
        if(name==='bookStall'){requireScene(s,'market');requireThat(reached(s,'M10'),'先完成潮线教学。');requireThat(q==='M10'||(clock(s).minute>=540&&clock(s).minute<1020),'普通集市在 09:00—17:00 开放。可先做家中小事或休息，再来预约。');s.stallUntil=s.worldTick+360;f.stallBooked=true;return;}
        if(name==='displayProduct'){quest('M10');requireScene(s,'market');requireThat(s.stallUntil>s.worldTick,'试摊预约已结束，可重新预约，不收罚款。');requireThat(products.includes(p.product)&&available(s,p.product)>=1,'先在仓房做一件制品，再带来摆摊。');s.featured=p.product;f.productDisplayed=true;return;}
        if(name==='sell'){requireScene(s,'market');requireThat(f.productDisplayed,'先预约并摆好主打商品。');requireThat(s.stallUntil>s.worldTick,'摊布已收起，可重新预约。');
          requireThat(Number.isInteger(p.sequence)&&p.sequence===s.transactions.length,'这笔买卖已结算，请查看更新后的余货。');spend(s,{[s.featured]:1});
          s.coins+=prices[s.featured];log(s,'sale',prices[s.featured],'镇集售出 '+itemNames[s.featured],s.featured);give(s,{receipt:1});f.firstSale=true;return;}
        if(name==='sellExtra'){requireScene(s,['village','market','generalStore']);requireThat(reached(s,'M05'),'先安顿家人，再到村里出售余货。');requireThat(Object.hasOwn(prices,p.item),'这件物品不可出售。');requireThat(Number.isInteger(p.sequence)&&p.sequence===s.transactions.length,'这笔买卖已结算。');if(s.scene==='market')requireThat(s.stallUntil>s.worldTick,'请先预约摊布。');spend(s,{[p.item]:1});s.coins+=prices[p.item];log(s,'sale',prices[p.item],'余货售出 '+itemNames[p.item],p.item);give(s,{receipt:1});return;}
        if(name==='acceptOrder'){quest('M11');requireScene(s,'market');return once(s,'acceptOrder',()=>{s.order={id:'O1',product:s.featured,total:2,delivered:0,reserved:0};f.orderAccepted=true;});}
        if(name==='reserveOrder'){quest('M11');requireScene(s,'market');requireThat(s.order,'先接小批单。');const needed=2-s.order.delivered-s.order.reserved;
          const n=Math.min(available(s,s.order.product),needed);requireThat(n>0,'先在仓房补做主打制品。已预留的货不会被试摊卖掉。');s.order.reserved+=n;f.orderReserved=true;return;}
        if(name==='deliverOrder'){quest('M11');requireScene(s,'market');const o=s.order;requireThat(o&&p.expected===o.delivered,'这一批已交付，请核对新凭单。');requireThat(o.reserved>=1,'先为承诺预留库存。');
          requireThat(quantity(s,o.product)>=1,'预留物资不足。');s.bag[o.product]--;o.reserved--;o.delivered++;s.coins+=prices[o.product];log(s,'order',prices[o.product],'小批单第 '+o.delivered+' 件',o.product);give(s,{receipt:1});f.orderDelivered=o.delivered===2;return;}
        if(name==='checkGutter'){quest('M13');requireScene(s,'yard');f.gutterChecked=true;return;}
        if(name==='storeGoods'){quest('M13');requireScene(s,'store');f.goodsStored=true;return;}
        if(name==='warnStorm'){quest('M13');requireScene(s,'village');f.stormWarned=true;return;}
        if(name==='clearHallway'){quest('M14');requireScene(s,'hall');f.hallwayCleared=true;return;}
        if(name==='raiseCrates'){quest('M14');requireScene(s,'store');f.cratesRaised=true;return;}
        if(name==='settleGuests'){quest('M14');requireScene(s,'hall');requireThat(f.hallwayCleared&&f.cratesRaised,'先腾出通道、架高货物。');requireThat(['family','neighbors'].includes(p.choice),'先安排铺位。');s.choices.shelter=p.choice;f.guestsSettled=true;return;}
        if(name==='fatherClue'){quest('M15');requireScene(s,'village');f.fatherClue=true;return;}
        if(name==='askGuide'){quest('M15');requireScene(s,'foothill');requireThat(f.fatherClue,'先向陈伯问清父亲的路线。');f.guideReady=true;return;}
        if(name==='checkWater'){quest('M15');requireScene(s,'mountainside');requireThat(f.guideReady,'先请阿岑带路。');f.waterChecked=true;return;}
        if(name==='findFather'){quest('M15');requireScene(s,'mountainside');requireThat(f.waterChecked,'先确认水位和安全归路。');f.fatherFound=true;return;}
        if(name==='fatherHome'){quest('M15');requireScene(s,'hall');requireThat(f.fatherFound,'先去高地找到父亲。');requireThat(['care','agreement'].includes(p.choice),'先和父亲说几句话。');s.choices.father=p.choice;f.fatherHome=true;return;}
        if(name==='returnBook'){quest('M16');requireScene(s,'village');return once(s,'returnBook',()=>{spend(s,{ledgerOriginal:1});f.bookReturned=true;});}
        if(name==='confirmHistory'){quest('M16');requireScene(s,'hall');requireThat(f.bookReturned,'先将私人物件交还程婉。');f.historyConfirmed=true;return;}
        if(name==='copyApproved'){quest('M16');requireScene(s,'village');requireThat(f.historyConfirmed,'先请祖父核对记号的往事。');return once(s,'copyApproved',()=>{give(s,{ledgerCopy:1});f.copyApproved=true;});}
        if(name==='reviewReceipts'){quest('M17');requireScene(s,'market');requireThat(quantity(s,'receipt')>=1,'先带上镇集买卖和交付留下的凭单。');f.receiptsReviewed=true;return;}
        if(name==='resolveAccounts'){quest('M17');requireScene(s,'market');requireThat(f.receiptsReviewed,'先逐项核对凭单。');requireThat(['negotiate','mediate'].includes(p.choice),'请选择怎样处理争议。');s.choices.accounts=p.choice;if(p.choice==='negotiate')f.accountResolved=true;else f.mediationRequested=true;return;}
        if(name==='mediationReceipt'){quest('M17');requireScene(s,'village');requireThat(f.mediationRequested,'先请陈伯代呈争议。');f.accountResolved=true;return;}
        if(name==='payFee'){quest('M17');requireScene(s,s.choices.accounts==='mediate'?'village':'market');requireThat(f.accountResolved,'先确认重算结果或县里的回执。');return once(s,'payFee',()=>{requireThat(s.coins>=2,'合理转运费还差 2 文。可在镇集卖一件制品。');s.coins-=2;log(s,'fee',-2,'双方确认的转运与代存费用');f.fairFeePaid=true;});}
        if(name==='familyLetter'){quest('M19');requireScene(s,'hall');requireThat(['father','mother','grandfather'].includes(p.who),'请分别和家人交谈。');s.familyTalks[p.who]=true;return;}
        if(name==='chooseGift'){quest('M19');requireScene(s,'hall');return once(s,'chooseGift',()=>{requireThat(['herb','shell'].includes(p.item),'可选一株草药或一枚贝壳。');spend(s,{[p.item]:1});s.choices.letterGift=p.item;f.giftChosen=true;});}
        if(name==='writeReply'){quest('M19');requireScene(s,'hall');requireThat(f.letterFamily&&f.giftChosen,'先听听三位家人的想法，再选好随信小物。');return once(s,'writeReply',()=>{give(s,{reply:1});f.replyWritten=true;});}
        if(name==='sendReply'){quest('M19');requireScene(s,'village');return once(s,'sendReply',()=>{spend(s,{reply:1});f.replySent=true;});}
        if(name==='seating'){quest('M20');requireScene(s,'hall');requireThat(['family','neighbors'].includes(p.choice),'先选家宴座次。');s.choices.feast=p.choice;f.seatingChosen=true;return;}
        if(name==='hangLamps'){quest('M20');requireScene(s,'yard');f.festivalLamps=true;return;}
        if(name==='shareFeast'){quest('M20');requireScene(s,'hall');requireThat(f.seatingChosen&&f.festivalLamps,'先安排座次，再挂好庭院的灯。');return once(s,'shareFeast',()=>{spend(s,{feast:1});f.feastShared=true;});}
        if(name==='practice'){requireScene(s,'hall');requireThat(done(s,'M04'),'先让家人吃上第一顿热饭。');requireThat(Number.isInteger(p.index)&&p.index>=0&&p.index<6,'请选择字纸。');if(p.index>=2)requireThat(done(s,'M05'),'先认识村里的邻居，孩子们才会来借纸。');return once(s,'practice:'+p.index,()=>{s.practice[p.index]=true;s.journal.push({id:'S01-'+p.index,text:['把空白纸分好，祖父把第一张留给你。','写下一个家字，祖父说落脚处也能慢慢成家。','替借纸的孩子描一笔山字。','孩子认得海字，讲起自家出海的人。','祖父把讲过的草木名抄成字条。','商议明春的课，书案前留下新的约定。'][p.index]});});}
        if(name==='sortPage'){requireScene(s,'study');requireThat(f.ledgerPermission,'先完成 M08 的归属确认与查看许可。');if(f.bookReturned)requireThat(f.copyApproved,'原簿已经交还，等程婉同意留下副本后再回看。');requireThat(Number.isInteger(p.index)&&p.index>=0&&p.index<4,'请选择获准整理的页片。');return once(s,'page:'+p.index,()=>{s.pages[p.index]=true;});}
        if(name==='tidy'){requireScene(s,'store');f.storeTidied=true;return;}
        if(name==='buy'){requireScene(s,'village');requireThat(done(s,'M04'),'先完成第一顿饭。');
          const order=p.items&&typeof p.items==='object'&&!Array.isArray(p.items)?p.items:{[p.item]:p.quantity??1},entries=Object.entries(order);
          requireThat(entries.length>0,'请先选择要购入的物资。');let total=0;
          for(const [item,quantity]of entries){requireThat(Object.hasOwn(supplyPrices,item),'这里暂时买不到这件物品。');requireThat(Number.isInteger(quantity)&&quantity>=1&&quantity<=99,'每种物资请选择 1—99 份。');total+=supplyPrices[item]*quantity;}
          requireThat(s.coins>=total,'铜钱不足，本次合计需要 '+total+' 文。');const goods=Object.fromEntries(entries);s.coins-=total;give(s,goods);
          const note=entries.map(([item,quantity])=>itemNames[item]+' ×'+quantity).join('、');log(s,'buy',-total,'向乡邻购入 '+note,entries.length===1?entries[0][0]:null);return;}
        fail('这项动作暂未开放。');
      });
    }
  }
  return {Engine,season5,SEASON5_ORDER,v5,V5_ORDER,v4,V4_ORDER,children,scholar,v3,V3_ORDER,rural,initial,current,done,reached,sceneGate,clock,tide,crop,gardenPlot,quantity,available,normaliseLoaded,
    rareResources,resourceCooldown,resourceRequirement,daylight,SAVE_KEY,ORDER,V2_ORDER,shopPrice,shopCustomers,story2:storyV2,shopProducts:storyV2.products,titles,steps,rewards,itemNames,products,prices,supplyPrices,recipes};
});
