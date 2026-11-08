/* Mount the story at its actual people and objects. The engine is the single settlement point. */
(()=>{'use strict';
const V=N.v3,L=(zh,en)=>zh;
let ordinary=false;
const roles={player:'你',grandfather:'祖父',father:'父亲',mother:'母亲',chen:'陈伯',cen:'阿岑',yu:'沈晚渔',doctor:'许青禾',lin:'林师傅',lu:'陆掌柜',neighbor:'街坊',xiaoman:'罗小满',boatman:'何行舟',zhou:'周成',fang:'方掌柜',narrator:'山海手记'};
const at=(s,k)=>V.target(s,k),now=()=>N.clock(state());
function visible(s,scene,o){
 if(o.id==='v3Chest')return !!s.flags.volume2Complete&&!s.flags.v3_claim;
 if(o.id==='v3Desk')return !!s.flags.volume3Started;
 if(o.id==='v3Zhou')return !!s.flags.v3_witness&&N.current(s)!=='V3_09';
 if(o.id==='v3ZhouShop')return N.current(s)==='V3_09';
 if(o.id==='v3XiaomanCounter')return V.presence(s,'xiaoman')==='generalStore';
 if(o.id==='v3Xiaoman')return !!s.flags.v3_aisle&&!V.presence(s,'xiaoman');
 if(o.id==='v3Gauge'||o.id==='v3Boatman'||o.id==='v3Fang')return !!s.flags.v3_return;
 if(o.id==='v3WharfRoad'||o.id==='v3WorksDoor'||o.id==='v3OldRoad')return !!s.flags.volume2Complete;
 return true;
}
function drawProp(o){const im=images.v3Props;if(!im?.naturalWidth)return;
 const i=o.v3Art,w=[62,68,48,38][i],cell=im.naturalWidth/2;
 ctx.drawImage(im,(i%2)*cell,Math.floor(i/2)*cell,cell,cell,o.x-w/2,o.y-w*.88,w,w);}
function prop(i){const el=document.createElement('div');el.className='v3-prop';el.setAttribute('aria-hidden','true');el.style.backgroundPosition=(i%2?'100%':'0')+' '+(i>=2?'100%':'0');$('panelExtra').append(el);return el;}
function note(t){const el=document.createElement('p');el.className='production-note';el.textContent=t;$('panelExtra').append(el);}
function navigate(sc,id){closeDialog();startNavigation(sc,id);}
function route(label,sc,id){button(label,()=>navigate(sc,id),'v3-route-'+id,true);}
function normal(o){ordinary=true;void interact(o);}
function action(label,name,p,again){if(window.NanlanSealsModel.eligible(name,p))return button(label,()=>window.NanlanSeals.prepare(name,{sequence:state().revision,...p},label,again),'v3-seal-'+name);return actButton(label,name,{sequence:state().revision,...p},again,'v3-'+(p.key||name)+(p.choice??''));}
function journal(){const s=state(),v=s.story3;if(!v)return;
 activity(L('山海手记 · 交接与余单','Mountain and Sea · Handover Book'),L('每一笔只记已经办过的事。定金另列，交货时再抵。','Only completed work is recorded. Advances stay separate until delivery.'),'v3-book');
 note(L('工棚待用竹料','Workshop bamboo')+' ×'+v.raw+' · '+L('架上成品','Finished on rack')+' ×'+v.ready+' · '+L('代售实物','On consignment')+' ×'+v.consign);
 if(v.job)note(L('工单预计完成','Work due')+' · '+stamp(v.job.due)+' · ×'+v.job.quantity);
 if(v.freight)note(L('在途','In transit')+' ×'+v.freight.n+' · '+stamp(v.freight.due));
 if(v.remainder)note(L('另班待发','Awaiting another sailing')+' ×'+v.remainder);
 if(v.contract)note(L('客栈已交','Delivered to inn')+' '+v.contract.delivered+'/'+v.contract.q+' · '+L('未抵定金','Advance outstanding')+' '+v.contract.advance+' 文 · '+L('约定取货日','Agreed pickup day')+' '+v.contract.dueDay);
 for(const [key,o] of Object.entries(s.story2.orders))if(o.delivered<o.quantity)note(L('南街未交','South Street outstanding')+' · '+N.itemNames[o.item]+' ×'+(o.quantity-o.delivered));
 if(v.shift)note(roles[v.shift.person]+' · '+stamp(v.shift.start)+' — '+stamp(v.shift.end));
 if(v.notes.length)note(v.notes.join('\n'));
 for(const b of v.book.slice(-8))note(stamp(b.tick)+' · '+b.zh+(b.amt?' · '+(b.amt>0?'+':'')+b.amt+' 文':''));
 const r=V.first(s);if(r){const [sc,id]=at(s,r[0]);route(r[3],sc,id);}
 if(s.flags.v3_roster)route(L('回作坊看工单','Visit the Workshop'),'workshop','v3Bench');
 if(s.flags.v3_ship)route(L('去河埠查余单','Check the Wharf Manifest'),'wharf','v3Berth');
}
function stamp(t){let m=Math.floor(t%1440);return L('第','Day ')+(Math.floor(t/1440)+1)+L('日','')+' '+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function guide(){
 const s=state();button(L('翻看眼下能亲手做的事','Browse the Activities You Have Discovered'),()=>{
   activity(L('生活手记','A Book of Daily Life'),L('选一项，沿熟悉的路去办。后来学会的手艺也会记在这里。','Choose an activity to follow its path. New crafts appear here as you learn them.'),'v3-guide');
   if(!s.flags.gateOpen)route(L('从门前交接开始','Start at the Household Gate'),'gate','familyLuggage');
   if(s.flags.gateOpen)route('仓房工作台','store','workbench');
   if(s.flags.stoveClean)route(L('回灶边亲手做饭','Cook at the Hearth'),'yard','stove');
   if(s.flags.smallBed)route(L('照看自家菜圃药圃','Tend the Kitchen and Herb Beds'),'yard','herbPlot');
   if(s.flags.stallBooked)route(L('去镇集摊布摆货','Set Out Goods at Market'),'market','playerStall');
   if(s.flags.volume2Started){route(L('去庭院桑塘照料','Tend the Silk Pond'),'yard','silkPond');route(L('看南街铺面的货与账','Visit the South Street Counter'),'generalStore','generalStoreKeeper');}
   if(s.flags.volume2Complete&&!s.story3)route(L('去南街看看门边的竹箱','Inspect the Chest at the Shop Door'),'generalStore','v3Chest');
   if(s.story3)button(L('查看工单、托店与余单','Check Work, Shifts and Open Orders'),journal,'v3-guide-journal');
 },'v3-discovered',true);
}
function intro(o){
 activity(L('南街 · 门前的一只竹箱','South Street · A Chest at the Door'),L('门侧那只竹箱有两张牌，一张写着本街，另一张已经磨白。陆掌柜朝你招了招手。','Two labels hang from the chest. One names this street. The older one has worn pale. Your neighbor beckons.'),'v3-opening');prop(0);
 const line={steady:L('陆掌柜：「熟客常来认你的货，这一箱可认得？」','“Your regulars know your goods. Do you know this chest?”'),neighbors:L('陆掌柜：「你常同村中做货的人打交道，可认识这枚旧记号？」','“You know the village makers. Have you seen this old mark?”'),travel:L('陆掌柜：「你认得走商的路，这箱子该往哪一边转？」','“You know the carriers’ roads. Which way should this chest go?”')};note(line[state().choices.nextSeason]||line.steady);
 action(L('把竹箱移到避雨处，翻开山海手记','Shelter the Chest and Open the Road Book'),'v3Start',{},()=>place(o));button(L('先照常开店','Attend to the Shop First'),closeDialog,'v3-later',true);
}
const pictures={tag:0,witness:0,claim:0,desk:3,return:3,sample:2,trial:2,mend:2,standard:2,teach:1,inspect:1,grade:1,batch:2,ship:0,receive:0,trade:2,consent:2,label:2,answer:3};
const exercises={
 desk:[L('核对当前价签','Check Posted Prices'),L('区分现货与预留','Separate Goods from Holds'),L('写下只准零售、不得垫支','Authorize Retail Only, No Spending')],
 trial:[L('提起篓耳试承重','Lift the Handle'),L('套入样篓试叠放','Nest the Sample'),L('在接缝系一根记号绳','Mark the Rough Joint')],
 teach:[L('将两份竹材点清','Count Both Bamboo Pieces'),L('把待验料移到左架','Set the Unchecked Lot on the Left'),L('请小满独自复点一次','Let Xiaoman Count It Back')],
 inspect:[L('把直厚竹放到承重架','Place the Stout Bamboo on the Load-Bearing Rack'),L('将薄竹另留作内衬','Set the Thin Splits Aside for Lining')],
 needs:[L('记下挑担人想减轻重量','Record the Porter’s Need for a Lighter Load'),L('记下买家想收叠省地方','Record the Buyer’s Need for Nesting Baskets')],
 answer:[L('回绝未经授权的临时大单','Reply to the Unapproved Bulk Request'),L('给取货人回一张约期笺','Return a Dated Pickup Slip')]
};
const roleMap={zhou:'zhou',v3Zhou:'zhou',v3Fang:'fang',v3Boatman:'boatman',v3Xiaoman:'xiaoman',v3ZhouShop:'zhou',v2Neighbor:'lu',doctor:'doctor',villager:'chen',shenYuCoast:'yu'};
function reading(i,o,pos=0){
 const ch=V.dialogue[i],line=ch.beats[pos];activity(roles[line[0]]||roles.narrator,line[1],'v3-voice');$('dialogKicker').textContent=ch.title[0]+' · '+(pos+1)+' / '+ch.beats.length;
 if(line[0]==='player')playerPortrait();$('next').hidden=true;
 button(pos+1<ch.beats.length?L('听下一句','Hear the Next Line'):L('回到眼前的事','Return to the Task'),()=>pos+1<ch.beats.length?reading(i,o,pos+1):place(o),'v3-read');
}
function playerPortrait(){const host=$('dialogPortraits');host.replaceChildren();host.hidden=false;const f=document.createElement('figure'),box=document.createElement('div'),img=document.createElement('img');box.className='portrait-frame';img.src=DATA.assets['npc_'+(state().gender==='male'?'playerMale':'playerFemale')];img.alt=roles.player;box.append(img);f.append(box);host.append(f);}
function stepSuccess(o,k,i,c){
 const s=state(),ch=V.dialogue[i],first=V.first(s),echo=ch.echo[['choiceA','choiceB','choiceC'][c]];
 const title=roles[roleMap[o.id]]||ch.title[0];
 activity(title,echo?echo[0]:first?.[0]===k?L('首件已验。下一件照工时继续。','The first piece is checked. The second is now underway.'):L('这一笔已记好。','The entry is in the book.'),'v3-result');
 if(k==='meal'){const art=document.createElement('img');art.className='v3-family';art.src=DATA.assets[s.gender==='male'?'familyMealMale':'familyMealFemale'];art.alt=L('回家吃饭','Supper at Home');$('panelExtra').append(art);}
 if(['return','audit','receive','first','ship','grade','capacity','trade','contract'].includes(k))note(s.story3.book.at(-1)?.zh||'');
 if(k==='outing'&&V.nextWait(s)>s.worldTick){action(L('留在此地到日落，再回南街','Stay Here Until Sunset Before Returning'),'v3Wait',{},()=>stepSuccess(o,k,i,c));}
 if(first){const [sc,id]=at(s,first[0]);if(sc===s.scene&&id===o.id)button(first[3],()=>place(o),'v3-again');else route(first[3],sc,id);}
 button(L('合上手记，继续走走','Close the Book and Walk On'),closeDialog,'v3-close',true);
}
function play(o,r,stage=0){
 const s=state(),k=r[0],i=V.chapterOf[k],ch=V.dialogue[i],role=roleMap[o.id]||o.role;
 const words=ch.beats.find(b=>b[0]===role)||ch.beats[Math.min(V.chapters[i].indexOf(r),ch.beats.length-1)];
 activity(roles[words[0]]||ch.title[0],words[1],'v3-story');$('dialogKicker').textContent=ch.title[0];$('next').hidden=true;
 if(words[0]==='player')playerPortrait();
 if(pictures[k]!=null)prop(pictures[k]);note(r[3]);
 const memory={claim:'cord',herbal:'herb',mend:'mark',teach:'teach'}[k];if(memory)window.NanlanThreads.offer(memory);
 const ex=exercises[k];
 if(['desk','handoff','audit','plan','capacity','contract','answer','ship','return'].includes(k))balances(k);
 if(k==='answer'){if(s.story3.remainder||s.story3.freight)route(L('去河埠清点分送余货','Settle the Split Load at the Wharf'),'wharf','v3Berth');if(s.story3.contract?.delivered<s.story3.contract?.q)route(L('找方掌柜核对交期','Confirm the Deadline with Fang'),'wharf','v3Fang');}
 if(k==='audit'&&!s.story3.shift?.returnedAtDusk){const [sc,id]=at(s,'outing');route(L('沿出行的路去等日落','Return to Your Outing Until Sunset'),sc,id);}
 if(k==='origin'||k==='label')note(s.story3.choices.grade?L('分架记录里，厚竹承重，薄竹另作内衬。','The grade record separates stout strips for carrying from thin strips for lining.'):L('退换单上记着补到的承重竹批号。','The exchange slip identifies the replacement batch of stout bamboo.'));
 if(k==='tag')note(L('纸签写着南街，旧木牌写着青溪埠。私信封口完好。','The paper names South Street. The wooden tag names Qingxi Landing. The letter is still sealed.'));
 if(k==='return'&&s.story3.shift)note(stamp(s.story3.shift.end));
 if(k==='order')note(L('每件用竹一份、工钱四文、日间工时四十分钟。','Each piece needs one bamboo, four coins of wages and forty working minutes.'));
 if(k==='grade')note(L('样品留在手边，粗竹承重，薄竹衬底。','Keep the sample close. Stout strips bear weight and thin strips line the base.'));
 if(k==='batch'&&s.story3.job&&s.worldTick>=s.story3.job.due)sceneClue(deskText('先看看小满收工后的货架','Inspect Xiaoman’s finished rack'),s.story3.choices.hire===0?deskText('最底下垫了两片旧竹，包绳的结都朝外。小满让你伸手摸摸底面：「潮气上不来。你教过我的。」','Two old slats lift the parcels off the shelf. Every knot faces out. Xiaoman invites you to feel underneath. “Dry. Just as you showed me.”'):deskText('两家的货各压着一联签。小满把其中一联递给你：「都是一样的篓，可交钱的时候，不能认错人。」','Each household’s baskets have their own slip. Xiaoman hands you one. “The baskets look alike. The people we owe must never be mixed up.”'),'xiaoman-rack');
 if(k==='batch'&&s.story3.job)note(L('收工时刻','Work due')+' · '+stamp(s.story3.job.due));
 if(k==='receive'&&s.story3.freight)note(L('预计到埠','Arrival')+' · '+stamp(s.story3.freight.due));
 if(k==='water'||k==='sail'||k==='alert')note(N.tide(s).low?L('潮桩已露，船身低于系缆石。','The gauge is exposed. The boat lies below the mooring stone.'):L('水正涨，缆绳渐渐绷紧。','The water is rising and the rope pulls taut.'));
 if(k==='alert'&&s.story3.side.tides?.length===3)note(L('晚渔指给你看：这一次，比你记下的三回都急。','Wanyu points to the gauge. The water is climbing faster than on your three visits.'));
 if(k==='note')note(s.story3.side.motherTime?L('母亲把约看时选好的小篮摆到架上。','Mother brings out the little basket she chose at her appointment.'):L('母亲翻出约看册，在空处另约了时辰。','Mother opens her appointment book and finds another free hour.'));
 if(k==='outing')note(s.story3.choices.handoff===0?(s.story3.side.teaching?L('祖父带上那张明春教读的草稿。','Grandfather has brought his lesson plan for spring.'):L('祖父理平袖口，问起村里孩子读书的事。','Grandfather smooths his cuff and asks about the children’s lessons.')):s.story3.choices.handoff===1?L('阿岑拨开竹叶，上回留下的幼竹还在。','A-Cen parts the leaves. The young bamboo still stands.'):L('晚渔指着湾外，讲起新一班船的消息。','Wanyu points beyond the bay and shares news of the next boat.'));
 if(ex&&stage<ex.length){
   if(k==='inspect'){note(stage===0?L('先摸直厚的一捆。该放在哪边？','Feel the straight, stiff bundle. Which rack suits it?'):L('薄篾有韧性，适合放在哪边？','The thin splits bend easily. Which rack suits them?'));
     const choices=[L('左架 · 承重料','Left Rack · Load-Bearing Strips'),L('右架 · 内衬料','Right Rack · Lining Strips')];
     choices.forEach((label,j)=>button(label,()=>{if(j===stage)play(o,r,stage+1);else{play(o,r,stage);note(L('周成递来样篓，示意你摸摸篓耳和篓底，再试一次。','Zhou passes you the sample. Feel its handle and base, then try again.'));}},'v3-sort-'+j));}
   else button(ex[stage],()=>play(o,r,stage+1),'v3-hands-'+stage);
 }
 else if(r.length>5){for(let c=0;c<r.length-5;c++)action(r[c+5][0],'v3Step',{key:k,choice:c},()=>stepSuccess(o,k,i,c));}
 else action(r[3],'v3Step',{key:k},()=>stepSuccess(o,k,i));
 if(k==='grade')action(L('只收一捆 · 三文，余料归还货主','Take One Bundle for Three Coins and Return the Rest'),'v3Step',{key:k,choice:1,small:true},()=>stepSuccess(o,k,i));
 if(k==='handoff'||k==='fill'||k==='order'||k==='batch'||k==='return'||k==='receive'||k==='audit')waitOptions(o);
 if(['repair','sample','teach','order','capacity','regular','fill','stall','meal'].includes(k))supplyRoutes(k);
 button(L('听这一章的前后对白','Hear This Chapter’s Conversation'),()=>reading(i,o),'v3-voices',true);
}
function balances(k){
 const s=state(),v=s.story3;
 note(L('在手钱','Cash')+' '+s.coins+' 文 · '+L('家用保留','Family reserve')+' '+s.story2.reserve+' 文');
 if(['desk','handoff','audit','return','answer'].includes(k)){
   const goods=Object.entries(s.shop.stock).filter(x=>x[1]>0).slice(0,6).map(([id,n])=>N.itemNames[id]+' ×'+n+' / '+L('可售','available')+' '+N.story2.stockAvailable(s,id)+' / '+N.shopPrice(s,id)+' 文');
   note(goods.join('\n')||L('架上暂空，可登记问询。','The shelves are empty. Enquiries can still be recorded.'));
   if(k==='handoff')note(L('当日工钱五文。只准按价零售；竹器留底与原有预留照旧。','Five coins for the day. Posted retail prices only. Keep the agreed shelf minimum and holds.'));
 }
 if(['plan','capacity','contract'].includes(k)){note(L('试算 · 两件小批、三件扩作、四件联供。扩作加工位需木二、竹一、六文；联供首件十文。三日交货，每件十八文，先付四文。','Plan for two, three or four pieces. Expand with two wood, one bamboo and six coins, or buy a partner’s first piece for ten. Delivery in three days, eighteen coins each, four in advance.'));
   note(L('架上成品','Finished on rack')+' ×'+v.ready+' · '+L('随身日用竹器','Bamboo ware in hand')+' ×'+N.available(s,'bambooWare'));}
}
function waitOptions(o){const s=state(),due=V.nextWait(s);if(due>s.worldTick&&now().minute<1320&&!(s.story3.shift?.full&&s.scene==='generalStore'))action(L('守候到下一班期','Wait for the Next Due Time')+' · '+stamp(Math.min(due,(now().day-1)*1440+1320)),'v3Wait',{},()=>place(o));route(L('回东厢房歇脚或过夜','Rest or Sleep in the East Room'),'bed','bedRest');}
function supplyRoutes(k){if(k==='meal')route(L('去庭院煮一锅热饭','Cook a Pot of Rice for Supper'),'yard','stove');else{
 route(L('到村口备材料','Get Materials in the Village'),'village','villagePantry');
 if(['capacity','fill','stall'].includes(k))route(L('到仓房先编一件竹器','Weave a Piece at the Household Bench'),'store','workbench');}}
function place(o){const s=state(),v=s.story3,r=V.first(s);const here=r&&at(s,r[0])[0]===s.scene&&at(s,r[0])[1]===o.id;
 if(here)play(o,r);
 else{activity(o.label,L('沿途经手的物件、工时和约定，都记在手记里。','The road book holds the goods, working hours and promises made along the way.'),'v3-place');if(o.v3Art!=null)prop(o.v3Art);
   if(r){const [sc,id]=at(s,r[0]);route(r[3],sc,id);}
   if(v.shift?.full&&v.shift.left&&s.scene!=='generalStore'&&s.worldTick<v.shift.end)waitOptions(o);
 }
 if(o.id==='v3Bench'||o.id==='v3Racks'){
   if(s.flags.v3_batch){if(v.job){action(L('按工单验收成品','Inspect the Finished Order'),'v3Collect',{},()=>place(o));if(!here)waitOptions(o);}
   else action(V.capacity(s)===3?L('扩作三件 · 竹三、十二文、一百二十工分','Expanded Lot · Three Bamboo, Twelve Coins, 120 Working Minutes'):L('委托两件竹器 · 竹二、工钱八文、八十工分','Commission Two Baskets · Two Bamboo, Eight Coins, 80 Working Minutes'),'v3Work',{},()=>place(o));}
   if(s.flags.v3_capacity&&v.choices.council===2&&v.partnerDay!==now().day)action(L('收一件联供竹器，当面付十文','Receive One Partner Piece for Ten Coins'),'v3Partner',{},()=>place(o));
   if(s.flags.v3_roster&&!v.side.crossTrained&&!v.shift&&!v.job)action(L('补教另一道工序 · 竹一、四文、一刻钟','Teach the Other Task · One Bamboo, Four Coins, 15 Minutes'),'v3Train',{},()=>place(o));
   if(s.flags.v3_roster&&!v.side.handover)action(L('和父亲改写交接简记','Rewrite the Handover Slip with Father'),'v3Side',{key:'handover'},()=>place(o));
 }
 if(o.id==='v3Gauge'&&(v.side.tides||[]).length<3)action(L('和晚渔再记一次实际潮位','Record the Tide with Wanyu'),'v3Side',{key:'gauge'},()=>place(o));
 if(o.id==='v3Shelter'&&!v.side.shoot)action(L('标出幼竹，留给下一季','Mark the Shoots to Leave for Next Season'),'v3Side',{key:'shoot'},()=>place(o));
 if(o.id==='v3Berth'){
   if(v.remainder&&!v.freight)action(L('发送余单 · 三文，一小时','Send the Remaining Load · Three Coins, One Hour'),'v3Remainder',{},()=>place(o));
   if(s.flags.v3_receive&&v.freight){action(L('签收另班货物','Sign for the Remaining Load'),'v3SignLate',{},()=>place(o));waitOptions(o);}
 }
 if(o.id==='v3Fang'&&s.flags.v3_first&&v.contract?.delivered<v.contract?.q)action(L('再交一件，抵扣本件定金','Deliver Another Piece Against Its Advance'),'v3Balance',{},()=>place(o));
 if(o.id==='v3Fang'&&v.contract&&v.contract.delivered<v.contract.q&&now().day>=v.contract.dueDay)action(L('与方掌柜另约两日后取货','Agree on a Pickup Two Days Later'),'v3Renew',{},()=>place(o));
 if(o.id==='v3Desk'&&s.flags.volume3Complete){
   if(v.shift)action(L('核对这一班托店流水','Review This Shift’s Trading Record'),'v3Review',{},()=>place(o));
   else action(L('再托店一日 · 五文','Arrange Another Day of Cover · Five Coins'),'v3Cover',{},()=>place(o));
   if(v.sampleOnShelf)note(v.choices.consent===0?L('周成制 · 青溪竹器','Made by Zhou · Qingxi Bamboo Ware'):L('青溪埠制 · 本批已验','Qingxi Landing · Batch Inspected'));
 }
 if(o.id==='v3Stall'&&s.flags.v3_trade&&v.marketDay!==now().day)action(L('摆一件竹器 · 十三文','Offer One Basket for Thirteen Coins'),'v3Market',{},()=>place(o));
 if(o.id==='v3Stall'&&v.consign)action(L('替周成寄售，货主十文、留佣二文','Sell Zhou’s Piece · Ten Coins to the Maker, Two in Commission'),'v3Consign',{},()=>place(o));
 if(o.id==='books'&&s.flags.v3_report&&!v.side.teaching)action(L('陪祖父誊写明春的课','Write Out Grandfather’s Spring Lesson'),'v3Side',{key:'teaching'},()=>place(o));
 if(!o.id.startsWith('v3'))button(L('照常使用这里的人物或物件','Use the Usual Activity Here'),()=>normal(o),'v3-usual',true);
 button(L('查看山海交接手记','Read the Handover Book'),journal,'v3-ledger',true);
}
function offer(o){if(ordinary){ordinary=false;return false;}const s=state();if(o.id==='v3Chest'&&!s.story3&&V.canStart(s)){intro(o);return true;}
 if(!s.story3||o.type==='door'||o.type==='property'||o.type==='locked')return false;
 const r=V.first(s);if(o.action==='v3Scene'||s.story3.shift?.full&&s.story3.shift.left&&s.flags.v3_outing&&at(s,'outing')[1]===o.id||r&&at(s,r[0])[0]===s.scene&&at(s,r[0])[1]===o.id||o.id==='books'&&s.flags.v3_report&&!s.story3.side.teaching){place(o);return true;}return false;}
function supplies(){if(!state().story3)return;for(const [k,c] of Object.entries(V.resources)){if(['rice','ingredient'].includes(k))continue;action(N.itemNames[k]+' ×1 · '+c+' 文','v3Buy',{item:k},showPantry);}}
function shelves(){const s=state();const items=Object.entries(s.shop.stock).filter(x=>x[1]>0).sort((a,b)=>s.choices.shopDisplay==='signature'?Number(b[0]===s.shop.featured)-Number(a[0]===s.shop.featured):s.choices.shopDisplay==='small'?N.prices[a[0]]-N.prices[b[0]]:N.story2.stockAvailable(s,b[0])-N.story2.stockAvailable(s,a[0]));if(!items.length||!s.flags.volume3Started)return;
 const box=document.createElement('div');box.className='v3-shelf';for(const [id]of items.slice(0,4)){const f=document.createElement('figure');f.innerHTML=inventoryArt(id);const cap=document.createElement('figcaption');cap.textContent=N.itemNames[id]+' · '+L('可售 ','For sale ')+N.story2.stockAvailable(s,id);f.append(cap);box.append(f);}$('panelExtra').append(box);}
function stallDisplay(){
 const s=state(),box=document.createElement('div');box.className='v3-shelf';
 for(const id of N.products.filter(k=>N.quantity(s,k)>0)){
   const f=document.createElement('figure');f.innerHTML=inventoryArt(id);const c=document.createElement('figcaption');
   c.textContent=N.itemNames[id]+' · '+L('行囊','Bag')+' '+N.quantity(s,id)+' · '+L('可用','Available')+' '+N.available(s,id);
   // The single action list below owns display controls and their stock state.
   f.append(c);box.append(f);
 }if(box.children.length)$('panelExtra').append(box);
}
window.NanlanV3={stallDisplay,visible,offer,journal,guide,drawProp,supplies,shelves};
})();
