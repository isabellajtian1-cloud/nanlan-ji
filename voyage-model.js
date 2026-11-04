/* Spring-tide journey and six epilogues. Additive records live under choices; legacy schemas remain readable. */
(function(root,make){const api=make();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanVoyage=api;})(globalThis,function(){
'use strict';
const raw=[["春潮带来的木匣","A Box Brought by the Spring Tide","anchorage","voyageBox","何行舟将青屿来信与一只受损竹篮摆稳。「先认清损处和归路，再说走多远。」","Xingzhou sets down a letter and a damaged basket. “Know the damage and the road home before deciding how far to go.”",["查看旧补与新损","Inspect old repairs and new damage"],["读信，确认受托查看与近岸出行依据","Read the invitation and confirm consent and passage"]],["谁能离开几日","Who Can Be Away","generalStore","v3Desk","母亲把旧约放在新行程前面。「有人接手，或向对方说明改期，才能安心走。」","Mother places existing promises before the itinerary. “Arrange cover or agree a change before leaving.”",["核对未交订单与已约工时","Review open orders and agreed work"],["商定有限交接或暂缓营业","Agree limited cover or a shop pause"]],["同行的人","A Companion for the Road","hall","mealTable","「这一程，你想不想一起走？」同行由本人同意；独行也能完成这一程。","“Would you like to come?” Companions join by consent. Travelling alone remains possible.",["选择并确认一位同行者，或独行","Agree on one companion, or travel alone"]],["一只箱子装不下所有东西","One Box Cannot Hold Everything","store","workbench","小满把食物、样品和工具分开。「先记归谁，再看装得下多少，回程也要留空。」","Xiaoman separates food, samples and tools. “Record ownership, then capacity. Leave room for the return.”",["选择行囊清单，核对重量、占格与归属","Choose a packing list and check weight, space and ownership"]],["铺子关不关门","Will the Shop Stay Open","generalStore","v3Desk","「关几日也无妨，答应的人要知道。」这一趟只允许一件已拨出的现货成交，不代接新约。","“Closing for a few days is quite all right, if promised customers know.” Only one assigned item may sell; no new orders.",["张贴歇业告示，或拨一件现货有限营业","Post a closure notice, or assign one item for limited trading"]],["开船以前的晚饭","Supper before Departure","hall","mealTable","祖父递来空册。「不明白的地方，先不要急着写满。」吃过饭，再核对往返船脚和归期留言。","Grandfather offers a blank book. “Do not hurry to fill what you do not understand.” Share supper and confirm passage and return messages.",["与家人分享一份热饭","Share a warm meal with the family"],["核对出行许可、船脚与回程保留","Confirm passage, fares and the return reserve"]],["潮路上的第一程","The First Coastal Passage","anchorage","voyageHarbor","何行舟指着岸标。「近岸慢些，容易寻地方停。」船主掌船；天气不适航时先等，不必冒险。","Xingzhou points to the shore marks. “The near shore has places to stop.” The skipper sails; unsuitable weather calls for waiting.",["在认可的近岸路线中选一条，付船脚并靠泊","Choose an approved coastal route, pay the fare and berth"]],["船上的一顿热饭","A Meal beside the Boat","qPier","voyageShoreStove","船已经靠稳。岸灶获准用火，也可以用行囊冷食，或到停靠处买一份饭。","The boat is secured. Use the permitted shore hearth, eat packed food, or buy a meal.",["在安全岸灶料理，或选择冷食、购饭","Cook at the shore hearth, eat packed food, or buy supper"]],["青屿的第一条路","The First Path on Qingyu","qPier","voyageRoute","引路人指向上坡竹径。「晚些回来，走上头那条。」渡口、集市、盐田、灯台和宿院都先在图上标明。","The guide points uphill. “Use the upper bamboo path for the return.” The map already names the landing, fair, salt pans, beacon and lodging.",["读清替代路和回宿院的标记","Read the alternate route and lodging markers"],["亲走竹径并记下归路","Walk the bamboo path and mark the way back"]],["被修过三次的竹篮","A Basket Repaired Three Times","qFair","voyageCraft","匠人托住篮底。「修得不像原来，也能再用。」先取得许可，再分别看旧补、新损和用途。","The maker supports the base. “It can still serve, even if it looks different.” Ask permission, then inspect the repairs, damage and use.",["对照三处接缝，确认物主允许局部处理","Compare three joints and obtain permission"],["选择换一处竹篾，或改作非承重用途","Replace a strip, or agree a non-load-bearing use"]],["临潮集不是南街","The Tidal Fair Is Not South Street","qFair","voyageStall","客人先试提，再问好不好修。「我常带着走，湿了以后怎样？」卖不卖都先把用途问明白。","A customer tests the handle. “I carry it often. What happens when it gets damp?” Learn the use before discussing a sale.",["听取耐湿、便携与易修的需求","Learn about damp, carrying and repair needs"],["实物试提、议价出售，或记下试用后收回","Offer the assigned sample, or retain it after inspection"]],["一件东西换一种做法","A Piece for a Method","qFair","voyageCraft","林师傅的话记在册上：「先各做一小段，用过再说。」交流范围、材料和署名由双方先说清。","Master Lin’s advice is in the book: “Try a short piece each before deciding.” Agree materials, credit and the limits of the exchange.",["确认只示范一段收绳法，或只交换样品观察","Agree a short binding demonstration, or observation only"],["用自己的竹料与草绳做一段合作小样","Make a joint practice piece from your own bamboo and rope"]],["盐田边的空篮子","An Empty Basket at the Salt Pans","qSalt","voyageMeasure","棚架比预计窄。你没有急着怪谁，先把原约和实测尺寸并列摆出。","The shelf is narrower than expected. Place the original agreement beside the measurements before assigning blame.",["量架口、篮沿和取用余量","Measure the shelf, rim and handling clearance"],["协商局部改样、改用途或减少件数","Agree a local change, another use or fewer pieces"]],["旧灯台上的风","Wind at the Old Beacon","qBeacon","voyageSketch","风从盐田吹来。「在这里坐一会儿吧。」低处也能记录景色，不用登高，也没有画得好坏的评判。","Wind comes across the pans. “Sit here a while.” A sketch from below is welcome; no climb or drawing score is required.",["选择景物与一句话，留一页写生","Choose a view and a line for the travel book"]],["临时留下的一夜","A Night Longer","qLodge","voyageGuestBook","宿院主人把房价写明。天气适航时，你可以照常返程；若想多留，也先把归期消息送到候船处。","The host writes down the lodging price. Sail home in suitable weather, or arrange a longer stay and leave a return message.",["核天气、住宿费与归期留言，决定住或返","Check weather, lodging and return messages; choose stay or return"]],["回来先看留言","Read the Notes on Returning","generalStore","v3Desk","小满指着已办和暂停的两栏。「这几项已办，余下的等你确认。」歇业与零成交也能平稳交接。","Xiaoman points to the done and paused columns. “These are settled; those await you.” A closed shop and no sales are valid outcomes.",["核对授权货、收入、工钱、暂停与未完承诺","Reconcile assigned goods, receipts, wages and pending promises"]],["异地做法怎样留下","A Method Brought Home","store","workbench","林师傅翻看旅记。「换了料，先试一件。」青屿方法只在本地小样验证后采用，也可以暂存。","Master Lin reads the notes. “Different material needs a new test.” Adopt the method after a local trial, or keep it for later.",["拿本地竹材试一段，或注明暂不量产","Try local bamboo, or mark the method as not for production"]],["春潮有信","Letters on the Spring Tide","backHall","voyageBook","祖父说：「回来以后，自家的日子也看得更清楚。」家人各说一句，旅费和未完的约也有落处。","“Returning makes our own days clearer,” says Grandfather. Each family member has a word; fares and unfinished promises have a place.",["听父亲说已核实的京中来信与仍待核之处","Hear Father distinguish confirmed news from what remains uncertain"],["听祖父与母亲确认教读、旧纸去向和各自闲日","Hear the family agree lessons, papers and time of their own"],["结清旅费、收好旅途册，选择来季生活","Settle the journey, shelve the book and choose next season"]]],bonus=[{"title":["南澜又一年","Another Year in Nanlan"],"role":"mother","place":["hall","mealTable"],"text":["母亲说：「这回请几个人，咱们自己定。」先约日子，再腾地方，雨来便移到后堂。","Mother says, “This time we decide whom to invite.” Set a date, make room, and use the back hall if rain comes."],"stages":[["约一桌人，确认人数与饮食","Agree guests and dietary needs"],["腾出通道，选庭院或后堂","Clear a passage; choose yard or back hall"],["各做一道菜，一起坐下","Prepare a dish and sit together"],["留下一页席间回忆","Keep a page of the gathering"]]},{"title":["母亲的铺子","Mother’s Corner of the Shop"],"role":"mother","place":["generalStore","v2MotherCounter"],"text":["「这几件，想照我的意思摆一回。」母亲看重自己的判断，利润不必替她决定结局。","“I would like to arrange these my own way.” Mother has her own judgment. Profit will not decide her story."],"stages":[["听她的选品心愿与预算","Hear her wishes and agree a budget"],["同行选一件本地实货","Choose one real local piece together"],["试摆、试提，听一位来客","Display it and hear a visitor"],["核余货，让她决定留或收","Check remaining goods; let Mother decide"]]},{"title":["祖父的一堂课","Grandfather’s Lesson"],"role":"grandfather","place":["study","books"],"text":["「这一句认得，下一句还要找找。」残页先问许可，缺字可以留白，不把推测写成原文。","“I know this line; the next needs looking up.” Ask permission and leave missing words blank."],"stages":[["确认查阅、复制与归还许可","Confirm permission to read, copy and return"],["按页边、行距与纸纹拼三片","Match three pieces by edge, spacing and grain"],["找出处，确证或留作存疑","Seek a source; confirm it or leave it uncertain"],["用复制稿教读并归还原件","Teach from a copy and return the original"]]},{"title":["父亲未寄出的信","Father’s Unsent Letter"],"role":"father","place":["hall","father"],"text":["「有些话，当时写下了，也没想好要寄给谁。」你先问他愿不愿意一起看。","“I wrote those words without knowing whom to send them to.” First ask whether he wishes to share them."],"stages":[["取得许可，或只听他讲","Ask permission, or simply listen"],["陪父亲走一段村口旧路","Walk the old village road together"],["由父亲决定寄出、重写或保留","Let Father choose to send, rewrite or keep"],["寄出并记费用，或放回指定处","Pay postage, or put it safely away"]]},{"title":["小满休沐日","Xiaoman’s Day Off"],"role":"xiaoman","place":["generalStore","v3XiaomanCounter"],"text":["小满说：「今日想挑点自己用的东西。」交班之后便不再谈加单，想回家时就结束。","“Today I would like to choose something for myself,” says Xiaoman. Once off duty, work can wait."],"stages":[["把班交清，确认她的休息照常","Agree cover and preserve her rest"],["逛集看布或吃茶，各自确认花费","Browse cloth or have tea; confirm spending"],["听她谈自己的兴趣与日程","Listen to her interests and plans"],["散步或各自回家，工作留待下班次","Walk or go home; leave work for the next shift"]]},{"title":["何行舟认得的海","The Sea Xingzhou Knows"],"role":"boatman","place":["wharf","v3Boatman"],"text":["「这回不用赶着交货，慢些走。」近岸探旧友，核船期与回程，天气不妥便改约。","“No delivery to hurry this time.” Visit an old friend along the coast, with a return plan and room to reschedule."],"stages":[["核船期、天气、费用与回程余量","Confirm passage, weather, fares and return margin"],["沿岸认两处旧标记","Read two old shore marks"],["获准后修一件绳具，在岸灶吃饭","Repair a rope fitting with consent; eat ashore"],["归还借物，结清船脚并留旅记","Return borrowed items, settle fares and keep a page"]]}];
const islands=['qPier','qFair','qSalt','qBamboo','qBeacon','qLodge'];
const order=raw.map((_,i)=>'V6_'+String(i+1).padStart(2,'0')),titles={},steps={},rewards={};
const rows=raw.map((r,i)=>({title:r.slice(0,2),scene:r[2],object:r[3],text:r.slice(4,6),actions:r.slice(6),id:order[i]}));
rows.forEach((r,i)=>{titles[r.id]=r.title[0];steps[r.id]=r.actions.map((a,j)=>['voyage_'+i+'_'+j,a[0]]);rewards[r.id]=[0,'旅途经历已记下。'];});
const get=s=>s.choices.voyage6,day=s=>Math.floor(s.worldTick/1440)+1;
function first(s){const i=order.findIndex(id=>s.quests[id]?.status==='ACTIVE');if(i<0)return null;const j=steps[order[i]].findIndex(([flag])=>!s.flags[flag]);return {i,j,...rows[i]};}
function canStart(s){return !!s.flags.season5Complete&&!get(s)&&!!s.season5?.plans?.xiaoman?.done;}
function target(s){const r=first(s),t=get(s);if(!r)return null;if(islands.includes(r.scene)&&!t?.away)return ['anchorage','voyageHarbor'];if(!islands.includes(r.scene)&&t?.away)return ['qPier','voyageReturn'];return r.i===8&&r.j===1?['qBamboo','voyagePath']:[r.scene,r.object];}
function gate(s,to){const t=get(s);if(islands.includes(to))return t?.away?'':'先到避风泊岸核船期，乘近岸班船前往青屿。';if(t?.away)return '正在青屿旅途中。请从青屿渡口按回程安排返湾。';return null;}
function note(s,zh,en){get(s).ledger.push({tick:s.worldTick,zh,en});}
function safeWeather(s){return !globalThis.NanlanWeather||globalThis.NanlanWeather.current(s).id!=='storm';}
function act(s,name,p,h){
 const {requireThat:need,requireScene:at,spend,give,available,log,prices}=h;
 need(p.sequence===s.revision,'记录已经更新，请重新打开这一页。');
 const pay=(n,why)=>{need(s.coins-n>=(s.story2?.reserve||0),'保留家用后现钱不足，还需准备 '+n+' 文。');s.coins-=n;log(s,'voyage',-n,why);};
 const work=(minutes,energy=0)=>{need(s.worldTick%1440+minutes<=1320,'天已晚，请先休息到次日再安排这一段。');need(s.stamina>=energy,'体力不足，先休息再来。');s.worldTick+=minutes;s.stamina-=energy;};
 if(name==='voyageStart'){at(s,'backHall');need(canStart(s),'先完成岁序长青，并与小满实际完成一项共事。');s.choices.voyage6={version:1,ledger:[],away:false,phase:'preparing',pack:{},reserve:0,fares:0,returnCount:0,loan:false,shop:null,sketch:null,repair:[],extra:{active:null,done:{},records:[]}};s.flags.voyageStarted=true;order.forEach((id,i)=>s.quests[id]={status:i?'LOCKED':'ACTIVE'});return;}
 const t=get(s);need(t,'先在后堂查看春潮来信。');
 if(name==='voyageBuy'){need(islands.includes(s.scene),'请到青屿的补给处。');const costs={rice:3,ingredient:3,wood:2,bamboo:3,rope:3,hotMeal:5};need(Object.hasOwn(costs,p.item),'请选明补给。');pay(costs[p.item],'青屿补给 '+p.item);give(s,{[p.item]:1});return;}
 if(name==='voyageWait'){need(['anchorage',...islands].includes(s.scene),'先到候船处或青屿歇脚。');work(60);note(s,'候船一小时，货物与未完行程仍在。','An hour ashore; goods and the itinerary remain intact.');return;}
 if(name==='voyageRest'){at(s,'qLodge');pay(2,'青屿简住宿一夜');s.worldTick=(Math.floor(s.worldTick/1440)+1)*1440+360;s.stamina=100;t.phase='away';note(s,'在宿院歇到次日清晨，已付简住宿费。','Rested until morning; simple lodging paid.');return;}
 if(name==='voyageReturn'){
  at(s,'qPier');need(t.away&&t.reserve===3,'请先确认回程保留。');need(safeWeather(s),'午后雷雨未歇，先候船；行程与物资保留。');work(45);t.reserve=0;t.fares+=3;t.away=false;t.phase='returned';t.returnCount++;s.scene='anchorage';s.player={x:530,y:510};s.visits.anchorage=true;log(s,'voyageReturn',0,'用已经封存的回程三文结清船脚');note(s,'按原留船脚平安返湾，余物仍待归来核对。','Returned safely on the reserved fare; remaining goods await reconciliation.');return;
 }
 if(name==='voyageResume'){
  at(s,'anchorage');need(!t.away,'仍在青屿，无需重复付去程船脚。');need(s.flags.voyage_6_0,'先完成首次航路安排。');need(safeWeather(s),'雷雨时先候船，不另收船脚。');pay(6,'再赴青屿：去程三文，回程封存三文');work(45);t.reserve=3;t.fares+=3;t.away=true;t.phase='away';s.scene='qPier';s.player={x:530,y:510};s.visits.qPier=true;return;
 }
 if(name.startsWith('voyageExtra'))return extraAct(s,name,p,{need,at,pay,work,spend,give,available,log,prices});
 const r=first(s);need(name==='voyageStep'&&r&&p.i===r.i&&p.j===r.j,'请先办眼前这一步，重复点击不会再次结算。');at(s,r.i===8&&r.j===1?'qBamboo':r.scene);
 need(typeof p.choice==='number'&&Number.isInteger(p.choice)&&p.choice>=0&&p.choice<=5,'请选一种安排。');
 const c=p.choice,k=r.i+'_'+r.j;
 switch(k){
 case '0_0':t.repair.push('旧补三处，新损一处；原作与修补分记');work(5);break;
 case '0_1':t.permission=true;break;
 case '1_0':t.obligations={order:s.order?{product:s.order.product,reserved:s.order.reserved,delivered:s.order.delivered}:null,contract:!!s.story4?.repeat};break;
 case '1_1':t.handover=c===0?'pause':'limited';break;
 case '2_0':need(c<6,'请选择同行者。');t.companion=['none','mother','father','xiaoman','boatman','lin'][c];t.consent=true;break;
 case '3_0':{
  need(c<3,'选生活、样品或轻装清单。');t.loadout=['life','sample','light'][c];
  if(available(s,'hotMeal')>=1){spend(s,{hotMeal:1});t.pack.hotMeal=1;}else{pay(3,'出行干粮一份');t.pack.rations=1;}
  if(p.sample){need(['bambooWare','narrowBasket','travelBox','driedHerb'].includes(p.sample),'选自己的可售样品。');spend(s,{[p.sample]:1});t.pack[p.sample]=1;t.sample=p.sample;}
  t.loan=c===2;t.slots=2+(t.sample?2:0);need(t.slots<=6,'留出回程空位。');break;
 }
 case '4_0':if(c===1){spend(s,{driedHerb:1});pay(2,'出行期间有限营业一班工钱');t.shop={item:'driedHerb',held:1,sold:0,fee:2,settled:false};}else t.shop={held:0,sold:0,settled:false,closed:true};break;
 case '5_0':spend(s,{hotMeal:1});work(10);t.familySupper=true;break;
 case '5_1':need(t.permission&&t.consent&&t.pack&&t.shop,'先核出行许可、行囊、同行与交接。');need(s.coins-(s.story2?.reserve||0)>=6,'往返船脚合计六文，须留够回程三文。');t.confirmed=true;break;
 case '6_0':{
  need(c<2&&t.confirmed,'选择船主认可的近岸路线。');need(safeWeather(s),'午后雷雨时不启程。可先候船，或回家歇一夜。');pay(6,'去程三文与回程封存三文');work(c?45:60);t.reserve=3;t.fares+=3;t.route=c;t.away=true;t.phase='away';s.scene='qPier';s.player={x:530,y:510};s.visits.qPier=true;break;
 }
 case '7_0':if(c===0){spend(s,{rice:1,ingredient:1,wood:1});work(10);t.meal='shore';}else if(c===1){need(t.pack.hotMeal||t.pack.rations,'行囊已无干粮，可在渡口买饭。');delete t.pack.hotMeal;delete t.pack.rations;t.meal='packed';}else{pay(5,'青屿岸上饭食');t.meal='bought';}break;
 case '8_0':t.mapRead=true;break;
 case '8_1':at(s,'qBamboo');work(10);s.visits.qBamboo=true;t.upperPath=true;break;
 case '9_0':t.repairConsent=true;t.measured=3;work(5);break;
 case '9_1':need(t.repairConsent,'先问物主许可。');if(c===0){spend(s,{bamboo:1});work(10,1);t.repair.push('获物主许可，局部换篾，保留三处旧补');}else{work(5);t.repair.push('获物主同意，改作不承重的收纳篮');}break;
 case '10_0':t.customerUse='耐湿、便携、好修';work(5);break;
 case '10_1':if(c===0){need(t.sample&&t.pack[t.sample]===1,'没有带来可售样品，可选试用后收回。');delete t.pack[t.sample];const price=prices[t.sample];need(price>0,'样品价格需核明。');s.coins+=price;t.sampleSale=price;log(s,'voyageSale',price,'临潮集当面交付自己的样品',t.sample);}else t.sampleSale=0;break;
 case '11_0':t.exchange=c===0?'demonstration':'observe';break;
 case '11_1':spend(s,{bamboo:1,rope:1});work(10,1);t.jointSample={owner:'household',source:'青屿匠人与李家共同试作',commercial:false};break;
 case '12_0':t.shelfMeasure={opening:36,rim:38,clearance:2};work(5);break;
 case '12_1':need(t.shelfMeasure,'先量棚架。');t.shelfPlan=['局部改样后再确认','改为不叠放用途','减少件数，不追加未确认交货'][Math.min(c,2)];break;
 case '13_0':need(c<3,'选一种景物。');t.sketch={view:['盐田与岸线','竹径与渡口','灯台下的风'][c],line:['路走远了，归处仍清楚。','不赶着交货，也走得成一程。','空白留给下一次看见。'][Math.min(p.line||0,2)],day:day(s)};work(10);break;
 case '14_0':if(c===0){pay(2,'自愿多留一夜');s.worldTick=(Math.floor(s.worldTick/1440)+1)*1440+360;s.stamina=100;t.phase='away';}else need(safeWeather(s),'雷雨暂不适航，可先歇脚，晚些转晴再到渡口。');t.message={sentAt:s.worldTick,arrivesAt:s.worldTick+60,text:c===0?'改为明日归来':'按约返湾'};break;
 case '15_0':need(!t.away,'先到青屿渡口，按回程安排返湾。');if(t.shop&&!t.shop.settled){if(t.shop.held===1){const price=prices.driedHerb;t.shop.held=0;t.shop.sold=1;s.coins+=price;log(s,'voyageShop',price,'仅结算拨出的一份干药，不动其他库存');}t.shop.settled=true;}
  for(const [id,n]of Object.entries(t.pack)){if(id!=='rations')give(s,{[id]:n});}t.pack={};t.loan=false;t.reconciled=true;break;
 case '16_0':if(c===0){spend(s,{bamboo:1});work(10,1);t.localTrial='局部收绳法已用本地竹料复测；保留青屿共同来源';}else t.localTrial='暂存观察，不作量产配方';break;
 case '17_0':t.fatherReply='京中来信仍是家常问候，不是赦免；未核之事不写作定论。父亲愿先把南澜的日子过稳。';break;
 case '17_1':t.familyReply='祖父用获准副本教读、原件归原主；母亲保留选品与会客日；伙伴按自愿岗位继续，各有自己的日程。';break;
 case '17_2':need(t.reconciled&&t.reserve===0&&!t.away,'先核回程、余物与授权账。');t.focus=['定期往来','偶尔远行','邀请来访','专注本地'][Math.min(c,3)];s.flags.voyageComplete=true;t.phase='complete';break;
 }
 if([7,13].includes(r.i)&&t.companion!=='none')s.choices['bond:'+t.companion+':shared:journey'+r.i]=day(s);
 if(r.i===17&&r.j===1)for(const role of ['mother','father','grandfather'])s.choices['bond:'+role+':shared:homecoming']=day(s);
 s.flags['voyage_'+r.i+'_'+r.j]=true;note(s,r.actions[r.j][0],r.actions[r.j][1]);
}
function extraAct(s,name,p,h){
 const {need,at,pay,work,spend,give,available,log,prices}=h,t=get(s),x=t.extra;
 need(s.flags.voyageComplete,'先完成春潮有信，回到自家日常。');
 if(name==='voyageExtraStart'){need(Number.isInteger(p.id)&&bonus[p.id]&&!x.active&&!x.done[p.id],'先完成或暂缓眼前活动。');need(p.day===day(s)||p.day===day(s)+1,'可约今日或次日，稍后仍能改约。');x.active={id:p.id,stage:0,day:p.day,paused:false,choices:[],receipts:[],held:null};return;}
 if(name==='voyageExtraResume'){need(x.active,'没有待续活动。');x.active.paused=false;x.active.day=day(s);return;}
 if(name==='voyageExtraPause'){need(x.active,'没有活动需要暂缓。');x.active.paused=true;return;}
 const a=x.active;need(a&&!a.paused&&day(s)>=a.day,'尚未到约定日期，或活动已暂缓。');need(p.id===a.id&&p.stage===a.stage,'这一段已经记下，请重新查看。');
 const b=bonus[a.id],targets=extraTargets(a.id,a.stage);at(s,targets[0]);need(Number.isInteger(p.choice)&&p.choice>=0&&p.choice<4,'请选择一种安排。');const c=p.choice;
 if(a.id===0){if(a.stage===0)a.guests=c===0?'家人小聚':'家人与愿来的邻里';if(a.stage===1)a.location=globalThis.NanlanWeather?.current(s).wet?'后堂':c===0?'庭院':'后堂';if(a.stage===2){spend(s,{hotMeal:1});work(15);}if(a.stage===3)a.memory='一家人坐齐，灯下讲完旅途。';}
 if(a.id===1){if(a.stage===0)a.budget=5;if(a.stage===1){need(available(s,'bambooWare')>=1,'先带一件自己的竹器，再陪母亲选品。');spend(s,{bambooWare:1});a.held='bambooWare';}if(a.stage===2){work(10);if(c===0){need(a.held,'展架已无货。');a.held=null;s.coins+=prices.bambooWare;log(s,'extraSale',prices.bambooWare,'母亲展售实物一件','bambooWare');}}if(a.stage===3){if(a.held){give(s,{[a.held]:1});a.held=null;}a.display=c===0?'母亲保留一角陈列方案':'母亲先收好展架，改日再办';}}
 if(a.id===2){if(a.stage===0)a.permission=c===0?'获准复制与归还':'只听讲、不动原件';if(a.stage===1){need(p.pieces==='201','按纸纹与行距排为：留白页角 → 字行 → 下边缘（201）。提示可随时看。');work(5);}if(a.stage===2)a.source=c===0?'出处仍存疑，留白':'对照已有书册，记下可确认部分';if(a.stage===3){work(10);a.returned=true;}}
 if(a.id===3){if(a.stage===0)a.permission=c===0?'父亲同意一起看草稿':'只听父亲讲，不展开信纸';if(a.stage===1)work(10);if(a.stage===2)a.letter=['寄出','重写后保留','原样保留','不再写'][c];if(a.stage===3&&a.letter==='寄出'){pay(1,'父亲同意寄出的家书邮资');a.sent=true;}}
 if(a.id===4){if(a.stage===0)a.cover='当日歇铺，小满照常休沐';if(a.stage===1){work(10);if(c===0){pay(1,'本人一盏茶，小满消费由她自己决定');a.tea=true;}}if(a.stage===2)a.interest='小满想留半日画花，不追加工作';if(a.stage===3)a.end=c===0?'各自回家':'散步后按约结束';}
 if(a.id===5){if(a.stage===0){need(safeWeather(s),'雷雨时改约，未收船脚。');pay(6,'何行舟近岸访友往返船脚');work(15);a.fare=6;}if(a.stage===1)work(10);if(a.stage===2){need(p.consent===true,'先问旧友是否愿意修补。');spend(s,{rope:1,hotMeal:1});work(10,1);}if(a.stage===3)a.returned=true;}
 a.choices.push(c);a.receipts.push({stage:a.stage,tick:s.worldTick,text:b.stages[a.stage]});a.stage++;
 if(a.stage===4){for(const role of a.id===0?['mother','father','grandfather']:[b.role])s.choices['bond:'+role+':shared:epilogue'+a.id]=day(s);x.done[a.id]={tick:s.worldTick,title:b.title,choices:a.choices,record:a};x.records.push(a.id);x.active=null;}
}
function extraTargets(id,stage){
 const sets=[
 [['hall','mealTable'],['yard','festivalLantern'],['yard','stove'],['hall','mealTable']],
 [['generalStore','v2MotherCounter'],['market','playerStall'],['generalStore','v2Shelf'],['generalStore','v2MotherCounter']],
 [['study','books'],['study','dryPages'],['study','books'],['backHall','v4Desk']],
 [['hall','father'],['village','villager'],['hall','father'],['hall','father']],
 [['generalStore','v3XiaomanCounter'],['market','playerStall'],['village','villager'],['village','villager']],
 [['wharf','v3Boatman'],['coast','coastBoard'],['coast','voyageCoastRest'],['wharf','v3Boatman']]
 ];return sets[id][stage];
}
function normalise(s,need){
 const t=get(s);if(!t){need(!s.flags.voyageStarted&&!s.flags.voyageComplete,'旅途簿缺页。');return;}
 need(t.version===1&&s.flags.season5Complete&&s.flags.voyageStarted,'旅途前置记录无效。');
 need(Array.isArray(t.ledger)&&t.pack&&[0,3].includes(t.reserve)&&typeof t.away==='boolean','行囊或回程记录无效。');
 need(t.away===islands.includes(s.scene),'旅途地点与在途状态不符。');
 const ix=order.findIndex(id=>s.quests[id]?.status!=='COMPLETED');
 order.forEach((id,i)=>{need(s.quests[id]?.status===(ix<0||i<ix?'COMPLETED':i===ix?'ACTIVE':'LOCKED'),'旅途章节顺序无效。');if(ix<0||i<ix)need(steps[id].every(([flag])=>s.flags[flag]),'旅途步骤缺页。');});
 need(!!s.flags.voyageComplete===(ix<0),'旅途结卷记录无效。');
 need(t.extra&&t.extra.done&&Array.isArray(t.extra.records),'番外记录缺页。');
 if(t.extra.active)need(bonus[t.extra.active.id]&&Number.isInteger(t.extra.active.stage)&&t.extra.active.stage>=0&&t.extra.active.stage<4&&Number.isInteger(t.extra.active.day),'番外约定无效。');
}
return {rows,order,titles,steps,rewards,bonus,islands,get,day,first,canStart,target,gate,act,normalise,extraTargets,safeWeather};
});

if(typeof window!=='undefined'){
 const dictionary=window.NANLAN_EN||(window.NANLAN_EN={}),V=window.NanlanVoyage;
 for(const r of V.rows){dictionary[r.title[0]]=r.title[1];dictionary[r.text[0]]=r.text[1];for(const p of r.actions)dictionary[p[0]]=p[1];}
 for(const b of V.bonus){dictionary[b.title[0]]=b.title[1];dictionary[b.text[0]]=b.text[1];for(const p of b.stages)dictionary[p[0]]=p[1];}
 Object.assign(dictionary,{'春潮有信':'Letters on the Spring Tide','主线完成 · 日常与番外继续':'Main Story Complete · Daily Life and Epilogues Continue','拆开春潮来信，安排青屿行程':'Open the spring-tide letter and plan a Qingyu journey','闲日邀约 · 六篇番外':'Days Together · Six Epilogues','旅途经历已记下。':'This part of the journey has been recorded.'});
}
