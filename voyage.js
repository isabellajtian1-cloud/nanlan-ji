/* Scene-bound journey and optional epilogues. All material changes go through Engine.act. */
(()=>{'use strict';const V=N.voyage,L=(a,b)=>window.NanlanI18n?.language==='en'?b:a,P=a=>a[window.NanlanI18n?.language==='en'?1:0];
let original=false;
const note=text=>{const p=document.createElement('p');p.className='production-note';p.textContent=text;$('panelExtra').append(p);};
function route(label,sc,id){navButton(label,()=>{closeDialog(true);startNavigation(sc,id);},'voyage-route-'+id);}
async function job(name,p,again){
 const t=V.get(state()),oldScene=state().scene;
 if((name==='voyageStep'&&p.i===6)||name==='voyageResume'){if(!await loadSceneAssets('qPier')){notice(L('青屿图片未载入，船脚尚未扣除。','Qingyu art is not loaded; no fare has been taken.'),true);return {ok:false};}}
 if(name==='voyageReturn'&&!await loadSceneAssets('anchorage'))return {ok:false,message:L('泊岸图片尚未载入，回程仍保留。','The berth art has not loaded; your return is preserved.')};
 return perform(name,{...p,sequence:state().revision},()=>{
  if(state().scene!==oldScene){closeDialog(true);refreshHud();render();notice(L('平安靠岸。行囊、回程安排和记录都在。','Safely berthed. Your luggage, return arrangements and records are preserved.'));return;}
  if(again)again();
 });
}
function stepButton(label,c=0,extra={}){const r=V.first(state());button(label,()=>job('voyageStep',{i:r.i,j:r.j,choice:c,...extra},()=>panel()),'voyage-step-'+c);}
function ledger(){
 const s=state(),t=V.get(s);activity(L('春潮有信 · 旅途册','Letters on the Spring Tide · Travel Book'),t?L('往返、行囊与共同经历在这里逐项保留。','Passage, luggage and shared memories are recorded here.'):L('第五卷的来季安排落实以后，何行舟会带来青屿的邀请。','Once next season is arranged, Xingzhou will bring an invitation from Qingyu.'),'voyage-ledger');
 if(!t){if(V.canStart(s))button(L('和家人拆开春潮来信','Open the spring-tide letter together'),()=>job('voyageStart',{},ledger),'voyage-start');else note(L('请先完成岁序长青，并至少实际完成一项伙伴共事或有效交接。','Complete Enduring Seasons and record at least one shared task or verified handover first.'));return;}
 const r=V.first(s),target=V.target(s);
 note(L('此刻：','Now: ')+L(t.away?'青屿旅途中':t.phase==='complete'?'主线已完成，日常继续':'在南澜，行程保留',t.away?'Away on Qingyu':t.phase==='complete'?'Main story complete; daily life continues':'In Nanlan; itinerary preserved'));
 note(L('回程封存：','Return fare reserved: ')+t.reserve+L(' 文 · 已付船脚：',' coins · Fares paid: ')+t.fares);
 if(t.sketch)note(L('旅途写生：'+t.sketch.view+' · '+t.sketch.line,'Travel sketch · A view, a quiet moment, and room left for the next discovery.'));
 if(t.message)note(L('归期消息：','Return message: ')+(s.worldTick>=t.message.arrivesAt?L('已随班船送达','Delivered by the scheduled boat'):L('随下一班船递送中','Travelling with the next scheduled boat')));
 if(r&&target)route(P(r.actions[r.j]),target[0],target[1]);
 if(s.flags.voyageComplete){note(L(t.fatherReply||'','The Capital’s letter brings household news, not a pardon. Unconfirmed matters remain open. Father chooses to tend life in Nanlan.'));note(L(t.familyReply||'','Grandfather teaches from permitted copies and returns originals. Mother keeps her selection and visiting days. Partners continue by consent, with lives of their own.'));navButton(L('看看闲日邀约与六篇番外','Open the six epilogue invitations'),extras,'voyage-extras');}
 for(const entry of t.ledger.slice(-10))note(P([entry.zh,entry.en]));
 navButton(L('收好旅途册','Put the travel book away'),()=>closeDialog(true),'voyage-book-close');
}
function introOrLedger(){ledger();}
function panel(){
 const s=state(),t=V.get(s),r=V.first(s);if(!r){ledger();return;}
 const target=V.target(s);
 if(target[0]!==s.scene){ledger();return;}
 if(t.away&&!V.islands.includes(r.scene)||!t.away&&V.islands.includes(r.scene)){harbor();return;}
 activity(P(r.title),P(r.text),'voyage-story');$('dialogKicker').textContent=L('春潮有信 · 眼前这一步','Spring Tide · The next small step');note(P(r.actions[r.j]));
 const k=r.i+'_'+r.j;
 if(k==='2_0'){[['独行','Travel alone'],['邀母亲同行，先商定休息与选品日','Invite Mother; agree time away'],['邀父亲同行，先交清账','Invite Father; hand over the accounts'],['邀小满同行，保留她的休沐','Invite Xiaoman; preserve her rest'],['邀何行舟同行，另由认可船主承运','Invite Xingzhou; a qualified skipper takes the passage'],['邀林师傅同行，避开已约教学','Invite Master Lin; preserve agreed lessons']].forEach((a,i)=>stepButton(P(a),i));}
 else if(k==='3_0'){
  note(L('三套清单可调整是否带一件自己的样品；占用最多四格，另留两格返程。干粮优先用行囊热饭，没有时购一份三文干粮。普通工具可借用，归来归还。','Choose a list and optionally add one sample you own. At most four spaces are used, leaving two for the return. Pack a meal, or buy provisions for three coins. Ordinary tools may be borrowed and returned.'));
  const type=document.createElement('select');[['生活清单','Daily essentials'],['样品清单','Sample kit'],['轻装清单，普通工具借用','Light kit; borrow ordinary tools']].forEach((a,i)=>{const o=document.createElement('option');o.value=i;o.textContent=P(a);type.append(o);});
  const sample=document.createElement('select'),none=document.createElement('option');none.value='';none.textContent=L('不带可售样品','No sale sample');sample.append(none);
  for(const id of ['bambooWare','narrowBasket','travelBox','driedHerb'])if(N.available(s,id)>0){const o=document.createElement('option');o.value=id;o.textContent=L(N.itemNames[id],({bambooWare:'Bamboo ware',narrowBasket:'Narrow basket',travelBox:'Travelling food box',driedHerb:'Dried herbs'})[id])+' ×1';sample.append(o);}
  $('panelExtra').append(type,sample);button(L('核对并装进行囊','Check and pack'),()=>job('voyageStep',{i:r.i,j:r.j,choice:Number(type.value),sample:sample.value||null},panel),'voyage-pack');
 }
 else if(k==='4_0'){stepButton(L('张贴暂歇告示，不动铺货','Post a closure notice; leave all stock untouched'),0);stepButton(L('拨干药 ×1，付工钱二文，只售这一份','Assign one dried-herb parcel; pay two coins; sell only this parcel'),1);}
 else if(k==='6_0'){stepButton(L('选近岸停靠线 · 六文含回程，六十分钟','Near-shore stops · Six coins including return; sixty minutes'),0);stepButton(L('选认可的直达近岸线 · 六文含回程，四十五分钟','Approved direct coastal passage · Six coins including return; forty-five minutes'),1);}
 else if(k==='7_0'){stepButton(L('岸灶热食 · 米、食材、柴各一','Cook ashore · One rice, ingredient and wood'),0);stepButton(L('分食已经装好的干粮','Share the packed provisions'),1);stepButton(L('向停靠处买饭 · 五文','Buy a meal ashore · Five coins'),2);}
 else if(k==='9_0'){
  note(L('篮口仍牢；旧补已用另一色篾。新损在篮底接缝，轻压时会张开。','The rim is sound; the old repair uses another strip. The new damage is a base joint that opens under light pressure.'));
  navButton(L('把仍牢的篮口当作新损','Mark the sound rim as new damage'),()=>notice(L('篮口仍牢，再看轻压会张开的篮底。','The rim is sound. Look at the base joint that opens under pressure.'),true),'voyage-inspect-again');
  stepButton(L('确认篮底接缝，再问物主许可','Identify the base joint and ask the owner'),0);
 }
 else if(k==='9_1'){stepButton(L('局部换篾 · 竹材一份','Replace a strip · One bamboo'),0);stepButton(L('征得同意，改作非承重收纳','Agree a non-load-bearing storage use'),1);}
 else if(k==='10_1'){if(t.sample&&t.pack[t.sample])stepButton(L('按公开价交付带来的样品','Sell the assigned sample at its listed price'),0);stepButton(L('只请客人试用，保留样品带回','Invite inspection and keep the sample'),1);}
 else if(k==='11_0'){stepButton(L('双方同意，只示范一段收绳法','Agree a short binding demonstration'),0);stepButton(L('只交流样品观察，不转授技法','Exchange observations without teaching the method'),1);}
 else if(k==='12_0'){note(L('棚口三十六寸，原篮沿三十八寸，取用还须留余量。先量再改，不归咎一方。','The shelf opening measures thirty-six units, the rim thirty-eight; handling needs clearance too. Measure before assigning responsibility.'));stepButton(L('记录架口、篮沿和余量三项','Record opening, rim and clearance'),0);}
 else if(k==='12_1'){[['局部改样后再确认','Modify and reconfirm'],['改作不叠放用途','Agree a use without stacking'],['减少件数，重谈数量','Agree fewer pieces']].forEach((a,i)=>stepButton(P(a),i));}
 else if(k==='13_0'){const lines=[['路走远了，归处仍清楚。','Farther roads, a familiar home.'],['不赶着交货，也走得成一程。','A journey need not hurry a delivery.'],['空白留给下一次看见。','Leave room for the next discovery.']];
  [['盐田与岸线','Salt pans and coast'],['竹径与渡口','Bamboo path and landing'],['灯台下的风','Wind below the beacon']].forEach((a,i)=>stepButton(P(a)+' · '+P(lines[i]),i,{line:i}));}
 else if(k==='14_0'){stepButton(L('自愿多留一夜 · 二文，随班船送归期消息','Stay one more night · Two coins; send a return message'),0);stepButton(L('核天气后照常返程，不另住一夜','Check the weather and return without another stay'),1);}
 else if(k==='16_0'){stepButton(L('竹材一份试做，标明青屿共同来源','Try one bamboo; credit the Qingyu collaboration'),0);stepButton(L('先存旅记，暂不量产','Keep the notes; do not begin production'),1);}
 else if(k==='17_2'){[['定期往来','Keep regular visits'],['偶尔远行','Travel from time to time'],['邀请来访','Invite friends here'],['专注本地','Tend life at home']].forEach((a,i)=>stepButton(P(a),i));}
 else stepButton(P(r.actions[r.j]),0);
 navButton(L('翻旅途册，看缺项与去向','Open the travel book'),ledger,'voyage-story-book');
 navButton(L('回到场景，稍后再做','Return and continue later'),()=>closeDialog(true),'voyage-story-back');
}
function harbor(){
 const s=state(),t=V.get(s);activity(L('近岸候船 · 归路先留好','Coastal Passage · Keep the Way Home'),L('班船由船主掌管。午后雷雨先候船，未启程不收船脚。往返六文，其中三文封存作回程，不能用于其他支出。','The skipper handles the boat. Wait ashore during a storm; no fare is taken before departure. Six coins cover both ways, with three held for your return.'),'voyage-harbor');
 if(!t){note(L('先回后堂拆开春潮来信。','Open the spring-tide letter in the back hall first.'));return;}
 const r=V.first(s);
 if(t.away)button(L('使用封存回程船脚，平安返湾','Use the reserved fare and return to the bay'),()=>job('voyageReturn',{},ledger),'voyage-return');
 else if(s.flags.voyage_6_0)button(L('按约再赴青屿 · 六文含回程','Visit Qingyu again · Six coins including return'),()=>job('voyageResume',{},ledger),'voyage-resume');
 else if(r?.i===6)navButton(L('核对本次航路后启程','Review the route and depart'),panel,'voyage-first-route');
 else{const to=V.target(s);if(to)route(L('先办行前安排','Finish the travel preparations'),to[0],to[1]);}
 button(L('在岸上候船一小时','Wait ashore for one hour'),()=>job('voyageWait',{},harbor),'voyage-wait');
 navButton(L('收好船期，回到场景','Keep the schedule and return'),()=>closeDialog(true),'voyage-harbor-close');
}
function supplies(o){
 activity(L('旅途补给与歇脚','Travel Supplies and Rest'),L('按实物逐份购买；行囊与原有订单预留分开。宿院可付简住宿二文歇到次日。','Buy real supplies one at a time. Your luggage does not draw from reserved orders. Simple lodging costs two coins.'),'voyage-supplies');
 for(const [id,zh,en,price]of [['rice','米粮','Rice',3],['ingredient','食材','Ingredients',3],['wood','枯枝','Firewood',2],['bamboo','竹材','Bamboo',3],['rope','草绳','Rope',3],['hotMeal','热饭','Warm meal',5]])button(L(zh,en)+' ×1 · '+price+L(' 文',' coins'),()=>job('voyageBuy',{item:id},()=>supplies(o)),'voyage-buy-'+id);
 if(state().scene==='qLodge')button(L('简住宿一夜 · 二文，恢复体力','Simple lodging · Two coins; restore energy'),()=>job('voyageRest',{},()=>supplies(o)),'voyage-rest');
 navButton(L('回到场景','Return to the scene'),()=>closeDialog(true),'voyage-supply-close');
}
function extras(){
 const s=state(),t=V.get(s);activity(L('闲日邀约 · 六篇番外','Days Together · Six Epilogues'),L('先约一件事。可约今日或明日，暂缓后随时续上；重看回忆不会扣料或改时间。','Arrange one activity at a time, today or tomorrow. Pause and resume when ready. Recalling a memory uses no materials or time.'),'voyage-extras');
 if(!s.flags.voyageComplete){note(L('春潮有信主线完成后，家人和伙伴会陆续发来邀约。','Invitations follow the completion of Letters on the Spring Tide.'));return;}
 const x=t.extra;
 if(x.active){const a=x.active,b=V.bonus[a.id];note(P(b.title)+' · '+L('约在第 ','Day ')+a.day);
  if(a.paused)button(L('今日续上这段相处','Resume this activity today'),()=>job('voyageExtraResume',{},extras),'extra-resume');
  else if(V.day(s)>=a.day){const [sc,id]=V.extraTargets(a.id,a.stage);route(P(b.stages[a.stage]),sc,id);}
  else note(L('约定在明日，今日先做别的事。','Your appointment is tomorrow. Today remains your own.'));
  button(L('暂缓，改日再来','Pause until another day'),()=>job('voyageExtraPause',{},extras),'extra-pause');
 }else V.bonus.forEach((b,id)=>{
  if(x.done[id])navButton(P(b.title)+' · '+L('重看回忆','Recall'),()=>replay(id),'extra-replay-'+id);
  else{button(P(b.title)+' · '+L('约今日','Today'),()=>job('voyageExtraStart',{id,day:V.day(s)},extras),'extra-today-'+id);button(P(b.title)+' · '+L('约明日','Tomorrow'),()=>job('voyageExtraStart',{id,day:V.day(s)+1},extras),'extra-tomorrow-'+id,true);}
 });
 navButton(L('回到场景','Return to the scene'),()=>closeDialog(true),'extra-back');
}
const epilogueLines=[
 [
  ['母亲数了数碗，又从柜里取下一只。「这回不赶家宴的日子。谁得空来，咱们就好好坐一会儿。」','Mother counts the bowls and takes down another. “There’s no feast day to hurry for. Whoever has time can sit with us a while.”'],
  ['祖父试着把椅子往后退。「这里再宽一点。最后来的人也能走到桌边，不必叫别人都站起来。」','Grandfather draws a chair back. “A little more room here. Let the last guest reach the table without everyone having to stand.”'],
  ['母亲接过你端来的热饭。「这碗放近些。等都坐下了，咱们才说这一年有什么好记的。」','Mother takes the warm dish you bring. “Set this one close. When everyone has sat down, we can talk about what we want to remember this year.”'],
  ['碗底还暖，祖父把旅册翻到空处。「今日不写去了哪里。写谁坐在这儿，谁说了笑话。」','The bowls are still warm. Grandfather finds a blank page. “Today let us write who sat here, and who made us laugh.”']
 ],[
  ['母亲把两件货换了位置。「我也有想自己试的摆法。钱要先算清，最后卖不卖，也等我自己拿主意。」','Mother swaps two goods around. “I have an arrangement I’d like to try. Let’s agree on the cost, then leave the decision to sell to me.”'],
  ['她用手试了试竹器的边。「先挑一件真能带回家用的。别只因它在架上好看就拿它。」','She runs a hand along the bamboo rim. “Pick one people can really use at home. Looking good on the shelf is only part of it.”'],
  ['来客把手伸向货架，母亲让开半步。「先请人试试。用过一句实话，比我说一串好处还管用。」','A visitor reaches for the shelf. Mother steps aside. “Let them try. One honest word from using it is better than a string of good things I might say.”'],
  ['人走后，母亲把布收好。「这一回，我知道自己为什么要这样摆了。下回留不留，也由我想。」','After the customer leaves, Mother folds the cloth. “This time I know why I arranged it this way. Next time I’ll decide whether to keep it.”']
 ],[
  ['祖父把残页托在两手间。「先问得留纸的人同意。纸有主，写在上面的话也不是见着就能拿走的。」','Grandfather holds the fragments between both hands. “Ask the keeper first. Paper has an owner, and its words are not ours merely because we see them.”'],
  ['他将三片纸推到光下。「别先看字。看纸纹、行距和页边，再看看哪一处本来就没有写。」','He slides the pieces into the light. “Look beyond the words. Find the grain, the spacing and the edges. See where no one wrote in the first place.”'],
  ['祖父举笔，又放下了。「我猜得出一个字，却未必就是原来的字。有出处再添，找不着，就留空。」','Grandfather lifts his brush and sets it down. “I can guess a word. It may not be the original. Fill it only if we find a source.”'],
  ['祖父把原页收回纸套，把誊本放在桌中。「给孩子看这一张。也让他们看看，空白有时候是认真的记法。」','Grandfather slips the original back into its cover and sets out the copy. “Show the children this one. Leaving a space can be the careful way to record something.”']
 ],[
  ['父亲把信压在掌下。「我想让你陪我坐一会儿。至于要不要读，容我自己说。」','Father rests a hand over the letter. “I’d like you to sit with me a while. Let me say whether I want it read.”'],
  ['走到村口时，父亲停下来等一个挑担人过去。「头一回来，我不知道哪边要让。今日倒认得几个人的脚步声了。」','At the village entrance Father waits for a porter to pass. “When we came, I didn’t know where to step aside. Now I recognize some people by their footsteps.”'],
  ['他把信翻过来，露出没有写名字的一面。「那时想说的话，和今日想说的，兴许不是同一封信。」','He turns the letter to the side with no name on it. “What I wanted to say then and what I would say now may belong to different letters.”'],
  ['父亲把信收拢，手放松了些。「今日能把去留定下来，就够了。谢谢你肯陪我走这一段。」','Father gathers the letter and his hand relaxes. “Deciding what to do with it is enough for today. Thank you for walking with me.”']
 ],[
  ['小满把交班纸压平。「有话写清了，人也能放心走。出了门，我今日想先听些与货无关的事。」','Xiaoman flattens the handover sheet. “When the notes are clear, I can leave in peace. Outside, I’d like to hear about anything but stock.”'],
  ['她站在摊前看了片刻，指着一角布。「平常总替客人想，今日这颜色合不合我的心意，倒可以自己说。」','She pauses at a stall and points to a corner of cloth. “I usually think about what customers like. Today I get to say whether I like this color.”'],
  ['小满说起小时候在家门口学过的调子，低低哼了两声，又笑了。「好久没唱，原来还记得。」','Xiaoman recalls a tune she learned outside her childhood home and hums a few notes. “I haven’t sung it in years. I still remember.”'],
  ['到分路的地方，她朝你摆摆手。「今日过得好。铺里的事等上工再说，明日也来得及。」','At the fork she waves. “It was a good day. The shop can wait until I am back on duty. Tomorrow will do.”']
 ],[
  ['何行舟把船期指给你看。「探朋友也要算清回程。天气若不肯放行，人情留着，下回照样能见。」','Xingzhou shows you the sailing times. “Even visiting a friend, plan the return. If the weather holds us back, we can still see them another day.”'],
  ['他指向岸石上一道发白的线。「这处看着不起眼。涨过一回大潮，我才知道回头要找它。」','He points to a pale line on a rock. “It doesn’t look like much. One high tide taught me to look for it on the way back.”'],
  ['旧友把松绳举起来。「你们肯看看，就已经帮了忙。要动手，等我把哪段最常受力指给你。」','The old friend lifts the loose line. “Looking is a help already. Before you work on it, let me show you where it takes the strain.”'],
  ['归程的水声轻了些。何行舟把借来的物件数齐。「回去吧。下回再出海，也可以只是看看海。」','The water sounds softer on the way back. Xingzhou counts the borrowed things. “Let’s go home. Next time we come out, it can be just to look at the sea.”']
 ]
];
function extraPanel(){
 const s=state(),a=V.get(s)?.extra.active;if(!a||a.paused||V.day(s)<a.day){extras();return;}
 const b=V.bonus[a.id],target=V.extraTargets(a.id,a.stage);
 if(s.scene!==target[0]){extras();return;}
 activity(P(b.title),P(epilogueLines[a.id][a.stage]),'voyage-extra-story');note(P(b.stages[a.stage]));
 const run=(c,more={})=>job('voyageExtraStep',{id:a.id,stage:a.stage,choice:c,...more},()=>{if(V.get(state()).extra.active)extras();else replay(a.id);});
 const option=(zh,en,c,more={})=>button(L(zh,en),()=>run(c,more),'extra-choice-'+c);
 if(a.id===0&&a.stage===0){option('只约家人，留一桌清闲','Invite only family',0);option('约愿来的邻里，未赴约的不扣关系','Invite willing neighbours',1);}
 else if(a.id===0&&a.stage===1){option('庭院留通道，雨来移后堂','Keep a passage; use the back hall in rain',0);option('直接选后堂避风雨','Choose the sheltered back hall',1);}
 else if(a.id===1&&a.stage===2){option('来客确认后卖出这一件实货','Sell this real piece by consent',0);option('只试用，余货留到收架','Offer inspection and keep it',1);}
 else if(a.id===1&&a.stage===3){option('由母亲保留一角陈列方案','Let Mother keep a display plan',0);option('听她决定先收架，改日再办','Let her put the display away',1);}
 else if(a.id===2&&a.stage===1){
  note(L('三片线索：0 字行延续；1 完整下边缘；2 无字留白页角。按从上到下点选，留白处不补字。','Three clues: 0 continues the text; 1 has the lower edge; 2 is the blank upper corner. Arrange top to bottom; do not invent missing words.'));
  let order='';const status=document.createElement('p');status.setAttribute('role','status');$('panelExtra').append(status);
  for(const [n,zh,en]of [[2,'留白页角','Blank upper corner'],[0,'字行片','Text fragment'],[1,'下边缘','Lower edge']])navButton(L(zh,en),()=>{if(!order.includes(n)){order+=n;status.textContent=order.split('').join(' → ');}},'extra-piece-'+n);
  navButton(L('重新摆放','Start again'),()=>{order='';status.textContent='';},'extra-piece-reset');
  button(L('确认拼合，保留缺字','Confirm and leave missing words blank'),()=>run(0,{pieces:order}),'extra-puzzle');
 }
 else if(a.id===3&&a.stage===0){option('问他是否愿意一起看，获准再读','Ask permission before reading',0);option('不展开，只听父亲讲','Listen without unfolding the letter',1);}
 else if(a.id===3&&a.stage===2){[['寄出','Send'],['重写后保留','Rewrite and keep'],['原样保留','Keep as it is'],['不再写','Leave it unwritten']].forEach((v,i)=>option(v[0],v[1],i));}
 else if(a.id===4&&a.stage===1){option('本人买一盏茶 · 一文，小满自定消费','Buy your own tea · One coin; Xiaoman decides for herself',0);option('只看布与日用品，不购买','Browse without buying',1);}
 else if(a.id===5&&a.stage===2){option('先问旧友许可，用草绳一份修绳具，再分热饭一份','Ask consent; use one rope and share one warm meal',0,{consent:true});}
 else option(P(b.stages[a.stage]),P(b.stages[a.stage]),0);
 navButton(L('改日再坐，保存并暂缓','Save and continue another day'),()=>job('voyageExtraPause',{},extras),'extra-stage-pause');
}
function replay(id){
 const s=state(),d=V.get(s)?.extra.done[id];if(!d)return;const b=V.bonus[id];
 activity(P(b.title)+' · '+L('回忆','Memory'),P(epilogueLines[id][3]),'voyage-memory');for(const receipt of d.record.receipts)note(P(receipt.text));
 navButton(L('回听这一天的对白','Read the conversations from this day'),()=>{
  activity(P(b.title)+' · '+L('对白','Conversations'),epilogueLines[id].map(P).join('\n\n'),'voyage-memory');
  navButton(L('回到这篇回忆','Return to this memory'),()=>replay(id),'extra-dialogue-back');
 },'extra-dialogue-replay');
 if(id===0){const img=document.createElement('img');img.src=DATA.assets[s.gender==='male'?'familyMealMale':'familyMealFemale'];img.alt=L('一家人围桌吃饭的回忆','A memory of the family sharing a meal');img.style.cssText='display:block;width:100%;max-height:340px;object-fit:contain;border-radius:8px';$('panelExtra').append(img);}
 note(L('这是已完成的回忆；查看不会再次扣料、推进时间或发放奖励。','This is a completed memory. Viewing it does not spend materials, advance time or grant rewards.'));
 navButton(L('查看其他邀约','View other invitations'),extras,'extra-memory-back');
}
function visible(s,scene,o){
 const t=V.get(s);if(o.id==='voyageBook')return !!s.flags.season5Complete;
 if(o.id==='voyageExtras')return !!s.flags.voyageComplete;
 if(o.id==='voyageCompanion'){if(!t?.away||t.companion==='none')return false;o.role=t.companion;return true;}
 if(t?.away&&o.id!=='voyageCompanion'&&npcRole(o)===t.companion)return false;
 if(['voyageBox','voyageHarbor'].includes(o.id))return !!s.flags.season5Complete;
 if(o.id==='voyageCoastRest')return !!s.flags.voyageComplete;
 return true;
}
function offer(o){
 if(original){original=false;return false;}const s=state(),t=V.get(s);
 if(o.id==='voyageBook'){introOrLedger();return true;}
 if(o.id==='voyageExtras'){extras();return true;}
 if(o.id==='voyageSupplies'){supplies(o);return true;}
 if(o.id==='voyageReturn'||o.id==='voyageHarbor'){const r=V.first(s);if(o.id==='voyageHarbor'&&r?.i===6&&!t?.away)panel();else harbor();return true;}
 if(o.id==='voyageCompanion'){activity(L('同行的人','Your Companion'),L('「慢些走吧。这回不赶交期，我们还有回去的路。」','“Let us take our time. No delivery to hurry, and a way home waiting.”'),'voyage-companion');return true;}
 const a=t?.extra.active;if(a&&!a.paused&&V.day(s)>=a.day){const [sc,id]=V.extraTargets(a.id,a.stage);if(sc===s.scene&&id===o.id){extraPanel();return true;}}
 const target=t&&V.target(s),r=V.first(s);
 if(r&&target&&target[0]===s.scene&&target[1]===o.id){panel();return true;}
 if(o.action==='voyageScene'){if(o.id==='voyageGuestBook')supplies(o);else ledger();return true;}
 return false;
}
$('nightNote').addEventListener('click',e=>{if(V.get(state())?.away){e.preventDefault();e.stopImmediatePropagation();closeDialog(true);startNavigation('qLodge','voyageGuestBook');}},true);
window.NanlanVoyageUI={offer,visible,ledger,extras,panel,extraPanel};
})();
