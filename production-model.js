/* Optional household production. All clocks use worldTick; no offline losses. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanProductionModel=api;})(globalThis,function(){
'use strict';
const shopNames=['南澜记','借灯阁','桑榆铺'];
const itemIds=['mulberrySapling','mulberryLeaf','silkwormEgg','fishFry','fishFeed','pondFish','rawSilk','fineSilk','silkwormCompost'];
const emptyWorm=()=>({startedAt:null,cleaned:false,tended:false});
const fresh=()=>({kit:false,mulberry:{planted:false,watered:false,readyAt:null,harvests:0,fertilized:false},worms:emptyWorm(),fish:{stocked:false,fedAt:null},botanical:false,clothesStartedAt:null,clothesReadyAt:null,clothesSeen:false,shopName:null});
const freshActors=()=>({layer:40,outfit:'old',changedAt:null});
function status(s){const p=s.production||fresh(),age=p.worms.startedAt===null?null:s.worldTick-p.worms.startedAt;return {mulberryReady:p.mulberry.watered&&s.worldTick>=p.mulberry.readyAt,wormAge:age,careOpen:age!==null&&age>=180&&age<300&&!p.worms.tended,wormReady:age!==null&&age>=360,fishReady:p.fish.fedAt!==null&&s.worldTick-p.fish.fedAt>=480};}
function reconcile(s){s.production??=fresh();s.actorState??=freshActors();const p=s.production;if(p.clothesReadyAt!==null&&s.worldTick>=p.clothesReadyAt&&s.actorState.outfit==='old'){s.actorState={layer:40,outfit:'nanlanSilk',changedAt:p.clothesReadyAt};s.journal.push({id:'南澜新衣',tick:p.clothesReadyAt,text:'自家生丝，南澜花样。一家人穿上亲手经营所得的新衣。'});}}
function normalise(s,need){s.production??=fresh();s.actorState??=freshActors();const p=s.production,a=s.actorState;need(p&&typeof p==='object'&&p.mulberry&&p.worms&&p.fish,'桑基生产资料无效。');const boolean=v=>typeof v==='boolean',time=v=>v===null||Number.isFinite(v)&&v>=0&&v<1e9;
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
 at(s,'yard');
 if(name==='silkKit'){need(!p.kit,'这份初养用具已经领过。');p.kit=true;give(s,{mulberrySapling:1,silkwormEgg:2,fishFry:2,fishFeed:2});return;}
 need(p.kit,'先在池边领取母亲备下的桑苗、蚕种与鱼苗。');
 if(name==='silkPlant'){need(!p.mulberry.planted,'这株桑树已经种好，不必重复种植。');spend(s,{mulberrySapling:1});p.mulberry.planted=true;return;}
 if(name==='silkWater'){need(p.mulberry.planted&&!p.mulberry.watered,'先种下桑苗；浇过一次就能生长。');need(s.bucketWater>=1,'请先到庭院水缸取一桶水。');s.bucketWater--;p.mulberry.watered=true;p.mulberry.readyAt=s.worldTick+240;return;}
 if(name==='silkFertilize'){need(p.mulberry.watered&&!z.mulberryReady&&!p.mulberry.fertilized,'每轮长叶时可施肥一次，叶子已长好便不必再施。');spend(s,{silkwormCompost:1});p.mulberry.fertilized=true;p.mulberry.readyAt=Math.max(s.worldTick,p.mulberry.readyAt-60);return;}
 if(name==='silkLeaves'){need(z.mulberryReady,'桑叶还在生长，请稍后再来。');give(s,{mulberryLeaf:6});p.mulberry.harvests++;p.mulberry.readyAt=s.worldTick+180;p.mulberry.fertilized=false;return;}
 if(name==='silkStart'){need(p.worms.startedAt===null,'这一匾蚕还没收茧，请先等它成熟。');spend(s,{silkwormEgg:1,mulberryLeaf:3});p.worms={startedAt:s.worldTick,cleaned:false,tended:false};return;}
 if(name==='silkClean'){need(z.careOpen&&!p.worms.cleaned,'清扫只在吐丝前进行一次；已过时机也会照常结茧。');p.worms.cleaned=true;give(s,{silkwormCompost:1});return;}
 if(name==='silkVent'){need(z.careOpen&&p.worms.cleaned,'先轻清蚕沙，再将窗扇支开一道缝；错过也会正常结茧。');p.worms.tended=true;return;}
 if(name==='silkHarvest'){need(z.wormReady,'蚕茧还没长好，稍后再来收。');give(s,{[p.worms.tended?'fineSilk':'rawSilk']:2,silkwormEgg:1});p.worms=emptyWorm();return;}
 if(name==='silkStockFish'){need(!p.fish.stocked,'这塘鱼还在养，请先收鱼再放苗。');spend(s,{fishFry:1});p.fish.stocked=true;return;}
 if(name==='silkFeedFish'){need(p.fish.stocked&&p.fish.fedAt===null,'放好鱼苗后只需投喂一次。');need(['feed','leaves'].includes(q.food),'请选择鱼食或桑叶。');spend(s,q.food==='feed'?{fishFeed:1}:{mulberryLeaf:2});p.fish.fedAt=s.worldTick;return;}
 if(name==='silkHarvestFish'){need(z.fishReady,'塘鱼还在长大，稍后再来。');give(s,{pondFish:3,fishFry:1});p.fish={stocked:false,fedAt:null};return;}
 if(name==='silkWait'){const targets=[];if(p.mulberry.watered&&!z.mulberryReady)targets.push(p.mulberry.readyAt);if(z.wormAge!==null&&!z.wormReady){const age=z.wormAge;targets.push(p.worms.startedAt+(age<180?180:age<300&&!p.worms.tended?300:360));}if(p.fish.fedAt!==null&&!z.fishReady)targets.push(p.fish.fedAt+480);need(targets.length,'眼下没有正在等待的生长阶段。');const night=Math.floor(s.worldTick/1440)*1440+1320;need(s.worldTick<night,'夜深了，请回东厢房睡一夜。');need(!z.careOpen||q.skipCare===true,'蚕儿正待照料，先清扫开窗，或明确选择让它自然结茧。');s.worldTick=Math.min(Math.min(...targets),night);return;}
 need(false,'这项桑基事务尚未开放。');
}
return {shopNames,itemIds,fresh,freshActors,status,normalise,reconcile,act};
});
