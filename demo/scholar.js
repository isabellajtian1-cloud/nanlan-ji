/* From the tea stall to the family table. The eight-second sequence has no economic
 * side effects until the single checked engine action at serving time. */
(()=>{'use strict';
const model=N.scholar;let cancelRun=null;
function interrupt(){if(cancelRun)cancelRun();}
function note(words){const p=document.createElement('p');p.className='production-note';p.textContent=words;$('panelExtra').append(p);}
function act(label,name,p,again){const seq=state().revision;return actButton(label,name,{...p,sequence:seq},again,'scholar-'+name+(p.item||''));}
function back(label,fn,id){return button(label,fn,'scholar-'+id,true,false);}
function nav(label,scene,id){back(label,()=>{closeDialog();startNavigation(scene,id);},'to-'+id);}
function speak(words){activity('梁问炊 · 锅边先生',words,'scholar-tea');}
async function meet(){
 const a=state().scholar;
 if(!a?.met){return perform('liangMeet',{sequence:state().revision},tea);}
 if(a.shared&&!a.signed){return perform('liangSign',{sequence:state().revision},()=>{speak('他把那半页旧方翻过来，蘸了墨，端端正正添上一行：「南澜李家，已试过。」');back('把饭方收好',tea,'put-away');});}
 tea();
}
function tea(){
 const a=state().scholar;
 speak(a.sat?'「上回那碗，家里人可吃热了？」他把长凳让出半边。':a.recipe?'「今日锅里有笋么？我在茶棚坐着，听锅的本事可没忘。」':'一封信才写了半页，一只空碗正压着纸角。「文章么，还须再改。倒是你身上这缕饭香，有什么讲究？」');
 button('「先生，尝一口我家的饭？」',()=>{
   speak('他用衣袖把碗沿擦了一遍。「锅底的留给我，我娘从前就爱这一口。」');
   if(a.giftDay!==model.day(state())&&N.available(state(),'hotMeal')>0)act('分一份热饭给先生','liangGift',{},()=>{
     speak('他把碗转了回来。「这块给我。上头的饭，水米周全就做得；底下这一层薄黄，得有人守着，听见响，才肯撤柴。你今早在灶边坐了好一会儿罢？」连碗沿那粒米，他也用筷尖拈走了。');back('陪先生再坐一会儿',tea,'again');});
   else note(a.giftDay===model.day(state())?'先生今日已经用过饭了。':'行囊里没有热饭，空手来也可坐坐。');
   if(!a.tasted&&N.available(state(),'crustRice')>0)act('请他尝薄黄锅巴','liangTaste',{},()=>{speak('他轻轻咬下一口，在你的饭方边上写了四个字：「柴撤得准。」');back('收好先生的边注',tea,'margin');});
   back('回到茶棚长凳',tea,'bench');
 },'scholar-offer',false,false);
 if(!a.recipe)button('「先生，你娘从前怎么做笋饭？」',()=>{
   speak('他把一张沾着油印的纸从书页间抽出来。「我替娘抄过一回，把‘听锅’改成了‘候火’。娘拿勺柄敲我一下，说过路人要学做饭，谁有空猜你那个‘候’字？」');
   if(state().visits.bambooGrove&&N.available(state(),'shoot')>0)act('递上一份竹笋，接过手抄饭方','liangRecipe',{},()=>{speak('他掐掐笋尖，另取新纸：「水声一收，笋香一冒，撤柴，盖严。」旧方留在书里，新抄的这一页交到你手上。');nav('回庭院试一锅笋饭','yard','stove');});
   else{note('带一份竹林采来的笋再来，梁先生便肯抄下旧方。');nav('去竹林寻笋','bambooGrove','shoot1');}
   back('回到茶棚长凳',tea,'bench');
 },'scholar-ask',false,false);
 else back('翻一翻梁先生的饭方',recipe,'recipe');
 act('「这碗得留给家里。我陪你坐一会儿。」','liangSit',{},()=>{speak('「那就趁热带回去。我娘卖饭，头一碗也总是扣在灶边的。小时候以为那碗卖相不好，长大才知道，那是我的。」');back('告辞，明日再见',closeDialog,'leave');});
}
function recipe(){
 const a=state().scholar;activity('手抄饭方 · 笋香焖饭','米一份，笋一份，枯枝一份，水一桶。水声一收，笋香一冒，撤柴，盖严。','scholar-recipe');
 if(a.margin)note(a.margin==='early'?'边注：上回撤早了。两股汽还没并成一缕，米心还要再焖。':'边注：上回撤迟了。盖沿最后轻碰一下，就该收柴。');
 if(a.tasted)note('柴撤得准。');if(a.signed)note('南澜李家，已试过。');
 const marks=document.createElement('p');marks.className='scholar-marks';marks.textContent=['尚待试锅','一个灶灰指印','两个灶灰指印','三个灶灰指印 · 已记熟'][a.practice];$('panelExtra').append(marks);
 nav('到庭院灶台做笋饭','yard','stove');
}
function kitchen(){button('照梁先生的方子做笋香焖饭',hearth,'scholar-kitchen',false,false);}
function pantry(){nav('去村口补米','village','villagePantry');nav('去竹林采笋','bambooGrove','shoot1');nav('去庭院水缸装水','yard','waterJar');nav('去村边拾枯枝','village','wood1');}
function eatButtons(refresh){for(const id of model.dishes)if(N.available(state(),id)>0)act('吃一份'+N.itemNames[id]+' · 恢复 35 体力','liangEat',{item:id},refresh);}
function bag(){back('翻看笋香焖饭的手抄饭方',recipe,'bag-recipe');eatButtons(showBag);}
function table(){for(const id of model.dishes)if(N.available(state(),id)>0){const first=id==='crustRice'&&!state().scholar.sharedCrust;act('把一份'+N.itemNames[id]+'端上饭桌','liangShare',{item:id},()=>{
 activity(first?'祖父 · 锅底那一弯':'正厅 · 分一碗笋饭',first?'祖父把碗转半圈，将金黄的一边朝向你。「这一口留给守灶的人。我们只管坐下吃，你可是听了半天。」':'一家人围桌分了笋饭。母亲把最后几片嫩笋拨进你的碗里。');
 const img=document.createElement('img');img.className='v3-family';img.src=DATA.assets[state().gender==='male'?'familyMealMale':'familyMealFemale'];img.alt='一家人围桌分饭';$('panelExtra').append(img);back('收好碗筷',closeDialog,'supper');});}}
function counter(){const s=state();if(s.scholar.order||model.lunch(s)&&s.scholar.lastOrder!==model.day(s)&&!s.story2.days[model.day(s)]?.closed)button(s.scholar.order?'看看脚夫的取饭篮':'听听午间客人的订饭口信',order,'scholar-lunch',true,false);}
function order(){
 const s=state(),o=s.scholar.order;activity('南街 · 两份脚夫饭',o?'两份笋饭，每份十文。柜上留好的饭篮随单保存，交清才收钱。':'「村口写信的梁先生说，你家的饭，掀盖还能闻见笋。明日午间，能不能替我们留两份？」');
 if(!o){act('接下两份笋饭 · 次日午间取，合计二十文','liangBook',{},order);back('这次先顾家中的饭',closeDialog,'decline');return;}
 note('取饭日 · '+o.due+'　11:00–13:00');for(const id of model.dishes)note(N.itemNames[id]+' · '+o[id]+'/2');
 if(o.shootRice+o.crustRice<2){for(const id of model.dishes)if(N.available(s,id)>0)act('装一份'+N.itemNames[id]+'进取饭篮','liangPack',{item:id},order);nav('回灶边备饭','yard','stove');}
 else if(model.day(s)>=o.due&&model.lunch(s)&&!s.story2.days[model.day(s)]?.closed)act('两份交给脚夫，收二十文','liangDeliver',{},()=>{activity('南街 · 掀盖闻笋','脚夫将饭篮端稳，把约好的二十文数进钱匣。「那我可得走稳些，别把锅底那点脆糟蹋了。」');back('回柜台看今日流水',()=>NanlanV2.show('v2Shop'),'paid');});
 else note('客人约在次日午间，错过可顺延到下一次午间。');
 back('商量退单，取回篮里的饭',()=>{activity('退回取饭篮','已装的笋饭会原样收回行囊。');act('确认退单','liangCancel',{},()=>NanlanV2.show('v2Shop'));back('保留原约',order,'keep');},'cancel');
}
const sound=name=>window.NanlanAudio?.play(name);
function cooked(result){
 const fine=result==='perfect';activity(fine?'笋香焖饭 · 薄脆起锅':'笋香焖饭 · 出锅',fine?'木铲沿锅边一转，带起一整弯薄金色锅巴，落在碗边轻轻一响。':result==='early'?'借余火再焖片刻，米心熟透了，竹笋还是嫩的。':result==='late'?'沿锅壁轻轻一铲，笋饭盛了出来，锅巴散成几片。':'揭开锅盖，笋香随着热汽散开。','scholar-served');
 const img=document.createElement('img');img.className='scholar-bowl';img.alt=fine?N.itemNames.crustRice:N.itemNames.shootRice;img.src=fine?'scholar-rice.webp':'scholar-rice-plain.webp';$('panelExtra').append(img);
 note('已装入行囊 · '+N.itemNames[fine?'crustRice':'shootRice']+' ×1');if(state().scholar.practice===3)note('饭方页角已留下三个灶灰指印，往后可照旧火候快做。');if(fine)sound('riceCrust');
 nav('端去正厅，趁热分饭','hall','mealTable');back('看看行囊',showBag,'view-rice');back('收好碗勺',closeDialog,'finish');
}
function hearth(){
 const s=state(),a=s.scholar,seq=s.revision;
 activity('庭院 · 听锅撤柴','夹住柴头不放。等两缕白汽并成一缕、锅盖轻碰一下，再松手撤火，点锅盖焖饭。空格也能夹柴、撤柴和扣盖。','scholar-hearth');
 const why=model.cookingBlock(s);if(why){note(why);pantry();back('回灶台',showCook,'back');return;}
 const box=document.createElement('div');box.className='scholar-pot';box.dataset.phase='ready';
 const steam=document.createElement('div');steam.className='scholar-steam';steam.setAttribute('aria-hidden','true');steam.append(document.createElement('i'),document.createElement('i'));
 const glow=document.createElement('i');glow.className='scholar-embers';glow.setAttribute('aria-hidden','true');
 const wood=document.createElement('button'),lid=document.createElement('button'),hint=document.createElement('p');wood.type=lid.type='button';wood.className='scholar-wood';lid.className='scholar-lid';wood.textContent='按住柴头';lid.textContent='扣稳锅盖';lid.hidden=true;hint.className='scholar-cue';hint.setAttribute('role','status');hint.textContent='等你动手才开始。';
 box.append(glow,steam,wood,lid,hint);$('panelExtra').append(box);wood.focus({preventScroll:true});
 let began=null,target=0,released=null,phase='ready',raf=0,cued=false;
 function cancel(){
   cancelAnimationFrame(raf);window.NanlanAudio?.stopKitchen?.();document.removeEventListener('visibilitychange',hidden);window.removeEventListener('blur',cancel);
   if(cancelRun===cancel)cancelRun=null;began=null;phase='ready';box.dataset.phase='ready';released=null;cued=false;
   box.classList.remove('one-plume');wood.hidden=false;lid.hidden=true;hint.textContent='等你动手才开始。';
 }
 function hidden(){if(document.hidden)cancel();}
 function start(){
   if(began!==null||phase!=='ready'||dialogKind!=='scholar-hearth'||!box.isConnected)return;
   began=performance.now();target=2450+Math.random()*900;phase='heat';box.dataset.phase='heat';cancelRun=cancel;
   document.addEventListener('visibilitychange',hidden);window.addEventListener('blur',cancel);hint.textContent='锅盖细颤，两股白汽往上冒。';sound('riceSimmer');raf=requestAnimationFrame(frame);
 }
 function pull(time,auto=false){
   if(phase!=='heat')return;released=auto?null:time-began;phase='cover';box.dataset.phase='cover';wood.hidden=true;lid.hidden=false;lid.focus({preventScroll:true});sound('riceRake');
   const g=model.judge(released,target,true);
   lid.textContent=g==='early'?'回盖再焖':g==='late'?'沿锅轻铲':'扣稳锅盖';
   hint.textContent=g==='early'?'水声还足，回盖借火再焖。':g==='late'?'火退得迟，沿壁轻铲仍有一碗。':'余烬尚红，轻轻扣盖。';
 }
 async function serve(covered){
   if(phase!=='cover'||!box.isConnected||document.hidden)return;
   const grade=model.judge(released,target,covered);cancel();phase='settling';wood.disabled=true;
   const r=await perform('liangCook',{result:grade,sequence:seq},()=>cooked(grade));
   if(!r.ok&&box.isConnected){hearth();note(r.message);}
 }
 function frame(t){
   if(document.hidden||!box.isConnected||dialogKind!=='scholar-hearth'){cancel();return;}
   const elapsed=t-began;
   if(phase==='heat'&&elapsed>=target&&!cued){cued=true;box.classList.add('one-plume');hint.textContent='两汽合一，锅沿轻响。';sound('riceLid');}
   if(phase==='heat'&&elapsed>=4500)pull(t,true);
   if(elapsed>=7950){void serve(false);return;}raf=requestAnimationFrame(frame);
 }
 wood.onpointerdown=e=>{if(e.button!==0||!e.isPrimary)return;e.preventDefault();wood.setPointerCapture(e.pointerId);start();};wood.onpointerup=e=>{if(e.isPrimary)pull(performance.now());};wood.onpointercancel=cancel;
 wood.onkeydown=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat)start();}};
 wood.onkeyup=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();pull(performance.now());}};
 lid.onclick=()=>serve(true);lid.onkeydown=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat)void serve(true);}};
 if(a.practice>=3)act('照旧火候焖一锅 · 保底普通笋饭','liangCook',{result:'quick'},()=>cooked('quick'));
 back('暂且离灶',showCook,'leave-hearth');
}
window.NanlanScholar={meet,kitchen,bag,table,counter,eatButtons,interrupt};
})();
