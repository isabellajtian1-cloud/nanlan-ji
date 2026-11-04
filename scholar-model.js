/* Optional household cooking, with packed meals kept outside saleable inventory. */
(function(root,make){if(typeof module==='object'&&module.exports)module.exports=make();else root.NanlanScholarModel=make();})(globalThis,function(){
'use strict';
const dishes=['shootRice','crustRice'],price=10;
const day=s=>Math.floor(s.worldTick/1440)+1;
const lunch=s=>s.worldTick%1440>=660&&s.worldTick%1440<780;
const present=s=>s.mode==='daily'&&!!s.flags.firstShared&&!!s.flags.bridgeReady&&lunch(s);
const fresh=()=>({met:false,recipe:false,pots:0,practice:0,sat:false,giftDay:0,shared:false,sharedCrust:false,tasted:false,signed:false,margin:'',order:null,lastOrder:0});
function normalise(s,need){const a=s.scholar;if(a===undefined)return;const count=n=>Number.isSafeInteger(n)&&n>=0;
 need(a&&typeof a==='object'&&['met','recipe','sat','shared','sharedCrust','tasted','signed'].every(k=>typeof a[k]==='boolean')&&['pots','practice','giftDay','lastOrder'].every(k=>count(a[k]))&&a.practice<=3&&a.practice<=a.pots&&(!a.recipe||a.met)&&(!a.pots||a.recipe)&&['','early','late'].includes(a.margin),'饭方记录不完整。');
 if(a.order){const o=a.order;need(a.recipe&&s.flags.v2Opened&&count(o.due)&&o.due>0&&count(o.shootRice)&&count(o.crustRice)&&o.shootRice+o.crustRice<=2,'取饭单记录不完整。');}}
function judge(released,target,covered){if(released===null||released-target>1000)return 'late';if(target-released>1000)return 'early';return covered&&Math.abs(target-released)<=450?'perfect':'ordinary';}
function cookingBlock(s){if(!s.scholar?.recipe)return '先带一份竹笋向锅边先生讨教。';if(!s.flags.stoveClean||!s.flags.drainClear)return '先清灶边和宅外水口。';if(!s.bucketWater)return '先到庭院水缸装一桶水。';
 if(!s.bag.rice)return '米袋空了，村口乡邻余粮可补购。';if(!s.bag.shoot)return '还缺一份竹笋，可去竹林采。';if(!s.bag.wood)return '还缺一份枯枝，可在村边拾取。';return '';}
function act(s,name,p,h){const {requireThat:need,requireScene:at,spend,give,log}=h;
 need(p.sequence===s.revision,'这份记录已更新，请重新查看后确认。');
 const a=s.scholar??=fresh();
 if(['liangMeet','liangSit','liangGift','liangRecipe','liangSign','liangTaste'].includes(name)){
   at(s,'village');need(present(s),'梁先生午间在村口茶棚，十一时至十三时可来。');
   if(name==='liangMeet'){a.met=true;return;}need(a.met,'先和茶棚里的书生说句话。');
   if(name==='liangSit'){a.sat=true;return;}
   if(name==='liangGift'){need(a.giftDay!==day(s),'先生今日已经用过饭了。');spend(s,{hotMeal:1});a.giftDay=day(s);return;}
   if(name==='liangRecipe'){need(!a.recipe,'这页饭方已抄在手边。');need(s.visits.bambooGrove,'先去竹林走一趟，带一份竹笋回来。');spend(s,{shoot:1});a.recipe=true;s.journal.push({id:'锅边先生',tick:s.worldTick,text:'梁问炊抄下母亲的笋饭方。'});return;}
   if(name==='liangTaste'){need(!a.tasted,'这一口已经尝过。');spend(s,{crustRice:1});a.tasted=true;return;}
   need(a.shared&&!a.signed,'等一家人尝过这道饭再来。');a.signed=true;s.journal.push({id:'锅边先生',tick:s.worldTick,text:'南澜李家，已试过。'});return;
 }
 if(name==='liangCook'){
   at(s,'yard');const why=cookingBlock(s);need(!why,why);need(['perfect','ordinary','early','late','quick'].includes(p.result),'请重新照看这锅笋饭。');if(p.result==='quick')need(a.practice>=3,'亲手做成三锅后，便能照旧火候快做。');
   spend(s,{rice:1,shoot:1,wood:1});s.bucketWater--;give(s,{[p.result==='perfect'?'crustRice':'shootRice']:1});a.pots++;
   if(['ordinary','perfect'].includes(p.result))a.practice=Math.min(3,a.practice+1);
   if(['early','late'].includes(p.result))a.margin=p.result;
   log(s,'cook',0,p.result==='perfect'?'笋饭出锅，留有薄黄锅巴':'笋香焖饭出锅');return;
 }
 if(name==='liangEat'||name==='liangShare'){need(dishes.includes(p.item),'请选择一份笋香焖饭。');if(name==='liangShare')at(s,'hall');
   spend(s,{[p.item]:1});if(name==='liangEat')s.stamina=Math.min(100,s.stamina+35);else{a.shared=true;if(p.item==='crustRice')a.sharedCrust=true;}return;}
 at(s,'generalStore');need(s.flags.v2Opened&&a.pots>0,'先在自家灶上做成一锅笋饭，并在南街开店。');
 if(name==='liangBook'){need(lunch(s)&&!s.story2.days[day(s)]?.closed,'午间开门时，脚夫会来问饭。');need(!a.order&&a.lastOrder!==day(s),'先办妥手里这张取饭单，改日再接。');a.order={due:day(s)+1,shootRice:0,crustRice:0};a.lastOrder=day(s);return;}
 const o=a.order;need(o,'柜上没有待办的取饭单。');
 if(name==='liangPack'){need(dishes.includes(p.item)&&o.shootRice+o.crustRice<2,'饭篮已经齐备，或饭种有误。');spend(s,{[p.item]:1});o[p.item]++;return;}
 if(name==='liangCancel'){give(s,{shootRice:o.shootRice,crustRice:o.crustRice});a.order=null;return;}
 need(name==='liangDeliver','请核对取饭单。');need(day(s)>=o.due&&lunch(s),'客人约在次日午间，错过可顺延到下一次午间。');need(o.shootRice+o.crustRice===2,'请先把两份实饭放进取饭篮。');
 h.bookSale(s,'shootRice',2,price,2*(h.supplyPrices.rice+h.prices.shoot+h.prices.wood),'riceOrder');a.order=null;a.lastOrder=day(s);
}
return {act,normalise,present,lunch,day,judge,price,dishes,cookingBlock};
});
