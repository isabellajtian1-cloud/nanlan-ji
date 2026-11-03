/* Optional household production. All clocks use worldTick; no offline losses. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanProductionModel=api;})(globalThis,function(){
'use strict';
const country=typeof module==='object'&&module.exports?require('./rural-model.js'):globalThis.NanlanRural;
const inputs={mulberrySapling:8,silkwormEgg:6,fishFry:4,fishFeed:2};
function addGoods(s,id,n,unit,give){
 if(!n)return;const costs=s.production.costs??={},old=s.bag[id]||0;
 costs[id]=(old*(costs[id]??unit)+n*unit)/(old+n);give(s,{[id]:n});
}
function rainLoss(s){
 const f=s.production.fish;if(f.start==null||f.protected)return false;
 const until=Math.min(s.worldTick,f.fedAt===null?s.worldTick:f.fedAt+480);
 for(let d=Math.floor(f.start/1440)+1;d<=Math.floor(until/1440)+1;d++){
   const noon=(d-1)*1440+720;
   if(f.start<=noon&&noon<=until&&(f.fedAt===null||noon<f.fedAt+480)&&country.weather(s,d)==='rain')return true;
 }
 return false;
}
const shopNames=['南澜记','借灯阁','桑榆铺'];
const itemIds=['mulberrySapling','mulberryLeaf','silkwormEgg','fishFry','fishFeed','pondFish','rawSilk','fineSilk','silkwormCompost'];
const emptyWorm=()=>({startedAt:null,cleaned:false,tended:false});
const fresh=()=>({kit:false,costs:{},mulberry:{planted:false,watered:false,readyAt:null,harvests:0,fertilized:false},worms:emptyWorm(),fish:{stocked:false,fedAt:null},botanical:false,clothesStartedAt:null,clothesReadyAt:null,clothesSeen:false,shopName:null});
const freshActors=()=>({layer:40,outfit:'old',changedAt:null});
function status(s){const p=s.production||fresh(),age=p.worms.startedAt===null?null:s.worldTick-p.worms.startedAt;return {mulberryReady:p.mulberry.watered&&s.worldTick>=p.mulberry.readyAt,wormAge:age,careOpen:age!==null&&age>=180&&age<300&&!p.worms.tended,wormReady:age!==null&&age>=360,rainLoss:rainLoss(s),fishDue:p.fish.fedAt===null?null:p.fish.fedAt+480+(rainLoss(s)?120:0),fishReady:p.fish.fedAt!==null&&s.worldTick>=p.fish.fedAt+480+(rainLoss(s)?120:0)};}
function reconcile(s){s.production??=fresh();s.actorState??=freshActors();const p=s.production;if(p.clothesReadyAt!==null&&s.worldTick>=p.clothesReadyAt&&s.actorState.outfit==='old'){s.actorState={layer:40,outfit:'nanlanSilk',changedAt:p.clothesReadyAt};s.journal.push({id:'南澜新衣',tick:p.clothesReadyAt,text:'自家生丝，南澜花样。一家人穿上亲手经营所得的新衣。'});}}
function normalise(s,need){s.production??=fresh();s.actorState??=freshActors();const p=s.production,a=s.actorState;need(p&&typeof p==='object'&&p.mulberry&&p.worms&&p.fish,'桑基生产资料无效。');p.costs??={};need(typeof p.costs==='object'&&!Array.isArray(p.costs),'生产成本记录无效。');
 for(const v of Object.values(p.costs))need(Number.isFinite(v)&&v>=0&&v<1e6,'生产成本记录无效。');
 if(p.worms.newLot)need([1,2].includes(p.worms.yield)&&Number.isFinite(p.worms.cost)&&p.worms.cost>=0,'蚕匾记录无效。');
 if(p.fish.start!=null)need(Number.isFinite(p.fish.start)&&p.fish.start>=0&&p.fish.start<=s.worldTick&&Number.isFinite(p.fish.cost)&&p.fish.cost>=0,'鱼塘记录无效。');
 const boolean=v=>typeof v==='boolean',time=v=>v===null||Number.isFinite(v)&&v>=0&&v<1e9;
 for(const v of [p.kit,p.botanical,p.clothesSeen,p.mulberry.planted,p.mulberry.watered,p.mulberry.fertilized,p.worms.cleaned,p.worms.tended,p.fish.stocked])need(boolean(v),'桑基生产状态无效。');
 for(const v of [p.mulberry.readyAt,p.worms.startedAt,p.fish.fedAt,p.clothesStartedAt,p.clothesReadyAt,a.changedAt])need(time(v),'生产时间无效。');
 need(Number.isInteger(p.mulberry.harvests)&&p.mulberry.harvests>=0&&p.mulberry.harvests<1e6,'桑树采收记录无效。');need(p.shopName===null||shopNames.includes(p.shopName),'铺号不在祖父拟定的三个名字中。');
 need(!p.mulberry.watered||p.mulberry.planted&&p.mulberry.readyAt!==null,'桑树浇水记录无效。');need(p.mulberry.planted||p.mulberry.readyAt===null,'桑树状态无效。');need(p.worms.startedAt===null?!p.worms.cleaned&&!p.worms.tended:p.worms.startedAt<=s.worldTick,'蚕匾时间无效。');need(!p.worms.tended||p.worms.cleaned,'蚕匾照料记录无效。');need(p.fish.fedAt===null||p.fish.stocked&&p.fish.fedAt<=s.worldTick,'鱼塘投喂记录无效。');
 need(p.clothesStartedAt===null?p.clothesReadyAt===null:p.botanical&&p.clothesStartedAt<=s.worldTick&&p.clothesReadyAt>p.clothesStartedAt,'制衣记录无效。');need(a&&a.layer===40&&['old','nanlanSilk'].includes(a.outfit),'角色衣装资料无效。');need(a.outfit==='old'||p.clothesReadyAt!==null&&s.worldTick>=p.clothesReadyAt,'新衣尚未制好。');need(!p.clothesSeen||a.outfit==='nanlanSilk','新衣回响资料无效。');reconcile(s);
}
function act(s,name,q,h){const {requireThat:need,requireScene:at,spend,give,log}=h;need(s.flags.volume2Started,'请先在正厅开启第二卷，再经营桑基鱼塘与筹备新衣。');need(q.sequence===s.revision,'眼前的安排已更新，请重新打开后操作。');const p=s.production,z=status(s);
 if(name==='silkChooseName'){at(s,'study');need(s.flags.v2Entry,'先在正厅读铺讯，再请祖父拟字号。');need(shopNames.includes(q.name),'请从祖父拟定的三个字号中选择。');need(!p.shopName,'字号已经落笔，可回书案重读家人的话。');p.shopName=q.name;s.journal.push({id:'铺号',tick:s.worldTick,text:'祖父题下「'+q.name+'」，一家人将它带往南街。'});return;}
 if(name==='silkBotanical'){at(s,'study');need(!p.botanical,'草木底稿已经誊好，可带给母亲看。');p.botanical=true;s.journal.push({id:'祖父记草木',tick:s.worldTick,text:'祖父画下桑叶与岭南小白花，愿将底稿借给母亲作新衣绣样。'});return;}
 if(name==='silkClothes'){need((['yard','hall'].includes(s.scene)&&!h.familyAtShop(s,'mother'))||(s.scene==='generalStore'&&h.familyAtShop(s,'mother')),'请到母亲当前所在的地方，当面交付生丝。');need(p.botanical,'请先到书房看祖父的草木底稿，再请母亲制衣。');need(p.clothesStartedAt===null,'母亲已经接下这份生丝，不必再交。');spend(s,{fineSilk:2});p.clothesStartedAt=s.worldTick;p.clothesReadyAt=(Math.floor(s.worldTick/1440)+3)*1440+360;return;}
 if(name==='silkClothesSeen'){need(s.actorState.outfit==='nanlanSilk','新衣还在裁绣，请等到约定的清晨。');if(p.clothesSeen)return false;p.clothesSeen=true;return;}
 if(name==='silkCookFish'){at(s,'yard');need(s.flags.stoveClean,'请先清理灶边。');need(s.bucketWater>=1,'请先到水缸取水。');spend(s,{pondFish:1,wood:1});s.bucketWater--;give(s,{hotMeal:1});return;}
 const R=country,work=(mins,energy)=>R.work(s,mins,energy,need);
 if(name==='silkBuy'){
   at(s,'village');need(p.kit&&Object.hasOwn(inputs,q.item),'先在池边接过初养用具。');
   const price=inputs[q.item];need(s.coins-price>=s.story2.reserve,'家用不足，先留足约好的家本。');
   s.coins-=price;addGoods(s,q.item,1,price,give);log(s,'supply',-price,'乡邻补给生产用料',q.item);return;
 }
 at(s,'yard');
 if(name==='silkKit'){
   need(!p.kit,'这份初养用具已经领过。');spend(s,{wood:2,bamboo:1});work(20,4);p.kit=true;
   for(const [id,n] of Object.entries({mulberrySapling:1,silkwormEgg:2,fishFry:2,fishFeed:2}))addGoods(s,id,n,0,give);return;
 }
 need(p.kit,'先在池边领取母亲备下的桑苗、蚕种与鱼苗。');
 if(name==='silkPlant'){need(!p.mulberry.planted,'这株桑树已经种好，不必重复种植。');spend(s,{mulberrySapling:1});work(5,1);p.mulberry.planted=true;return;}
 if(name==='silkWater'){need(p.mulberry.planted&&!p.mulberry.watered,'先种下桑苗；浇过一次就能生长。');need(s.bucketWater>=1,'请先到庭院水缸取一桶水。');work(5,1);s.bucketWater--;p.mulberry.watered=true;p.mulberry.readyAt=s.worldTick+240;return;}
 if(name==='silkFertilize'){need(p.mulberry.watered&&!z.mulberryReady&&!p.mulberry.fertilized,'每轮长叶时可施肥一次，叶子已长好便不必再施。');spend(s,{pondMud:1});work(10,2);p.mulberry.fertilized=true;p.mulberry.readyAt=Math.max(s.worldTick,p.mulberry.readyAt-60);return;}
 if(name==='silkLeaves'){need(z.mulberryReady,'桑叶还在生长，请稍后再来。');work(10,2);give(s,{[R.weather(s)==='damp'?'wetLeaf':'mulberryLeaf']:6});p.mulberry.harvests++;p.mulberry.readyAt=s.worldTick+180;p.mulberry.fertilized=false;return;}
 if(name==='silkDryLeaves'){
   const n=Math.min(6,s.bag.wetLeaf||0);need(n>0,'没有待晾的湿叶。');spend(s,{wetLeaf:n});
   if(q.heat)spend(s,{wood:1});work(q.heat?5:15,1);give(s,{mulberryLeaf:n});return;
 }
 if(name==='silkStart'){
   need(p.worms.startedAt===null,'这一匾蚕还没收茧，请先等它成熟。');
   const dry=Math.min(3,s.bag.mulberryLeaf||0),wet=3-dry;
   const cost=(p.costs?.silkwormEgg??6)+3;
   spend(s,{silkwormEgg:1,mulberryLeaf:dry,wetLeaf:wet});work(10,2);
   p.worms={...emptyWorm(),startedAt:s.worldTick,newLot:true,yield:wet?1:2,cost};return;
 }
 if(name==='silkCare'||name==='silkClean'||name==='silkVent'){
   need(z.careOpen,'清扫只在吐丝前进行一次；已过时机也会正常结茧。');
   if(!p.worms.cleaned){
     need(name!=='silkVent','先轻清蚕沙，再将窗扇支开一道缝。');work(5,1);
     p.worms.cleaned=true;give(s,{silkwormCompost:1});
   }else need(name!=='silkClean','蚕匾已经清扫过了。');
   if(name!=='silkClean')p.worms.tended=true;return;
 }
 if(name==='silkHarvest'){
   need(z.wormReady,'蚕茧还没长好，稍后再来收。');
   const w=p.worms;
   if(!w.newLot){give(s,{[w.tended?'fineSilk':'rawSilk']:2,silkwormEgg:1});p.worms=emptyWorm();return;}
   const hits=q.hits??0;need(Number.isInteger(hits)&&hits>=0&&hits<=3,'请重新拾绪。');
   need(!q.keep||w.yield>1,'这匾只够一束，先保住成品。');
   spend(s,{wood:1});work(10,2);
   const n=w.yield-(q.keep?1:0),fine=!w.tended?0:hits===3?n:hits===2?Math.floor(n/2):0;
   const unit=(w.cost+2)/w.yield;
   addGoods(s,'fineSilk',fine,unit,give);addGoods(s,'rawSilk',n-fine,unit,give);
   if(q.keep)addGoods(s,'silkwormEgg',1,unit,give);
   if(!w.cleaned)give(s,{silkwormCompost:1});p.worms=emptyWorm();return;
 }
 if(name==='silkStockFish'){
   need(!p.fish.stocked,'这塘鱼还在养，请先收鱼再放苗。');
   const cost=p.costs?.fishFry??4;spend(s,{fishFry:1});work(5,1);p.fish={stocked:true,fedAt:null,start:s.worldTick,cost,protected:false};return;
 }
 if(name==='silkGuard'){
   need(p.fish.stocked&&p.fish.start!=null&&!p.fish.protected&&!rainLoss(s)&&R.weather(s)==='rain'&&s.worldTick%1440+20<=720&&!z.fishReady,'午前看到涨水征兆，才需扎篱。');
   spend(s,{bamboo:1});work(20,3);p.fish.protected=true;return;
 }
 if(name==='silkFeedFish'){
   need(p.fish.stocked&&p.fish.fedAt===null,'放好鱼苗后只需投喂一次。');need(['feed','leaves','litter'].includes(q.food),'请选择鱼食、桑叶或蚕沙。');
   if(q.food==='feed'){spend(s,{fishFeed:1});p.fish.cost=(p.fish.cost??4)+(p.costs?.fishFeed??2);}
   else if(q.food==='litter')spend(s,{silkwormCompost:1});
   else{const dry=Math.min(2,s.bag.mulberryLeaf||0);spend(s,{mulberryLeaf:dry,wetLeaf:2-dry});p.fish.cost=(p.fish.cost??4)+2;}
   work(5,1);p.fish.fedAt=s.worldTick;return;
 }
 if(name==='silkHarvestFish'){
   need(z.fishReady,'塘鱼还在长大，稍后再来。');const fish=p.fish;
   if(fish.start==null){give(s,{pondFish:3,fishFry:1,pondMud:1});}
   else{const n=z.rainLoss?2:3,unit=fish.cost/n;work(15,3);addGoods(s,'pondFish',n-(q.keep?1:0),unit,give);if(q.keep)addGoods(s,'fishFry',1,unit,give);give(s,{pondMud:1});}
   p.fish={stocked:false,fedAt:null};return;
 }
 if(name==='silkWait'){const targets=[];if(p.mulberry.watered&&!z.mulberryReady)targets.push(p.mulberry.readyAt);if(z.wormAge!==null&&!z.wormReady){const age=z.wormAge;targets.push(p.worms.startedAt+(age<180?180:age<300&&!p.worms.tended?300:360));}if(p.fish.fedAt!==null&&!z.fishReady)targets.push(z.fishDue);need(targets.length,'眼下没有正在等待的生长阶段。');const night=Math.floor(s.worldTick/1440)*1440+1320;need(s.worldTick<night,'夜深了，请回东厢房睡一夜。');need(!z.careOpen||q.skipCare===true,'蚕儿正待照料，先清扫开窗，或明确选择让它自然结茧。');s.worldTick=Math.min(Math.min(...targets),night);return;}
 need(false,'这项桑基事务尚未开放。');
}
return {inputs,shopNames,itemIds,fresh,freshActors,status,normalise,reconcile,act};
});
