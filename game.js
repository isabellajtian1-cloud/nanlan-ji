'use strict';
const $=id=>document.getElementById(id);
const N=NanlanEngine, DATA=window.NANLAN_DATA, world=DATA.world;
// The painted garden extends slightly beyond the old walking limit; this lets the actor reach its edge without stepping on crops.
world.yard.bounds[2]=970;
world.village.objects.find(o=>o.id==='villagePantry').label='乡邻余粮 · 种子与补给';
(()=>{
 const labels=window.NANLAN_EN||(window.NANLAN_EN={});
 labels['乡邻余粮 · 种子与补给']='Neighbor’s Pantry · Seeds and Supplies';
 window.NanlanI18n?.configure(labels);
})();
const canvas=$('game'),ctx=canvas.getContext('2d',{alpha:false}),W=1100,H=733;
const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
const engine=new N.Engine(storage,world);
let active=false,started=false,gender='female',dialogKind=null,dialogObject=null;
let path=[],keys={},moving=false,direction='down',walkFrame=0,lastFrame=0,lastHud=0,transitioning=false;
let storedRaw=null,oldRaw=null,previousFocus=null,messageTimer=0,rewardTimer=0,lastAutosave=0;
let camera={scale:1,ox:0,oy:0,dpr:1,vw:W,vh:H},hitTargets=[],focusedObjectId=null,lastInteractionHint='';
let lastQuestSignature='';
let completionFx=null;
let gardenWorkFx=null;
const pantryDraft={rice:0,ingredient:0,seed:0,repair:0,rope:0};
const images={},imagePromises={};
DATA.assets.bedDamage='bed-damage-v39.png';
DATA.assets.storePickups='store-pickups-v39.png';
DATA.assets.walkFemale='player-female-walk-v39.png';
DATA.assets.walkMale='player-male-walk-v39.png';
DATA.assets.inventoryHousehold='inventory-household-v392.png';
DATA.assets.inventoryCrafts='inventory-crafts-v392.png';
DATA.assets.gardenStages='garden-stages-v395.png';
DATA.assets.diningTable='hall-table-v394.png';
DATA.assets.familyMealFemale='family-meal-female-v394.png';
DATA.assets.familyMealMale='family-meal-male-v394.png';
DATA.assets.workbench='workbench-v3912.webp';
DATA.assets.waterJar='water-jar-v3912.webp';
DATA.assets.villageLetter='village-letter-v3915.webp';
let gaitBlend=0,lastPoseTime=0;
function state(){return engine.state;}
function clean(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function loadImage(id){
  const key=world[id]?.asset||id;if(imagePromises[key])return imagePromises[key];
  const source=DATA.assets[key];if(!source)return Promise.resolve(false);
  imagePromises[key]=new Promise(resolve=>{
    const sources=[source,DATA.assets[key+'_fallback']].filter((item,index,list)=>item&&list.indexOf(item)===index);
    function attempt(index){
      const candidate=sources[Math.floor(index/2)];
      if(!candidate){delete imagePromises[key];resolve(false);return;}
      const im=new Image();let finished=false;
      const timer=setTimeout(()=>finish(false),15000);
      function finish(ok){if(finished)return;finished=true;clearTimeout(timer);im.onload=im.onerror=null;
        if(ok){images[key]=im;resolve(true);}else attempt(index+1);
      }
      im.onload=()=>finish(im.naturalWidth>0);im.onerror=()=>finish(false);
      im.src=candidate+(candidate.includes('?')?'&':'?')+'build=396'+(index%2?'&retry='+Date.now():'');
    }
    attempt(0);
  });
  return imagePromises[key];
}
async function loadSceneAssets(scene){
  const required=[scene];
  if(scene==='backHall')required.push('backHallReady');
  if(world[scene]?.objects?.some(o=>o.v3Art!=null))required.push('v3Props');
  if(scene==='yard')required.push('gardenStages','productionStages','productionItems','waterJar');
  if(state().actorState?.outfit==='nanlanSilk')required.push('familySilk',state().gender==='male'?'walkMaleSilk':'walkFemaleSilk');
  if(['mountain','coast'].includes(scene))required.push('seals');
  if(['foothill','mountain'].includes(scene))required.push('fruitTrees','fruitTreesPicked');
  if(scene==='store')required.push('storePickups','inventoryHousehold','inventoryCrafts','workbench');
  if(scene==='bed')required.push('bed','bedDamage','bedPatched');
  if(scene==='hall')required.push('diningTable','familyMealFemale','familyMealMale');
  if(scene==='village')required.push('villageLetter');
  return (await Promise.all(required.map(loadImage))).every(Boolean);
}
function notice(text,sticky=false){
  $('message').textContent=text;$('message').classList.remove('fade');clearTimeout(messageTimer);
  if(!sticky)messageTimer=setTimeout(()=>$('message').classList.add('fade'),8500);
}
const storyHooks={
  M01:'门轴转动时，屋里传来一声滴水。今夜，谁能睡得安稳？',
  M02:'床褥刚铺下，庭院草丛里露出半截生锈的旧农具。',
  M03:'通路见了光，灶膛却还是冷的；墙外的水声也不太对。',
  M04:'饭后，陈伯托人捎话：村口有封家信，等着有人念给乡邻听。',
  M05:'信纸边沾着细碎竹叶。陈伯说，山脚有人正为一条路发愁。',
  M06:'竹篓缝里落下一粒种子。许青禾看了一眼，只说：“先种下再认。”',
  M07:'药草初芽那夜，仓房深处传来纸页粘连的轻响。',
  M08:'程婉望向海湾：“有些旧事，得等潮退以后才看得清。”',
  M09:'岸边商贩看见你带回的海货，问你明日可愿在镇集摆一次。',
  M10:'第一位客人走后，又有人在摊边停了很久，却什么也没买。',
  M11:'凭单最后一角沾上雨星。远处闷雷滚过，风向变了。',
  M13:'沟渠才清好，第一滴雨便落下；村路上还有人没有回来。',
  M14:'灯下的人数点齐了，唯独父亲常坐的位置仍空着。',
  M15:'父亲袖中压着一页被雨浸过的旧记号，祖父一眼便认了出来。',
  M16:'原簿被程婉带走，桌上却还剩一张待核的转运凭单。',
  M17:'账刚结清，驿差便递来一封京中信；祖父看见落款，手指停住了。',
  M19:'祖父写完回信，却没有立刻封口：“等岁末那盏灯亮起来。”',
  M20:'家宴散后，门外留下了一张南街铺讯。新春要从另一扇门开始。',
  V2_01:'铺讯角落记着三个时辰。母亲说，先去南街站一整日。',
  V2_02:'三段客流里，有间空铺始终不开门，门槛却像每天都有人扫。',
  V2_03:'两扇门各有短处。祖父把算盘推来：“喜欢不算数，先算得起。”',
  V2_04:'纸上的数勉强合拢了，真正的门钥匙还握在别人手里。',
  M12:'钥匙转动，空铺里回声很大。林师傅量到墙角，忽然收住了尺。',
  V2_06:'柜架刚立稳，后门便传来车轮声：同一车货，跟着两处账。',
  V2_07:'账对上了，母亲却从货箱里挑出一件：“它不该摆在最前面。”',
  V2_08:'排面定下，门外第一位客人已经等了片刻，却迟迟没有进门。',
  V2_09:'门闩落下前，那个等了许久的人终于抬脚走了进来。',
  V2_10:'客人离开时回头问：“这间铺，能按时把货送到吗？”',
  V2_11:'大单写下了交期，门外天色已暗；今晚的灯不能只为照明。',
  M18:'灯亮后，隔壁掌柜来道贺，目光却停在最显眼的竹篮上。',
  V2_13:'同样的竹篮摆在两家铺里，第二天，那位熟客却空手而来。',
  V2_14:'熟客没买东西，只留下一句：“县集那日，我会带两个人来。”',
  V2_15:'两张订单都交了，后仓却比预想中空得更快。',
  V2_16:'南澜来的货终于稳定，父亲和母亲却同时说：活不能再这样分。',
  V2_17:'分工刚写定，街上灯火次第亮起。门外有人请你出去看看。',
  V2_18:'门前有只陌生的竹箱，旧牌上还系着一段山里的青绳。'
};
function reward(id,silent=false){
  if(!silent)window.NanlanAudio?.play('success');
  startCompletionFeedback(id);
  $('chapterToast').textContent=N.titles[id]+' · '+N.rewards[id][1]+(storyHooks[id]?'\n余音 · '+storyHooks[id]:'');
  $('chapterToast').hidden=false;clearTimeout(rewardTimer);
  rewardTimer=setTimeout(()=>$('chapterToast').hidden=true,8500);
}
function startCompletionFeedback(id){
  const s=state(),source=dialogObject&&Number.isFinite(dialogObject.x)?dialogObject:s.player;
  completionFx={id,scene:s.scene,start:performance.now(),x:source.x,y:source.y-24};
}
function renderCompletionFeedback(time){
  if(!completionFx)return;const age=(time-completionFx.start)/1000,reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,duration=reduced?1.35:3;
  if(age>=duration){completionFx=null;return;}const p=age/duration,fade=Math.sin(Math.PI*Math.min(1,p)),{x,y,scene,id}=completionFx;
  ctx.save();const halo=ctx.createRadialGradient(x,y,4,x,y,66+28*p);halo.addColorStop(0,'rgba(255,232,164,'+(.42*(1-p))+')');halo.addColorStop(.55,'rgba(244,195,98,'+(.18*fade)+')');halo.addColorStop(1,'rgba(244,195,98,0)');ctx.fillStyle=halo;ctx.fillRect(x-100,y-100,200,200);
  if(!reduced){const kind=['coast','tidalflat'].includes(scene)?'water':['foothill','mountain','mountainside','summit','bambooGrove'].includes(scene)?'leaf':['market','county','pharmacy','generalStore','teahouse'].includes(scene)?'paper':'light',seed=[...id].reduce((n,c)=>n+c.charCodeAt(0),0);
    for(let i=0;i<14;i++){const angle=(i*2.399+seed*.17),speed=28+(i%5)*9,spread=speed*Math.min(age,1.7),px=x+Math.cos(angle)*spread,py=y+Math.sin(angle)*spread-age*(kind==='water'?3:kind==='light'?24:10),alpha=Math.max(0,1-p)*(.45+(i%3)*.16);ctx.save();ctx.translate(px,py);ctx.rotate(angle+age*(i%2?1:-1));ctx.globalAlpha=alpha;
      if(kind==='leaf'){ctx.fillStyle=i%2?'#91a55f':'#c4a357';ctx.beginPath();ctx.ellipse(0,0,5,2.2,.4,0,Math.PI*2);ctx.fill();}
      else if(kind==='water'){ctx.strokeStyle='#d8eff0';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,3+(i%3),0,Math.PI);ctx.stroke();}
      else if(kind==='paper'){ctx.fillStyle=i%2?'#d7b878':'#b35f4b';ctx.fillRect(-2.5,-1.5,5,3);}
      else{ctx.fillStyle=i%2?'#ffe6a0':'#f5c56e';ctx.beginPath();ctx.arc(0,0,1.8+(i%2),0,Math.PI*2);ctx.fill();}ctx.restore();}
  }
  ctx.restore();
}
function dialogueCast(title){
  const people=[['苏茂','seaMerchant'],['京中故交','visitor'],['梁问炊','liang'],['罗小满','xiaoman'],['何行舟','boatman'],['周成','zhou'],['方掌柜','fang'],['祖父','grandfather'],['父亲','father'],['母亲','mother'],['陈伯','chen'],['许青禾','doctor'],['阿岑','cen'],['程婉','wan'],['沈晚渔','yu'],['邱管事','qiu'],['林师傅','lin'],['郑掌柜','landlord'],['陆掌柜','neighbor'],['茶馆掌柜','tea'],['罗掌柜','tea'],['南街熟客','customer'],['官兵','guard']];
  const matched=people.find(([name])=>title.startsWith(name));if(matched)return [matched];
  if(/^(家议|正厅 · 家宴后的铺讯|正厅 · 临时安置|第一卷完成)/.test(title))return [['母亲','mother'],['父亲','father'],['祖父','grandfather']];
  if(title==='旧宅门前 · 交接')return [['官兵','guard'],['祖父','grandfather']];
  if(/^(旧宅仓房 · 实货与装车|门前灯笼)/.test(title))return [['母亲','mother']];
  if(/^(乡邻余粮|村中收购)/.test(title))return [['乡邻货主','vendor']];
  if(/看铺与条款/.test(title))return [['郑掌柜','landlord']];
  if(/柜台与账目/.test(title)&&state().flags.v2Opened)return [['南街来客','customer']];
  return [];
}
function showDialoguePortraits(title){
  const host=$('dialogPortraits'),cast=dialogueCast(title);host.replaceChildren();host.hidden=!cast.length;
  host.className=cast.length>1?'portrait-group':'portrait-single';
  for(const [name,role]of cast){const src=window.NANLAN_DATA.assets['npc_'+role];if(!src)continue;const figure=document.createElement('figure'),frame=document.createElement('div'),img=document.createElement('img'),caption=document.createElement('figcaption');frame.className='portrait-frame';img.src=src;img.alt=name+'的肖像';if(role==='grandfather')img.style.transformOrigin='85% 0';img.onerror=()=>{figure.hidden=true;};caption.textContent=name;frame.append(window.NanlanProduction?.portraitElement(role,name)||img);figure.append(frame,caption);host.append(figure);}
  window.NanlanAudio?.setDialogue(cast.length>0);
}
function activity(title,text,kind='general'){
  globalThis.NanlanScholar?.interrupt();
  if(typeof cancelNavigation==='function')cancelNavigation();
  previousFocus=document.activeElement;active=false;path=[];keys={};moving=false;dialogKind=kind;
  showDialoguePortraits(title);$('speaker').textContent=title;$('line').textContent=text;$('panelExtra').replaceChildren();$('choices').replaceChildren();
  $('dialog').classList.remove('arrival-mode');
  $('dialogKicker').textContent=kind==='quest'?'南澜记 · 眼前的事':'南澜小事';
  $('dialogQuestNavigate').hidden=true;
  $('choices').hidden=false;$('next').hidden=true;$('dialog').hidden=false;$('skip').textContent=started?'返回游戏 ×':'返回启程页 ×';
  $('skip').onclick=closeDialog;$('skip').focus();if(kind!=='arrival'&&kind!=='pantry')window.NanlanDesktop?.dialogue(title,text);
}
function button(label,fn,id,secondary=false,showOutcome=true){
  const b=document.createElement('button');b.textContent=label;b.dataset.action=id||label;
  if(secondary)b.className='secondary';
  b.onclick=async event=>{
    if(b.disabled||b.dataset.busy==='true')return;
    b.dataset.busy='true';let feedback=null;
    if(showOutcome){
      for(const other of $('choices').querySelectorAll('button')){other.classList.remove('choice-selected');other.setAttribute('aria-pressed','false');}
      b.dataset.choiceState='pending';b.classList.add('choice-selected');b.setAttribute('aria-pressed','true');
      feedback=$('panelExtra').querySelector('.choice-feedback');
      if(!feedback){feedback=document.createElement('div');feedback.className='choice-feedback';feedback.setAttribute('role','status');$('panelExtra').append(feedback);}
      feedback.className='choice-feedback pending';feedback.textContent='正在尝试：'+label;
      await new Promise(resolve=>setTimeout(resolve,180));
    }
    try{
      const outcome=await fn(event);
      if(showOutcome&&b.isConnected){
        if(outcome?.ok===false){b.dataset.choiceState='blocked';b.classList.add('choice-blocked');b.setAttribute('aria-pressed','false');feedback.className='choice-feedback blocked';feedback.textContent='尚未完成 · '+(outcome.message||'请先办妥前面的事情。');}
        else if(outcome?.ok===true){b.dataset.choiceState='confirmed';feedback.className='choice-feedback confirmed';feedback.textContent='✓ 已办妥：'+label;}
        else{b.dataset.choiceState='selected';feedback.className='choice-feedback';feedback.textContent='已选择：'+label;}
      }
    }finally{if(b.isConnected)b.dataset.busy='false';}
  };
  $('choices').append(b);return b;
}
function navButton(label,fn,id){
  const b=button(label,fn,id,true,false);b.dataset.navigation='true';return b;
}
function closeDialog(force=false){
  globalThis.NanlanScholar?.interrupt();
  if(force===true)window.NanlanDesktop?.discard();else if(window.NanlanDesktop?.restore())return;
  window.NanlanAudio?.setDialogue(false);
  $('dialog').hidden=true;$('dialog').classList.remove('arrival-mode');dialogKind=null;dialogObject=null;path=[];keys={};
  active=started&&!transitioning&&!document.hidden&&$('gallery').hidden&&$('worldMap').hidden;
  if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
}
$('skip').onclick=closeDialog;
function nearObject(o){return !o||engine.near(o);}
async function perform(name,p={},rerender){
  if(dialogObject&&!nearObject(dialogObject)){const failed={ok:false,message:'请先走到物件旁，再进行操作。'};notice(failed.message,true);closeDialog();return failed;}
  if(name==='openGate'&&!await loadImage('yard')){const failed={ok:false,message:'庭院图片未能载入，请重试。原有进度已保留。'};notice(failed.message,true);return failed;}
  if(['shareFirst','shareFeast','liangShare'].includes(name)&&!await loadImage(state().gender==='male'?'familyMealMale':'familyMealFemale')){const failed={ok:false,message:'用餐画面未加载完成，请再试一次；饭菜尚未扣除。'};notice(failed.message,true);return failed;}
  const gathered=['collect','harvest','clearWeed','silkLeaves','silkHarvest','silkHarvestFish','silkKit'].includes(name),beforeBag=gathered?{...state().bag}:null;
  const nightCopy=name==='sleep'&&!engine.memoryOnly?JSON.stringify(state()):null;
  const result=engine.act(name,p);
  if(nightCopy&&result.ok&&!result.duplicate){try{localStorage.setItem('nanlan_last_night',nightCopy);}catch{notice(deskText('已过夜，设备空间不足，未能保留睡前副本。','Morning has come, but the device could not keep a bedtime copy.'),true);}}
  if(!result.ok){window.NanlanAudio?.play('blocked');notice(result.message,true);$('saveState').textContent=result.message.startsWith('保存失败')?'本次动作尚未保存':'当前目标尚待完成';return result;}
  if(!result.duplicate)window.NanlanAudio?.play(p.seal?(p.seal==='stone'?'sealStone':'sealWood'):name==='openGate'?'door':/water|Water/.test(name)?'water':/repair|Repair|patch|Patch|craft|Craft/.test(name)?'repair':/nap|sleep/.test(name)?'rest':/collect|harvest|Harvest|gather/.test(name)?'gather':'success');
  $('saveState').textContent=engine.memoryOnly?'仅本次试玩 · 关闭网页会丢失':'已保存';
  if(result.completed)reward(result.completed,!!p.seal);
  refreshHud();
  if(name==='openGate'){closeDialog();render();notice('院门打开了。先去东厢房检查窗格与漏点。');return result;}
  if(name==='v2Sign'&&window.NanlanProduction){window.NanlanProduction.mounted();return result;}
  if(rerender)rerender();else notice(result.duplicate?'这件事已经办好了。':actionMessage(name));
  const nextChapter=result.completed&&N.chapterEntries(state()).find(e=>!e.started&&e.ready);
  if(nextChapter&&!$('dialog').hidden)navButton(window.NanlanI18n?.language==='en'?'Next Chapter · View Entrance':'下一卷已可开启 · 查看入口',()=>window.NanlanChapters.show(nextChapter.number),'completed-next-chapter');
  if(gathered&&!result.duplicate){
    const received=Object.entries(state().bag).filter(([id,n])=>n>(beforeBag[id]||0)).map(([id,n])=>(N.itemNames[id]||id)+' ×'+(n-(beforeBag[id]||0)));
    if(received.length){
      const text=(name==='harvest'?'采收获得：':name==='clearWeed'?'清理获得：':'已采得：')+received.join('、');
      notice(text+(state().selected==='basket'?' · 已放入竹背篓':' · 已放入行囊'));
      const open=document.createElement('button');open.className='receipt-open';open.textContent='查看行囊';open.onclick=()=>{if(started)showBag();};$('message').append(open);
      if(!$('dialog').hidden){const receipt=document.createElement('p');receipt.className='gather-receipt';receipt.setAttribute('role','status');receipt.textContent=text+(state().selected==='basket'?'，已放入竹背篓。':'，已放入行囊。');$('panelExtra').prepend(receipt);button('按 B 查看全部行囊物资',showBag,'harvest-bag',true);}
    }
  }
  return result;
}
function actButton(label,name,p,refresh,id,secondary=false){
  return button(label,()=>perform(name,p||{},refresh),id||name,secondary);
}
function prerequisiteNote(text){
  if(!text||$('panelExtra').querySelector('.prerequisite-note'))return;const note=document.createElement('p');note.className='prerequisite-note lock-note';note.textContent='尚未开放 · '+text;$('panelExtra').prepend(note);
}
function objectPrerequisite(o){
  const s=state(),f=s.flags,q=N.current(s),a=o.action;
  if(['window','leak','bed'].includes(a)&&!f.bedReady&&q!=='M02')return '请在完成 M01「门外的行李」后，于 M02「今夜睡在哪里」处理卧房（东厢房）。';
  if(['tools','bucket','axe'].includes(a)&&!N.reached(s,'M03'))return '请在完成 M02「今夜睡在哪里」后再取用这件物品。';
  if(a==='garden'&&!f.smallBed&&q!=='M03')return '请在完成 M02 后，按 M03「后院见光」清理通路，再整理地面菜畦。';
  if(['cook','water','drain'].includes(a)&&!N.reached(s,'M04'))return '请在完成 M03「后院见光」后，再进行 M04 的取水、清灶与做饭。';
  if(a==='villageLetter'&&!N.reached(s,'M05'))return '请在完成 M04「南澜的第一顿饭」后，再替乡邻读信。';
  if(a==='bridge'&&!N.reached(s,'M06'))return '请在完成 M05「村口那碗茶」后，再修这段竹林小径。';
  if(a==='bookbox'&&!N.reached(s,'M08'))return '请在完成 M07「等它慢慢长」后，再登记旧住客书箱。';
  if(a==='dry'&&!f.ledgerPermission)return f.boxFound?'请先在 M08 中联系程婉，征得同意后再晾旧页。':'请先在 M08 中登记仓房旧书箱，再联系程婉。';
  if(a==='gutter'&&!N.reached(s,'M13'))return '请在完成 M11「一单生意两种打算」后，再进行 M13 的风雨检查。';
  if(a==='shelter'&&!N.reached(s,'M14'))return '请在 M14「灯火借人」开始后，再腾通道和安排铺位。';
  if(a==='waterMark'&&!N.reached(s,'M15'))return '请在 M15「父亲没有按时回来」请阿岑带路后，再检查水位。';
  if(a==='lamps'&&!N.reached(s,'M20'))return '请在完成 M19「京中来信」后，再挂岁末灯火。';
  return '';
}
function actionMessage(name){
  const messages={
    clearWeed:'杂草清掉了，通路露出来了。前两处草丛中的枯枝已收进背包。',fillWater:'木桶装满了水，可以做饭或浇灌。',collect:'采集完成。可打开行囊核对物资。',
    harvest:'亲手采收完成，种子也回收了一份。',nap:'床榻上小憩片刻，体力恢复了。',sleep:'一觉醒来，已是次日清晨。作物与采集节点也经过了一夜。',
    firstRepair:'修补留下了看得见的痕迹，另一处可以往后再安排。',setBed:'床褥从行囊搬进了房间，现在可以小憩。',repairTools:'旧农具修好了。选第 2 格镰刀，再去庭院清草。',
    shareFirst:'家人围坐在饭桌前，庭院第一次有了安稳的灯火。',tidy:'材料按用途归好，没有凭空增加物资。',craft:'原料已扣除，成品已入包。'
  };return messages[name]||'这一步已经记下了。'+nextHint();
}
function nextHint(s=state(),q=N.current(s)){
  const f=s.flags;
  if(!f.volume2Started&&N.done(s,'M20'))return window.NanlanI18n?.language==='en'?'The feast is over. Open the South Street notice and meet your family in the hall to begin Volume II.':'家宴已毕。打开「南街铺讯」查看条件，到正厅与家人读铺讯，开启第二卷。';
  if(q?.startsWith('V6_')){const r=N.voyage.first(s);return r?r.actions[r.j][window.NanlanI18n?.language==='en'?1:0]:'';}
  if(f.voyageComplete)return window.NanlanI18n?.language==='en'?'The main story is complete. Family and friends have six invitations waiting in the back hall.':'六卷主线已完成，后堂还有家人和伙伴的六篇闲日邀约。';
  if(N.voyage.canStart(s))return window.NanlanI18n?.language==='en'?'A spring-tide letter waits in the back hall.':'后堂有一封春潮来信，何行舟邀你去青屿看看。';
  if(q?.startsWith('S5_'))return N.season5.first(s)?.label[0]||N.titles[q];
  if(N.season5?.canStart(s))return '后堂秋风翻账，母亲和伙伴们等你商量下一年的日子。';
  if(s.flags.season5Complete&&!q)return '岁序簿已翻到来年，伙伴的共事和后堂的纪念物都留在身边。';
  if(q?.startsWith('V5_'))return N.v5.first(s)?.[3]||N.titles[q];
  if(s.flags.volume5Complete)return '清渠已有名字与轮值，自家水缸边也留着给路人的碗。';
  if(N.v5?.canStart(s))return '后堂桌上多了一碗井水，井绳晒干后结着细白。';
  if(q?.startsWith('V4_'))return N.v4.first(s)?.[3]||N.titles[q];
  if(s.flags.volume4Complete)return '公所账已分清，家书已寄出；后堂留着一家人的灯。';
  if(N.v4?.canStart(s))return '海湾有人指着一面陌生的帆，可去岸边看看。';
  if(q?.startsWith('V3_'))return N.v3.first(s)?.[3]||N.titles[q];
  if(s.flags.volume3Complete)return '山海手记已写成，还可以接手余单、生产与赴集。';
  if(N.v3?.canStart(s))return '南街门边多了一只旧牌竹箱。得空去铺子看看。';
  const v2=window.NanlanV2?.hint(s,q);if(v2)return v2;
  const hints={
    M01:!f.handover?'先在门前点家人与行李，选好怎样帮忙。':!f.keyTaken?'接过官兵递来的院门钥匙。':'靠近旧宅院门，亲手开门。',
    M02:!f.windowInspected||!f.leakInspected?'去卧房（东厢房），分别查看窗格和漏点。':!f.firstRepair?'在卧房（东厢房）先选一处最急的地方，花 1 份材料修补。':'到卧房（东厢房）床榻旁把床褥搬进去。',
    M03:!f.farmTools?'仓房里有一束旧农具。':!f.toolsRepaired?'到仓房工作台，用 1 份修补材料修农具。':!f.pathCleared?'选第 2 格镰刀，清掉庭院 3 处杂草。':'去庭院东侧整理一小块菜畦或香草畦。',
    M04:!f.stoveClean?'先收拾庭院东北的灶边。':!f.bucketFilled?(s.tools.water?'水桶已经在手，到庭院水缸取水。':'在仓房领水桶，再到庭院水缸取水。'):!f.drainClear?'清理宅外水口。池塘只是背景，不用修。':!f.firstCooked?'灶边用米、食材、枯枝和一桶水做饭。':'端着热饭回正厅，在饭桌旁与家人分享。',
    M05:'到南澜村认识陈伯、许青禾，再替乡邻读信。',
    M06:!f.metCen?'去青岚山脚找阿岑。':!f.bambooIdentified?'山脚与山路各有一份落竹可拾。':!f.bambooChoice?'回山脚和阿岑安排竹料的用途。':'到山路木道铺通竹林小径。',
    M07:!f.fullGarden?'庭院东侧先扩整药圃。':!f.dryRack?'仓房做晾架：枯枝 ×1、竹材 ×1。':!f.medicinalPlanted?'在自家药圃播种药草。':!f.medicinalWatered?'水缸装水，再给药草浇水。':'药草需 4 分钟等效生长。可练字、整理仓房或回床榻休息。',
    M08:!f.boxFound?'回仓房检查旧住客留下的书箱。':!f.ledgerPermission?'去村里联系程婉，先确认归属和查看许可。':'到书房窗下晾好两页旧纸。',
    M09:!f.metYu?'先在村里请沈晚渔讲清海湾归路。':!f.coastVisited?'沿村南小路前往南澜海湾。':!f.tideRead?'到海边读潮线木牌。':'在低潮时进入滩涂，亲手拾一份物资。',
    M10:!f.stallBooked?'带一件制品去镇集，先预约摊布。':!f.productDisplayed?'在你的摊布旁选择主打制品；仓房可制作。':'在自己的摊布旁完成一次买卖。',
    M11:!f.orderAccepted?'在你的摊布旁接两件货物的小批单。':'补做主打制品，预留库存，再分两次交付。预留货物不能散卖。',
    M13:'检查庭院沟渠 → 把晾晒物收回仓房 → 告知村中陈伯。',
    M14:'先腾正厅通道、架高仓房货箱，再回正厅安排铺位。',
    M15:!f.fatherClue?'先去村里向陈伯问父亲的去向。':!f.guideReady?'去山脚请阿岑带路。':!f.waterChecked?'从山路上山腰，先确认水位标记。':!f.fatherFound?'在高地找到父亲，和他结伴回家。':'回正厅，和父亲说说以后出门的约定。',
    M16:!f.bookReturned?'去村里把原簿交还程婉。':!f.historyConfirmed?'回正厅请祖父核对小花记号的往事。':'再找程婉，征得同意后留下誊写副本。',
    M17:!f.receiptsReviewed?'带着凭单去镇集找邱管事，逐项核对。':!f.accountResolved?'可协商重算，或请陈伯代呈并带回回执。':'在已确认的地点结清合理费用 2 文，接续京中来信。',
    M19:!f.letterFamily?'回正厅分别与祖父、父亲和母亲谈来信。':!f.giftChosen?'在正厅选一株草药或一枚贝壳随信。':!f.replyWritten?'请祖父把家书写好。':'带着回信去村里，托陈伯寄出。',
    M20:!f.seatingChosen?'在正厅饭桌旁安排岁末座次。':!f.feastCooked?'灶边准备家宴，缺粮可向村中乡邻购入。':!f.festivalLamps?'回庭院挂上灯火。':'回正厅饭桌旁完成家宴。'
  };return q?(hints[q]||'跟随任务簿继续。'):'第一卷已完成。可以继续采集、种植、制作与镇集买卖，或回看人物与家中的变化。';
}
function timeText(){
  const c=N.clock(state()),weather=window.NanlanWeather?.current(state());
  if(c.story)return {short:'初夏 · 初抵南澜 · '+c.story,full:'初抵南澜\n'+c.story,extra:'序章随剧情推进时段'};
  if(window.NanlanI18n?.language==='en'){
    const calendar=NanlanClimate.at(state()),season=calendar.en+' · '+calendar.day+'/'+calendar.length;
    const time=String(c.hour).padStart(2,'0')+':'+String(c.minute%60).padStart(2,'0');
    return {short:season+' · Day '+c.day+' · '+time,full:season+' · Day '+c.day+'\n'+time,extra:(weather?.en||'Clear')+' · '+window.NanlanI18n.t(N.daylight(state()).label)+' · '+(N.tide(state()).low?'Low Tide':'Rising Tide')+' · Changes in '+Math.ceil(N.tide(state()).remaining)+' game min'};
  }
  const calendar=NanlanClimate.at(state()),season=calendar.zh+' · '+calendar.day+'/'+calendar.length;
  const h=c.hour,minute=String(c.minute%60).padStart(2,'0');
  return {short:season+' · 第 '+c.day+' 日 · '+(h>=12?'下午':'上午')+' '+(h%12||12)+':'+minute,
    full:season+' · 第 '+c.day+' 日\n'+(h>=12?'下午':'上午')+' '+(h%12||12)+':'+minute,
    extra:(weather?.zh||'晴朗')+' · '+N.daylight(state()).label+' · 海湾'+(N.tide(state()).low?'低潮':'涨潮')+' · '+Math.ceil(N.tide(state()).remaining)+' 游戏分钟后转换'};
}
function showTime(){
  const s=state(),c=N.clock(s),g=N.crop(s),t=N.tide(s),light=N.daylight(s),weather=window.NanlanWeather?.current(s),weatherAdvice=window.NanlanWeather?.advice(s,window.NanlanI18n?.language==='en');
  activity('南澜日历 · 山海有时',c.story?
    '初抵南澜 · '+c.story+'\n\n序章时段跟随安顿进度：门前抵达 → 收拾卧房（东厢房）与后院的傍晚 → 第一顿热饭的入夜。M04 家宴完成后，开启日常日期和时钟。':
    timeText().short+' · '+light.label+'\n\n日常从 06:00 到 22:00。每现实 1 秒，经过 1 个游戏分钟；对白、舆图、菜单和切到后台时暂停。夜深后，可回东厢房睡到次日清晨。');
  const entries=c.story?[
    ['当前时段',c.story],['眼前的事',nextHint()],['休息',s.flags.bedReady?'卧房（东厢房）床榻可临时休息恢复体力；第一顿饭后开放睡一夜。':'先在卧房（东厢房）安顿床褥。']
  ]:[
    ['日光',light.label+' · '+(c.minute>=1320?'夜已深，回家休息。':'日期与场景光线同步变化。')],
    ['自家小畦',!g.planted?'尚未播种':g.ready?'已经成熟，回庭院亲手采收。':!s.garden.watered?'已播种，等你提水浇灌。':'还需 '+Math.ceil(g.remaining)+' 游戏分钟（约 '+Math.ceil(g.remaining)+' 秒有效游玩）。'],
    ['南澜潮汐',(t.low?'低潮还剩 ':'下一轮低潮还有 ')+Math.ceil(t.remaining)+' 游戏分钟；涨潮仍可从滩涂返回海边。'],
    ['村口集市',c.minute>=540&&c.minute<1020?'正在开集 · 17:00 收摊。':'日常 09:00—17:00 开集；M10 首摊可单独预约。']
  ];
  if(!c.story){
    entries.unshift([window.NanlanI18n?.language==='en'?'Today’s weather':'今日天色',(window.NanlanWeather?.dayLine(s,window.NanlanI18n?.language==='en')||'')+'\n'+(weatherAdvice?.summary||'')+'\n'+(weather?.remaining?Math.ceil(weather.remaining)+(window.NanlanI18n?.language==='en'?' game minutes until the sky changes.':' 游戏分钟后天色可能转变。'):'')]);
    entries.unshift([window.NanlanI18n?.language==='en'?'Season':'时令',NanlanClimate.note(s,window.NanlanI18n?.language==='en')]);
  }
  const list=document.createElement('div');list.className='time-cards';
  entries.forEach(([title,text])=>{const card=document.createElement('div'),b=document.createElement('b'),p=document.createElement('p');b.textContent=title;p.textContent=text;card.append(b,p);list.append(card);});$('panelExtra').append(list);
  if(N.voyage.get(s))navButton(window.NanlanI18n?.language==='en'?'Open the travel book and invitations':'查看旅途册与闲日邀约',()=>window.NanlanVoyageUI.ledger(),'clock-voyage');
  button('在舆图上查看全部地点',()=>{closeDialog();showMap();},'time-map',true);
  if(s.flags.bedReady)button('找卧房（东厢房）床榻 · 两种休息',()=>{closeDialog();startNavigation('bed','bedRest');},'time-rest');
}
function rowProgress(flag){
  const s=state();if(flag==='pathCleared')return ['weed1','weed2','weed3'].filter(k=>s.collected[k]).length+'/3';
  if(flag==='orderDelivered')return (s.order?.delivered||0)+'/2';
  if(flag==='pagesDried')return [s.flags.driedPage0,s.flags.driedPage1].filter(Boolean).length+'/2';
  if(flag==='letterFamily')return Object.values(s.familyTalks).filter(Boolean).length+'/3';if(flag==='v2ThreeDays')return Math.min(3,s.story2.closings.length)+'/3';return s.flags[flag]?'1/1':'0/1';
}
function navigateTaskStep(flag,label,index){
  const s=state(),q=N.current(s),steps=q?N.steps[q]:[],first=steps.findIndex(([id])=>!s.flags[id]);
  if(s.flags[flag]){notice('「'+label+'」已经办妥。');return;}
  if(index>first){notice('先办妥「'+steps[first][1]+'」，再做这一件。',true);return;}
  if(typeof objectiveForStep!=='function'){notice('路线正在写入舆图，请稍后再点一次。');return;}
  const target=objectiveForStep(flag,label);if(!target){notice('这一件事就在当前场景，先看看附近可互动之处。');return;}
  if(!$('dialog').hidden)closeDialog(true);chooseTaskRoute(target);
}
function renderQuestSteps(host,dialog=false,s=state(),q=N.current(s)){
  const steps=q?N.steps[q]:[],first=steps.findIndex(([flag])=>!s.flags[flag]);host.replaceChildren();
  steps.forEach(([flag,label],index)=>{const done=!!s.flags[flag],row=document.createElement('button');row.type='button';row.className='task-row'+(done?' done':index===first?' current':' waiting');row.disabled=done;
    row.innerHTML='<span class="task-mark">'+(done?'✓':index===first?'○':'·')+'</span><span class="task-label">'+clean(label)+' <small>('+rowProgress(flag)+')</small>'+(done?'':index===first?'<span class="task-route">点击选择沿路行走或快行</span>':'<span class="task-route">办妥上一件后开放</span>')+'</span>';
    row.onclick=()=>navigateTaskStep(flag,label,index);host.append(row);
  });
  if(dialog)host.classList.add('task-step-list');
}
// Title, rows and hint always describe the same current quest, even while folded.
function refreshQuestBanner(s=state(),q=N.current(s)){
  const hint=nextHint(s,q);
  const questSignature=q+'|'+(q?N.steps[q].map(([flag])=>flag+':'+rowProgress(flag)).join('|'):'none');
  if(questSignature!==lastQuestSignature){
    renderQuestSteps($('quest'),false,s,q);lastQuestSignature=questSignature;
  }
  $('questAct').textContent=q?.startsWith('V6_')||s.flags.voyageComplete?'春潮有信':q?.startsWith('S5_')||s.flags.season5Complete&&!q?'岁序长青':s.flags.volume5Started?'清水归渠':s.flags.volume4Started?'海天帆影':s.flags.volume3Started?'山海成行':s.flags.volume2Started?'南街的新日子':q?(Number(q.slice(1))<=4?'先安顿一家人':'在南澜生活'):'这一季已经写完';
  $('questHeading').textContent=q?N.titles[q]:s.flags.voyageComplete?'主线完成 · 日常与番外继续':s.flags.season5Complete?'岁序长青 · 来年有约':s.flags.volume5Complete?'清水满缸 · 日常继续':s.flags.volume4Complete?'海天帆影 · 家灯长明':s.flags.volume3Complete?'山海之间 · 日常继续':s.flags.volume2Complete?'南街灯起 · 日常继续':'岁末满庭 · 新春家议';
  $('questHint').textContent=hint;
  const entry=N.chapterEntries(s).find(e=>!e.started&&e.ready),en=window.NanlanI18n?.language==='en';$('volume2Entry').hidden=!entry;
  if(entry){$('volume2Entry').textContent=en?'Volume '+entry.number+' · View Entrance':'第'+entry.number+'卷 · 查看开启入口';if(!q){$('questAct').textContent=en?'A New Beginning':'接下来的日子';$('questHeading').textContent=en?entry.en+' · Available':entry.title+' · 已可开启';}}
}
function refreshHud(){
  const s=state(),q=N.current(s),t=timeText();
  $('where').textContent=s.scene==='generalStore'&&s.story2?.site?'南街 · '+(s.production?.shopName||N.story2.shops[s.story2.site].name):world[s.scene].name;$('roleName').textContent=s.gender==='male'?'李家晚辈 · 男主角':'李家晚辈 · 女主角';
  $('statusTime').textContent=t.short;$('clock').replaceChildren();
  const text=document.createElement('div');text.style.whiteSpace='pre-line';text.textContent=t.full;
  const small=document.createElement('small');small.textContent=t.extra;$('clock').append(text,small);
  const track=document.createElement('span'),sun=document.createElement('i'),hint=document.createElement('small');
  track.className='day-track';sun.style.left=(N.daylight(s).progress*100)+'%';sun.textContent=N.daylight(s).darkness>.5?'☾':'☀';track.append(sun);hint.className='clock-hint';hint.textContent='点此查看日历与生长';$('clock').append(track,hint);
  $('clock').setAttribute('aria-label','查看日期、昼夜与潮汐：'+t.short);
  $('energy').textContent=Math.floor(s.stamina);$('energyBar').style.width=s.stamina+'%';$('coins').textContent=s.coins;
  refreshQuestBanner(s,q);$('nightNote').hidden=!(s.mode==='daily'&&N.clock(s).minute>=1320);
  $('nightNote').querySelector('strong').textContent=N.voyage.get(s)?.away?(window.NanlanI18n?.language==='en'?'Take me to the guest courtyard':'带我到宿院歇一夜'):(window.NanlanI18n?.language==='en'?'Take me to the bed in the East Wing':'带我回卧房（东厢房）床榻');
  refreshToolbar();window.NanlanChapterMark?.refresh(s,started);window.NanlanEndings?.refresh(s,started);
}
const toolDefs=[
  ['hand','拾取','挽起布袖拾取落枝、草药与海湾物资。'],['sickle','月牙镰','清理杂草；须先在仓房修好农具。'],
  ['hoe','长柄锄','整理小畦，也可在山顶旧药畦挖取人参。'],['basket','竹背篓','采集时选用；完整行囊请按 B 打开。'],
  ['water','箍木桶','到院中水缸装水，再做饭或浇灌。'],['seed','布种袋','去自家小畦播种；采收会回收一份种子。'],
  ['repair','匠作小箧','修缮时选用；内装钉、绳与小件工具。'],['hotMeal','青花饭钵','只查看与食用热饭；完整行囊请按 B。'],
  ['journal','线装任务簿','当前目标、奖励与第一卷完成条件。'],['map','卷轴舆图','查看路线、开放条件与当前地点。'],
  ['axe','木柄斧','仓房领取；修好农具后，用于劈取沉香与海南黄花梨枯木。'],['rest','木榻','须回到已安顿的卧房（东厢房）床榻。']
];
const extraIcons={
  seed:'<g stroke="#765234" stroke-linecap="round" stroke-linejoin="round"><path d="M23 17c5 3 13 3 18 0l3 8c10 10 9 28-3 33-7 3-18 2-23-4-7-9 0-22 4-29z" fill="#b69a68" stroke-width="1.7"/><path d="M22 25c7 4 15 4 23 0M25 17c3-5 11-5 14 0" fill="none" stroke="#e1c58e" stroke-width="2"/><path d="M24 32q9 6 18 0M22 42q11 7 22 0" fill="none" stroke="#82663f" stroke-width="1.2"/><path d="M30 23l-8-10m13 10 9-11" fill="none" stroke="#59734d" stroke-width="2"/><path d="M21 12q7-5 11 3-8 3-11-3m24-1q-8-4-10 4 7 2 10-4" fill="#82905b" stroke="#536b48" stroke-width="1"/></g>',
  repair:'<g stroke="#704a2e" stroke-linejoin="round" stroke-linecap="round"><path d="M11 27h43v28H11z" fill="#a96f3e" stroke-width="1.8"/><path d="M9 24h47v10H9z" fill="#c59257" stroke-width="1.8"/><path d="M15 38h35m-31 0v17m27-17v17" fill="none" stroke="#e0b471" stroke-width="1.2"/><path d="M24 24V14q8-7 16 0v10" fill="none" stroke="#7d5938" stroke-width="3"/><path d="M32 34v10" stroke="#5d744d" stroke-width="5"/><path d="M18 20l7-9 5 4-7 9" fill="#6e8370" stroke-width="1.3"/><path d="M44 24l5-12" stroke="#80603f" stroke-width="2.5"/><path d="M46 13h7" stroke="#69786d" stroke-width="4"/></g>',
  hotMeal:'<g stroke="#4e6270" stroke-linecap="round" stroke-linejoin="round"><path d="M10 31h45c-2 18-10 25-22 25S13 49 10 31z" fill="#e8dfc3" stroke-width="1.8"/><ellipse cx="32.5" cy="31" rx="22.5" ry="6.5" fill="#f4ecd6" stroke-width="1.6"/><path d="M17 39q8 7 16 0t16 0M21 48q6 5 12 0t12 0" fill="none" stroke="#66829a" stroke-width="2"/><path d="M23 29q10-7 20 0" fill="none" stroke="#c49b55" stroke-width="3"/><path d="M21 24c-7-8 5-10 0-17m11 16c-7-8 5-9 0-16m11 17c-7-8 5-10 0-17" fill="none" stroke="#7f9178" stroke-width="1.6"/><path d="M45 13L18 31m31-14L23 32" stroke="#795536" stroke-width="1.8"/></g>',
  journal:'<g stroke="#64513a" stroke-linejoin="round"><path d="M13 10h39v46H13z" fill="#d9c28e" stroke-width="1.8"/><path d="M18 10v46" stroke="#6c7961" stroke-width="3"/><path d="M19 15c-5 0-5 7 0 7m0 6c-5 0-5 7 0 7m0 6c-5 0-5 7 0 7" fill="none" stroke="#a96f53" stroke-width="1.6"/><path d="M29 15h15v33H29z" fill="#eee1bb" stroke="#9b7a4f" stroke-width="1"/><path d="M36 19v25" stroke="#876643" stroke-width="1.4"/><path d="M32 21v20m8-20v20" stroke="#9a7a53" stroke-width="1" stroke-dasharray="2 3"/></g>',
  map:'<g stroke-linecap="round" stroke-linejoin="round"><path d="M16 10h32v44H16z" fill="#ddc894" stroke="#87673f" stroke-width="1.5"/><path d="M13 8h38v5H13zm0 44h38v5H13z" fill="#96643b" stroke="#68442c" stroke-width="1.3"/><circle cx="12" cy="10.5" r="3" fill="#b8884e" stroke="#68442c"/><circle cx="52" cy="10.5" r="3" fill="#b8884e" stroke="#68442c"/><circle cx="12" cy="54.5" r="3" fill="#b8884e" stroke="#68442c"/><circle cx="52" cy="54.5" r="3" fill="#b8884e" stroke="#68442c"/><path d="M20 43l7-13 7 7 9-16 5 8" fill="none" stroke="#627a55" stroke-width="2.5"/><path d="M22 21q8-6 15-2m-12 26q10 4 20-1" fill="none" stroke="#a88c5e" stroke-width="1.2"/><circle cx="35" cy="36" r="2.5" fill="#a95f47"/></g>',
  bag:'<g stroke="#665038" stroke-linecap="round" stroke-linejoin="round"><path d="M15 27l14-14 21 9-4 29-27 4z" fill="#9b986c" stroke-width="1.8"/><path d="M29 13l4 17-18-3m35-5L33 30l13 21M19 55l14-25" fill="none" stroke="#dfc58d" stroke-width="2"/><path d="M15 27l18 3 17-8" fill="none" stroke="#6f7554" stroke-width="1.4"/><path d="M29 13q8-7 14 1" fill="none" stroke="#9a6a41" stroke-width="2.2"/><path d="M40 12q8 0 7 7-7 1-10-4" fill="#b28a55" stroke-width="1.2"/></g>',
  rest:'<g stroke="#68462d" stroke-linejoin="round" stroke-linecap="round"><path d="M9 20v36m46-36v36M9 46h46M12 31h40v15H12z" fill="#a87343" stroke-width="2.5"/><path d="M14 31h37v7H14z" fill="#d2b77b" stroke-width="1.2"/><path d="M17 23h14v8H17z" fill="#e7d6a9" stroke-width="1.2"/><path d="M31 26h20v12H31z" fill="#7c8b69" stroke-width="1.2"/><path d="M14 48h37m-35 4h33" stroke="#c99a59" stroke-width="1.2"/><path d="M9 20l5-5m41 5-5-5" stroke-width="2"/></g>'
};
function iconArt(id){
  if(['hand','sickle','hoe','basket','water','axe'].includes(id))return toolArt(id);
  return '<svg viewBox="0 0 64 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'+(extraIcons[id]||extraIcons.bag)+'</svg>';
}
const deskText=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh;
let lastGardenInput=matchMedia('(pointer:coarse)').matches?'touch':'mouse';
document.addEventListener('pointerdown',e=>{lastGardenInput=e.pointerType;},true);
document.addEventListener('keydown',()=>{lastGardenInput='keyboard';},true);
function gardenToolHint(slot,keyboard,zh,en){
 const tool=$('bottom').children[slot-1];if(tool?.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)tool.animate([{outline:'3px solid #f0c46a'},{outline:'3px solid transparent'}],{duration:750,iterations:2});
 notice(lastGardenInput==='keyboard'?keyboard:deskText(zh,en),true);
}
function sceneClue(label,words,id){
 button(label,()=>{let line=$('panelExtra').querySelector('[data-clue]');if(!line){line=document.createElement('p');line.dataset.clue='true';line.className='production-note';line.setAttribute('role','status');$('panelExtra').append(line);}line.textContent=words;},id,true,false);
}
function refreshToolbar(){
  const s=state(),belt=$('bottom');
  if(!belt.children.length)toolDefs.forEach(([id,label,note],index)=>{
    const b=document.createElement('button');b.type='button';b.className='tool';b.dataset.slot=String(index+1);
    b.innerHTML='<span class="slot-key">'+['1','2','3','4','5','6','7','8','9','0','−','='][index]+'</span><span class="tool-icon">'+toolbarArt(id)+'</span><span class="slot-count"></span><span class="slot-tip">'+label+'<br>'+note+'</span>';
    b.onclick=()=>selectTool(index);belt.append(b);
  });
  toolDefs.forEach(([id,label],i)=>{
    const b=belt.children[i],locked=(i<5||id==='axe')?!s.tools[id]:false;
    b.className='tool'+(locked?' locked':'')+(s.selected===id?' active':'');
    b.setAttribute('aria-label','第 '+(i+1)+' 格 '+label+(locked?' 尚未获得':''));b.setAttribute('aria-pressed',String(s.selected===id));
    b.querySelector('.slot-count').textContent=id==='water'?(s.bucketWater?'满':'空'):['seed','repair','hotMeal'].includes(id)?N.quantity(s,id):'';
  });
  const current=toolDefs.find(d=>d[0]===s.selected)||toolDefs[0];$('toolInfo').textContent=current[1]+' · '+current[2];
}
function selectTool(index){
  if(!active)return;const [id,label]=toolDefs[index],s=state();
  if((index<5||id==='axe')&&!s.tools[id]){notice('请先去仓房领取'+label+'。');return;}
  if(id==='journal'){showQuest();return;}if(id==='map'){showMap();return;}
  if(id==='hotMeal'){s.selected=id;refreshToolbar();showMealBowl();return;}
  if(id==='rest'){const o=world[s.scene].objects.find(o=>o.id==='bedRest');if(o){approach(o);return;}notice('卧房（东厢房）的床榻安顿后，可选择临时休息或睡一夜。可从舆图查看回家路线。');return;}
  if(['seed','hoe','basket','repair'].includes(id)){s.selected=id;notice('已选'+label+(id==='hoe'?'。可整理自家小畦，或在山顶挖取人参。':id==='seed'?'。到庭院东侧点击自家小畦。':id==='basket'?'。靠近可采集的物资后点击采收；完整行囊仍由 B 键打开。':'。靠近待修处后点击修缮。'));refreshToolbar();return;}
  s.selected=id;refreshToolbar();notice('已选'+label+'。');
}
function showQuest(){
  const s=state(),q=N.current(s);
  activity(q?N.titles[q]:s.flags.voyageComplete?'春潮有信 · 日常与番外继续':s.flags.season5Complete?'岁序长青 · 来年有约':s.flags.volume5Complete?'清水满缸 · 日常继续':s.flags.volume4Complete?'海天帆影 · 家灯长明':s.flags.volume3Complete?'山海之间 · 日常继续':s.flags.volume2Complete?'南街灯起 · 日常继续':'岁末满庭 · 新春家议',q?'点一条眼前的具体事项，人物会沿已经走通的路前往。事情要按生活里的先后去办，不必另找“下一步”按钮。\n\n事情办妥后：'+N.rewards[q][1]:nextHint());
  $('dialogKicker').textContent='只记下已经发生与眼前要做的事';
  if(q){const list=document.createElement('div');renderQuestSteps(list,true);$('panelExtra').append(list);}
  navButton(window.NanlanI18n?.language==='en'?'Chapter Entrances · Requirements':'篇章入口 · 查看开启条件与去向',()=>window.NanlanChapters.show(),'quest-chapter-entry');
  button('回看已经走过的路',showQuestCatalog,'catalog',true);
  button('查看家人与邻里留下的回应',showJournal,'journal',true);
}
function showQuestCatalog(){
  const s=state();
  const current=N.current(s),known=[...N.ORDER,...N.V2_ORDER,...(N.V3_ORDER||[]),...(N.V4_ORDER||[]),...(N.V5_ORDER||[]),...(N.SEASON5_ORDER||[]),...(N.V6_ORDER||[])].filter(id=>s.quests[id]?.status==='COMPLETED'||id===current);
  activity('走过的路',known.length>1?'从旧宅门前走到今日，许多事是做过以后才明白。这里不会提前写下还没发生的故事。':'旧宅的门还没有推开。先把眼前的一件事做好，新的页章自然会出现。','quest');
  const box=document.createElement('div');box.className='quest-catalog';
  for(const id of known){
    const st=s.quests[id]?.status,card=document.createElement('div');card.className='quest-card';
    card.innerHTML='<b>'+N.titles[id]+'</b><span class="status-label '+st+'">'+(st==='COMPLETED'?'已经走过':'正在经历')+'</span><small>'+(st==='COMPLETED'?clean(N.rewards[id]?.[1]||'这一页已经写下。'):clean(nextHint()))+'</small>';box.append(card);
  }$('panelExtra').append(box);
  const unknown=document.createElement('p');unknown.className='prerequisite-note';unknown.textContent='后面的页还是空白。继续生活、交谈与选择，它们才会有名字。';$('panelExtra').append(unknown);
}
function showJournal(){
  activity('家中的回响',state().journal.length?state().journal.map(r=>(r.id||'小事')+' · '+r.text).join('\n\n'):'刚到南澜，新的故事还未写下。');window.NanlanVillage?.journal();
}
function showTextMap(){
  const s=state();
  const places=['眼下认得的路：'];
  places.push(s.flags.gateOpen?'旧宅门前 → 庭院 → 家中各房':'旧宅门前；院门里面仍是未知。');
  if(N.reached(s,'M05'))places.push('从宅院可以走到南澜村。');
  if(s.flags.metCen)places.push('阿岑指过山脚、山路与竹林的方向。');
  if(s.flags.metYu)places.push('沈晚渔讲过海湾与潮线。');
  if(s.flags.volume2Started)places.push('县城南街已经成为新的日常去处。');
  activity('手边的路',places.join('\n\n')+'\n\n舆图会保留远处山海的轮廓；地名和路线要等亲自听过、走过才会写清。');
  const routes=world[s.scene].objects.filter(o=>o.type==='door');
  for(const o of routes){const why=objectGate(o);button(o.label+(why?' · 尚未开放':''),()=>{closeDialog();if(why)notice(why,true);else approach(o);},'route-'+o.id,true);}
  button('查看所有场景原画',showGallery,'map-gallery',true);
}
function itemSource(id){
  if(id==='travelBox')return '通过四项试样后，在仓房以竹材二、草绳一制作。';
  if(id==='duckStone'||id==='grassHopper')return globalThis.NanlanKids.desc[id];
  if(id==='shootRice'||id==='crustRice')return '按梁先生的饭方，用米、竹笋、枯枝和桶内水焖制。';
  if(['mulberrySapling','silkwormEgg','fishFry','fishFeed'].includes(id))return '初养物资可在乡邻余粮补购，也可在收获时选择留种留苗。';
  if(['mulberryLeaf','rawSilk','fineSilk','pondFish','silkwormCompost'].includes(id))return '后院桑基生产所得；生丝、桑叶与塘鱼可装车运往南街。';
  if(id==='wetLeaf')return '回南天采下的桑叶，可在桑畦摊晾。';
  if(id==='pondMud')return '起鱼时取得，敷回桑畦可促长叶。';
  if(id==='sealTimber')return '阿岑指路，在青岚山取下；交林师傅刻木印。';
  if(id==='sealPebble')return '沈晚渔指路，在海湾旧泊岸拾得；交林师傅磨石印。';
  const m={rice:'村中乡邻余粮可补购',ingredient:'村中乡邻补给，或用自种菜蔬代替',seed:window.NanlanI18n?.language==='en'?'Neighbor’s Pantry in Nanlan Village · '+N.supplyPrices.seed+' coins per packet; harvesting returns one packet.':'南澜村「乡邻余粮 · 种子与补给」常备 · 每份 '+N.supplyPrices.seed+' 文；采收也会返还一份',
    repair:'家中带来 2 份；村中可补购',wood:'清草前两处回收；村边、山脚、竹林均可拾',
    lychee:'山脚荔枝树 · 每次 2 份 · 1 游戏日刷新 · 每份 4 文',longan:'山脚龙眼树 · 每次 2 份 · 1 游戏日刷新 · 每份 4 文',mandarin:'山路柑橘树 · 每次 2 份 · 1 游戏日刷新 · 每份 3 文',
    ginseng:'山顶旧药畦 · 长柄锄挖取 · 5 体力 · 3 游戏日刷新 · 售价 28 文',agarwood:'竹林枯木 · 木柄斧劈取 · 6 体力 · 2 游戏日刷新 · 售价 22 文',huali:'山腰枯木 · 木柄斧劈取 · 8 体力 · 3 游戏日刷新 · 售价 26 文',
    herb:'山脚、山路与药圃采收',bamboo:'山脚与山路落竹、竹林可采',weed:'用修好的镰刀清草',shell:'海边与低潮滩涂',
    vegetable:'自家菜畦采收',hotMeal:'灶边消耗米、食材或菜蔬、枯枝与桶内水',feast:'M20 在灶边准备',
    narrowBasket:'第二卷仓房：竹材 ×2、草绳 ×1',driedHerb:'仓房：鲜草药 ×2',bambooWare:'仓房：竹材 ×1',shellCraft:'仓房：贝壳 ×2',receipt:'镇集真实买卖与交付留下',
    ledgerOriginal:'程婉的私人物件，获准代管',ledgerCopy:'M16 征得同意后誊写',bedroll:'安顿后搬进卧房，未被销毁'};
  return m[id]||'在已开放地点实际拾取或完成对应动作获得';
}
const inventorySheets=[
  {file:'inventory-household-v392.png',rows:[0,414,805,1254],items:['yardKey','bedroll','repair','rice','ingredient','seed','vegetable','hotMeal','feast']},
  {file:'inventory-crafts-v392.png',rows:[0,425,800,1254],items:['driedHerb','bambooWare','shellCraft','rope','ledgerOriginal','ledgerCopy','receipt','reply','narrowBasket']}
];
function inventoryArt(id){
  if(id==='travelBox')return inventoryArt('narrowBasket');
  if(id==='duckStone'||id==='grassHopper')return globalThis.NanlanKids.art(id);
  if(id==='shootRice'||id==='crustRice')return '<img class="scholar-food-icon" alt="" src="'+(id==='crustRice'?'scholar-rice.webp':'scholar-rice-plain.webp')+'">';
  if(id==='pondMud'||id==='wetLeaf')return window.NanlanProduction?.itemArt(id==='pondMud'?'silkwormCompost':'mulberryLeaf')||'';
  if(window.NanlanProductionModel?.itemIds.includes(id))return window.NanlanProduction?.itemArt(id)||'';
  if(['sealTimber','sealPebble'].includes(id))return window.NanlanSeals?.art(id,'inventory-art')||'';
  if(resourceTypes.includes(id))return resourceArt(id);
  const sheet=inventorySheets.find(sheet=>sheet.items.includes(id));
  if(!sheet)return '';
  const index=sheet.items.indexOf(id),col=index%3,row=Math.floor(index/3),y=sheet.rows[row],height=sheet.rows[row+1]-y;
  return '<svg class="inventory-art" viewBox="'+(col*418)+' '+y+' 418 '+height+'" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><image href="'+sheet.file+'" width="1254" height="1254"/></svg>';
}
function toolbarArt(id){
  const ids=['hand','sickle','hoe','basket','water','axe','journal','map','rest'],index=ids.indexOf(id);
  if(index<0)return inventoryArt(id);
  return '<svg viewBox="'+(index%3*418)+' '+(Math.floor(index/3)*418)+' 418 418" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><image href="toolbar-ming-v394.png" width="1254" height="1254"/></svg>';
}
function taskMaterials(s){
  const q=N.current(s),need={},add=(id,n=1)=>need[id]=Math.max(need[id]||0,n),f=s.flags;
  if(q==='M02'&&!f.firstRepair)add('repair');
  if(q==='M03'&&!f.toolsRepaired)add('repair');
  if(q==='M04'&&!f.firstCooked){add('rice');add('wood');if(!N.quantity(s,'vegetable'))add('ingredient');}
  if(q==='M06'&&!f.bambooChoice)add('bamboo');else if(q==='M06'&&!f.bridgeReady){add('wood');if(s.choices.bamboo==='rack')add('bamboo');}
  if(q==='M07'&&!f.dryRack){add('wood');add('bamboo');}else if(q==='M07'&&!f.medicinalPlanted)add('seed');
  if(q==='M10'&&!N.products.some(id=>N.available(s,id)>0)){add('herb',2);add('bamboo');add('shell',2);}
  if(q==='M19'&&!f.giftChosen){add('herb');add('shell');}
  if(q==='M20'&&!f.feastCooked){add('rice');add('wood');if(!N.quantity(s,'vegetable'))add('ingredient');}
  if(q?.startsWith('V4_')){const k=N.v4.first(s)?.[0];if(['sample','liLot'].includes(k)){add('fineSilk');add('narrowBasket');}if(k==='room'&&s.story4?.choices.room===0){add('wood',2);add('bamboo');}}
  if(q?.startsWith('V5_')){const k=N.v5.first(s)?.[0];if(k==='build'){add('bamboo',2);add('wood');}if(k==='brace')add('wood');if(k==='repair')add('bamboo');}
  if(q?.startsWith('S5_')){
    const k=N.season5.first(s)?.key,materials={reserve:{ingredient:1},motherDo:{herb:2},apprenticePlan:{bamboo:3,rope:1},xiaomanDo:{bamboo:2},prototype:{bamboo:4,rope:1},maintenance:{wood:1},tripDepart:{rice:1,wood:1,...(s.season5.trip?.delegate?{driedHerb:1}:{})}};
    for(const [id,n]of Object.entries(materials[k]||{}))add(id,n);
    if(s.season5.prototype?.tests[k]==='adjust')add('bamboo');
  }
  return need;
}
function showBag(){
  window.NanlanDesktop?.enterBag();
  const s=state(),required=taskMaterials(s),keys=Object.keys(N.itemNames).filter(k=>N.quantity(s,k)>0||required[k]>0);
  activity('随身行囊','家用 '+s.coins+' 文 · 体力 '+Math.floor(s.stamina)+'/100\n钥匙串：'+(s.keyring.includes('yardKey')?'院门钥匙':'暂无')+' · 水桶：'+(!s.tools.water?'尚未领取':Number(s.bucketWater||0)>0?'已装水':'空')+'\n'+(s.flags.bedReady?'床褥已搬进卧房。':'床褥仍在行囊。')+'\n\n当前任务要用的材料即使为 0 也会列出来源；预留库存仍属于你，但不能散卖。');
  const grid=document.createElement('div');grid.className='inventory-grid';
  for(const id of keys){
    const row=document.createElement('div');row.className='inventory-row';
    row.classList.toggle('required-missing',required[id]>N.available(s,id));
    row.innerHTML=inventoryArt(id)+'<div><strong>'+N.itemNames[id]+' ×'+N.quantity(s,id)+(required[id]?'<em>任务需要 '+required[id]+'</em>':'')+(N.available(s,id)!==N.quantity(s,id)?'（预留 '+(N.quantity(s,id)-N.available(s,id))+'）':'')+'</strong><small>'+itemSource(id)+'</small></div>';grid.append(row);
  }$('panelExtra').append(grid);
  if(!keys.length){const empty=document.createElement('p');empty.textContent='行囊暂时没有物资，采集所得会显示在这里。';$('panelExtra').append(empty);}
  if(s.season5)navButton('岁序长青 · 查看共事与试样',()=>window.NanlanSeasons.ledger(),'bag-seasons');
  if(s.scholar?.recipe)globalThis.NanlanScholar?.bag();
  if(N.quantity(s,'hotMeal')&&N.done(s,'M04'))actButton('吃一份热饭 · 恢复 35 体力','eat',{},showBag);
  if(s.flags.volume2Started)button('桑基生产与全家新衣',()=>window.NanlanProduction.progress(),'bag-production',true);
  if(s.flags.volume2Started)button('查看铺号印匣与留底凭单',()=>window.NanlanSeals.show(),'bag-seals',true);
  button('查看家庭收支与凭单',showAccounts,'accounts',true);
  button('导入进度文件',importSave,'import',true);
  if(localStorage.getItem('nanlan_before_import'))button('下载导入前的进度备份',()=>download('Nanlan_Before_Import.json',localStorage.getItem('nanlan_before_import')),'before-import',true);
  if(localStorage.getItem('nanlan_v20_previous'))button('恢复自动备份 · 新旅程前的存档',restoreAutomaticBackup,'restore-auto-backup',true);
  button(deskText('切换对话字号','Toggle Dialogue Text Size'),toggleReadingSize,'large-text',true);
  if(document.fullscreenEnabled)button(deskText('切换窗口与全屏','Toggle Full Screen'),toggleGameScreen,'fullscreen',true);
  if(localStorage.getItem('nanlan_last_night'))button(deskText('查看上次睡前存档','Review Last Bedtime Save'),bedtimeReview,'bedtime-save',true);
  button('导出当前进度备份',()=>download('Nanlan_V20_Save.json',JSON.stringify(state(),null,2)),'export',true);
}
function showMealBowl(){
  const s=state(),count=N.quantity(s,'hotMeal');
  activity('青花饭钵',count?'饭钵里还留着 '+count+' 份热饭。这里仅放用餐之物；其他物资请按 B 查看随身行囊。':'饭钵现在是空的。做好热饭后，会在这里看到并食用。其他物资请按 B 查看随身行囊。');
  if(s.scholar?.recipe)globalThis.NanlanScholar?.eatButtons(showMealBowl);
  const card=document.createElement('div');card.className='held-item-card';card.innerHTML=inventoryArt('hotMeal')+'<div><strong>热饭 ×'+count+'</strong><small>食用一份可恢复 35 体力</small></div>';$('panelExtra').append(card);
  if(count&&N.done(s,'M04'))actButton('吃一份热饭 · 恢复 35 体力','eat',{},showMealBowl);
  else if(count)prerequisiteNote('请在完成 M04「南澜的第一顿饭」后，再食用留存的热饭。');
  button('返回场景',closeDialog,'meal-close',true);
}
function showAccounts(){
  const s=state();activity('家庭收支','家中带来的积蓄：80 文\n目前家用：'+s.coins+' 文\n实际买卖、制作、交付与费用都会留下记录。');
  for(const r of s.transactions.slice().reverse()){
    const row=document.createElement('div');row.className='ledger-row';row.textContent=r.id+' · '+r.note+' · '+(r.amount>0?'+':'')+r.amount+' 文';$('panelExtra').append(row);
  }
}
function showPantry(){
  const fresh=$('dialog').hidden,s=state();if(fresh)for(const item of Object.keys(pantryDraft))pantryDraft[item]=0;
  const en=window.NanlanI18n?.language==='en',L=(zh,english)=>en?english:zh;
  activity('乡邻余粮 · 种子与补给',L('挑选实际需要的物资，可以混合选择并自行填写数量。确认前只计算合计，不会扣除家用。\n\n目前家用 '+s.coins+' 文。','Choose the supplies and quantities you need. Nothing is charged until you confirm.\n\nHousehold savings: '+s.coins+' coins.'),'pantry');
  const seedNote=document.createElement('p');seedNote.className='prerequisite-note';seedNote.dataset.noLocalize='';
  seedNote.textContent=L('乡邻这里常备种子，每份 '+N.supplyPrices.seed+' 文。一份可播一块地，青菜与药草共用，买好就放进行囊。','Seeds are always available here at '+N.supplyPrices.seed+' coins per packet. One packet plants one plot; the same seeds are used for vegetables and herbs. Purchased seeds go into your satchel.');
  $('panelExtra').append(seedNote);
  if(s.production.kit)window.NanlanVillage?.supplies();globalThis.NanlanV3?.supplies();
  const board=document.createElement('div');board.className='pantry-board';const controls=[];
  for(const item of ['seed',...Object.keys(N.supplyPrices).filter(id=>id!=='seed')]){
    const price=N.supplyPrices[item],row=document.createElement('div');row.className='pantry-row';row.dataset.item=item;
    const art=document.createElement('div');art.className='pantry-art';art.innerHTML=inventoryArt(item);
    const info=document.createElement('div');info.className='pantry-info';info.innerHTML='<strong>'+N.itemNames[item]+'</strong><small>行囊已有 '+N.quantity(s,item)+' · 单价 '+price+' 文 / 份</small>';
    const stepper=document.createElement('div');stepper.className='pantry-stepper';
    const minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.setAttribute('aria-label','减少'+N.itemNames[item]);
    const input=document.createElement('input');input.type='number';input.min='0';input.max='99';input.step='1';input.inputMode='numeric';input.value=String(pantryDraft[item]);input.setAttribute('aria-label',N.itemNames[item]+'购买数量');
    const plus=document.createElement('button');plus.type='button';plus.textContent='＋';plus.setAttribute('aria-label','增加'+N.itemNames[item]);
    stepper.append(minus,input,plus);row.append(art,info,stepper);board.append(row);controls.push({item,input,minus,plus});
  }
  const summary=document.createElement('div');summary.className='pantry-summary';summary.setAttribute('role','status');$('panelExtra').append(board,summary);
  const checkout=button('请先选择物资',async()=>{
    const items=Object.fromEntries(Object.entries(pantryDraft).filter(([,quantity])=>quantity>0));
    return perform('buy',{items},()=>{
      const goods=Object.entries(items).map(([id,n])=>(en?window.NanlanI18n.t(N.itemNames[id]):N.itemNames[id])+' ×'+n).join(en?', ':'、');
      for(const item of Object.keys(pantryDraft))pantryDraft[item]=0;
      showPantry();
      const receipt=document.createElement('p');receipt.className='gather-receipt';receipt.dataset.noLocalize='';receipt.setAttribute('role','status');
      receipt.textContent=L('已购入 '+goods+'，已放入行囊。','Purchased '+goods+'. Added to your satchel.');
      $('panelExtra').prepend(receipt);notice(receipt.textContent);
    });
  },'pantry-checkout');
  function updatePantry(){
    let count=0,total=0;for(const {item,input,minus,plus}of controls){const quantity=Math.max(0,Math.min(99,Math.trunc(Number(input.value)||0)));pantryDraft[item]=quantity;if(input.value!==String(quantity))input.value=String(quantity);minus.disabled=quantity===0;plus.disabled=quantity===99;count+=quantity;total+=quantity*N.supplyPrices[item];}
    checkout.disabled=!N.done(s,'M04')||count===0||total>s.coins;checkout.textContent=count?'确认购入 · '+count+' 份 / '+total+' 文':'请先选择物资';
    if(!N.done(s,'M04')){summary.className='pantry-summary';summary.textContent=L('请先回正厅与家人分享第一顿饭，再来乡邻这里购买。','Share the first meal with your family in the hall before buying supplies here.');}
    else if(!count){summary.className='pantry-summary';summary.textContent='尚未选择物资 · 本次不会扣款。';}
    else if(total>s.coins){summary.className='pantry-summary shortage';summary.textContent='已选 '+count+' 份 · 合计 '+total+' 文。家用不足，还差 '+(total-s.coins)+' 文。';}
    else{summary.className='pantry-summary ready';summary.textContent='已选 '+count+' 份 · 合计 '+total+' 文。确认后一次放入行囊。';}
  }
  for(const control of controls){control.minus.onclick=()=>{control.input.value=String(Number(control.input.value)-1);updatePantry();};control.plus.onclick=()=>{control.input.value=String(Number(control.input.value)+1);updatePantry();};control.input.oninput=updatePantry;control.input.onchange=updatePantry;}updatePantry();
}
function showPeople(){
  const s=started?state():null,f=s?.flags||{};
  activity('相识之人',s?'这里只记下你已经见过的人。一起做过的事越多，人物谱里的话也会随之改变。':'故事尚未开始。门前等着你的，是一同赶了很久路的家人。');
  const grid=document.createElement('div');grid.className='people-grid';
  DATA.profiles.forEach(([id,name,role,description])=>{
    const known=(id==='seaMerchant'&&f.v4_board)||(id==='visitor'&&f.v4_visitor)||(id==='liang'&&s?.scholar?.met)||(['xiaoman','boatman','zhou','fang'].includes(id)&&state().story3?.side['met_'+id])||['protagonist','grandfather','father','mother'].includes(id)||(id==='chen'&&f.metChen)||(id==='doctor'&&f.metDoctor)||(id==='cen'&&f.metCen)||(id==='yu'&&f.metYu)||(id==='wan'&&s&&N.reached(s,'M08'))||(id==='qiu'&&s&&N.reached(s,'M17'))||(id==='vendor'&&s&&N.reached(s,'M05'))||(id==='lin'&&f.v2Leased)||(id==='landlord'&&(f.v2InspectEast||f.v2InspectWest))||(id==='neighbor'&&f.v2NeighborHeard)||(id==='tea'&&f.v2Opened)||(id==='customer'&&f.v2Opened);
    if(!known)return;
    const early={
      protagonist:'跟着家人走到南澜。眼下先把行李安顿下来，往后的路由你亲自选择。',
      grandfather:N.done(s,'M16')?'旧纸上的往事说开以后，他不再只看向来路，也开始记南澜的草木。':'一路话不多，始终护着随身的书册。要听懂他的心事，还需多坐下来谈谈。',
      father:N.done(s,'M15')?'那次在高地把话说开后，他出门前会交代去向，也愿意让家人分担。':'总抢着搬最重的箱笼，像是习惯了把难处先压在自己肩上。',
      mother:N.done(s,'M19')?'她既记挂一家人的起居，也有自己的手艺与经营判断。许多主意，她只是等合适的时候才说。':'刚到门前，她先看屋檐、窗格和家人的衣袖；她在意的事，要从这些细处慢慢看见。',
      chen:'在村口递来一碗茶的长者。说话朴实，似乎很清楚村里每个人的难处。',doctor:'懂草木的当地大夫。她没有急着讲大道理，只先教你认眼前能用的东西。',cen:'常在山脚出没的采山人，认路也认竹。他看重山里留下什么，胜过一次带走多少。',yu:'熟悉潮线的渔家姑娘。她说海水每天都不同，人的去路也不必只有一条。',wan:'来寻找旧物的年轻女子。她对书箱里的东西十分珍重，许多缘由仍未说尽。',qiu:'负责转运账目的管事。说话先看凭单，但并非只认冷冰冰的数字。',vendor:'村中经营余粮与杂货的乡邻。先做过几次买卖，才慢慢熟络起来。',lin:'做事讲究稳当的木匠。',landlord:'南街铺面的主人，谈事情很看重说清责任。',neighbor:'南街的邻铺掌柜，既是同行，也是每日抬头可见的邻居。',tea:'南街上做惯生意的掌柜，对货物与交期都有自己的尺度。',customer:'在南街来往的客人。每个人进门时，想找的东西都不一样。'
    };
    const p=document.createElement('div');p.className='person-card';p.innerHTML='<img class="person-sprite" alt="'+clean(name)+'" src="'+DATA.assets['npc_'+(id==='protagonist'?((started?state().gender:gender)==='male'?'playerMale':'playerFemale'):id)]+'"><b>'+name+'</b><small>'+role+'</small><p>'+clean(early[id]||description)+'</p>';if(s&&window.NanlanBonds?.roles.includes(id)){
      const bond=document.createElement('small');bond.textContent=window.NanlanBonds.description(s,id,window.NanlanI18n?.language==='en');p.append(bond);
      const memories=window.NanlanBonds.events[id].filter((_,i)=>s.choices[window.NanlanBonds.key(id,'event'+i)]!==undefined);
      for(const memory of memories){const line=document.createElement('p');line.textContent=memory.title[window.NanlanI18n?.language==='en'?1:0];p.append(line);}
    }grid.append(p);
  });$('panelExtra').append(grid);
}
function showHelp(){
  const s=started?state():null,sections=['眼前怎样行动\n点击地面行走；点击人物或物件会先靠近，再互动。电脑可用 WASD / 方向键移动，空格或 E 互动；B 打开行囊，再按 B 返回；J 看当前记录，M 看舆图。手机与平板可点「场景互动」。','放心尝试\n体力或材料不足时，游戏会告诉你还缺什么。休息、补料后可以再来，不会因为一次没做成而清空进度。'];
  if(s)sections.push('沿路换景\n用 WASD 或方向键朝门口、路口走，进入出口范围便会前往下一处，无须打开舆图。尚未开放的道路会说明缘由。');
  if(s&&N.reached(s,'M03'))sections.push('工具与整理\n数字键可选择工具栏。菜圃可在场景里直接劳作：选锄头点硬土、选种袋点空畦、选木桶点缺水作物；成熟后用双手或竹背篓点击采收。菜圃总览仍可查看全部地块。');
  if(s&&N.reached(s,'M04'))sections.push('时间与休息\n日常时钟会随游玩推进；对白、舆图和菜单中暂停。卧房床榻可以临时恢复体力，也可以睡到次日清晨。');
  if(s&&N.reached(s,'M07'))sections.push('种植与等待\n翻地、播种、浇水后，作物会随游戏时间生长。等待时可以探索、制作或回访已经认识的人。');
  if(s&&N.reached(s,'M10'))sections.push('制作与买卖\n制品可以带到集市。预留给订单的货仍在行囊里，但不能重复散卖。每次实际收支都会留下记录。');
  if(s?.flags.volume2Started)sections.push('南街生活\n铺面经营、运输、结账和后院生产会在用到时逐一说明。人物对货物与凭单的反应，也会透露彼此的信任变化。');
  activity('怎样在南澜生活',sections.join('\n\n'));if(s)globalThis.NanlanV3?.guide();if(s?.story4)button('翻开公所总账',globalThis.NanlanV4.ledger,'v4-guide',true);
}
function showGallery(){
  previousFocus=document.activeElement;active=false;path=[];keys={};$('gallery').hidden=false;
  $('galleryGrid').replaceChildren();
  for(const [id,w] of Object.entries(world)){
      if(!started||!(id===state().scene||state().visits[id]))continue;
      const card=document.createElement('button');card.className='scene-card';card.dataset.scene=id;
      const img=document.createElement('img');
      img.src=DATA.assets[w.asset];img.loading='lazy';img.alt=w.name+'场景原画';
      const desc=document.createElement('div');desc.innerHTML='<b>'+clean(w.name)+'</b><p>'+(id===state().scene?'此刻正在这里':'你曾亲自走过这里')+'</p>';
      card.append(img,desc);card.onclick=()=>{card.classList.toggle('expanded');if(card.classList.contains('expanded'))card.scrollIntoView({behavior:'smooth',block:'start'});};$('galleryGrid').append(card);
  }
  $('galleryClose').focus();
}
$('galleryClose').onclick=()=>{$('gallery').hidden=true;active=started&&$('dialog').hidden&&$('worldMap').hidden&&!document.hidden;if(previousFocus?.isConnected)previousFocus.focus();};
function showPractice(){
  const s=state(),done=Object.keys(s.practice).length,labels=['分好空白纸','写一个家字','给孩子描山字','教孩子认海字','抄一张草木字条','商议明春的课'];
  activity('祖父 · 字纸小事','「旧纸还有空白处，留着给孩子们用。」\n\n这些小事不需要等作物成熟。第一次留下字条或人物回应，回看不会反复发铜钱。\n\n已完成 '+done+'/6 段。');
  labels.forEach((label,index)=>{if(index>=2&&!N.done(s,'M05'))return;if(s.practice[index])button('✓ 回看 · '+label,()=>{activity('字纸小事',s.journal.find(r=>r.id==='S01-'+index)?.text||'这一页已经记下了。');button('回到字纸',showPractice,'practice-back',true);},'practice-read-'+index,true);
    else button(label,()=>{activity('把字写在纸上','祖父把纸铺平，你慢慢写下这一笔。\n\n「字要看清，也要把眼前的人看清。」');actButton('写好，夹进字纸册','practice',{index},showPractice,'practice-'+index);},'practice-open-'+index);});
}
function showArchive(){
  const s=state();activity('书案 · 获准整理的旧页',!s.flags.ledgerPermission?'书箱属于旧住客。在 M08 确认归属、征得程婉同意以前，先只看看自己的笔记，不翻阅私人物件。':
    s.flags.bookReturned&&!s.flags.copyApproved?'原簿已经交还程婉。等获准留下誊写副本，再来回看。':
    '这里只整理获准晾晒或誊写的页。原簿始终属于程婉；重复整理不产生额外物资。\n\n已整理 '+Object.keys(s.pages).length+'/4 片。');
  if(s.children)globalThis.NanlanKids?.home(showArchive);
  if(s.flags.ledgerPermission&&(!s.flags.bookReturned||s.flags.copyApproved)){
    const texts=['纸边写着借灯时日，名字暂缺一角。','一栏记下归还器具，旁边画着小花。','雨痕间留着相助的人名，等当事人核对。','同一件事的几页放在一起，先不把数字都当作欠账。'];
    texts.forEach((line,index)=>button((s.pages[index]?'✓ 回看':'整理')+' · 第 '+(index+1)+' 片',()=>{activity('获准的第 '+(index+1)+' 片',line+(s.flags.historyConfirmed?'\n\n这些记号记着旧时互助，原簿已回到程婉手中。':'\n\n眼下只认出纸页的次序，往事还需当事人说清。'));if(!s.pages[index])actButton('理好页序，记一条笔记','sortPage',{index},showArchive,'sort-'+index);else button('返回书案',showArchive,'archive-back',true);},'page-'+index,true));
  }
  window.NanlanProduction?.desk();
  button('查看家中的回响',showJournal,'archive-journal',true);
}
let selectedPlot=0;
const gardenSpots=[[930,412],[974,393],[944,443],[988,424],[958,474],[1002,455]];
function gardenTarget(index){const [visualX,visualY]=gardenSpots[index];return {id:'gardenPlot'+index,label:plotName(index),type:'activity',action:'gardenDirect',plot:index,x:visualX,y:visualY,visualX,visualY};}
function plotFrame(index){
  const s=state(),g=N.gardenPlot(s,index),c=N.crop(s,index);
  if(!c.planted)return g.harvestedKind?[3,g.harvestedKind==='herb'?2:1]:[0,0];
  if(!g.watered)return [2,0];
  const progress=1-c.remaining/g.duration;
  if(progress<.12)return [3,0];
  return [c.ready?2:progress<.5?0:1,g.kind==='herb'?2:1];
}
function plotArt(index){const [col,row]=plotFrame(index);return `<svg viewBox="${col*384} ${row*1024/3} 384 ${1024/3}" aria-hidden="true"><image href="${DATA.assets.gardenStages}" width="1536" height="1024"/></svg>`;}
function plotName(index){return index<4?'菜畦 '+(index+1):'药田 '+(index-3);}
function plotStatus(index){const s=state(),g=N.gardenPlot(s,index),c=N.crop(s,index);return index>=4&&!s.flags.fullGarden?'M07 扩整后开放':index>0&&!g.tilled?'待翻土':!c.planted?'空畦 · 可播种':!g.watered?'已播种 · 待浇水':c.ready?'成熟 · 可收获':(g.kind==='herb'?'药草':'青菜')+' · 生长中';}
function equipGardenHoe(){
  if(!state().tools.hoe){prerequisiteNote('请先去仓房领取长柄锄，再回来翻土。');return false;}
  state().selected='hoe';refreshToolbar();return true;
}
async function gardenAction(name,p){
  return await perform(name,p,()=>{
    showGarden(p.plot??selectedPlot);
    const tile=$('panelExtra').querySelector('[data-plot="'+selectedPlot+'"]');
    if(tile){const fx=document.createElement('span');fx.className='garden-action-fx '+name;fx.innerHTML=toolbarArt(name==='waterCrop'?'water':name==='tillPlot'?'hoe':name==='plant'?'seed':'hand');tile.append(fx);setTimeout(()=>fx.remove(),1000);}
    const feedback={tillPlot:'松土完成，留下了整齐的土垄。',plant:'种子已播下并覆土，接下来提水浇灌。',waterCrop:window.NanlanWeather?.helpsWater(state())?'借着檐下雨水浇透了地，木桶里的水没有消耗。':'水渗进泥土，作物开始生长。',harvest:'作物已经摘下，收成和留种已放进行囊。'};
    notice(feedback[name]);
  });
}
function startGardenWorkFx(index,kind){const target=gardenTarget(index);gardenWorkFx={start:performance.now(),kind,x:target.visualX,y:target.visualY};}
function renderGardenWorkFx(time){
  if(!gardenWorkFx)return;const age=(time-gardenWorkFx.start)/1000;if(age>=1.05){gardenWorkFx=null;return;}const {kind,x,y}=gardenWorkFx,p=age/1.05,alpha=Math.sin(Math.PI*p);ctx.save();ctx.globalAlpha=alpha;
  if(kind==='tillPlot'){ctx.strokeStyle='#7d5638';ctx.lineWidth=4;ctx.translate(x-12+24*p,y-28+14*p);ctx.rotate(-.8+1.5*p);ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(0,16);ctx.stroke();ctx.strokeStyle='#ad8454';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-10+i*7,16,3+i%2,Math.PI,Math.PI*2);ctx.stroke();}}
  else if(kind==='plant'){ctx.fillStyle='#8b6c39';for(let i=0;i<7;i++){const a=i*.9;ctx.beginPath();ctx.arc(x-16+i*5,y-18+Math.sin(a)*5+18*p,2,0,Math.PI*2);ctx.fill();}}
  else if(kind==='waterCrop'){ctx.strokeStyle='#a9d7dc';ctx.lineWidth=2;for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(x-18+i*7,y-30+34*p+(i%2)*3,3,0,Math.PI);ctx.stroke();}}
  else{ctx.fillStyle='#789c55';for(let i=0;i<8;i++){const a=i*.78;ctx.save();ctx.translate(x+Math.cos(a)*22*p,y-14-Math.sin(a)*18*p);ctx.rotate(a+p);ctx.beginPath();ctx.ellipse(0,0,5,2.4,.4,0,Math.PI*2);ctx.fill();ctx.restore();}}
  ctx.restore();
}
async function directGardenAction(name,index,kind){
  dialogObject=null;return perform(name,{plot:index,...(kind?{kind}:{})},()=>{startGardenWorkFx(index,name);render();const feedback={tillPlot:'土垄已经翻松，可以换上布种袋播种。',plant:'种子落进土里了，接下来换木桶浇水。',waterCrop:'清水浸入土垄，作物开始生长。',harvest:'作物已经采下，收成与留种放进了行囊。'};notice(feedback[name]);});
}
function showDirectSeedChoice(index,target){
  const s=state(),allowed=index>=4?['herb']:s.flags.fullGarden?['vegetable','herb']:[s.choices.firstBed||'vegetable'];
  if(allowed.length===1){directGardenAction('plant',index,allowed[0]);return;}
  activity(plotName(index)+' · 选种','青菜与药草使用同一种种子；点选后会立即播下，并扣除 1 份。','garden');dialogObject=target;$('dialogPortraits').hidden=true;
  for(const kind of allowed)actButton((kind==='herb'?'播下药草':'播下青菜')+' · 现有 '+N.quantity(s,'seed')+' 份','plant',{plot:index,kind},()=>{closeDialog();startGardenWorkFx(index,'plant');render();notice('种子已经播下，换上箍木桶便可直接浇水。');},'direct-seed-'+kind);
  button('返回庭院',closeDialog,'direct-seed-cancel',true);
}
async function handleGardenPlot(target){
  const index=target.plot,s=state(),f=s.flags,g=N.gardenPlot(s,index),c=N.crop(s,index),selected=s.selected;
  if(!f.smallBed){showGarden(0);return;}
  if(index>=4&&!f.fullGarden){notice('这两块药田还没有扩整。继续生活，等许青禾教你整理药圃。',true);return;}
  if(index>0&&!g.tilled){if(selected!=='hoe'){gardenToolHint(3,'这块土还硬着。先按 3 选中长柄锄，再点这块土地。','点下方长柄锄，再点硬土。','Select the hoe below, then the hard soil.');return;}await directGardenAction('tillPlot',index);return;}
  if(!c.planted){if(selected!=='seed'){gardenToolHint(6,'这里可以播种。先按 6 选中布种袋，再点这块空畦。','点下方布种袋，再点空畦。','Select the seed pouch below, then the empty plot.');return;}if(N.quantity(s,'seed')<1){notice('布种袋空了。采收会留下种子，也可向乡邻补购。',true);return;}showDirectSeedChoice(index,target);return;}
  if(!g.watered){if(selected!=='water'){gardenToolHint(5,'嫩芽还缺水。先按 5 选中箍木桶，再点这块菜畦。','点下方木桶，再点嫩芽。','Select the bucket below, then the seedlings.');return;}if(s.bucketWater<1){notice('木桶是空的。先去庭院水缸装水，再回来点菜畦。',true);return;}await directGardenAction('waterCrop',index);return;}
  if(c.ready){if(!['hand','basket'].includes(selected)){gardenToolHint(4,'作物已经成熟。按 1 使用双手，或按 4 选竹背篓，再点作物采收。','点下方竹背篓，再点成熟的作物。','Select the basket below, then the ripe crop.');return;}await directGardenAction('harvest',index);return;}
  notice((g.kind==='herb'?'药草':'青菜')+'正在生长，还需约 '+Math.ceil(c.remaining)+' 游戏分钟。走动、做事或休息都会推进时间。');
}
function storyGardenPlot(){
  const s=state();if(N.current(s)!=='M07'||!s.flags.fullGarden)return selectedPlot;
  if(!s.flags.medicinalPlanted)return [4,5,0,1,2,3].find(i=>!N.crop(s,i).planted)??4;
  return [4,5,0,1,2,3].find(i=>{const g=N.gardenPlot(s,i);return g.kind==='herb'&&g.duration===240&&g.plantedAt!==null;})??4;
}
function showGarden(index=selectedPlot){
  selectedPlot=Number.isInteger(index)?index:0;
  const s=state(),f=s.flags,g=N.gardenPlot(s,selectedPlot),c=N.crop(s,selectedPlot),q=N.current(s);
  const timeNote=s.mode==='prologue'?'完成 M04 家宴后开始生长计时。':N.clock(s).minute>=1320?'夜已深，睡一夜可推进生长。':'离开此面板后，走动、外出和休息都会推进生长。';
  activity('自家菜圃与药圃',!f.smallBed?'先清理通路，再整理第一块小畦。':plotName(selectedPlot)+' · '+plotStatus(selectedPlot)+'。'+(c.planted&&g.watered&&!c.ready?'还需 '+Math.ceil(c.remaining)+' 游戏分钟。':'')+'\n'+timeNote,'garden');
  $('dialogPortraits').hidden=true;
  const board=document.createElement('div');board.className='garden-board';
  for(let i=0;i<6;i++){
    const tile=document.createElement('button');tile.className='garden-plot'+(selectedPlot===i?' selected':'');tile.dataset.plot=i;tile.setAttribute('aria-label',plotName(i)+'，'+plotStatus(i));tile.setAttribute('aria-pressed',String(selectedPlot===i));
    tile.innerHTML=plotArt(i)+'<span>'+plotName(i)+'</span><small>'+plotStatus(i)+'</small>';
    if(!f.smallBed||i>=4&&!f.fullGarden)tile.classList.add('unprepared');
    tile.onclick=()=>{selectedPlot=i;window.NanlanAudio?.play('click');showGarden(i);};board.append(tile);
  }
  $('panelExtra').append(board);
  const canPrepare=q==='M03'&&f.pathCleared&&!f.smallBed;
  const canExpand=q==='M07'&&!f.fullGarden;
  if(canPrepare){actButton('整理第一块菜畦','smallBed',{choice:'vegetable'},()=>showGarden(0),'bed-vegetable');actButton('先整理香草小畦','smallBed',{choice:'herb'},()=>showGarden(0),'bed-herb');}
  if(canExpand)actButton('扩整药圃 · 开放两块药田','expandGarden',{},()=>showGarden(4));
  if(f.smallBed&&(selectedPlot<4||f.fullGarden)){
    if(selectedPlot>0&&!g.tilled)button('拿起长柄锄 · 翻土（体力 2）',()=>{if(!equipGardenHoe())return;return gardenAction('tillPlot',{plot:selectedPlot});},'garden-till');
    else if(!c.planted){
      for(const kind of selectedPlot>=4?['herb']:['vegetable',...(f.fullGarden||s.choices.firstBed==='herb'?['herb']:[])]){
        const b=button((kind==='herb'?'播下药草':'播下青菜')+' · 种子 ×1',()=>gardenAction('plant',{plot:selectedPlot,kind}),'seed-'+kind);b.disabled=N.available(s,'seed')<1;
      }
      const stock=document.createElement('p');stock.className='prerequisite-note';stock.textContent='可用种子：'+N.available(s,'seed')+' 份。青菜与药草使用同一种种子；点击播种后扣除 1 份。';$('panelExtra').append(stock);
      if(N.available(s,'seed')<1){
        stock.textContent+='\n种子不够。可以采收已成熟的作物留种，或去南澜村的乡邻余粮补购。';
        navButton('去乡邻余粮补购种子',()=>{closeDialog();startNavigation('village','villagePantry');},'garden-buy-seed');
      }
    }else if(!g.watered){
      const water=Number.isFinite(s.bucketWater)?s.bucketWater:0,rainWater=!!window.NanlanWeather?.helpsWater(s),b=button(rainWater?'借檐雨浇灌 · 不耗桶水':'提起木桶 · 浇水（水 '+water+'）',()=>gardenAction('waterCrop',{plot:selectedPlot}),'garden-water');
      if(!rainWater&&!s.tools.water){b.disabled=true;prerequisiteNote('先在仓房领取水桶。领取前水量按 0 显示，不能尝试浇水。');}
      else if(water<1){b.disabled=true;prerequisiteNote('木桶是空的。先到庭院水缸装水，再回来浇灌。');}
    }
    else if(c.ready)button('亲手采收 · '+(g.kind==='herb'?'鲜草药':'青菜')+' ×3，留种 ×1',()=>gardenAction('harvest',{plot:selectedPlot}),'garden-harvest');
    else prerequisiteNote('作物正在扎根生长，不必重复浇水。'+timeNote);
  }else if(!canPrepare&&!canExpand)prerequisiteNote(f.smallBed?'请在 M07 扩整药圃后，再种这两块药田。':'请按 M03 清理通路，整理第一块菜畦。');
  if(c.planted&&!g.watered&&!window.NanlanWeather?.helpsWater(s)&&s.tools.water&&Number(s.bucketWater||0)<1)button('去水缸装水',()=>{closeDialog();startNavigation('yard','waterJar');},'garden-refill',true);
  if(c.planted&&!g.watered&&!window.NanlanWeather?.helpsWater(s)&&!s.tools.water)button('去仓房领取水桶',()=>{closeDialog();startNavigation('store','water');},'garden-get-bucket',true);
  if(s.mode==='daily'&&N.clock(s).minute>=1320)button('去卧房睡一夜',()=>{closeDialog();startNavigation('bed','bedRest');},'garden-sleep',true);
  button('收好农具 · 返回庭院',()=>closeDialog(),'garden-resume',true);
}
function showCraft(){
  const s=state(),stallLeft=Math.max(0,Math.ceil((s.stallUntil||0)-s.worldTick));activity('仓房工作台','制作和修缮都要核对材料。确认后才会扣料，成品会进入行囊。\n\n枯枝 '+N.quantity(s,'wood')+' · 竹材 '+N.quantity(s,'bamboo')+' · 草药 '+N.quantity(s,'herb')+' · 贝壳 '+N.quantity(s,'shell')+(stallLeft?'\n\n摊位预约仍在计时：还剩 '+stallLeft+' 游戏分钟。面板打开时暂停；完成一件后可直接返回摊位。':''));
  if(stallLeft)navButton('制作后直接返回镇集摊布',()=>{closeDialog();startNavigation('market','playerStall');},'craft-back-stall');
  window.NanlanVillage?.rack();
  if(N.current(s)==='M03'&&!s.flags.toolsRepaired)actButton('修旧农具 · 修补材料 ×1','repairTools',{},showCraft);
  for(const [id,r] of Object.entries(N.recipes)){
    if(id==='travelBox'&&!s.flags.travelBoxPattern)continue;
    if(id==='narrowBasket'&&!s.flags.volume2Started)continue;
    const ready=id==='rack'?N.reached(s,'M07'):id==='driedHerb'?N.done(s,'M07'):id==='shellCraft'?N.done(s,'M09'):N.done(s,'M06');
    if(!ready)continue;if(r.flag&&s.flags[r.flag])continue;
    actButton(r.label+' · '+Object.entries(r.cost).map(([k,n])=>N.itemNames[k]+' ×'+n).join(' / '),'craft',{recipe:id},showCraft,'craft-'+id);
  }
  if(!N.done(s,'M06'))button('配方随竹林与药圃任务逐步开放',showQuest,'craft-locked',true);
}
// The kitchen steps are presentation only. The existing cookMeal action settles the whole pot.
const kitchenStages=[
  ['灶边 · 米下锅','淘好的米还沥在竹箩里。点铁锅，把米和菜送进清水里。','将米和菜下锅'],
  ['灶边 · 添柴','清水刚刚没过米粒。点灶口，把枯枝往里送一送，再盖上木盖。','往灶口添柴'],
  ['灶边 · 揭盖','木盖轻轻作响，米香从锅沿漫出来。点案边的饭碗，揭盖把饭盛出来。','揭盖盛饭'],
  ['灶边 · 出锅','热饭已经盛好，碗沿还带着白汽。','']
];
function kitchenObstacle(s){
  if(!N.reached(s,'M04'))return '先把庭院的小畦安顿好，再来开灶。';
  if(!s.flags.stoveClean)return '灶膛还有积灰。先把灶边清理干净。';
  if(!s.flags.drainClear)return '宅外的水口还堵着。先去疏通水口，再回来生火。';
  if((s.bucketWater||0)<1)return '桶里还没有水。到庭院水缸装一桶水，再来下米。';
  if(N.available(s,'rice')<1)return '米箩空了。备一份米粮，再来做饭。';
  if(N.available(s,'wood')<1)return '灶下缺柴。拾一份枯枝，再来生火。';
  const food=N.quantity(s,'vegetable')?'vegetable':'ingredient';
  if(N.available(s,food)<1)return '还缺一份可用的菜蔬或食材。';
  return '';
}
function showCook(){
  const s=state(),q=N.current(s);
  activity('灶边 · 一顿热饭','一锅热饭用米粮、菜蔬或食材、枯枝各一份，再添一桶水。','kitchen');
  const scene=document.createElement('div');scene.className='kitchen-scene';
  const art=document.createElement('img');art.alt='';art.draggable=false;
  art.onerror=()=>{art.hidden=true;scene.classList.add('without-art');};
  art.src='kitchen-hearth-v3927.webp';
  const spot=document.createElement('button');spot.type='button';spot.className='kitchen-action';
  const tag=document.createElement('span');spot.append(tag);
  const caption=document.createElement('p');caption.className='kitchen-caption';caption.setAttribute('aria-live','polite');
  scene.append(art,spot);$('panelExtra').append(scene,caption);
  const supplies=document.createElement('details');supplies.className='kitchen-supplies';
  const summary=document.createElement('summary');summary.textContent='看看米缸与柴堆';
  const stock=document.createElement('p');stock.textContent='米粮 '+N.available(s,'rice')+' · 食材 '+N.available(s,'ingredient')+' · 菜蔬 '+N.available(s,'vegetable')+' · 枯枝 '+N.available(s,'wood')+' · 桶内水 '+(s.bucketWater||0);
  supplies.append(summary,stock);$('panelExtra').append(supplies);
  let stage=0,busy=false,quick=null;
  function paint(reason=''){
    const [title,line,label]=kitchenStages[stage];
    $('dialogKicker').textContent=title;scene.dataset.frame=String(stage);
    caption.textContent=reason||line;tag.textContent=label;spot.hidden=stage===3;
    spot.disabled=!!reason||busy;spot.setAttribute('aria-label',label||title);
    if(quick)quick.disabled=!!reason||busy||stage===3;
  }
  async function finish(){
    if(busy||stage===3||dialogKind!=='kitchen'||!scene.isConnected)return;
    busy=true;paint();
    try{
      const result=await perform('cookMeal',{},()=>{
        stage=3;paint();supplies.hidden=true;$('choices').replaceChildren();
        if(N.current(state())==='M04'&&!state().flags.firstShared){
          caption.textContent='门外传来母亲的声音：「祖父的碗摆好了。趁热端来，咱们一起吃。」';
          navButton('端去正厅与家人分饭',()=>{closeDialog();startNavigation('hall','mealTable');},'kitchen-to-table');
        }
        navButton('回到灶台',showCook,'kitchen-again');
        navButton('收好碗勺，回庭院',()=>closeDialog(),'kitchen-leave');
        $('choices').querySelector('button')?.focus({preventScroll:true});
      });
      if(!result.ok){busy=false;paint(kitchenObstacle(state()));caption.textContent=result.message;}
      return result;
    }finally{busy=false;}
  }
  spot.onclick=event=>{
    if(busy||dialogKind!=='kitchen'||event?.detail>1)return;
    if(stage===3)return;
    if(stage===2)return finish();
    if(stage===0)window.NanlanAudio?.play('water');
    stage++;paint();
  };
  if(q==='M04'&&!s.flags.stoveClean)actButton('先把灶边清理干净','cleanStove',{},showCook);
  if(N.reached(s,'M04')){
    quick=button('直接煮好一锅热饭',finish,'cookMeal',true,false);
    if(s.flags.stoveClean&&!s.flags.drainClear)navButton('到宅外疏通水口',()=>{closeDialog();startNavigation('yard','drain');},'kitchen-to-drain');
    else if(s.flags.stoveClean&&s.flags.drainClear&&(s.bucketWater||0)<1)navButton('去水缸装水',()=>{closeDialog();startNavigation('yard','waterJar');},'kitchen-to-water');
  }
  if(s.flags.volume2Started)actButton('煮一锅鲜鱼饭 · 塘鱼1、枯枝1、桶内水1','silkCookFish',{sequence:s.revision},showCook);
  if(N.reached(s,'M20'))actButton('准备岁末家宴','cookFeast',{},showCook);
  paint(kitchenObstacle(s));
  if(s.scholar?.recipe)globalThis.NanlanScholar?.kitchen();
  if(!spot.disabled)spot.focus({preventScroll:true});
}
function showBed(){
  const s=state(),f=s.flags,q=N.current(s);
  activity('卧房（东厢房）· 床榻',f.bedReady?'床褥已经铺好。这里始终有两种休息方式：临时休息恢复体力；睡一夜则到次日清晨，并推进菜畦、采集节点和潮汐。':'先检查窗格与屋顶漏点，选一处最急的地方修好，再把带来的床褥铺上。');
  if(f.bedReady){
    actButton('临时休息 · 体力恢复至 100（推进 30 分钟）','nap',{},showBed,'bed-nap');
    if(N.done(s,'M04'))actButton('睡一夜 · 到次日 06:00（推进生长）','sleep',{},()=>{closeDialog();refreshHud();notice(actionMessage('sleep'));},'bed-sleep');
    else{const locked=button('睡一夜 · 完成 M04 后开放',()=>{},'bed-sleep-locked',true);locked.disabled=true;prerequisiteNote('请在完成 M04「南澜的第一顿饭」后再睡一夜；现在可以临时休息恢复体力。');}
  }else if(q==='M02'&&f.firstRepair){
    actButton('搬入床褥，安顿卧房（东厢房）','setBed',{},showBed);
  }else prerequisiteNote(q==='M02'?'请先检查窗格与漏雨处，修好其中一处，再搬入床褥。':'请在 M02「今夜睡在哪里」中安顿卧房（东厢房）后再休息。');
}
function showStall(){
  const s=state(),q=N.current(s),open=N.clock(s).minute>=540&&N.clock(s).minute<1020;
  activity('镇集 · 第一张摊布','普通镇集时段为 09:00—17:00。第一次试摊有 6 分钟准备窗口，可以重新约，不罚钱。\n\n'+(s.stallUntil>s.worldTick?'当前预约还剩 '+Math.ceil(s.stallUntil-s.worldTick)+' 游戏分钟。':'当前没有有效的试摊预约。')+'\n\n主打制品：干药草、竹制小器、贝壳小饰。也可出售草绳与采集余货，已预留的订单货物不会被卖掉。');
  if(q==='M10'||s.flags.stallBooked)actButton('预约 / 重新约一张摊布','bookStall',{},showStall);
  if(!open&&q!=='M10')$('line').textContent+='\n普通集市已散，可休息到次日再来。';
}
function showTrade(){
  const s=state(),q=N.current(s);
  activity('你的摊布 · 实货与承诺','主打：'+(N.itemNames[s.featured]||'还未选定')+'\n现有制品：'+N.products.map(k=>N.itemNames[k]+' '+N.quantity(s,k)).join(' · ')+
    (s.order?'\n小批单：'+N.itemNames[s.order.product]+' ×2，已交 '+s.order.delivered+'，预留 '+s.order.reserved:'')+'\n\n每次买卖和交付都会扣掉实货、记一张凭单。预留给小批单的货物不能散卖。');
  if(s.flags.stallBooked)globalThis.NanlanV3?.stallDisplay();
  if(q==='M10'&&!s.flags.productDisplayed)N.products.forEach(product=>actButton('摆上 '+N.itemNames[product]+' · 行囊 '+N.quantity(s,product),'displayProduct',{product},showTrade,'display-'+product));
  if(s.flags.productDisplayed){
    const stock=N.available(s,s.featured),sell=actButton(stock>0?'卖出 '+N.itemNames[s.featured]+' ×1 · '+N.prices[s.featured]+' 文':'主打制品库存 0 · 先回仓房制作','sell',{sequence:s.transactions.length},showTrade,'sell');
    sell.disabled=stock<1;
  }
  for(const item of Object.keys(N.prices))if(N.available(s,item)>0)actButton('出售余货 '+N.itemNames[item]+' ×1 · '+N.prices[item]+' 文','sellExtra',{item,sequence:s.transactions.length},showTrade,'extra-'+item);
  if(q==='M11'&&!s.order)actButton('接下两件主打制品的小批单','acceptOrder',{},showTrade);
  if(q==='M11'&&s.order){actButton('为承诺预留现有库存','reserveOrder',{},showTrade);actButton('交付一件 · 当前已交 '+s.order.delivered+'/2','deliverOrder',{expected:s.order.delivered},showTrade);}
}
function addConversation(o){
  const role=NanlanConversations.roles[o.id];if(!role||$('choices').querySelector('[data-action="chat-open"]'))return;
  navButton('聊聊近况 · '+NanlanConversations.cast[role].name,()=>showConversation(o),'chat-open');
}
function showConversation(o){
  const C=NanlanConversations,role=C.roles[o.id],s=state(),t=C.topic(s,role),expected=s.choices['chatCount:'+role]||0;
  activity(C.cast[role].name+' · 闲话',(window.NanlanBonds?.greeting(s,role,window.NanlanI18n?.language==='en')||'')+'\n\n'+C.greeting(s,role));dialogObject=o;
  window.NanlanBondUI?.npc(o);
  for(const choice of [0,1])button(t[choice===0?1:3],async()=>{
    if(!nearObject(o)){notice('请先回到人物身旁。',true);closeDialog();return;}
    const result=engine.act('chat',{object:o.id,choice,expected});
    if(!result.ok){$('line').textContent=result.message;return;}
    activity(C.cast[role].name+' · 回应',t[choice===0?2:4]);dialogObject=o;
    $('dialogKicker').textContent='这次交谈已记下';
    navButton('换个话题',()=>showConversation(o),'chat-more');
    navButton('结束交谈，回到场景',closeDialog,'chat-leave');
  },'chat-choice-'+choice);
  navButton('结束交谈，回到场景',closeDialog,'chat-leave');
}
function npc(o){npcStory(o);addConversation(o);window.NanlanSeals?.npc(o);window.NanlanProduction?.npc(o);window.NanlanVillage?.npc(o);window.NanlanBondUI?.npc(o);}
function npcStory(o){
  const s=state(),f=s.flags,q=N.current(s),id=o.id;
  if(!f.volume2Started&&N.done(s,'M20')&&['father','motherHall','grandfather'].includes(id)){window.NanlanV2.entry();return;}
  if(f.volume2Started&&['father','motherHall','grandfather'].includes(id)){window.NanlanV2.show('v2Family');return;}
    if(id==='grandfather'){
    const tone=s.choices.arrival==='grandfather'?'「你在门前扶的那一下，祖父记着。」\n\n':'';
    activity('祖父',tone+(q==='M19'?'「来信只问我们好不好。把这一季的日子写进去，不必只写京中的旧事。」':
      q==='M16'?'程婉：“画一朵，他就说，这一笔先不问了。”\n祖父：“簿子上的数目，未必能记尽。”':
      N.done(s,'M04')?'「纸还有空白处，拿来写几个字吧。别只等着地里的东西长。」':'「走了这么远，倒到了门口才觉得腿沉。先让家人有地方坐，也有地方睡。」'));
    if(f.historyConfirmed&&f.copyApproved)window.NanlanThreads.offer('flower');
    if(q==='M16'&&!f.historyConfirmed)actButton('请祖父核对小花记号的往事','confirmHistory',{},()=>npc(o));
    if(q==='M19'){
      if(!s.familyTalks.grandfather)actButton('听祖父谈来信','familyLetter',{who:'grandfather'},()=>npc(o));
      if(f.letterFamily&&f.giftChosen&&!f.replyWritten)actButton('请祖父写好回信','writeReply',{},()=>npc(o));
    }
    if(N.done(s,'M04'))button('与祖父整理字纸、练写一个字',showPractice,'practice');
    button('查看当前任务',showQuest,'npc-quest',true);return;
  }
  if(['father','fatherHill','mother','motherHall'].includes(id)){
    const father=id.startsWith('father'),who=father?'父亲':'母亲';
    activity(who,id==='fatherHill'?'父亲在河道旁收拾被雨冲散的物件。你和阿岑确认了归路，现在可以一起回家。':
      father?(f.fatherHome?'「往后出门先说去向，遇事也一道商量。」':'「积蓄还在，房子慢慢修。眼下先把一家人的日子安顿好。」'):
      s.choices.repair==='window'?'「窗先修好了，今晚大家往这边坐。床褥安顿好，再去看看灶边。」':'「先补漏也好，把干燥处留给祖父。厨房的事，我们可以一起做。」');
    if(id==='fatherHill'&&q==='M15')actButton('与父亲结伴，循原路返家','findFather',{},()=>npc(o));
    if(father&&id==='father'&&q==='M15'&&f.fatherFound&&!f.fatherHome){
      actButton('先说一句担心','fatherHome',{choice:'care'},()=>npc(o));
      actButton('商定以后出门先报去向','fatherHome',{choice:'agreement'},()=>npc(o));
    }
    if(q==='M19'&&!s.familyTalks[father?'father':'mother'])actButton('听'+who+'谈来信','familyLetter',{who:father?'father':'mother'},()=>npc(o));
    if(!father&&q==='M04')button('母亲提醒：做好的热饭要端回正厅饭桌',showQuest,'mother-hint',true);return;
  }
  if(id==='villager'){
    activity('陈伯',q==='M05'?'「先喝碗茶。村里人各有各的手艺，走一走，往后遇事才知道找谁。」':
      q==='M15'?'「你父亲往高地河道那边去了。先找阿岑，别独自摸路。」':
      q==='M17'?'「有凭单就逐项核对。县里的事，我替你递过去，再把回执带回来。」':
      '「到这儿便是街坊了。有事先说清楚，能帮的，大家一道帮。」');
    if(q==='M05'&&!f.metChen)actButton('报上姓名，认识街坊','meetChen',{},()=>npc(o));
    if(q==='M13'&&!f.stormWarned)actButton('确认风雨消息与公共物资','warnStorm',{},()=>npc(o));
    if(q==='M15'&&!f.fatherClue)actButton('问清父亲最后的去向','fatherClue',{},()=>npc(o));
    if(q==='M17'&&f.mediationRequested&&!f.accountResolved)actButton('收下县里带回的回执','mediationReceipt',{},()=>npc(o));
    if(q==='M17'&&f.accountResolved&&!f.fairFeePaid&&s.choices.accounts==='mediate')actButton('按回执结清合理费用 · 2 文','payFee',{},()=>npc(o));
    if(q==='M19'&&f.replyWritten&&!f.replySent)actButton('托陈伯寄出回信','sendReply',{},()=>npc(o));
    navButton('问问今日能做的事',()=>{activity('陈伯 · 顺路的小事','回家可与祖父练字、整理仓房；缺材料可看看村中余粮。'+nextHint());$('dialogKicker').textContent='陈伯的提醒 · 不会推进任务';},'chen-hint');return;
  }
  if(id==='doctor'){
    activity('许青禾','「山里的草先认形色，再谈怎么用。小畦先种活，药圃往后慢慢扩。成熟了，要自己来采一回。」');
    if(q==='M05'&&!f.metDoctor)actButton('认识许青禾，记下草木的事','meetDoctor',{},()=>npc(o));
    button('查看种植任务',showQuest,'doctor-hint',true);return;
  }
  if(id==='aCen'){
    activity('阿岑',q==='M15'?'「先确认水位，再走高地。我跟你一道去。」':'「落竹可用，幼株留下。竹料是先借出去修路，还是先做自家晾架，你拿主意。」');
    if(q==='M06'&&!f.metCen)actButton('向阿岑问清竹林小路','meetCen',{},()=>npc(o));
    if(q==='M06'&&f.metCen&&f.bambooIdentified&&!f.bambooChoice){
      actButton('先借竹料修路 · 竹材 ×1','bambooChoice',{choice:'lend'},()=>npc(o),'lend-bamboo');
      actButton('先做自家晾架 · 竹材 ×1','bambooChoice',{choice:'rack'},()=>npc(o),'own-rack');
    }
    if(q==='M15'&&!f.guideReady)actButton('请阿岑带路到高地','askGuide',{},()=>npc(o));return;
  }
  if(id==='chengWan'){
    activity('程婉',q==='M08'?'「那箱旧书是父亲留下的。先别把纸页扯散了。我同意你们把受潮的两页晾开，原簿还请替我保管。」':
      q==='M16'?'「这是父亲的东西，谢谢你们照看。哪些页可以誊写，我们一起说清楚。」':'「旧物里记着的事，得由见过的人慢慢说。」');
    if(q==='M08'&&f.boxFound&&!f.ledgerPermission)actButton('确认归属，征得晾晒与查看同意','ledgerPermission',{},()=>npc(o));
    if(q==='M16'&&!f.bookReturned)actButton('把借灯簿原件交还程婉','returnBook',{},()=>npc(o));
    if(q==='M16'&&f.historyConfirmed&&!f.copyApproved)actButton('征得同意，留下誊写副本','copyApproved',{},()=>npc(o));return;
  }
  if(['shenYu','shenYuCoast'].includes(id)){
    activity('沈晚渔','「潮线要认清，归路更要认清。涨潮便先回海边，下一轮低潮还会来。我也在等自己的第一次试行回信。」');
    if(q==='M09'&&!f.metYu)actButton('请她讲清潮线与海湾归路','meetYu',{},()=>npc(o));
    button('查看当前潮汐',()=>showTide(), 'yu-tide',true);return;
  }
  if(id==='qiu'){
    activity('邱管事','「买卖归买卖，转运和代存也得逐项算清。把凭单摆出来，我们重新核对。」\n\n合理费用：转运与代存共 2 文；有争议的额外费用不应混在一起。');
    if(q==='M17'&&!f.receiptsReviewed)actButton('逐项核对实际买卖与交付凭单','reviewReceipts',{},()=>npc(o));
    if(q==='M17'&&f.receiptsReviewed&&!f.accountResolved&&!f.mediationRequested){
      actButton('当面协商，重算费用','resolveAccounts',{choice:'negotiate'},()=>npc(o),'account-negotiate');
      actButton('请陈伯代呈，带回县里回执','resolveAccounts',{choice:'mediate'},()=>npc(o),'account-mediate');
    }
    if(q==='M17'&&f.accountResolved&&!f.fairFeePaid&&s.choices.accounts==='negotiate')actButton('结清双方确认的费用 · 2 文','payFee',{},()=>npc(o));
    button('查看家庭收支',showAccounts,'qiu-accounts',true);return;
  }
  activity(o.label,o.lines||'「慢慢来，有事再说。」');
}
function showTide(){
  const t=N.tide(state());activity('南澜海湾 · 潮线木牌',(t.low?'现在是低潮，可以进入滩涂，约还有 ':'正在涨潮，下一轮低潮约在 ')+Math.ceil(t.remaining)+' 游戏分钟。\n\n潮汐每 8 分钟一轮，其中低潮 3 分钟。第一次到访有一次低潮教学窗口；离开再来不会反复重置。\n\n涨潮时不能拾取滩涂物资，但随时可以回海边。可先与沈晚渔交谈、回访村里或整理字纸。');
  if(N.current(state())==='M09'&&!state().flags.tideRead)actButton('辨认潮线，记住归路','readTide',{},showTide);
}
function objectGate(o){
  if(o.type==='door'){if(o.requires&&!state().flags[o.requires])return '先在山路木道铺通眼前的小路。';const story=N.sceneGate(state(),o.to);if(story)return story;if(o.to==='tidalflat'&&!N.tide(state()).low)return '潮水正在上涨，下一轮低潮还有 '+Math.ceil(N.tide(state()).remaining)+' 游戏分钟。海边仍可走动与采集。';}
  return '';
}
function visibleObjects(scene=state().scene,includeCooling=false){
  const s=state(),f=s.flags,q=N.current(s);
  return world[scene].objects.filter(o=>{
    if(globalThis.NanlanVoyageUI&&!globalThis.NanlanVoyageUI.visible(s,scene,o))return false;
    if(globalThis.NanlanV5&&!globalThis.NanlanV5.visible(s,o))return false;
    if(globalThis.NanlanV4&&!globalThis.NanlanV4.visible(s,o))return false;
    if(o.id==='seasonBook')return !!f.volume4Complete;
    if(o.id==='seasonDisplay')return !!s.season5?.display?.placed;
    if(f.season5Started&&!f.season5Complete){const r=N.season5.first(s),to=r&&N.season5.target(s,r.key);if(to&&to[0]===scene&&to[1]===o.id)return true;}
    if(o.id==='dryRackVisual'&&!f.dryRack)return false;
    if(o.action==='kidsCamp'&&N.children.camp(s)!==scene)return false;
    if(o.id==='scholarLiang'&&!N.scholar.present(s))return false;
    if(globalThis.NanlanV3&&!globalThis.NanlanV3.visible(s,scene,o))return false;
    if(o.id.startsWith('neighbor-home')&&(s.rural.chen!=='working'||s.rural.homes&(1<<(o.stop-1))))return false;
    if(o.id.startsWith('neighbor-mark')&&(s.rural.cen!=='working'||s.rural.marks&(1<<(o.stop-1))))return false;
    if(o.id==='neighbor-windfall'&&!s.rural.gifts.cen)return false;
    if(o.id==='sealTimberNode'&&(!s.seals?.woodRoute||s.seals.wood||s.bag.sealTimber))return false;
    if(o.id==='sealPebbleNode'&&(!s.seals?.stoneRoute||s.seals.stone||s.bag.sealPebble))return false;
    if(o.id==='v2Family'&&!N.done(s,'M20'))return false;
    if(o.id==='doctor'&&s.flags.volume3Started)return true;
    if(o.id==='doctor'&&f.volume2Started&&!s.rural.xu&&!N.rural.offered(s,'xu'))return false;
    if(o.id==='shenYu'&&f.metYu)return false;
    if(o.id==='v2Customer'&&(!f.v2Opened||N.shopCustomers(s)<=0)&&!['V2_10','V2_14'].includes(q))return false;
    if(o.id.startsWith('v2Observe')){if(q!=='V2_02'||f[N.story2.slots[o.slot].flag])return false;}
    if(o.id==='v2Supplier'&&q!=='V2_16')return false;
    if(o.id==='aCen'&&q==='V2_16')return false;
    if(f.volume2Started&&o.id==='mother')return false;
    if(o.id==='motherHall'&&f.volume2Started&&N.story2.familyAtShop(s,'mother'))return false;
    if(o.id==='father'&&f.volume2Started&&N.story2.familyAtShop(s,'father'))return false;
    if(o.id==='v2MotherCounter'&&(!f.volume2Started||!N.story2.familyAtShop(s,'mother')))return false;
    if(o.id==='v2FatherCounter'&&(!f.volume2Started||!N.story2.familyAtShop(s,'father')))return false;
    if(['weed1','weed2','weed3','villageWeed'].includes(o.id)&&s.collected[o.id])return false;
    if(!includeCooling&&!fruitTypes.includes(o.type)&&resourceTypes.includes(o.type)&&o.type!=='weed'&&s.nodes[o.id]!==undefined&&s.worldTick-s.nodes[o.id]<N.resourceCooldown(o.type))return false;
    if(o.id==='familyLuggage'&&f.handover)return false;
    if(o.id==='keyHandover'&&(!f.handover||f.keyTaken))return false;
    if(o.id==='sickle'&&f.farmTools)return false;
    if(o.id==='water'&&s.tools.water)return false;
    if(o.id==='oldAxe'&&s.tools.axe)return false;
    if(o.id==='father'&&q==='M15'&&!f.fatherFound)return false;
    if(o.id==='fatherHill'&&(q!=='M15'||f.fatherFound))return false;
    if(o.id==='chengWan'&&!f.boxFound)return false;
    if(['shenYu','shenYuCoast'].includes(o.id)&&!N.reached(s,'M09'))return false;
    if(o.id==='qiu'&&!N.reached(s,'M17'))return false;
    // Physical quest objects remain visible; their panels explain exact prerequisites.
    return true;
  });
}
function objectLabel(o){
  const s=state();if(o.id==='silkPond'){const z=window.NanlanProductionModel.status(s);return !s.flags.volume2Started?'桑基鱼塘 · 第二卷开放':z.careOpen?'蚕匾 · 吐丝前可照料':z.wormReady||z.fishReady||z.mulberryReady?'桑基鱼塘 · 有产物可收':'桑基鱼塘 · 种桑、养蚕、喂鱼';}if(o.id==='v2Family')return s.flags.volume2Started?'家议 · 铺面与下一季':'新春家议 · 开启第二卷';if(['leaseEast','leaseWest'].includes(o.id)&&s.flags.v2Leased&&o.site===s.story2.site)return N.story2.shops[o.site].name+' · 已租用';if(o.id==='herbPlot'){const plots=Array.from({length:s.flags.fullGarden?6:4},(_,i)=>N.crop(s,i)),ready=plots.filter(c=>c.ready).length;return !s.flags.smallBed?'菜畦 · 待整理':ready?'菜圃药圃 · '+ready+' 块可收获':plots.some(c=>c.planted)?'菜圃药圃 · 照料作物':'菜圃药圃 · 可播种';}
  if(o.type==='door'&&objectGate(o))return o.label+' · 待开启';
  if(o.id==='window')return s.flags.windowPatched?'窗格 · 已修好':'松动窗格 · 查看';
  if(o.id==='leak')return s.flags.leakPatched?'屋顶 · 已补漏':'屋顶漏雨 · 查看';
  if(o.id==='bedRest')return s.flags.bedReady?'床榻 · 临时休息 / 睡一夜':'床榻 · 待安顿';
  if(o.id==='dryRackVisual')return '自家晾架 · '+(s.flags.dryRack?'可晾晒':'待搭建');
  return o.label;
}
function localObjectiveObject(){
  if(typeof nextObjective!=='function')return null;const target=nextObjective();
  if(!target||target.scene!==state().scene||!target.object)return null;
  return visibleObjects().find(o=>o.id===target.object)||null;
}
function refreshInteractionHint(){
  const hint=$('interactionHint');if(!hint)return;
  if(!started||!active||!$('dialog').hidden||!$('worldMap').hidden||!$('gallery').hidden||!$('nightNote').hidden){hint.hidden=true;lastInteractionHint='';return;}
  const objects=visibleObjects();if(!objects.length){hint.hidden=true;lastInteractionHint='';return;}
  const travelling=path[path.length-1]?.object,objective=localObjectiveObject();
  const nearest=[...objects].sort((a,b)=>Math.hypot(a.x-state().player.x,a.y-state().player.y)-Math.hypot(b.x-state().player.x,b.y-state().player.y))[0];
  const nearbyResource=objects.filter(o=>isGatherable(o)&&nearObject(o)).sort((a,b)=>Math.hypot(a.x-state().player.x,a.y-state().player.y)-Math.hypot(b.x-state().player.x,b.y-state().player.y))[0];
  const o=travelling||objects.find(v=>v.id===focusedObjectId&&nearObject(v))||nearbyResource||objective||nearest,near=nearObject(o);
  const mode=travelling?'travelling':near?'near':objective===o?'objective':'nearby';
  const firstSteps=N.current(state())==='M01',gather=isGatherable(o);
  const kicker=firstSteps?(travelling?'初行引导 · 正在走近':near?'初行引导 · 按空格或点击互动':'初行引导 · 点击这里自动走近'):travelling?(gather?'正在走近物资 · 到达后采集':'正在前往 · 点击可重新聚焦'):near?(o.type==='weed'?'清理杂草 · 选好镰刀后点击':gather&&o.action!=='garden'?(N.resourceRequirement(state(),o.type)||(N.rareResources[o.type]?.tool==='axe'?'可劈取 · 点击采料':o.type==='ginseng'?'可挖取 · 点击采参':'可采集 · 点击拾取')):'已经走近 · 点击互动'):objective===o?'当前任务目标 · 点击前往':'附近可互动 · 点击前往';
  const key=[state().scene,o.id,mode,objectLabel(o),kicker].join('|');
  if(key!==lastInteractionHint){hint.className='panel '+mode;$('interactionHintMark').textContent=mode==='objective'?'令':near?'近':travelling?'行':'寻';$('interactionHintKicker').textContent=kicker;$('interactionHintLabel').textContent=objectLabel(o);hint.setAttribute('aria-label',kicker+'：'+objectLabel(o));lastInteractionHint=key;}
  hint.dataset.object=o.id;hint.hidden=false;
}
async function interact(o){
  if(!o||transitioning)return;
  if(!nearObject(o)){notice('先走近'+o.label+'。');return;}
  if(globalThis.NanlanVoyageUI?.offer(o)){dialogObject=o;return;}
  if(o.action==='kidsCamp'){dialogObject=o;globalThis.NanlanKids.play();return;}
  if(o.action==='liangTea'){dialogObject=o;await globalThis.NanlanScholar.meet();window.NanlanBondUI?.npc(o);return;}
  if(globalThis.NanlanSeasons?.offer(o)){dialogObject=o;window.NanlanBondUI?.npc(o);return;}
  if(globalThis.NanlanGuild?.atStop(o)){dialogObject=o;window.NanlanBondUI?.npc(o);return;}
  if(globalThis.NanlanV5?.offer(o)){dialogObject=o;window.NanlanBondUI?.npc(o);return;}
  if(globalThis.NanlanV4?.offer(o)){dialogObject=o;window.NanlanBondUI?.npc(o);return;}
  if(globalThis.NanlanV3?.offer(o)){dialogObject=o;window.NanlanBondUI?.npc(o);return;}
  if(o.type==='door'){const why=objectGate(o);if(why){notice(why,true);return;}await switchScene(o.to);return;}
  if(o.type==='locked'||o.type==='property'){activity(o.label,o.lines||'这个地点暂未开放，后续篇章会有新安排。');dialogObject=o;return;}
  if(o.type==='npc'){npc(o);dialogObject=o;return;}
  if(o.type==='view'||o.type==='read'){activity(o.label,o.lines||'这里记着家中旧事。');dialogObject=o;return;}
  if(resourceTypes.includes(o.type)){
    if(o.type==='weed')await perform('clearWeed',{id:o.id});
    else await perform('collect',{id:o.id});return;
  }
  const s=state(),f=s.flags,q=N.current(s),a=o.action;
  if(a==='neighborStop'){window.NanlanVillage.stop(o);dialogObject=o;return;}
  if(a==='seasonDisplay'){window.NanlanSeasons.ledger();dialogObject=o;return;}
  if(a==='dryRack'){activity('庭院 · 自家晾架','这就是当初留下的自家晾架。竹脚落在地面，药草与潮湿桑叶都在这里摊开通风。');window.NanlanVillage?.rack();dialogObject=o;return;}
  if(a==='gardenDirect'){await handleGardenPlot(o);return;}
  if(a==='silkProduction'){window.NanlanProduction.show();dialogObject=o;return;}
  if(a?.startsWith('seal')){window.NanlanSeals.gather(o);return;}
  if(a?.startsWith('v2')){window.NanlanV2.show(a,o);dialogObject=o;addConversation(o);window.NanlanSeals?.npc(o);window.NanlanProduction?.npc(o);window.NanlanVillage?.npc(o);window.NanlanBondUI?.npc(o);return;}
  if(f.volume2Started&&o.id==='goodsCrates'){window.NanlanV2.show('v2Cargo',o);dialogObject=o;return;}
  if(a==='arrival'){
    activity('旧宅门前 · 交接','官兵：「文书与行李都在此。李家远迁岭南，并未籍没家产。我等交接完便返京。」\n\n祖父：「走了这么远，倒到了门口才觉得腿沉。」\n你：「进去坐一坐。」\n\n门还没有开。你先帮谁一把？');
    actButton('先扶祖父到门边','handover',{choice:'grandfather'},()=>{closeDialog();notice('祖父站稳了。现在可以接过院门钥匙。');},'arrival-grandfather');
    actButton('先把行李搬到门边','handover',{choice:'luggage'},()=>{closeDialog();notice('行李已交接。现在可以接过院门钥匙。');},'arrival-luggage');
  }else if(a==='key'){
    activity('官兵 · 院门钥匙','「这是宅院钥匙。屋舍久无人住，先把一家人安顿好。」\n\n钥匙需要你亲手接过，不会因为略过对白就自动放入行囊。');
    actButton('接过钥匙，收入行囊','takeKey',{},()=>{closeDialog();notice('院门钥匙 ×1 已入包。走到旧宅院门前开门。');});
  }else if(a==='gate'){
    activity('旧宅院门','旧门沉沉地合着。钥匙转开以后，要亲手推门，院内才会开放。');
    actButton('用钥匙打开院门','openGate');
  }else if(a==='window'||a==='leak'){
    const window=a==='window',fixed=f[window?'windowPatched':'leakPatched'];
    activity(window?'东厢房 · 松动窗格':'东厢房 · 屋顶漏点',fixed?(window?'窗榫已经垫紧，窗扇合拢，风不再往屋里钻。':'漏处已经补妥，滴水停了，地面也收拾干净。'):(window?'你轻轻一推，窗扇就晃了起来。木榫松脱，窗纸裂开，风从缝隙里钻进来。':'滴答——水珠沿着发黑的梁边落下，墙皮已经起翘，床边地砖湿了一片。再不补，床褥也要受潮。'));
    const detail=document.createElement('div');detail.className='repair-detail '+(window?'window-detail':'leak-detail');detail.style.backgroundImage='url("'+DATA.assets[fixed?'bed':'bedDamage']+'")';detail.setAttribute('role','img');detail.setAttribute('aria-label',window?'窗格修缮细节':'墙面渗水与地面积水细节');$('panelExtra').append(detail);
    if(f.firstRepair&&!fixed&&!N.done(s,'M04'))$('line').textContent+='\n\n请在完成 M04「灶火与热饭」后补修此处，先将材料留给农具。';
    if(f.firstRepair&&!fixed&&N.done(s,'M04'))actButton(window?'补好剩下的窗格 · 材料 ×1':'补好剩下的漏点 · 材料 ×1','finishRoomRepair',{part:window?'window':'leak'},()=>{closeDialog();notice(window?'窗格稳了，屋内不再漏风。':'水滴停下，墙边的积水已经擦净。');});
    if(q==='M02'){
      if(!f[window?'windowInspected':'leakInspected'])actButton(window?'查看窗格的松动处':'查看漏雨的痕迹',window?'inspectWindow':'inspectLeak',{},()=>{closeDialog();refreshHud();notice('检查记下了。'+nextHint());});
      if(f.windowInspected&&f.leakInspected&&!f.firstRepair)actButton(window?'先修窗格 · 材料 ×1':'先补漏点 · 材料 ×1','firstRepair',{choice:window?'window':'leak'},()=>{closeDialog();notice(actionMessage('firstRepair'));});
    }else $('line').textContent+='\n\n'+(f.firstRepair?'已经完成最急的一处修补，家人的站位和对白留下了选择。':'先跟随眼前任务。');
  }else if(a==='bed')showBed();
  else if(a==='tools'){
    activity('仓房 · 旧农具','一束旧镰刀、锄头和背篓还收在墙边。先领出来，再用工作台修好松动的连接。');
    if(N.reached(s,'M03'))actButton('领取农具一束','farmTools',{},()=>{closeDialog();notice('镰刀、锄头和背篓已收好。工作台上可以修理。');});
  }else if(a==='axe'){activity('仓房 · 木柄斧','木柄与铁刃尚好，可随身带走。修好农具后，选中木柄斧，可在竹林和山腰处理沉香、海南黄花梨枯木。枯枝仍可徒手拾取。');if(N.reached(s,'M03')&&!s.tools.axe)actButton('领取木柄斧','takeAxe',{},()=>{closeDialog();notice('木柄斧已放入工具栏第 11 格。');});
  }else if(a==='bucket'){activity('仓房 · 旧水桶','水桶还能盛水。带到庭院的水缸旁装水，可用于做饭与浇灌。');if(N.reached(s,'M03'))actButton('拿起旧水桶','bucket',{},()=>{closeDialog();notice('获得旧水桶。');});}
  else if(a==='garden')showGarden(storyGardenPlot());
  else if(a==='craft')showCraft();
  else if(a==='cook')showCook();
  else if(a==='water'){activity('庭院 · 水缸','缸中的水可装入旧木桶。一次装满，够做一锅饭或浇一畦地。');if(N.reached(s,'M04'))actButton('把水桶装满','fillWater',{},()=>{closeDialog();refreshHud();notice(actionMessage('fillWater'));});}
  else if(a==='drain'){activity('宅外水口',f.drainClear?'水口通了，灶边与通路不再被积水妨碍。':'落叶塞住了小水口。清掉这一处即可通水，不需要修复池塘。');if(q==='M04'&&!f.drainClear)actButton('清理落叶，疏通水口','clearDrain',{},()=>{closeDialog();notice('小水口已经通了。');});}
  else if(a==='table'){
    activity('正厅 · 一家人的饭桌',q==='M04'?'第一锅饭已经端来。家人先吃上热饭，这处落脚的房子便开始像个家。':'饭桌旁可以商量家事，来信、座次和一顿饭都会留下记录。');
    if(q==='M04'){actButton('先给家人盛饭','shareFirst',{choice:'family'},()=>showFamilyMeal(false),'share-family');actButton('分一碗留给陈伯，再与家人同食','shareFirst',{choice:'chen'},()=>showFamilyMeal(false),'share-chen');}
    if(s.children)globalThis.NanlanKids?.home(()=>interact(o));
    if(s.scholar?.recipe)globalThis.NanlanScholar?.table();
    if(f.firstShared)button('回看一家人围桌吃饭',()=>showFamilyMeal(!!f.feastShared,true),'meal-memory',true);
    if(q==='M19'&&!f.giftChosen){actButton('选一株草药随信','chooseGift',{item:'herb'},()=>interact(o),'gift-herb');actButton('选一枚贝壳随信','chooseGift',{item:'shell'},()=>interact(o),'gift-shell');}
    if(q==='M20'){
      if(!f.seatingChosen){actButton('家人在内席，邻里在回廊','seating',{choice:'family'},()=>interact(o),'seat-family');actButton('家人与街坊同席','seating',{choice:'neighbors'},()=>interact(o),'seat-neighbors');}
      if(f.seatingChosen)actButton('上菜，与家人邻里完成岁末家宴','shareFeast',{},()=>showFamilyMeal(true),'share-feast');
    }
  }else if(a==='villageLetter'){activity('乡邻来信','纸上说远行的人平安，也问家里今年的收成。陈伯请你把信慢慢读给街坊听。');if(q==='M05')actButton('读完这封家信，替乡邻记下回话','readLetter',{},()=>{closeDialog();notice('乡邻的回话记好了。');});}
  else if(a==='pantry')showPantry();
  else if(a==='bridge'){activity('山路 · 木道','把眼前松动的一段铺好，才好进入竹林。先借出竹料，阿岑会帮工；先做自家晾架，则一起补另一段桥面。');if(q==='M06'&&!f.bridgeReady)actButton('铺通小路 · 枯枝 ×1'+(s.choices.bamboo==='rack'?'、竹材 ×1':''),'repairBridge',{},()=>{closeDialog();notice('小路铺好了，竹林入口已开放。');});}
  else if(a==='bookbox'){activity('仓房 · 旧住客书箱','书箱是旧住客留下的私人物件，里面的书页受了潮。先确认归属，联系程婉，征得同意后再查看和晾晒。');if(q==='M08'&&!f.boxFound)actButton('登记书箱，托人联系旧住客家人','findBox',{},()=>{closeDialog();notice('已记下书箱归属线索。去村里联系程婉。');});}
  else if(a==='dry'){
    activity('书房窗下 · 晾纸','只晾晒程婉同意的两页，不自行拆散整本旧簿。');
    if(q==='M08'){
      for(let index=0;index<2;index++){
        if(f['driedPage'+index])continue;
        const dryButton=actButton('把第 '+(index+1)+' 页铺平晾好','dryPage',{index},()=>interact(o),'dry-'+index);
        dryButton.disabled=!f.ledgerPermission;
      }
      if(f.ledgerPermission&&!f.pagesDried)navButton('托起纸角，迎光细看',()=>showWindowPages(o),'inspect-paper');
    }
  }
  else if(a==='archive')showArchive();
  else if(a==='tide')showTide();
  else if(a==='stall')showStall();
  else if(a==='sellSurplus'){activity('村中收购 · 出售余货','按件出售采集物、菜蔬和手作制品。订单预留货物不会售出，请自行保留制作材料。');for(const item of Object.keys(N.prices))if(N.available(s,item)>0)actButton('卖出 '+N.itemNames[item]+' ×1 · '+N.prices[item]+' 文','sellExtra',{item,sequence:s.transactions.length},()=>interact(o),'surplus-'+item);}
  else if(a==='trade')showTrade();
  else if(a==='gutter'){activity('宅院 · 屋檐与沟渠','先检查水能往哪儿走，再收好晾晒物，通知陈伯。风雨到来由剧情触发，不会因为日历换了一天就错过。');if(q==='M13')actButton('检查沟渠与屋檐，记下风雨准备','checkGutter',{},()=>{closeDialog();refreshHud();notice('沟渠与屋檐已经检查。');});}
  else if(a==='crates'){
    activity('仓房 · 物资与货箱','按用途理好物资，把承诺的货物分清。整理本身不会增加材料或铜钱。');
    actButton('整理仓房，核对现有物资','tidy',{},()=>{closeDialog();notice(actionMessage('tidy'));});
    if(q==='M13')actButton('把晾晒物收回仓房','storeGoods',{},()=>interact(o));
    if(q==='M14')actButton('把货箱架高，避开积水','raiseCrates',{},()=>interact(o));
  }else if(a==='shelter'){
    activity('正厅 · 临时安置','母亲：「人也要进来，两件事，咱们一起做。」\n你：「现在也用得上。」\n\n先腾出通道、架高货物，再安排临时铺位。');
    if(q==='M14'&&!f.hallwayCleared)actButton('腾出正厅通道','clearHallway',{},()=>interact(o));
    if(q==='M14'&&f.hallwayCleared&&f.cratesRaised){actButton('先照应家人，再安置邻里','settleGuests',{choice:'family'},()=>interact(o),'shelter-family');actButton('按到达顺序安排铺位','settleGuests',{choice:'neighbors'},()=>interact(o),'shelter-neighbors');}
  }else if(a==='waterMark'){activity('高地 · 水位标记','沿石上刻痕确认水位，再走阿岑指出的归路。');if(q==='M15')actButton('确认安全水位与返回路线','checkWater',{},()=>{closeDialog();notice('水位已确认，可以去找父亲。');});}
  else if(a==='lamps'){activity('庭院 · 岁末灯火','把灯挂在回廊与门前，等人归家，也等邻里来坐。');if(q==='M20')actButton('挂起岁末的灯','hangLamps',{},()=>{closeDialog();notice('庭院挂好了灯，回正厅上菜。');});}
  else activity(o.label,'这处物件暂时没有新的安排。'+nextHint());
  prerequisiteNote(objectPrerequisite(o));
  dialogObject=o;
}
// A closer look is optional. The only saved action is the ordinary dryPage action.
function showWindowPages(o){
  const s=state(),f=s.flags;
  if(N.current(s)!=='M08'||!f.ledgerPermission||f.pagesDried){void interact(o);return;}
  const details=[
    ['迎光辨墨迹','你把纸稍稍偏向窗光。“借灯”二字留了下来，日子却浅得只剩半笔。','「那一笔若是认不清，就留着吧。等纸干了，我陪你慢慢认。」'],
    ['轻托小花旁的卷边','你从纸背托住卷边，一朵淡墨小花露了出来。最后一瓣歪着，倒像刚被风吹过。','「小时候我总想把那一瓣描圆。如今再看，倒舍不得添这一笔了。」']
  ];
  let selected=null;
  activity('书房窗下 · 细看潮页','你将两张旧页分开一掌宽。窗风很轻，指腹托住纸背，就看得见上面的细处。','paper-reading');
  dialogObject=o;
  const desk=document.createElement('div');desk.className='paper-reading-desk';
  desk.innerHTML=inventoryArt('ledgerOriginal');
  const response=document.createElement('div');response.className='paper-reading-response';response.hidden=true;
  response.setAttribute('aria-live','polite');
  const portrait=document.createElement('img');portrait.src=DATA.assets.npc_wan;portrait.alt='程婉';
  const words=document.createElement('div'),detail=document.createElement('p'),voice=document.createElement('p');
  words.append(detail,voice);response.append(portrait,words);
  $('panelExtra').append(desk,response);
  const spots=[];
  for(const [index,[label,observation,line]] of details.entries()){
    if(f['driedPage'+index])continue;
    const spot=document.createElement('button');spot.type='button';spot.className='paper-reading-spot page-'+index;
    spot.textContent=label;spot.setAttribute('aria-pressed','false');spots.push(spot);
    spot.onclick=()=>{
      selected=index;
      for(const other of spots)other.setAttribute('aria-pressed',String(other===spot));
      desk.dataset.page=String(index);detail.textContent=observation;
      voice.textContent='想起程婉递纸时的话：'+line;response.hidden=false;dry.disabled=false;
    };
    desk.append(spot);
  }
  const dry=button('把眼前这页铺平晾好',()=>perform('dryPage',{index:selected},()=>interact(o)),'paper-dry',false,false);
  dry.disabled=true;
  navButton('放回窗边',()=>interact(o),'paper-back');
  spots[0]?.focus({preventScroll:true});
}
function showFamilyMeal(feast=false,memory=false){
  const s=state(),imageKey=s.gender==='male'?'familyMealMale':'familyMealFemale';
  activity(memory?'饭桌旧事 · 一家同食':feast?'岁末家宴 · 一家同席':'第一顿热饭 · 一家同食',
    feast?'灯火映着碗沿，祖父放下筷子，笑着听你说这一年的见闻。席间的热气，让远迁的日子终于有了家的模样。':
    '母亲把热饭递到你手里，父亲夹来一筷青菜。祖父慢慢尝了一口，点点头：「能坐下来好好吃顿饭，就安稳了。」'+(s.choices.firstMeal==='chen'?'\n留给陈伯的那一碗，也已盛好放在一旁。':''),'meal');
  $('dialogPortraits').hidden=true;
  const figure=document.createElement('figure'),img=document.createElement('img');figure.className='family-meal-art';img.src=DATA.assets[imageKey];img.alt='祖父、父亲、母亲与'+(s.gender==='male'?'男主角':'女主角')+'围坐饭桌用餐';figure.append(img);$('panelExtra').append(figure);
  $('dialogKicker').textContent=memory?'回看团聚 · 不消耗饭菜':'饭已上桌 · 一家团聚';
  button(feast&&!memory?'饭后叙话 · 岁末满庭':'收好碗筷，回到正厅',()=>{if(feast&&!memory)showEnding();else closeDialog();},'meal-continue');
}
function showEnding(){
  if(window.NanlanEndings){window.NanlanEndings.play(1);return;}
  activity('第一卷完成 · 岁末满庭','灯亮在回廊，家人与邻里坐在一处。你从门外接过行李，走过竹林、山路和海湾，也学会把家计与承诺说清楚。\n\n祖父留下了明春的课，父亲约定出门先报去向，母亲有了自己的小单。原簿回到程婉手里，获准的副本留在书案。\n\n这里终于成了愿意守护的家。\n\n第一卷已完成。到正厅的「新春家议」开启第二卷「南街灯起」。任务、物品和人物选择全部保留。','ending');
  button(window.NanlanI18n?.language==='en'?'Read the Shop Notice · Begin Volume II':'与家人读铺讯 · 开启第二卷',()=>window.NanlanV2.entry(),'ending-volume2');
  button('回到家中，继续过日子',()=>{closeDialog();notice('岁末满庭之后，日常仍在继续。');},'ending-continue');
  button('回看一路留下的回应',showJournal,'ending-journal',true);
}
function showNearby(){
  const s=state(),objective=localObjectiveObject(),all=visibleObjects(s.scene,true);
  const distance=o=>Math.hypot(o.x-s.player.x,o.y-s.player.y),rank=o=>o===objective?0:nearObject(o)?1:isGatherable(o)?2:o.type==='door'?4:3;
  all.sort((a,b)=>rank(a)-rank(b)||distance(a)-distance(b));
  activity('场景互动 · '+world[s.scene].name,
    '已按“当前任务 → 就在旁边 → 采集与设施 → 出入口”排列。选择后，主角会先沿可走的路靠近，再进行交谈或操作。'+
    (objective?'\n\n当前任务目标：'+objectLabel(objective):''));
  for(const o of all){
    const resource=resourceTypes.includes(o.type),last=s.nodes[o.id],cooldown=resource&&last!==undefined&&s.worldTick-last<N.resourceCooldown(o.type);
    const remaining=cooldown?Math.ceil(N.resourceCooldown(o.type)-s.worldTick+last):0,why=objectPrerequisite(o)||objectGate(o);
    const prefix=o===objective?'【当前任务】':nearObject(o)?'【就在旁边】':resource?'【采集物资】':o.type==='door'?'【出入口】':'【场景物件】';
    const suffix=cooldown?' · '+remaining+' 分钟后恢复':why?' · 有前置条件':'';
    const b=button(prefix+' '+objectLabel(o)+suffix,()=>{closeDialog();approach(o);},'near-'+o.id,o!==objective&&!nearObject(o));
    if(cooldown){b.disabled=true;b.title='这处物资还需 '+remaining+' 游戏分钟恢复。';}
  }
}
async function switchScene(to){
  if(transitioning)return;const why=N.sceneGate(state(),to);if(why){notice(why,true);return;}
  const wasActive=active;transitioning=true;active=false;path=[];keys={};
  notice('正在前往'+world[to].name+'…',true);
  try{
    if(!await loadSceneAssets(to)){cancelNavigation();notice('目的地图片未能载入，仍留在原处。请稍后重试。',true);return;}
    const result=engine.enter(to);
    if(!result.ok){cancelNavigation();notice(result.message,true);return;}
    window.NanlanAudio?.play('door');focusedObjectId=null;lastInteractionHint='';
    if(result.completed)reward(result.completed);render();refreshHud();notice('来到'+world[to].name+'。');$('saveState').textContent='已保存';
  }finally{transitioning=false;active=wasActive&&$('dialog').hidden&&$('worldMap').hidden&&!document.hidden;}
  if(active)continueNavigation();
}
function objectFootprint(o){
  if(o.type==='door'||resourceTypes.includes(o.type)||['window','leak','gutter','lamps','tide','waterMark'].includes(o.action))return null;
  const fixed={familyLuggage:[48,28],mealTable:[88,42],bedRest:[66,31],workbench:[75,35],bookBox:[28,18],goodsCrates:[62,32],silkPond:[76,44],herbPlot:[67,36],waterJar:[24,14],stove:[42,25],shelter:[55,28],generalStoreKeeper:[62,27],v2Shelf:[48,25],villageLetter:[23,10]};
  if(fixed[o.id])return fixed[o.id];
  if(fruitTypes.includes(o.type))return [38,22];
  if(npcRole(o)||o.type==='npc')return [22,14];
  if(['activity','locked','property','view','read'].includes(o.type))return [27,18];
  return null;
}
function insideObjectFootprint(o,x,y,clearance=0){
  const size=objectFootprint(o);if(!size)return false;const [rx,ry]=size;
  return ((x-o.x)/(rx+clearance))**2+((y-o.y)/(ry+clearance))**2<1;
}
function baseBlocked(x,y,clearance=0){
  const b=world[state().scene].bounds;if(x<b[0]||x>b[2]||y<b[1]||y>b[3])return true;
  for(const [a,c,w,h] of world[state().scene].collisions||[])if(x>a-6-clearance&&x<a+w+6+clearance&&y>c-6-clearance&&y<c+h+6+clearance)return true;
  if(state().scene==='yard')for(const o of world.yard.objects.filter(v=>v.type==='weed'&&!state().collected[v.id]))if(Math.hypot(x-o.x,y-o.y)<22+clearance)return true;
  return false;
}
function blocked(x,y,clearance=0){
  if(baseBlocked(x,y,clearance))return true;
  return visibleObjects().some(o=>insideObjectFootprint(o,x,y,clearance));
}
function movementBlocked(x,y,fromX,fromY){
  if(baseBlocked(x,y))return true;
  for(const o of visibleObjects()){
    const size=objectFootprint(o);if(!size||!insideObjectFootprint(o,x,y))continue;
    // Old saves may resume inside a newly-added footprint. They may walk outward, never farther in.
    if(!insideObjectFootprint(o,fromX,fromY))return true;
    const [rx,ry]=size,was=((fromX-o.x)/rx)**2+((fromY-o.y)/ry)**2,now=((x-o.x)/rx)**2+((y-o.y)/ry)**2;
    if(now<=was)return true;
  }
  return false;
}
function findPath(target){
  const s=state(),step=18,b=world[s.scene].bounds,cols=Math.ceil((b[2]-b[0])/step)+1,rows=Math.ceil((b[3]-b[1])/step)+1;
  const cell=(x,y)=>[Math.max(0,Math.min(cols-1,Math.round((x-b[0])/step))),Math.max(0,Math.min(rows-1,Math.round((y-b[1])/step)))];
  const xy=(x,y)=>({x:b[0]+x*step,y:b[1]+y*step}),start=cell(s.player.x,s.player.y),end=cell(target.x,target.y),key=(x,y)=>x+','+y;
  const queue=[start],previous=new Map([[key(...start),null]]);
  let finish=null;
  for(let n=0;n<queue.length;n++){
    const [x,y]=queue[n],p=xy(x,y);
    if((target.object&&Math.hypot(p.x-target.object.x,p.y-target.object.y)<=70)||(!target.object&&Math.hypot(x-end[0],y-end[1])<=.1)){finish=[x,y];break;}
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const nx=x+dx,ny=y+dy,k=key(nx,ny),np=xy(nx,ny);if(nx<0||ny<0||nx>=cols||ny>=rows||previous.has(k)||blocked(np.x,np.y,10))continue;
      if(dx&&dy&&(blocked(p.x,np.y,10)||blocked(np.x,p.y,10)))continue;
      previous.set(k,[x,y]);queue.push([nx,ny]);
    }
  }
  if(!finish)return null;const points=[];for(let at=finish;at;at=previous.get(key(...at)))points.unshift(xy(...at));
  points.shift();if(points.length)points[points.length-1].object=target.object;
  else points.push({x:s.player.x,y:s.player.y,object:target.object});return points;
}
function approach(o){
  const target=findPath({x:o.x,y:o.y,object:o});
  if(!target){notice('这处还走不到。先看看通路是否清理，或从场景互动选择其他物件。',true);return;}
  focusedObjectId=o.id;path=target;notice('前往'+o.label+'。');refreshInteractionHint();
}
let edgeExitCooldown=0,edgeExitAttempt=null;
function keyboardExitDirection(o){
  if(['study','home','backFoothill','sideBack','sideBamboo','coastBack','tideBack','v4ToCoast'].includes(o.id))return [-1,0];
  if(['mountainGate','toGeneral','coastTide','v4ToShip','v4ToBackHall'].includes(o.id))return [1,0];
  if(['villageGate','exit-yard','bayRoad','toVillage','countyBack','exit-county','footVillage','grovePath','summitBack','groveBack','v4ToTown','v4ToHall'].includes(o.id))return [0,1];
  return [0,-1];
}
function tryKeyboardExit(dx,dy,dt){
  edgeExitCooldown=Math.max(0,edgeExitCooldown-dt);if(transitioning)return false;
  const s=state(),doors=visibleObjects().filter(o=>o.type==='door').map(o=>{
    const [ex,ey]=keyboardExitDirection(o),rx=o.x-s.player.x,ry=o.y-s.player.y;
    return {o,d:Math.hypot(rx,ry),along:rx*ex+ry*ey,across:Math.abs(rx*ey-ry*ex),facing:dx*ex+dy*ey};
  }).filter(v=>v.d<=94&&v.across<=68&&v.along>=-40&&v.along<=56&&v.facing>=.5).sort((a,b)=>a.d-b.d);
  // A road has width: crossing beside its centre must work as well as hitting its exact point.
  if(!doors.length){edgeExitAttempt=null;return false;}
  const {o}=doors[0],attempt=s.scene+':'+o.id;
  if(edgeExitCooldown||edgeExitAttempt===attempt)return false;
  edgeExitAttempt=attempt;edgeExitCooldown=1.1;notice('沿路前往'+world[o.to].name+'…');void interact(o);return true;
}
function worldPoint(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left-camera.ox)/camera.scale,y:(e.clientY-r.top-camera.oy)/camera.scale};}
function resolveHit(p){
  const within=(p,r)=>!!r&&p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
  return hitTargets.find(h=>within(p,h.rect))?.o||hitTargets.filter(h=>within(p,h.anchor)).sort((a,b)=>Math.hypot(a.o.x-p.x,a.o.y-p.y)-Math.hypot(b.o.x-p.x,b.o.y-p.y))[0]?.o;
}
canvas.addEventListener('pointerdown',e=>{
  if(!active||transitioning)return;cancelNavigation();const p=worldPoint(e),o=resolveHit(p);
  if(o){approach(o);return;}focusedObjectId=null;if(blocked(p.x,p.y)){notice('请点击可走的道路或场景标记。');return;}
  path=findPath(p)||[];if(!path.length)notice('这里暂时走不到。可以从「场景互动」选择物件。');
});
function update(dt){
  if(!active||transitioning||document.hidden)return;
  const destination=path[path.length-1]?.object;
  if(destination&&engine.near(destination)){path=[];moving=false;interact(destination);return;}
  engine.tick(dt);let targetDistance=Infinity,dx=Number(!!(keys.d||keys.arrowright))-Number(!!(keys.a||keys.arrowleft)),dy=Number(!!(keys.s||keys.arrowdown))-Number(!!(keys.w||keys.arrowup));
  const keyboardSteering=!!(dx||dy);if(keyboardSteering){path=[];cancelNavigation();}
  else if(path.length){
    const p=path[0],distance=Math.hypot(p.x-state().player.x,p.y-state().player.y);
    if(distance<7){path.shift();if(p.object){moving=false;interact(p.object);return;}}
    else{targetDistance=distance;dx=(p.x-state().player.x)/distance;dy=(p.y-state().player.y)/distance;}
  }
  moving=!!(dx||dy);
  if(moving){
    const s=state(),len=Math.hypot(dx,dy),step=Math.min(targetDistance,(keys.shift?255:205)*dt),nx=s.player.x+dx/len*step,ny=s.player.y+dy/len*step;
    direction=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';
    if(!movementBlocked(nx,s.player.y,s.player.x,s.player.y))engine.move(nx,s.player.y);if(!movementBlocked(state().player.x,ny,state().player.x,s.player.y))engine.move(state().player.x,ny);walkFrame+=dt*10;
    if(keyboardSteering&&tryKeyboardExit(dx/len,dy/len,dt))return;
  }
}
function setupCamera(){
  const r=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2),vw=r.width,vh=r.height;
  if(canvas.width!==Math.round(vw*dpr)||canvas.height!==Math.round(vh*dpr)){canvas.width=Math.round(vw*dpr);canvas.height=Math.round(vh*dpr);}
  const portrait=vw<600&&vh>vw,scale=portrait?Math.max(vw/640,(vh-220)/H):Math.min(vw/W,vh/H);
  const viewW=vw/scale,center=portrait?Math.max(viewW/2,Math.min(W-viewW/2,state().player.x)):W/2;
  camera={scale,ox:vw/2-center*scale,oy:(vh-H*scale)/2,dpr,vw,vh};
  ctx.setTransform(scale*dpr,0,0,scale*dpr,camera.ox*dpr,camera.oy*dpr);
}
function polygon(points,fill,stroke){
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
}
function paintCropPlant(x,y,size,ready){
  ctx.save();ctx.translate(x,y);ctx.strokeStyle='#5e7448';ctx.lineWidth=Math.max(1.4,size*.13);ctx.beginPath();ctx.moveTo(0,2);ctx.quadraticCurveTo(1,-size*.45,0,-size);ctx.stroke();
  for(const side of [-1,1])for(let row=0;row<2;row++){ctx.save();ctx.translate(side*size*(.16+row*.08),-size*(.42+row*.25));ctx.rotate(side*(.45-row*.12));ctx.fillStyle=row?'#789452':'#8da960';ctx.beginPath();ctx.ellipse(0,0,size*.34,size*.17,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(ready){ctx.fillStyle='#e7c66f';for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.ellipse(Math.cos(a)*3,-size+Math.sin(a)*3,2.6,1.6,a,0,Math.PI*2);ctx.fill();}}
  ctx.restore();
}
function paintDifferenceLayers(){
  const s=state(),f=s.flags,sc=s.scene;
  if(sc==='bed'){
    const damage=images.bedDamage,clean=images.bed;
    if(damage?.naturalWidth&&clean?.naturalWidth){
      ctx.drawImage(damage,0,0,W,H);
      // Independently restore each repaired part, including old saves that repaired only one.
      if(f.windowPatched)ctx.drawImage(clean,490,0,350,210,490/1536*W,0,350/1536*W,210/1024*H);
      if(f.leakPatched)ctx.drawImage(clean,840,0,696,475,840/1536*W,0,696/1536*W,475/1024*H);
      if(f.windowPatched&&f.leakPatched)ctx.drawImage(clean,0,0,W,H);
    }
    if(!f.leakPatched){
      const tick=performance.now()/1000;
      for(let i=0;i<3;i++){const phase=(tick*.6+i/3)%1,x=640+i*4,y=128+phase*147;
        ctx.save();ctx.globalAlpha=.65;ctx.fillStyle='#d3e2de';ctx.beginPath();ctx.ellipse(x,y,1.4,3.2,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#c9d7cb';ctx.globalAlpha=(1-phase)*.38;ctx.beginPath();ctx.ellipse(x,280,3+phase*13,1+phase*4,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
    }
  }
  // The entrance is a full painted background, with no geometric gate overlay.
  if(sc==='yard'){
    if(!f.pathCleared){const weed=images.weedPatch;world.yard.objects.filter(o=>o.type==='weed'&&!s.collected[o.id]).forEach((o,index)=>{if(!weed?.naturalWidth)return;ctx.save();ctx.translate(o.x,o.y);ctx.scale(index%2?-1:1,1);ctx.drawImage(weed,-53,-58,106,70);ctx.restore();});}
    // The edited base art places the plot on the far-right ground. Only growth is painted here.
    if(f.smallBed&&images.gardenStages?.naturalWidth){
      for(let i=0;i<(f.fullGarden?6:4);i++){
        if(i>0&&!N.gardenPlot(s,i).tilled)continue;
        const [col,row]=plotFrame(i),[x,y]=gardenSpots[i];
        ctx.drawImage(images.gardenStages,col*384,row*1024/3,384,1024/3,x-28,y-36,56,50);
      }
    }
  }
  // Bedroom leak and repaired states are full painted variants, avoiding mismatched canvas patches.
  if(f.v2ShopLamp&&sc==='generalStore'){const glow=ctx.createRadialGradient(830,365,3,830,365,100);glow.addColorStop(0,'rgba(255,210,132,.35)');glow.addColorStop(1,'rgba(255,210,132,0)');ctx.fillStyle=glow;ctx.fillRect(730,265,200,200);}
  const daylight=N.daylight(s);
  if(daylight.warmth){ctx.fillStyle='rgba(190,116,36,'+(daylight.warmth*.13)+')';ctx.fillRect(0,0,W,H);}
  if(daylight.morning){ctx.fillStyle='rgba(242,206,98,'+(daylight.morning*.12)+')';ctx.fillRect(0,0,W,H);}
  if(daylight.darkness){
    ctx.fillStyle='rgba(18,37,56,'+(daylight.darkness*(f.stableLights?.35:.45))+')';ctx.fillRect(0,0,W,H);
    if(f.stableLights&&['yard','hall','bed','study','store'].includes(sc)){
      for(const [x,y] of sc==='yard'?[[400,183],[570,160],[745,280]]:[[350,255],[765,300]]){
        const g=ctx.createRadialGradient(x,y,2,x,y,93);g.addColorStop(0,'rgba(255,213,139,'+(daylight.darkness*.5)+')');g.addColorStop(1,'#ffc56a00');ctx.fillStyle=g;ctx.fillRect(x-93,y-93,186,186);
      }
    }
  }
}
const npcRoles={countyInn:'landlord',v2Neighbor:'neighbor',v2ObserveMorning:'customer',v2ObserveNoon:'customer',v2ObserveAfternoon:'customer',v2Supplier:'cen',v2MotherCounter:'mother',v2FatherCounter:'father',grandfather:'grandfather',father:'father',fatherHill:'father',mother:'mother',motherHall:'mother',villager:'chen',doctor:'doctor',aCen:'cen',shenYu:'yu',shenYuCoast:'yu',chengWan:'wan',qiu:'qiu',bambooStall:'vendor',villagePantry:'vendor',pharmacyKeeper:'doctor',teahouseKeeper:'tea',v2Customer:'customer',keyHandover:'guard',familyLuggage:'father'};
function npcRole(o){
  if(o.role)return o.role;
  if(o.id==='v2Repair')return state().flags.v2Leased&&!state().flags.v2Sign?'lin':null;
  return npcRoles[o.id]||null;
}
// Per-object orientation and breathing remain transient presentation state.
const npcFacing=new Map();
const npcHomeFacing={grandfather:false,father:false,mother:true,motherHall:true,villager:false,doctor:true,aCen:false,shenYu:true,shenYuCoast:true,chengWan:true,qiu:true,v2MotherCounter:true,v2FatherCounter:false,keyHandover:true,familyLuggage:false};
DATA.assets.npcIdle='npc-idle-v3911.png';loadImage('npcIdle');
function npcPresentation(o,t){
 const role=npcRole(o),s=state(),key=s.scene+':'+o.id,dx=s.player.x-o.x,dy=s.player.y-o.y;
 const seed=[...o.id].reduce((n,c)=>n+c.charCodeAt(0),0),near=Math.hypot(dx,dy)<125;
 let flip=npcFacing.has(key)?npcFacing.get(key):(npcHomeFacing[o.id]??(seed%2===0));
 // Dead zone avoids rapid left/right flicker when standing directly in front.
 if(near&&Math.abs(dx)>22)flip=dx<0;
 npcFacing.set(key,flip);
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const phase=t/1000*(.65+seed%5*.08)+seed;
 return {role,flip,near,lean:reduced?0:Math.sin(phase)*.006,breath:reduced?1:1+Math.sin(phase*.85)*.003};
}
function drawNaturalPerson(o,t){
  if(o.role==='children'){drawPerson('children',o.x,o.y,62,false);return;}
 const pose=npcPresentation(o,t),col=['grandfather','father','mother','cen'].indexOf(pose.role);
 const silk=window.NanlanProduction?.portrait(pose.role),sheet=images.npcIdle;
 ctx.save();ctx.translate(o.x,o.y);ctx.rotate(pose.lean);ctx.scale(1,pose.breath);ctx.translate(-o.x,-o.y);
 if(col>=0&&!silk&&sheet?.naturalWidth){
  const cw=sheet.naturalWidth/4,ch=sheet.naturalHeight/2;
  ctx.save();ctx.translate(o.x,o.y);if(pose.flip)ctx.scale(-1,1);
  ctx.filter='brightness('+(1-N.daylight(state()).darkness*.28)+')';
  ctx.drawImage(sheet,col*cw,pose.near?ch:0,cw,ch,-34,-87,68,91);ctx.restore();
 }else drawPerson(pose.role,o.x,o.y,84,pose.flip);
 ctx.restore();
}
function drawPerson(role,x,y,height=84,flip=false){
  const costume=window.NanlanProduction?.portrait(role);if(costume&&!images[costume.asset])loadImage(costume.asset);
  const dressed=costume&&images[costume.asset]?.naturalWidth,im=dressed?images[costume.asset]:images['npc_'+role];if(!im?.naturalWidth){loadImage('npc_'+role);return;}
  const width=height*(dressed?costume.rect[2]/costume.rect[3]:im.naturalWidth/im.naturalHeight);
  // Soft contact shadow belongs to the actor, rather than a floating marker.
  ctx.save();const shadow=ctx.createRadialGradient(x,y-1,1,x,y-1,16);shadow.addColorStop(0,'#26332255');shadow.addColorStop(1,'#26332200');ctx.fillStyle=shadow;ctx.beginPath();ctx.ellipse(x,y-1,17,5,0,0,Math.PI*2);ctx.fill();
  ctx.translate(x,y);if(flip)ctx.scale(-1,1);
  ctx.filter='brightness('+(1-N.daylight(state()).darkness*.28)+')';if(dressed)ctx.drawImage(im,...costume.rect,-width/2,-height,width,height);else ctx.drawImage(im,-width/2,-height,width,height);ctx.restore();
}
function renderCharacter(t){
  const s=state(),p=s.player,oldKey=s.gender==='male'?'walkMale':'walkFemale',key=s.actorState?.outfit==='nanlanSilk'?oldKey+'Silk':oldKey;
  if(!images[key])loadImage(key);const im=images[key]||images[oldKey];
  const elapsed=Math.min(.1,(t-(lastPoseTime||t))/1000);lastPoseTime=t;
  gaitBlend+=(Number(moving&&active)-gaitBlend)*Math.min(1,elapsed*12);
  if(!im?.naturalWidth){drawPerson(s.gender==='male'?'playerMale':'playerFemale',p.x,p.y,84,direction==='left');return;}
  const col=direction==='down'?0:direction==='up'?1:2,row=gaitBlend>.15?Math.floor(walkFrame/Math.PI)%2:0;
  const bob=-Math.abs(Math.sin(walkFrame))*1.7*gaitBlend;
  ctx.save();const shadow=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,18);shadow.addColorStop(0,'#26332255');shadow.addColorStop(1,'#26332200');ctx.fillStyle=shadow;ctx.beginPath();ctx.ellipse(p.x,p.y,18,5,0,0,Math.PI*2);ctx.fill();
  ctx.translate(p.x,p.y+bob);if(direction==='left')ctx.scale(-1,1);
  ctx.rotate(Math.sin(walkFrame)*.012*gaitBlend);
  ctx.filter='brightness('+(1-N.daylight(s).darkness*.28)+')';
  ctx.drawImage(im,col*384,row*512,384,512,-34,-87,68,91);ctx.restore();
}
function isGatherable(o){return resourceTypes.includes(o.type)||o.action==='garden';}
function storePickup(o){return state().scene==='store'?({tools:0,bucket:1,axe:2}[o.action]):undefined;}
function personBounds(role,x,y){
  const im=images['npc_'+role],height=84,width=role==='playerMale'||role==='playerFemale'?68:im?.naturalWidth?height*im.naturalWidth/im.naturalHeight:64;
  return {x:x-width/2-6,y:y-height-8,w:width+12,h:height+18};
}
function render(){
  const r=canvas.getBoundingClientRect();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#20392d';ctx.fillRect(0,0,canvas.width,canvas.height);setupCamera();ctx.imageSmoothingEnabled=true;
  const s=state(),baseKey=s.scene==='backHall'&&s.flags.v4_room?'backHallReady':s.scene==='bed'&&s.flags.leakPatched?'bedPatched':world[s.scene].asset;
  const base=images[baseKey]||images[world[s.scene].asset];if(base?.naturalWidth)ctx.drawImage(NanlanClimate.picture(base,s.scene,s),0,0,W,H);
  NanlanClimate.atmosphere(ctx,s.scene,s,performance.now(),W,H);
  window.NanlanWeather?.atmosphere(ctx,s.scene,s,performance.now(),W,H);
  paintDifferenceLayers();hitTargets=[];
  const left=Math.max(8,-camera.ox/camera.scale+8),right=Math.min(W-8,(camera.vw-camera.ox)/camera.scale-8);
  const time=performance.now(),objective=localObjectiveObject(),destination=path[path.length-1]?.object;
  const people=visibleObjects().filter(o=>npcRole(o));
  const actors=people.map(o=>({layer:40,y:o.y,draw:()=>drawNaturalPerson(o,time)}));
  if(started)actors.push({layer:40,y:s.player.y,draw:()=>renderCharacter(time)});

  for(const o of visibleObjects()){
    if(o.x<left-70||o.x>right+70)continue;
    const locked=!!objectGate(o)||o.type==='locked'||o.type==='property',selected=o.id===focusedObjectId||o===destination,isObjective=o===objective;
    if(o.id==='dryRackVisual'){
      actors.push({layer:40,y:o.y,draw:()=>{ctx.save();const x=o.x,y=o.y;ctx.strokeStyle='#765334';ctx.lineCap='round';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-31,y);ctx.lineTo(x-23,y-61);ctx.moveTo(x+31,y);ctx.lineTo(x+23,y-61);ctx.stroke();ctx.strokeStyle='#b98a4e';ctx.lineWidth=3;for(let j=0;j<5;j++){ctx.beginPath();ctx.moveTo(x-30,y-52+j*10);ctx.lineTo(x+30,y-52+j*10);ctx.stroke();}ctx.fillStyle='#71854f';for(let j=0;j<9;j++){ctx.beginPath();ctx.ellipse(x-24+j*6,y-48+(j%3)*10,5,2.5,(j%2?-.5:.4),0,Math.PI*2);ctx.fill();}ctx.restore();}});
      hitTargets.push({o,rect:null,anchor:{x:o.x-42,y:o.y-72,w:84,h:76}});continue;
    }
    if(o.id==='seasonDisplay'){
      const id=s.season5.display.item,im=images.inventoryCrafts;
      if(['duckStone','grassHopper'].includes(id)){
        const gift=images.kidsGifts;if(!gift)loadImage('kidsGifts');
        else actors.push({layer:40,y:o.y,draw:()=>{const half=gift.naturalWidth/2,w=id==='duckStone'?18:23;ctx.drawImage(gift,id==='duckStone'?0:half,0,half,gift.naturalHeight,o.x-w/2,o.y-w*gift.naturalHeight/half,w,w*gift.naturalHeight/half);}});
      }else if(im?.naturalWidth)actors.push({layer:40,y:o.y,draw:()=>ctx.drawImage(im,...(id==='ledgerCopy'?[836,425,418,375]:[836,800,418,454]),o.x-19,o.y-37,38,37)});
      hitTargets.push({o,rect:null,anchor:{x:o.x-25,y:o.y-44,w:50,h:50}});continue;
    }
    if(o.id==='silkPond'){hitTargets.push({o,rect:null,anchor:{x:245,y:385,w:130,h:140}});continue;}
    if(s.scene==='study'&&o.id==='books')globalThis.NanlanKids?.draw('study');
    if(o.v3Art!=null){globalThis.NanlanV3?.drawProp(o);}
    if(s.scene==='village'&&o.id==='villageLetter'){
      const im=images.villageLetter,w=50,h=34;
      // Keep the small letter tray in scale with people; retain a forgiving touch target.
      if(im?.naturalWidth)actors.push({layer:40,y:o.y,draw:()=>{ctx.save();ctx.globalAlpha=s.flags.letterRead?.78:1;ctx.drawImage(im,o.x-w/2,o.y-h+5,w,h);ctx.restore();}});
      hitTargets.push({o,rect:null,anchor:{x:o.x-28,y:o.y-36,w:56,h:44}});
      if(selected||isObjective||nearObject(o)){ctx.save();ctx.strokeStyle=isObjective?'#9bc6b3':'#e1c47c';ctx.lineWidth=1.2;ctx.globalAlpha=.65+.22*Math.sin(time/240);ctx.beginPath();ctx.ellipse(o.x,o.y-2,23,7,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
      continue;
    }
    if(o.action?.startsWith('sealGather')){
      const wood=o.action==='sealGatherWood',im=resourceImages[wood?'wood':'stone'],w=wood?44:32,h=im?.naturalWidth?w*im.naturalHeight/im.naturalWidth:35;
      if(im?.naturalWidth)ctx.drawImage(im,o.x-w/2,o.y-h,w,h);
      hitTargets.push({o,rect:null,anchor:{x:o.x-24,y:o.y-55,w:48,h:60}});
      if(selected||nearObject(o)){ctx.save();ctx.strokeStyle='#e8d8a7';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(o.x,o.y-3,18,6,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
      continue;
    }
    if(o.action==='garden'){
      const count=s.flags.fullGarden?6:4;
      for(let i=0;i<count;i++){const plot=gardenTarget(i),[x,y]=gardenSpots[i];hitTargets.push({o:plot,rect:null,anchor:{x:x-27,y:y-43,w:54,h:52}});if(plot.id===focusedObjectId){ctx.save();ctx.strokeStyle='#e7ca79';ctx.lineWidth=1.7;ctx.beginPath();ctx.ellipse(x,y-5,24,9,0,0,Math.PI*2);ctx.stroke();ctx.restore();}}
      hitTargets.push({o,rect:null,anchor:{x:890,y:365,w:145,h:125}});continue;
    }
    if(fruitTypes.includes(o.type)){
      const cooling=s.nodes[o.id]!==undefined&&s.worldTick-s.nodes[o.id]<N.resourceCooldown(o.type);
      const im=images[cooling?'fruitTreesPicked':'fruitTrees'],w=128,h=140;
      if(im?.naturalWidth)ctx.drawImage(im,fruitTypes.indexOf(o.type)*512,0,512,560,o.x-w/2,o.y-h,w,h);
      hitTargets.push({o,rect:null,anchor:{x:o.x-w/2,y:o.y-h,w,h}});
      if(selected){ctx.save();ctx.strokeStyle='#ecd69a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(o.x,o.y-4,24,8,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
      continue;
    }
    if(s.scene==='hall'&&o.id==='mealTable'){
      const im=images.diningTable;if(im?.naturalWidth)ctx.drawImage(im,o.x-120,o.y-160,240,160);globalThis.NanlanKids?.draw('hall');
      hitTargets.push({o,rect:null,anchor:{x:o.x-108,y:o.y-146,w:216,h:146}});
      continue;
    }
    const pickup=storePickup(o);
    if(pickup!==undefined){
      const im=images.storePickups,crop=[[0,80,500,780],[590,240,380,570],[1010,450,500,400]][pickup],w=[36,28,46][pickup],h=w*crop[3]/crop[2];
      if(im?.naturalWidth)ctx.drawImage(im,...crop,o.x-w/2,o.y-h,w,h);
      hitTargets.push({o,rect:null,anchor:{x:o.x-Math.max(44,w)/2,y:o.y-Math.max(44,h),w:Math.max(44,w),h:Math.max(44,h)+8}});
      if(selected||isObjective||nearObject(o)){const glow=ctx.createRadialGradient(o.x,o.y-12,1,o.x,o.y-12,18);glow.addColorStop(0,'#ffe7a24d');glow.addColorStop(1,'#ffe7a200');ctx.fillStyle=glow;ctx.fillRect(o.x-18,o.y-30,36,36);}
      continue;
    }
    if(s.scene==='store'&&o.id==='bookBox'&&images.inventoryCrafts?.naturalWidth){
      ctx.drawImage(images.inventoryCrafts,418,425,418,375,o.x-22,o.y-39,44,39);
    }
    if(s.scene==='store'&&o.id==='workbench'&&images.workbench?.naturalWidth){
      ctx.drawImage(images.workbench,o.x-80,o.y-106,160,107);
    }
    if(s.scene==='store'&&o.id==='goodsCrates'&&images.inventoryHousehold?.naturalWidth){
      ctx.drawImage(images.inventoryHousehold,0,414,418,391,o.x-52,o.y-68,72,68);
      ctx.drawImage(images.inventoryHousehold,836,0,418,414,o.x-5,o.y-62,72,72);
    }
    if(s.scene==='yard'&&o.id==='waterJar'){
      // The jar rests on the east-room paving, with the same depth order as people.
      const im=images.waterJar,w=56,h=49;
      if(im?.naturalWidth)actors.push({layer:40,y:o.y,draw:()=>{const shade=ctx.createRadialGradient(o.x,o.y-2,1,o.x,o.y-2,21);shade.addColorStop(0,'#29322444');shade.addColorStop(1,'#29322400');ctx.fillStyle=shade;ctx.fillRect(o.x-21,o.y-6,42,12);ctx.drawImage(im,o.x-w/2,o.y-h,w,h);}});
      hitTargets.push({o,rect:null,anchor:{x:o.x-30,y:o.y-h,w:60,h:h+6}});
      continue;
    }
    if(selected||isObjective)ellipse(o.x,o.y,selected?18:13,selected?8:5,locked?'#80674988':selected?'#f4cb6faa':'#f4e1a066');
    if(selected||isObjective){ctx.save();ctx.strokeStyle=isObjective?'#9bc6b3':'#ebc66f';ctx.lineWidth=selected?2.4:1.5;ctx.globalAlpha=.72+.22*Math.sin(time/240);ctx.beginPath();ctx.ellipse(o.x,o.y,selected?25:20,selected?11:9,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
    if(resourceTypes.includes(o.type)&&!(o.type==='weed'&&s.scene==='yard')){
      const im=resourceImages[o.type],size={herb:38,wood:48,stone:38,bamboo:49,mushroom:33,shoot:35,shell:28,seaweed:39,clam:27,weed:58,ginseng:43,agarwood:64,huali:68}[o.type];
      if(im?.naturalWidth){const height=size*im.naturalHeight/im.naturalWidth;ctx.drawImage(im,o.x-size/2,o.y-height+3,size,height);}
    }
    // Resources have only physical hit areas; no floating nameplate or leader line.
    if(isGatherable(o)){
      const size=o.action==='garden'?66:o.type==='weed'?58:['agarwood','huali'].includes(o.type)?68:48;
      const anchor={x:o.x-size/2,y:o.y-size,w:size,h:size+8};
      hitTargets.push({o,rect:null,anchor});
      const harvestable=o.action!=='garden'||N.crop(s).ready;
      if(harvestable){
        const phase=(time/1000+(o.x+o.y)/97)%4.8;
        const glow=(selected||nearObject(o)) ? .55 : Math.max(0,1-Math.abs(phase-1)/.65)*.45;
        if(glow>0){ctx.save();ctx.globalAlpha=glow;const g=ctx.createRadialGradient(o.x+4,o.y-18,0,o.x+4,o.y-18,6);g.addColorStop(0,'#fff2c6');g.addColorStop(1,'#fff2c600');ctx.fillStyle=g;ctx.fillRect(o.x-2,o.y-24,12,12);ctx.restore();}
      }
      continue;
    }
    // Keep the physical target clickable even when there is no safe space for its label.
    const target={o,rect:null,anchor:npcRole(o)?personBounds(npcRole(o),o.x,o.y):{x:o.x-26,y:o.y-42,w:52,h:48}};
    hitTargets.push(target);
    // Names and instructions are shown only in the fixed interaction panel.

  }
  actors.sort((a,b)=>a.y-b.y).forEach(actor=>actor.draw());
  if(path.length){const p=path[path.length-1];ctx.strokeStyle='#f5dfa3aa';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,11,5,0,0,Math.PI*2);ctx.stroke();}
  renderGardenWorkFx(time);
  renderCompletionFeedback(time);
}
function frame(t){
  const dt=Math.min(.1,(t-(lastFrame||t))/1000);lastFrame=t;
  try{update(dt);render();if(t-lastHud>300){refreshHud();refreshInteractionHint();lastHud=t;}
    void window.NanlanProduction?.maybeMorning();
    window.NanlanAudio?.setEnvironment(window.NanlanOpening?.environment()||world[state().scene].soundScene||state().scene,window.NanlanOpening?.running()?false:N.daylight(state()).darkness>.25,started&&active&&moving);
    if(started&&active&&t-lastAutosave>20000){const r=engine.save();$('saveState').textContent=r.ok?(engine.memoryOnly?'仅本次试玩':'已保存'):'自动保存失败 · 请手动保存';lastAutosave=t;}
  }catch(e){console.error(e);active=false;notice('画面暂停了，请先保存进度，再刷新重试。',true);}
  requestAnimationFrame(frame);
}
function reviewSave(check){
      const candidate=check.state,q=N.current(candidate);
      activity('导入进度 · 确认内容','地点：'+world[candidate.scene].name+'\n任务：'+(q?q+' '+N.titles[q]:candidate.flags.volume4Complete?deskText('第四卷已完成','Volume IV complete'):candidate.flags.volume3Complete?deskText('第三卷已完成','Volume III complete'):candidate.flags.volume2Complete?'第二卷已完成':'第一卷已完成')+'\n家用：'+candidate.coins+' 文\n\n确认后替换本页进度。原进度将保留一份备份，可在行囊下载。');
      button('确认导入这份进度',async()=>{
        if(!await loadSceneAssets(candidate.scene)){notice('场景图片加载失败，尚未修改进度。',true);return;}
        try{
          const previous=started?JSON.stringify(state()):localStorage.getItem(N.SAVE_KEY);
          if(previous)localStorage.setItem('nanlan_before_import',previous);
          storage.setItem(N.SAVE_KEY,JSON.stringify(candidate));engine.state=candidate;engine.memoryOnly=false;localStorage.removeItem("nanlan_last_night");
          storedRaw=JSON.stringify(candidate);started=true;path=[];keys={};moving=false;$('start').hidden=true;$('hud').hidden=false;
          closeDialog();refreshHud();render();notice('进度已导入。'+nextHint());
        }catch(e){notice('保存失败，原有进度未被替换。可检查浏览器存储后重试。',true);}
      },'confirm-import');
      button('取消，保留当前进度',closeDialog,'cancel-import',true);
}
function setReadingSize(on){document.documentElement.classList.toggle('large-read',on);$('readSize').setAttribute('aria-pressed',String(on));}
try{setReadingSize(localStorage.getItem('nanlan_large_text')==='1');}catch{}
function toggleReadingSize(){const on=!document.documentElement.classList.contains('large-read');setReadingSize(on);try{localStorage.setItem('nanlan_large_text',on?'1':'0');}catch{}}
$('readSize').onclick=toggleReadingSize;
async function toggleGameScreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notice(deskText('当前窗口无法切换全屏。','This window cannot switch to full screen.'),true);}}
if(document.fullscreenEnabled){$('screenMode').hidden=false;$('screenMode').onclick=toggleGameScreen;document.addEventListener('fullscreenchange',()=>{$('screenMode').textContent=document.fullscreenElement?'退出全屏 / Windowed':'全屏 / Full screen';});}
function bedtimeReview(){try{const check=new N.Engine(storage,world);check.load(localStorage.getItem('nanlan_last_night'));reviewSave(check);}catch{notice(deskText('睡前存档无法读取。','The bedtime save could not be read.'),true);}}
function importSave(){
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.hidden=true;document.body.append(input);input.oncancel=()=>input.remove();
  input.onchange=async()=>{
    const file=input.files?.[0];if(!file)return;
    try{
      if(file.size>2*1024*1024)throw new Error('存档文件过大，请选择游戏导出的 JSON 文件。');
      const raw=await file.text(),check=new N.Engine(storage,world);check.load(raw);
      reviewSave(check);
    }catch(e){activity('无法导入这份存档',e.userMessage||e.message||'请使用本游戏导出的 JSON 存档；当前进度未改变。');}
    input.remove();
  };input.click();
}
function download(name,text){
  const url=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function chooseGender(value){gender=value;for(const id of ['female','male'])$(id).setAttribute('aria-pressed',String(id===gender));$('selection').textContent='已选择'+(gender==='female'?'女主角':'男主角')+' · 将以这个身份走进南澜';}
$('female').onclick=()=>chooseGender('female');$('male').onclick=()=>chooseGender('male');
function showStartGuide(){
  activity('启程前 · 怎样行动','点击地面行走，点击人物或物件互动。电脑可用 WASD / 方向键移动，空格或 E 互动；B 打开或收起行囊。\n\n不用预先记住所有系统。第一次遇到采集、修缮、种植或买卖时，游戏会在当时说明。');
}
const arrivalBeats=[
  ['岭南雨歇','最后一阵雨停在山后。车辙陷进湿泥，押送的人把文书卷起，指了指前面那扇久闭的院门。'],
  ['父亲 · 门前','「到了。箱笼先别全搬，门锁、屋瓦和能落脚的地方，都要亲眼看过再说。」'],
  ['母亲 · 门前','「你一路也累了。先接好文书，别让雨打湿；屋里的事，我们进去一件件看。」'],
  ['祖父 · 门前','「往后的日子，不必今日就想完。先把这扇门打开吧。」']
];
function showFirstSteps(){
  activity('第一步 · 走到家人身边','先只做眼前这一件事：走近门边的家人与行李。\n\n鼠标：点击右下角的引导，人物会自动走过去。\n键盘：用 WASD 或方向键走近，再按空格互动。','tutorial');
  $('dialogKicker').textContent='初行小引 · 边走边学';
  button('我来试试',()=>{closeDialog(true);focusedObjectId='familyLuggage';lastInteractionHint='';notice('第一步：点击右下角「家人与行李」，或走近后按空格。',true);},'first-step-try');
  button('先自己看看',()=>{closeDialog(true);notice('需要提示时，看右下角「初行引导」；玩法会在第一次遇到时说明。');},'first-step-explore',true);
}
function finishOpeningIntro(){
  closeDialog(true);focusedObjectId='familyLuggage';lastInteractionHint='';
  notice(window.NanlanI18n?.language==='en'?'Walk towards your family and the luggage. Use WASD / arrow keys, then press Space; or click the guide at the lower right.':'走近家人与行李。用 WASD / 方向键移动后按空格，或点击右下角的初行引导。',true);
  refreshInteractionHint();
}
function showArrivalBeat(index=0){
  const [title,line]=arrivalBeats[index];activity(title,line,'arrival');$('dialog').classList.add('arrival-mode');
  $('dialogKicker').textContent='初见南澜 · '+(index+1)+' / '+arrivalBeats.length;$('skip').textContent='跳过演出 ×';
  $('skip').onclick=showFirstSteps;
  if(index<arrivalBeats.length-1)button('继续听下去',()=>showArrivalBeat(index+1),'arrival-next',false,false);
  else button('走近家人与行李',showFirstSteps,'arrival-enter',false,false);
}
async function restoreAutomaticBackup(){
  const raw=localStorage.getItem('nanlan_v20_previous');if(!raw){notice('目前没有可恢复的自动备份。',true);return;}
  const check=new N.Engine(storage,world);try{check.load(raw);}catch(e){notice('自动备份无法读取，当前进度没有改变。',true);return;}
  const q=N.current(check.state);activity('恢复自动备份？','备份地点：'+world[check.state.scene].name+'\n备份进度：'+(q?N.titles[q]:'已完成的日常')+'\n家用：'+check.state.coins+' 文\n\n确认后会把当前进度另存一份，再恢复新旅程开始前的存档。','restore-backup');
  button('确认恢复这份自动备份',async()=>{if(!await loadSceneAssets(check.state.scene)){notice('备份场景图片未能载入，当前进度没有改变。',true);return;}try{const current=started?JSON.stringify(state()):localStorage.getItem(N.SAVE_KEY);if(current)localStorage.setItem('nanlan_before_import',current);storage.setItem(N.SAVE_KEY,raw);engine.load(raw);storedRaw=raw;started=true;active=true;$('start').hidden=true;$('hud').hidden=false;closeDialog();render();refreshHud();notice('自动备份已恢复。恢复前的进度仍可在行囊下载。');}catch(e){notice('恢复失败，当前进度没有改变。',true);}},'confirm-restore-auto');
  button('取消，保留当前进度',closeDialog,'cancel-restore-auto',true);
}
async function beginGame(confirmed=false){
  if(transitioning)return;
  if(storedRaw&&confirmed!==true){
    activity('另开一段新旅程？','开始新的第一卷？当前进度会先保留一份备份，再创建新开局。','new-journey');
    button('确认，开始新旅程',()=>{closeDialog();return beginGame(true);},'confirm-new-journey');
    button('取消，保留当前存档',closeDialog,'cancel-new-journey',true);
    return;
  }
  transitioning=true;$('begin').disabled=true;
  try{
    if(!await loadImage('gate')){$('loadWarning').hidden=false;$('loadWarning').textContent='旧宅门前图片未能载入，请稍后再试。';return;}
    if(storedRaw&&!engine.memoryOnly){storage.setItem('nanlan_v20_previous',storedRaw);$('restoreAutoBackup').hidden=false;}
    engine.reset(gender);if(!engine.memoryOnly)localStorage.removeItem('nanlan_last_night');started=true;active=true;$('start').hidden=true;$('hud').hidden=false;storedRaw=null;
    refreshHud();if(window.NanlanOpening)window.NanlanOpening.start(finishOpeningIntro);else showArrivalBeat();
  }catch(e){
    activity('浏览器暂时无法保存','当前浏览器没有可用的本地存储。你可以检查浏览器设置后重试，或选择仅本次试玩；试玩模式关闭网页后不会保留进度。');
    button('仅本次试玩 · 我知道关闭后会丢失',()=>{engine.memoryOnly=true;storedRaw=null;closeDialog();beginGame();},'memory-only');
    button('返回，稍后重试',closeDialog,'retry-storage',true);
  }finally{transitioning=false;$('begin').disabled=false;}
}
$('begin').onclick=()=>beginGame();
$('startImport').onclick=importSave;
$('restoreAutoBackup').onclick=restoreAutomaticBackup;
$('continueGame').onclick=async()=>{
  if(!storedRaw||transitioning)return;
  const check=new N.Engine(storage,world);try{check.load(storedRaw);}catch(e){$('loadWarning').hidden=false;$('loadWarning').textContent='存档暂时无法读取，原数据已保留。可以备份后重新开局。';return;}
  transitioning=true;
  try{
    if(!await loadSceneAssets(check.state.scene)){$('loadWarning').hidden=false;$('loadWarning').textContent='场景物资图片未加载完整。请重试继续游戏，原存档已保留。';return;}
    engine.load(storedRaw);started=true;active=true;$('start').hidden=true;$('hud').hidden=false;render();refreshHud();notice(!state().flags.volume2Started&&N.done(state(),'M20')?(window.NanlanI18n?.language==='en'?'Progress restored. Volume II is available; open the South Street notice in your task panel.':'进度已恢复。第二卷已可开启，打开任务栏里的「南街铺讯」，到正厅与家人商议。'):'进度已恢复。可点右下角提示继续任务。');
  }finally{transitioning=false;}
};
try{
  storedRaw=localStorage.getItem(N.SAVE_KEY);oldRaw=localStorage.getItem('nanlan_v16');
  $('restoreAutoBackup').hidden=!localStorage.getItem('nanlan_v20_previous');
  if(storedRaw){const check=new N.Engine(storage,world);check.load(storedRaw);$('continueGame').hidden=false;$('begin').textContent='另开一段新旅程';}
  if(oldRaw){$('oldSaveExport').hidden=false;$('loadWarning').hidden=false;$('loadWarning').textContent='旧版八章存档仍保留。新版按原企划重做任务顺序，请从门前开始新的第一卷；可先备份旧档。';}
}catch(e){$('loadWarning').hidden=false;$('loadWarning').textContent='当前存档资料无法完整读取，原数据没有删除。可以先备份，再开始新旅程。';if(storedRaw||oldRaw)$('oldSaveExport').hidden=false;}
$('oldSaveExport').onclick=()=>download('Nanlan_Previous_Save.json',oldRaw||storedRaw||'{}');
$('volume2Entry').onclick=()=>{const entry=N.chapterEntries(state()).find(e=>!e.started&&e.ready);if(entry?.number===2)window.NanlanV2.entry();else window.NanlanChapters.show(entry?.number);};
$('questOpen').onclick=showQuest;$('nearbyOpen').onclick=showNearby;$('peopleOpen').onclick=showPeople;$('galleryOpen').onclick=showGallery;$('helpOpen').onclick=showHelp;
$('interactionHint').onclick=()=>{if(!active)return;const o=visibleObjects().find(v=>v.id===$('interactionHint').dataset.object);if(!o)return;if(nearObject(o))interact(o);else approach(o);};
$('startGuide').onclick=showStartGuide;
$('openingReplay').onclick=()=>window.NanlanOpening?.replay();
$('clock').onclick=showTime;
$('taskToggle').onclick=()=>{refreshQuestBanner();const collapsed=$('tasks').classList.toggle('collapsed');$('taskToggle').setAttribute('aria-expanded',String(!collapsed));};
$('bagOpen').onclick=showBag;
$('save').onclick=()=>{const result=engine.save();$('saveState').textContent=result.ok?(engine.memoryOnly?'仅本次试玩':'已保存'):'保存失败 · 进度仍在';notice(result.ok?(engine.memoryOnly?'当前为仅本次试玩模式，可从行囊导出备份。':'进度已保存，下次选择继续即可。'):result.message,true);};
window.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey||['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;
  const k=e.key.toLowerCase();
  if(k==='escape'){if(!$('gallery').hidden)$('galleryClose').click();else if(!$('worldMap').hidden)closeMap();else if(!$('dialog').hidden)closeDialog();return;}
  if(k==='m'&&!$('worldMap').hidden){e.preventDefault();closeMap();return;}
  if(!active)return;
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(k==='b'){e.preventDefault();showBag();return;}
  if(k==='m'){e.preventDefault();showMap();return;}if(k==='j'){e.preventDefault();showQuest();return;}
  if((k==='e'||k===' ')&&!e.repeat){const near=visibleObjects().filter(o=>engine.near(o)).sort((a,b)=>Math.hypot(a.x-state().player.x,a.y-state().player.y)-Math.hypot(b.x-state().player.x,b.y-state().player.y))[0];if(near)interact(near);else notice('靠近场景物件或微光采集物，再按空格或 E。');return;}
  const index=['1','2','3','4','5','6','7','8','9','0','-','='].indexOf(k);if(index>=0){e.preventDefault();if(!e.repeat)selectTool(index);return;}keys[k]=true;
});
window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();keys[k]=false;if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k))edgeExitAttempt=null;});
window.addEventListener('blur',()=>{keys={};path=[];moving=false;});
document.addEventListener('visibilitychange',()=>{keys={};path=[];moving=false;if(document.hidden){active=false;if(started)engine.save();}else{active=started&&$('dialog').hidden&&$('gallery').hidden&&$('worldMap').hidden&&!transitioning&&!window.NanlanOpening?.running();lastFrame=performance.now();}});
document.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;const root=!$('gallery').hidden?$('gallery'):!$('worldMap').hidden?$('worldMap'):!$('dialog').hidden?$('dialog'):null;if(!root)return;
  const buttons=[...root.querySelectorAll('button:not([hidden]):not(:disabled),input')];if(!buttons.length)return;
  if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons[buttons.length-1].focus();}
  else if(!e.shiftKey&&document.activeElement===buttons[buttons.length-1]){e.preventDefault();buttons[0].focus();}
});
window.addEventListener('beforeunload',()=>{if(started)engine.save();});
loadImage('walkFemale');loadImage('walkMale');loadImage('bedDamage');loadImage('storePickups');loadImage('bed');loadImage('gate');loadImage('yard');loadImage('npc_playerFemale');loadImage('npc_playerMale');loadImage('bedPatched');loadImage('weedPatch');refreshHud();requestAnimationFrame(frame);

document.addEventListener('nanlanlanguagechange',()=>{if(started)refreshHud();});
