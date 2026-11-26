/* The village ledger records deeds on the road, then follows their goods to South Street. */
(()=>{'use strict';
const R=N.rural;
const L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh;
const labels={chen:L=>L('陈伯 · 两篮时蔬','Uncle Chen · Two Baskets of Greens'),xu:L=>L('许青禾 · 午前之约','Xu Qinghe · Before Noon'),cen:L=>L('阿岑 · 认一道水痕','A-Cen · The High-Water Mark')};
const words={
 chen:L=>L('陈伯搁下扁担。「巷口和井边各有一户，灶上还缺口青菜。你若顺路，一户捎一篮。」','Uncle Chen sets down his pole. “Two hearths need greens today. If you pass the lane and the well, take a basket to each.”'),
 xu:L=>L('许青禾拣出两张包药纸。「两份新采的草药，午前可肯留给我？若要改主意，趁早告诉我，也好另寻。」','Xu smooths two sheets of paper. “Could you keep two fresh herbs for me until noon? Tell me early if your plans change.”'),
 cen:L=>L('阿岑指着桥脚。「水退了，石上有旧痕。带根竹子，同我认认桥柱和高阶，给后来的挑夫留条路。」','A-Cen points to the bridge. “The water has fallen. Bring a length of bamboo. We shall mark the pillar and the high steps for the next porter.”')};
const gifts={chen:L=>L('陈伯将种袋推过来。「往后拿一篮菜来，我给你换一包种子。咱们轮着种。」','Chen offers a seed pouch. “Bring a basket of greens and I shall trade you seeds. We can take turns growing them.”'),
 xu:L=>L('许青禾把竹匾图样折好。「一层薄摊，故意留道风口。你家的仓房也晒得出好药。」','Xu folds a drawing of a shallow drying tray. “Spread them thin and leave room for air. Your own storeroom will do.”'),
 cen:L=>L('阿岑拨开竹叶。「从这边进林，风落的香木也收得着。往后你认得路了。」','A-Cen parts the bamboo. “Take this path to find fallen fragrant wood. You know the way now.”')};
function note(str){const el=document.createElement('p');el.className='production-note';el.textContent=str;$('panelExtra').append(el);}
function action(label,name,p,refresh){if(name==='v2SampleDeliver')return button(label,()=>window.NanlanSeals.prepare(name,{sequence:state().revision,...p},label,refresh),name);return actButton(label,name,{...p,sequence:state().revision},refresh,name);}
function nav(label,scene,id){button(label,()=>{closeDialog();startNavigation(scene,id);},'rural-route-'+id,true);}
function journal(){
 const r=state().rural;
 if(r.chen==='working')for(const [bit,id,label] of [[1,'neighbor-home1',L('送到巷口','Visit the Lane')],[2,'neighbor-home2',L('送到井边','Visit the Well')]])if(!(r.homes&bit))nav(label,'village',id);
 if(R.promiseLive(state()))nav(L('午前去找许青禾','Meet Xu Before Noon'),'village','doctor');
 if(r.cen==='working')for(const [bit,id,label] of [[1,'neighbor-mark1',L('看桥柱水痕','Inspect the Bridge Pillar')],[2,'neighbor-mark2',L('看石阶水痕','Inspect the High Steps')]])if(!(r.marks&bit))nav(label,'mountain',id);
}
function meeting(g){
 const s=state(),r=s.rural,again=()=>meeting(g);
 activity(labels[g](L),words[g](L),'village-meeting');
 if(R.offered(s,g)){
   const cost={chen:L('留两篮菜，分送两户','Set Aside Two Greens for the Two Hearths'),xu:L('约定留两份鲜草药','Promise Two Fresh Herbs'),cen:L('带竹材一根，一起去认路','Bring One Bamboo Pole and Walk the Trail')}[g];
   action(cost,'neighborAccept',{person:g},again);action(L('今日顾不上，改日再来','Leave It for Another Day'),'neighborDecline',{person:g},()=>{closeDialog();});
 }
 if(g==='xu'&&R.promiseLive(s)){
   action(L('照约送药 · 一刻钟','Deliver the Herbs · 15 Minutes'),'neighborKeep',{},again);
   action(L('先说明另有安排','Let Xu Know Your Plans Have Changed'),'neighborWithdraw',{},again);
   button(L('另售原约的草药','Offer the Promised Herbs for Sale'),()=>{
     activity(labels.xu(L),L('这两份是午前的约。另售得六文，青禾须另寻药材。','These herbs were promised to Xu. Selling them brings six coins. She will have to find another supply.'));
     action(L('仍决定另售','Sell the Herbs for Six Coins'),'neighborSell',{},again);button(L('守住原约','Keep the Promise'),again,'keep-word',true);
   },'village-break',true);
 }
 if(r[g]==='working')journal();
 if(r[g]==='done'){
   note(gifts[g](L));
   if(!r.gifts[g]&&R.day(s)>=r.dates[g]+3)action(L('收下这份心意','Accept the Gift'),'neighborGift',{person:g},again);
   else if(!r.gifts[g])note(L('「过三个清晨再来，我给你留样东西。」','“Come back after three dawns. I shall have something for you.”'));
   if(r.gifts.chen&&g==='chen'&&r.seedDay!==R.day(s))action(L('一篮菜换一包菜种','Trade One Green for Seeds'),'neighborSeed',{},again);
   if(r.gifts.cen&&g==='cen')nav(L('去竹林找风落香木','Follow the Bamboo Trail'),'bambooGrove','neighbor-windfall');
 }
 if(r[g]==='broken')note(L('青禾把包药纸收回抽屉。「明日，请先同我说一声。」','Xu puts the papers away. “Next time, please tell me first.”'));
 if(R.rank(s))note(R.rank(s)===2?L('陈伯已答应替李家担保榕荫铺的押钱。','Chen has offered to stand surety for the banyan shop.'):L('村簿上已经写下了李家的名字。','The Li family now has a place in the village register.'));
}
function villageWord(){
 const s=state(),r=s.rural,level=R.rank(s),known=['chen','xu','cen'].some(k=>r[k]==='done');
 activity(L('陈伯 · 街坊怎样说起你','Uncle Chen · What the neighbours remember'),level===2?L('「这家人的字，我肯在旁边押个名。」','“I would put my own name beside theirs.”'):level===1?L('「翻开村簿吧，你家的名字已经记下了。」','“Open the village register. Your household has a line of its own.”'):L('「坐。你来南澜这些日子，哪一件事是谁亲眼见的，咱就说哪一件。」','“Sit a while. Let me tell you what folk here have actually seen.”'),'village-word');
 if(r.chen==='done')note(L('井边那户还记得，是你把菜送到了灶边。','At the well they remember who brought greens right to their hearth.'));
 if(r.xu==='done')note(L('青禾替你说过话：「说好午前，两份鲜草一份没少。」','Qinghe spoke for you. “Before noon, as promised. Both bundles.”'));
 if(r.cen==='done')note(L('阿岑说，挑担人认得你们留下的水痕。','Cen says the porters still look for the water marks you checked.'));
 if(s.flags.v2RegularFulfilled)note(L('南街的熟客认你的留货签，说回来取时，东西还在。','A regular on South Street remembers finding the promised goods waiting.'));
 if(s.flags.v3_audit)note(L('小满提过那次独立当班。你回来同她一笔笔核过账。','Xiaoman remembers the shift she ran and the accounts you checked together afterward.'));
 if(s.flags.v4_pay)note(L('河埠传回了话：第一航的钱，各家当面分清了。','Word came from the landing. Every household saw the first voyage settled.'));
 if(r.seedLoan){note(L('陈伯翻到借种那一行。收成后把原数留给下一户就好。','Chen finds your loan. After harvest, leave the same amount for the next household.')+' ×'+r.seedLoan);
 if(N.available(s,'seed')>=r.seedLoan)action(L('照原数还种','Return the borrowed seed'),'neighborRepay',{},villageWord);else note(L('行囊里还没留足菜种，收获后再来。','Set aside enough seed after harvest and come back.'));}
 else if(r.xu==='broken'||r.seedPledgeBroken)note(L('「青禾还记着那两份另卖的药。改日早些去找她，重新约好并送到，我再把种袋托你。」','“Qinghe remembers the herbs sold elsewhere. Make a fresh promise one morning and keep it. Then I can lend you seed.”'));
 else if(known){const n=level===2?2:1;note(L('「公种袋借你下地，收了照数还。误了时节也不收息。」','“Sow some seed from our common pouch. Return as much after harvest. No interest if the season slips.”'));action(L('向公种袋借菜种','Borrow from the village seed pouch')+' ×'+n,'neighborBorrow',{},villageWord);}
 else note(L('「清早来走走。灶上缺菜、药要趁鲜、水涨时哪条路能走，都是街坊用得着的事。」','“Come by early. A hearth needs greens, herbs must travel fresh, and someone must check the high road after rain.”'));
}
function npc(o){
 const g={villager:'chen',doctor:'xu',aCen:'cen'}[o.id];if(!g)return;
 if(g==='chen'&&state().flags.metChen)button(L('坐下听听乡里口碑','Sit and hear village word'),villageWord,'village-word',true);
 if(R.offered(state(),g)||state().rural[g])button(labels[g](L),()=>meeting(g),'neighbor-'+g,true);
}
function stop(o){
 const home=o.id.startsWith('neighbor-home'),name=home?'neighborDeliver':'neighborMark';
 activity(o.label,home?L('门边有一只空篮，屋里听见脚步声，有人来应门。','An empty basket waits by the door. Someone hears your footsteps and comes to greet you.'):L('石色深浅分明。记准水痕，挑担的人就知道该走哪一级。','The stone is darker below the waterline. It shows which steps the porters can safely take.'));
 action(home?L('送一篮菜 · 十分钟','Deliver One Green · 10 Minutes'):L('查看水痕 · 一刻钟','Read the Water Mark · 15 Minutes'),name,{stop:o.stop},()=>{closeDialog();notice(home?L('这一户收到了菜。','The household has its greens.'):L('水痕记下了。','The water mark is recorded.'));});
}
function rack(){const s=state();if(s.rural.gifts.xu&&s.rural.rackDay!==R.day(s))action(L('按青禾的图样晒药 · 鲜草三份得干药两份','Use Xu’s Tray · Three Fresh Herbs for Two Dried'),'neighborDry',{},showCraft);}
function supplies(){
 for(const [id,price] of Object.entries(window.NanlanProductionModel.inputs))action((N.itemNames[id]||id)+' ×1 · '+price+L(' 文',' coins'),'silkBuy',{item:id},showPantry);
}
function counter(){button(L('查看行商丝样单与防潮丝柜','View Silk Orders and the Display Cabinet'),silkDesk,'silk-counter',true);}
function silkDesk(){
 const s=state(),t=s.story2,o=t.orders.silkSample,today=R.day(s);
 activity(L('柜上 · 匀丝样单','At the Counter · A Silk Sample Order'),L('行商每隔三日来取丝，每束付二十八文。留给柜上的丝，就不能再取回给家里。','A merchant comes every three days and pays 28 coins per skein. Silk reserved at the counter stays there until the order is settled.'));
 if(o&&!o.delivered&&today<o.expires){
   note(L('已留样丝','Skeins reserved')+' '+o.held+'/'+o.quantity+' · '+L('最迟交货日','Last delivery day')+' '+(o.expires-1));
   action(L('把新到的特级丝留样','Reserve Newly Arrived Fine Silk'),'v2SampleReserve',{},silkDesk);
   action(L('交付样丝、结账','Deliver the Sample and Settle'),'v2SampleDeliver',{},silkDesk);
 }else if(!t.lastSampleDay||today>=t.lastSampleDay+3){
   action(L('接两束特级丝样单','Accept an Order for Two Fine Skeins'),'v2SampleAccept',{quantity:2},silkDesk);
   if(t.silkCabinet)action(L('接三束特级丝样单','Accept an Order for Three Fine Skeins'),'v2SampleAccept',{quantity:3},silkDesk);
 }else note(L('行商已收好货，过几日再来。','The merchant has the silk and will return in a few days.'));
 if(t.silkCabinet)note(L('丝样柜已经摆好，可以多陈列一束。','The cabinet has room for a third sample.'));
 else if(N.story2.cabinetPlan(s))action(L('照林师傅的图制柜 · 木二、竹二、八文','Build Master Lin’s Cabinet · Two Wood, Two Bamboo, Eight Coins'),'v2SilkCabinet',{},silkDesk);
 else note(L('林师傅想先看两个营业日的生丝销路：共卖四束日用丝，再交足一张样单，就送制柜图。','Master Lin will share his plan after four plain skeins sell across two trading days and one sample order is filled.'));
 button(L('回到铺面柜台','Return to the Shop Counter'),()=>window.NanlanV2.show('v2Shop'),'counter-back',true);
}
window.NanlanVillage={npc,stop,rack,supplies,journal,counter};
})();
